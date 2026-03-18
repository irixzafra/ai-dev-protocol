# Supabase Diagnostics — Deep Reference

Advanced diagnostic queries and troubleshooting for the active project self-hosted Supabase.

## Table of Contents

1. [Connection Diagnostics](#connection-diagnostics)
2. [Lock Contention](#lock-contention)
3. [Replication & WAL](#replication--wal)
4. [Cache Hit Ratio](#cache-hit-ratio)
5. [Auth Troubleshooting](#auth-troubleshooting)
6. [Storage Troubleshooting](#storage-troubleshooting)
7. [Kong / API Gateway](#kong--api-gateway)
8. [Common Failure Scenarios](#common-failure-scenarios)

---

## Connection Diagnostics

```sql
-- Detailed connection breakdown
SELECT
  pid, usename, application_name, client_addr,
  state, wait_event_type, wait_event,
  now() - state_change as state_duration,
  left(query, 80) as current_query
FROM pg_stat_activity
WHERE state IS NOT NULL
ORDER BY state_change;

-- Long-running queries (>5s)
SELECT
  pid, usename, now() - query_start as duration,
  state, left(query, 150) as query
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;

-- Kill a stuck connection
SELECT pg_terminate_backend(PID);

-- Connection limits check
SELECT
  max_conn, used, max_conn - used as available,
  round(100.0 * used / max_conn, 1) as used_pct
FROM
  (SELECT count(*) as used FROM pg_stat_activity) t,
  (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') s;
```

## Lock Contention

```sql
-- Blocked queries waiting for locks
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_query,
  blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Lock types summary
SELECT locktype, mode, count(*)
FROM pg_locks
GROUP BY locktype, mode
ORDER BY count DESC;
```

## Replication & WAL

```sql
-- WAL size and location
SELECT
  pg_current_wal_lsn() as current_lsn,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as wal_written;

-- Replication slots (if any)
SELECT slot_name, slot_type, active, restart_lsn
FROM pg_replication_slots;

-- WAL disk usage
SELECT pg_size_pretty(sum(size)) as wal_size
FROM pg_ls_waldir();
```

## Cache Hit Ratio

```sql
-- Overall buffer cache hit ratio (should be >99%)
SELECT
  sum(blks_hit) as hits,
  sum(blks_read) as reads,
  round(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2) as hit_ratio
FROM pg_stat_database
WHERE datname = current_database();

-- Per-table cache hit ratio
SELECT
  schemaname, relname,
  heap_blks_hit, heap_blks_read,
  CASE WHEN heap_blks_hit + heap_blks_read > 0
    THEN round(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2)
    ELSE 100
  END as hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_hit + heap_blks_read > 100
ORDER BY hit_ratio ASC
LIMIT 15;

-- Index cache hit ratio
SELECT
  schemaname, relname, indexrelname,
  idx_blks_hit, idx_blks_read,
  CASE WHEN idx_blks_hit + idx_blks_read > 0
    THEN round(100.0 * idx_blks_hit / (idx_blks_hit + idx_blks_read), 2)
    ELSE 100
  END as hit_ratio
FROM pg_statio_user_indexes
WHERE idx_blks_hit + idx_blks_read > 100
ORDER BY hit_ratio ASC
LIMIT 15;
```

## Auth Troubleshooting

```bash
# GoTrue container health
ssh your-server 'docker inspect YOUR_AUTH_CONTAINER --format "{{.State.Health.Status}}"'

# Auth config validation
ssh your-server 'docker exec YOUR_AUTH_CONTAINER env | grep -E "^(GOTRUE_|API_|MAILER_)" | sort'

# Recent auth events
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT
  ip, created_at, factor_type,
  left(user_agent, 60) as ua
FROM auth.mfa_challenges
ORDER BY created_at DESC
LIMIT 10;"'

# User sessions (active)
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT count(*),
  count(*) FILTER (WHERE not_after > now()) as active,
  count(*) FILTER (WHERE not_after <= now()) as expired
FROM auth.sessions;"'

# Orphaned sessions cleanup
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
DELETE FROM auth.sessions WHERE not_after < now() - interval '"'"'30 days'"'"';"'
```

## Storage Troubleshooting

```bash
# Storage container health
ssh your-server 'docker inspect YOUR_STORAGE_CONTAINER --format "{{.State.Health.Status}}"'

# Storage disk usage on host
ssh your-server 'du -sh /var/lib/docker/volumes/project_storage-data/_data/ 2>/dev/null || echo "Volume not found at expected path"'

# S3 configuration (if using external storage)
ssh your-server 'grep -E "^(STORAGE_|S3_|FILE_)" /opt/supabase/your-project/.env | cut -d= -f1'

# Orphaned storage objects
ssh your-server 'docker exec YOUR_DB_CONTAINER psql -U postgres -c "
SELECT bucket_id, count(*) as orphans
FROM storage.objects o
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets b WHERE b.id = o.bucket_id)
GROUP BY bucket_id;"'
```

## Kong / API Gateway

```bash
# Kong routes and services
ssh your-server 'docker exec YOUR_KONG_CONTAINER kong config parse /usr/local/kong/kong.yml 2>&1 | tail -5'

# Kong error rate (last 100 requests)
ssh your-server 'docker logs YOUR_KONG_CONTAINER --tail 100 2>&1 | grep -oP "HTTP/\d\.\d\" \K\d+" | sort | uniq -c | sort -rn'

# Kong latency spikes
ssh your-server 'docker logs YOUR_KONG_CONTAINER --tail 100 2>&1 | grep -oP "request_time\":\K[0-9.]+" | sort -rn | head -10'

# CORS configuration
ssh your-server 'grep -i cors /opt/supabase/your-project/volumes/api/kong.yml 2>/dev/null || echo "Check kong.yml location"'
```

## Common Failure Scenarios

### "Cannot connect to Supabase"
1. Check if Kong is running: `docker ps | grep kong`
2. Check if DB is accepting connections: `docker exec YOUR_DB_CONTAINER pg_isready`
3. Check DNS resolution: `nslookup supabase.your-domain.com`
4. Check Caddy proxy: `docker logs deployment-platform-proxy --tail 20`
5. Check if max_connections reached (see Connection Diagnostics above)

### "Auth login fails / JWT invalid"
1. Check GoTrue logs: `docker logs YOUR_AUTH_CONTAINER --tail 30`
2. Verify JWT secret matches between `.env` and app config
3. Check if auth.users table is accessible
4. Verify SITE_URL matches the app URL

### "RLS blocking all queries"
1. Check the user's JWT claims: `SELECT auth.jwt()`
2. Verify the RLS policy USING clause matches the JWT structure
3. Test with service_role key (bypasses RLS) to confirm it's an RLS issue
4. Check if organization_id exists in JWT and matches the data

### "Storage upload fails"
1. Check bucket exists and policies allow upload
2. Verify file size limit on bucket
3. Check allowed_mime_types
4. Check Storage container logs for disk/permission errors

### "Slow API response"
1. Run performance mode to find slow queries
2. Check connection pool saturation
3. Check cache hit ratio (should be >99%)
4. Look for lock contention
5. Check if autovacuum is running on large tables
