# Deployment & Operations Standards

> Criterios de deploy, recuperacion, monitoreo y operaciones en produccion.
> Aplica a todo proyecto desplegado en infraestructura propia o cloud.

---

## Principios

1. **Deploy reproducible** — el mismo commit produce el mismo resultado, siempre
2. **Rollback en < 5 minutos** — si algo se rompe, se vuelve al estado anterior sin pensar
3. **Sin estado local en servidor** — el servidor no tiene checkouts git ni cambios manuales
4. **Health check obligatorio** — si no hay endpoint de health, no hay deploy
5. **Secrets fuera del codigo** — nunca en git, siempre en `.env` o secrets manager

---

## Evolucion del deploy

| Nivel | Metodo | Cuando |
|-------|--------|--------|
| **Basico** | `git archive` -> rsync -> rebuild in-place | Escala baja (1 servidor, baja concurrencia) |
| **Siguiente** | Docker Image Registry -> `docker pull` -> rolling restart | Cuando haya alta disponibilidad o multiples nodos |

El metodo basico funciona y es simple. Evolucionara cuando la escala lo requiera, no antes.

---

## Flujo de deploy canonico

```
git push main
  |
  v
CI (GitHub Actions o similar)
  +-- 1. Empaquetar solo archivos trackeados (git archive)
  +-- 2. Subir artefacto por SSH
  +-- 3. Extraer en /opt/{proyecto}/releases/{sha}
  +-- 4. Copiar .env al release
  +-- 5. rsync --delete al directorio live
  +-- 6. docker compose build + up
  +-- 7. Health check: GET /api/version
          |
          +-- 200 OK -> deploy exitoso
          +-- falla  -> rollback automatico
```

### Reglas

| Regla | Razon |
|-------|-------|
| **Nunca `git pull` en servidor** | El servidor no es un checkout |
| **Nunca editar codigo en servidor** | Los cambios se pierden en el siguiente deploy |
| **`git archive` para empaquetar** | Solo archivos trackeados, sin `.git/` ni gitignored |
| **`rsync --delete` al directorio live** | Elimina archivos huerfanos del deploy anterior |
| **Health check post-deploy** | Detectar fallos antes de que el usuario los vea |

---

## Health check

Todo proyecto debe exponer:

```
GET /api/version
```

Response:
```json
{
  "version": "abc1234",
  "buildTime": "2026-03-18T10:00:00Z",
  "status": "ok"
}
```

### Verificacion manual

```bash
# Desde local
curl -fsS https://{dominio}/api/version

# Desde servidor
docker ps --filter name={container}
docker logs {container} --tail 50
```

---

## Rollback

### Automatico (en CI)

Si el health check falla despues del deploy, CI debe:
1. Restaurar el release anterior desde `/opt/{proyecto}/releases/{sha-anterior}`
2. Rebuild + restart
3. Notificar

### Manual

```bash
ssh {server} '
  set -euo pipefail
  rsync -a --delete /opt/{proyecto}/releases/{sha-bueno}/ /opt/{proyecto}/app/
  docker compose -f /opt/{proyecto}/docker-compose.yml build {servicio}
  docker compose -f /opt/{proyecto}/docker-compose.yml up -d {servicio}
'
# Verificar
curl -fsS https://{dominio}/api/version
```

### Reglas de rollback

| Regla | Razon |
|-------|-------|
| **Mantener ultimos 5 releases** en `/opt/{proyecto}/releases/` | Rollback rapido sin rebuild |
| **No borrar releases hasta tener 5 nuevos** | Siempre hay a donde volver |
| **Rollback primero, diagnosticar despues** | El usuario no espera |

---

## Secrets

| Regla | Detalle |
|-------|---------|
| **Secrets en `.env`** del servidor, nunca en git | `app/.env` en gitignore |
| **Secrets de CI** en el secrets manager del CI | `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, etc. |
| **No copiar secrets entre proyectos** | Cada proyecto tiene sus propias keys |
| **Rotar keys si se exponen** | Inmediatamente, sin esperar |
| **Verificar antes de commit** | Gate G3: sin secrets en diff |

### Variables estandar

```bash
# Database
DATABASE_URL=

# Auth
AUTH_SECRET=

# LLM / AI
LLM_API_KEY=

# Deploy
APP_VERSION=         # commit sha, inyectado en build
APP_BUILD_TIME=      # timestamp, inyectado en build
```

---

## Docker

### Reglas

| Regla | Razon |
|-------|-------|
| **Un servicio = un container** | Aislamiento y reinicio independiente |
| **`restart: unless-stopped`** en compose | Recuperacion automatica |
| **No montar volumenes de codigo** en produccion | El codigo esta en la imagen |
| **Build con `--pull`** en CI | Siempre con imagen base actualizada |
| **No `docker exec` para cambiar codigo** | El codigo viene del deploy |

### Diagnostico

```bash
# Estado de containers
docker ps --filter name={proyecto}

# Logs recientes
docker logs {container} --tail 50 --timestamps

# Recursos
docker stats --no-stream

# Reiniciar un servicio
docker compose -f /opt/{proyecto}/docker-compose.yml restart {servicio}
```

---

## Migraciones en produccion

Las migraciones SQL NO se aplican automaticamente en el deploy.

### Flujo

```
1. Escribir migracion en app/migrations/{NNN}_{desc}.sql
2. Probar localmente (si hay DB local)
3. Aplicar en produccion ANTES del deploy que la necesita:

   psql -v ON_ERROR_STOP=1 -U {admin_user} -d {database} \
     < app/migrations/{NNN}_{desc}.sql

4. Verificar que la tabla/columna/funcion existe
5. Deploy del codigo que la usa
```

### Reglas

| Regla | Razon |
|-------|-------|
| **Migracion antes que codigo** | El codigo asume que el schema existe |
| **`ON_ERROR_STOP=1`** | Detectar fallos al instante |
| **Usar usuario admin** | Permisos correctos para DDL + RLS |
| **Verificar despues de aplicar** | `to_regclass()` o query de prueba |
| **No borrar columnas con datos sin backup** | Irreversible |

---

## Monitoreo

### Que monitorear

| Senal | Como | Frecuencia |
|-------|------|-----------|
| App up | `GET /api/version` | Cada 5 min (uptime monitor) |
| Containers | `docker ps` | Manual o cron |
| Disco | `df -h` | Semanal |
| Memoria | `free -h` | Cuando hay problemas |
| Logs de error | `docker logs --tail 50` | Ante problemas |

### Alertas

| Nivel | Cuando | Accion |
|-------|--------|--------|
| **Critico** | Health check falla, container caido | Rollback inmediato + diagnostico |
| **Warning** | Disco > 80%, memoria > 90%, errores recurrentes | Investigar en < 24h |
| **Info** | Deploy exitoso, migracion aplicada | Solo log |

---

## Recuperacion ante desastres

### Si se cae la app

```bash
# 1. Verificar estado
ssh {server} 'docker ps --filter name={container}'

# 2. Ver logs
ssh {server} 'docker logs {container} --tail 100'

# 3. Reiniciar
ssh {server} 'docker compose -f /opt/{proyecto}/docker-compose.yml restart {servicio}'

# 4. Verificar
curl -fsS https://{dominio}/api/version
```

### Contingencia por dependencia externa

| Dependencia | Si cae | Accion | Impacto usuario |
|-------------|--------|--------|-----------------|
| **LLM provider** | Chat/generacion no funciona | `503 DEPENDENCY_UNAVAILABLE` + mensaje claro | Feature de IA degradada, resto funciona |
| **Embedding service** | Search no funciona | `503` + retry 3x con backoff | Search degradado |
| **Database** | App completa caida | Reiniciar DB | Todo caido |
| **CI/CD** | No se puede deployar | Deploy manual por SSH | Solo deploy afectado |

**Regla:** Nunca degradar silenciosamente. Si falla, decirlo. El usuario prefiere un mensaje honesto a una pantalla vacia.

### Backups

| Que | Frecuencia | Donde |
|-----|-----------|-------|
| Base de datos | Diario (pg_dump o equivalente) | Storage externo |
| Volumenes Docker | Semanal (snapshot del proveedor) | Proveedor cloud |
| Secrets | Manual cuando cambian | Lugar seguro offline |
| Codigo | Siempre en GitHub | GitHub |
