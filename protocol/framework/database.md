# Database Standards

> Criterios obligatorios para schema, migraciones y acceso a datos.
> Aplica a todo proyecto que use PostgreSQL (con o sin Supabase, Prisma, etc.).

---

## Naming

| Elemento | Convencion | Ejemplo |
|----------|-----------|---------|
| Schema | `snake_case`, dominio del modulo | `billing`, `iam`, `content` |
| Tabla | `snake_case`, plural | `user_documents`, `chat_sessions` |
| Columna | `snake_case` | `created_at`, `source_id`, `cover_url` |
| PK | `id uuid DEFAULT gen_random_uuid()` | — |
| FK | `{tabla_singular}_id` | `source_id`, `user_id` |
| Indice | `{tabla}_{columnas}_{tipo}` | `chunks_embedding_hnsw`, `sources_author_idx` |
| Enum (DB) | `snake_case` | `document_kind`, `job_status` |
| Funcion RPC | `snake_case`, verbo + sustantivo | `match_chunks`, `get_user_profile` |

---

## Columnas obligatorias

Toda tabla nueva debe incluir:

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),  -- ver nota sobre UUID v7
created_at      timestamptz NOT NULL DEFAULT now(),
updated_at      timestamptz NOT NULL DEFAULT now(),
deleted_at      timestamptz,           -- soft delete (ver politica de borrado)
organization_id uuid                   -- multi-tenancy: presente desde dia 1
```

**Por que `organization_id`?** Multi-tenancy. Anadirlo despues es una migracion dolorosa en tablas con datos. Disenar con el desde el primer dia.

### UUID v7 (preferido sobre v4)

UUID v4 (`gen_random_uuid()`) es aleatorio y fragmenta indices B-tree en tablas grandes. UUID v7 es secuencial por tiempo — mejora rendimiento de indices y da ordenamiento natural por creacion.

- **PostgreSQL 17+:** `uuidv7()` nativo
- **PostgreSQL < 17:** usar extension `pg_uuidv7` o seguir con v4 hasta migrar

Cuando el proyecto este en Postgres 17+, cambiar el default a `uuidv7()`.

---

## Politica de borrado — Soft Deletes

**Regla:** No se hace `DELETE` fisico de datos de usuario en produccion. Se usa soft delete.

### Como funciona

```sql
-- "Borrar"
UPDATE schema.tabla SET deleted_at = now() WHERE id = $1;

-- "Restaurar"
UPDATE schema.tabla SET deleted_at = NULL WHERE id = $1;
```

### RLS con filtro de soft delete

```sql
CREATE POLICY "hide_deleted" ON schema.tabla
  FOR SELECT
  USING (deleted_at IS NULL AND auth.uid() = user_id);
```

### Cuando SI hacer DELETE fisico

| Caso | Razon |
|------|-------|
| Datos temporales de pipeline (jobs, candidatos descartados) | No son datos de usuario |
| Purga de datos > 90 dias tras soft delete | GDPR / limpieza planificada |
| Datos de test/desarrollo | No son produccion |

### Cuando NUNCA hacer DELETE fisico

- Documentos del usuario, notas, sesiones de chat
- Contenido del corpus o base de conocimiento
- Cualquier tabla con `user_id`

---

## Migraciones

### Formato de archivo

```
app/migrations/{NNN}_{descripcion_snake_case}.sql
```

Numeracion secuencial de 3 digitos: `001_`, `002_`, ...

### Reglas

| Regla | Razon |
|-------|-------|
| Una migracion = un cambio logico | Rollback granular |
| Nunca borrar columnas con datos en produccion sin backup | Irreversible |
| `IF NOT EXISTS` en `CREATE TABLE` / `CREATE INDEX` | Idempotencia |
| `ON_ERROR_STOP=1` siempre al aplicar | Detectar fallos inmediatamente |
| Usar el usuario admin correcto para DDL | Permisos correctos para DDL y RLS |

### Como aplicar

```bash
# Aplicar migracion via psql (adaptar a tu entorno)
psql -v ON_ERROR_STOP=1 -U {admin_user} -d {database} < app/migrations/NNN_descripcion.sql
```

### Verificacion post-migracion

```bash
# Tabla existe
psql -U {admin_user} -d {database} -Atc "SELECT to_regclass('schema.tabla');"

# API la expone (si usas PostgREST/Supabase)
curl -s "$API_URL/rest/v1/tabla?select=id&limit=1" \
  -H "apikey: $ANON_KEY" -H "Accept-Profile: schema"
```

---

## RLS (Row Level Security)

| Regla | Detalle |
|-------|---------|
| **Toda tabla con datos de usuario -> RLS ON** | Sin excepciones |
| **Policy minima:** `auth.uid() = user_id` para SELECT/INSERT/UPDATE/DELETE | El usuario solo ve lo suyo |
| **Admin override:** policy adicional para `role = 'admin'` si aplica | No mezclar en la misma policy |
| **Service role:** bypasea RLS por diseno — usar solo en server-side | Nunca en cliente browser |
| **Verificar despues de crear:** `SELECT * FROM pg_policies WHERE tablename = 'X'` | No asumir que se aplico |

### Template RLS

```sql
ALTER TABLE schema.tabla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON schema.tabla
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Indices

| Tipo | Cuando | Ejemplo |
|------|--------|---------|
| B-tree (default) | FKs, filtros frecuentes | `CREATE INDEX ON tabla(source_id)` |
| HNSW (pgvector) | Vector similarity search | `CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)` |
| GIN | Full-text search, JSONB | `CREATE INDEX ... USING gin (metadata)` |

**Regla:** No crear indices especulativos. Crear cuando hay una query lenta medida.

---

## Queries

| Regla | Razon |
|-------|-------|
| No `SELECT *` en produccion | Solo las columnas necesarias |
| Paginar con `LIMIT` + `OFFSET` o cursores | Sin resultados ilimitados |
| `ILIKE` solo si es necesario — preferir `=` con valor normalizado | Performance |
| Escapar input del usuario en `ILIKE` patterns | SQL injection via `%`, `_` |
| No joins de mas de 3 tablas sin justificacion | Complejidad y performance |

---

## Anti-patterns

- **No crear tablas sin `organization_id`** — viola contrato de migracion
- **No usar `CASCADE` sin verificar** — puede borrar datos que no esperas
- **No crear FK a tablas de otro schema sin documentar** — dependencia cruzada oculta
- **No modificar funciones RPC sin verificar callers** — pueden tener consumidores que no ves
