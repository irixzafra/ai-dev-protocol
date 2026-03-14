# Motores de Ejecución — Runtime Guide

> El protocolo es el cerebro. Tú eliges el músculo según tu necesidad.
> La clave: inyectar siempre `dev.protocol.md` (y el playbook) como prompt de sistema base.
> Sin eso, tienes un agente genérico. Con eso, tienes un sistema autónomo.

---

## Matriz de decisión

| Escenario | Motor recomendado | Por qué | Contra |
|:---|:---|:---|:---|
| Equipos técnicos, refactors grandes, código legacy | **OpenHands** | Sandbox Docker, seguro, UI web completa | Pesado — necesita servidor con más RAM |
| Solopreneur, control móvil, VPS barato (4-8€/mes) | **Agente Go ligero** (ej. GoClaw) | Binario único, Telegram/WhatsApp nativo, RAM ínfima | Sandbox menos estricto |
| Solo terminal, sin UI | **Aider** | `pip install`, ligero, ideal para sesiones cortas | Sin UI, sin control remoto |

Elige uno. Inyecta el protocolo. Funciona con cualquier LLM via LiteLLM.

---

## 1. OpenHands — El obrero de fábrica

Para tareas pesadas donde la IA necesita ejecutar código en un entorno aislado sin tocar tu máquina real.

**Qué es:** [OpenHands](https://github.com/All-Hands-AI/OpenHands) (antes OpenDevin) — agente FOSS con UI web y sandbox Docker para cada tarea.

**Beneficios:** Dockerizado, seguro, soporte multi-modelo, UI web accesible desde el iPad.

**Cómo inyectar el protocolo:**

```bash
# Concepto general — adapta a tu setup
docker run -it \
  -v $(pwd):/workspace \
  -e LITELLM_BASE_URL=http://host.docker.internal:4000 \
  -e WORKSPACE_BASE=/workspace \
  docker.all-hands.dev/all-hands-ai/openhands:latest
```

En el workspace, coloca `.openhands/microagents/repo.md` (ver `setup.sh` — lo crea automáticamente).
OpenHands lo lee al arrancar y carga el protocolo sin que pegues nada manualmente.

**Flujo de trabajo:**
1. Abres OpenHands desde el navegador
2. Pegas la tarea o la lees de `planning/WORKBOARD.md`
3. Cierras el navegador — el agente sigue
4. Vuelves a ver el resultado

---

## 2. Agente Go ligero — El CTO de bolsillo

Para gestionar el proyecto desde el móvil. Un agente ligero escrito en Go: binario único, sin dependencias, Telegram/WhatsApp nativo, consume 4-8x menos RAM que las alternativas en Python.

**Por qué Go:** Compila a un solo ejecutable estático (~25 MB). Lo copias al VPS, lo arrancas, y ya está. No hay pip, no hay venv, no hay Docker si no quieres.

**Motor recomendado: [GoClaw](https://github.com/nextlevelbuilder/goclaw)** — 750⭐, 13+ proveedores LLM, 7 canales (Telegram, WhatsApp, Discord...), Docker nativo.

**Cómo inyectar el protocolo en GoClaw:**

GoClaw usa un archivo `SOUL.md` como identidad del agente. Es exactamente donde va el protocolo.

```bash
# 1. Clona y genera secretos
git clone https://github.com/nextlevelbuilder/goclaw /opt/dev-runner
cd /opt/dev-runner && bash prepare-env.sh  # genera GATEWAY_TOKEN + ENCRYPTION_KEY

# 2. Configura .env (provider + telegram + postgres)
cp .env.example .env && nano .env

# 3. Crea el SOUL.md con el protocolo
mkdir -p skills
# → copia el contenido de dev.protocol.md + planning/project.playbook.md en skills/SOUL.md

# 4. Monta el SOUL y arranca
cat > docker-compose.override.yml << 'EOF'
services:
  goclaw:
    volumes:
      - ./skills:/app/skills:ro
    ports:
      - "127.0.0.1:52010:18790"
EOF

docker compose -f docker-compose.yml -f docker-compose.postgres.yml -f docker-compose.override.yml up -d --build
```

**Flujo de trabajo:**
1. El agente corre en el VPS 24/7
2. Tú mandas tareas desde Telegram/WhatsApp mientras duermes o estás de viaje
3. El agente ejecuta el loop del protocolo (Align → Execute → Verify → Reflect)
4. Si se bloquea, te manda el `BLOCKER.md` por chat
5. Tú respondes con la decisión — el agente retoma

**Nota:** Si usas otro sistema de agentes en Go, inyecta `dev.protocol.md` como system prompt y sigue el mismo patrón.

---

## 3. Aider — La navaja suiza de terminal

Para sesiones cortas sin UI. Sin Docker, sin servidor, solo una terminal.

```bash
pip install aider-chat
aider --model openrouter/anthropic/claude-sonnet-4-6 \
      --read dev.protocol.md \
      --read planning/project.playbook.md
```

Más ligero que OpenHands. Ideal si ya tienes un entorno local y solo quieres un agente en terminal para una tarea concreta.

---

## 4. El freno de emergencia — Obligatorio para 24/7

> Un agente autónomo que entra en bucle a las 4AM puede quemar todo tu presupuesto antes del desayuno.

**Dos líneas de defensa:**
1. **Rollback rule** (en `protocol.md`): si la verificación falla 3 veces seguidas, el agente hace `git stash` y vuelve a Phase 1. Primera línea — en el propio protocolo.
2. **LiteLLM budget**: si el agente ignora la rollback rule, LiteLLM corta la conexión al llegar al límite diario. Salvavidas final.

### NUNCA le des la API key directamente al agente

```
❌  ANTHROPIC_API_KEY=sk-ant-... → agente directamente
✅  ANTHROPIC_API_KEY=sk-ant-... → LiteLLM → agente usa http://localhost:4000
```

### LiteLLM — proxy con budget diario

```yaml
# litellm-config.yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gemini-flash
    litellm_params:
      model: openrouter/google/gemini-2.5-flash
      api_key: os.environ/OPENROUTER_API_KEY

general_settings:
  max_budget: 5        # $5 máximo total
  budget_duration: 1d  # se resetea cada 24 horas
```

```bash
docker run -d \
  --name litellm \
  -p 127.0.0.1:4000:4000 \
  -v $(pwd)/litellm-config.yaml:/app/config.yaml \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  ghcr.io/berriai/litellm:main \
  --config /app/config.yaml
```

Al llegar a $5/día → LiteLLM devuelve 429. El agente para. Tú revisas qué pasó.

---

## Infraestructura base (VPS + acceso privado)

### VPS recomendado

| Proveedor | Tier mínimo | Coste |
|---|---|---|
| Hetzner CX22 | 2 vCPU, 4GB RAM | ~4€/mes |
| DigitalOcean Basic | 2 vCPU, 2GB RAM | ~12$/mes |

Para el agente Go ligero, 2GB RAM es más que suficiente. Para OpenHands, usa 4GB+.

### Acceso privado desde móvil — Tailscale

```bash
# En el VPS:
curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up

# En tu móvil: instala la app → misma cuenta → el VPS aparece en tu red privada
```

Accedes al VPS como si fuera local. Sin puertos abiertos al mundo.

---

## El panel de control visual — GitHub Projects

No necesitas una UI propia. El tablero de administración del protocolo es **GitHub Projects** — gratuito e integrado.

```
[Tú — desde el móvil]
   → Creas un Issue: "Añadir validación en /api/users"
   → Lo mueves a "Ready"

[Agente — en el VPS]
   → Lee Issues con etiqueta `auto`
   → Aplica el protocolo (Align → Execute → Verify → Reflect)
   → Mueve la tarjeta a "Done"
   → Cierra el Issue con referencia al commit
```

```bash
# Etiquetas mínimas
gh label create "auto"       --color "#0075ca"  # tarea autónoma
gh label create "in-progress" --color "#e4e669" # reclamada por agente
gh label create "blocked"     --color "#d93f0b" # necesita intervención humana
```

---

## Observabilidad opcional

| Herramienta | Qué hace | Self-hosted |
|---|---|---|
| [Langfuse](https://github.com/langfuse/langfuse) | Trazas, costes, evaluación de prompts | ✅ Docker |
| [Phoenix (Arize)](https://github.com/Arize-ai/phoenix) | Observabilidad de agentes, spans | ✅ pip install |

LiteLLM integra con ambos via callbacks. Para la mayoría de casos el dashboard de LiteLLM es suficiente.

---

## ¿Usas otro motor?

Aider, Cline, Cursor, tu propio agente — el principio es el mismo:

1. Inyecta `dev.protocol.md` como system prompt o contexto inicial
2. Inyecta `planning/project.playbook.md` si existe
3. El agente lee las últimas 3 entradas de `planning/dev-log.md` al arrancar
4. Sigue el loop: Align → Execute → Verify → Reflect

**Contribuye una guía** para tu motor vía PR — ver `CONTRIBUTING.md`.

---

## Coste total estimado

| Concepto | Coste |
|---|---|
| VPS Hetzner CX22 | ~4€/mes |
| LiteLLM, OpenHands, Tailscale | 0€ (FOSS) |
| API (Claude Sonnet) | ~$0.003/1K tokens — budget propio |
| **Total infra** | **~4€/mes + lo que uses de API** |
