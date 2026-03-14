# Runtime Guide — Cómo ejecutar el protocolo 24/7

> **Filosofía:** Soberanía tecnológica y pragmatismo.
> Solo pagas el VPS y el consumo de API. Todo el tooling es FOSS.
> El agente trabaja mientras duermes. Tú mandas desde el iPad.

---

## Arquitectura en una línea

```
Tu dispositivo (iPad / móvil / portátil)
    ↓  Tailscale VPN (acceso privado, sin puertos abiertos)
VPS Linux
    ├── code-server        → VS Code en el browser
    ├── OpenHands          → agente ejecutor FOSS con UI web
    └── LiteLLM            → proxy de API + budget + logs
            ↓
    OpenRouter / Anthropic / OpenAI  (pagas solo lo que usas)
```

---

## Capa 1 — Infraestructura (el servidor)

### VPS recomendado

| Proveedor | Tier mínimo | Coste |
|---|---|---|
| Hetzner CX22 | 2 vCPU, 4GB RAM, 40GB SSD | ~4€/mes |
| DigitalOcean Basic | 2 vCPU, 2GB RAM | ~12$/mes |
| Cualquier VPS Linux | Ubuntu 22.04+ | — |

4GB RAM es suficiente para code-server + OpenHands + LiteLLM corriendo juntos.

### Tailscale — acceso privado desde cualquier dispositivo

Tailscale crea una red privada entre tus dispositivos. No abres puertos al mundo. Accedes al servidor como si fuera local.

```bash
# En el VPS:
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# En tu iPad / móvil:
# Instala la app Tailscale → misma cuenta → el VPS aparece en tu red privada
```

> **Alternativa 100% self-hosted:** [Headscale](https://github.com/juanfont/headscale) es el control server de Tailscale en FOSS que puedes alojar tú mismo.

### Docker — aislamiento y reproducibilidad

```bash
# Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## Capa 2 — El entorno y el agente (el "músculo")

### code-server — VS Code en el browser

```bash
docker run -d \
  --name code-server \
  -p 127.0.0.1:8080:8080 \
  -v "$HOME/.config:/home/coder/.config" \
  -v "$PWD:/home/coder/project" \
  -e PASSWORD="tu_password_aqui" \
  codercom/code-server:latest
```

Acceso: `http://[tailscale-ip-del-vps]:8080`

Desde la terminal de code-server clonas el repo, editas el playbook, lanzas al agente, y puedes cerrar el browser — el proceso sigue corriendo en el servidor.

### OpenHands — agente ejecutor FOSS

[OpenHands](https://github.com/All-Hands-AI/OpenHands) (antes OpenDevin) es el ejecutor de agentes más completo en FOSS. Tiene UI web, sandbox Docker para cada tarea, y soporte nativo para múltiples modelos.

```bash
docker run -d \
  --name openhands \
  -p 127.0.0.1:3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest \
  -e LITELLM_BASE_URL=http://host.docker.internal:4000 \
  docker.all-hands.dev/all-hands-ai/openhands:latest
```

Acceso: `http://[tailscale-ip]:3000`

**Flujo de trabajo:**
1. Abres OpenHands desde el iPad
2. Pegas la tarea: `"Lee dev.protocol.md y planning/WORKBOARD.md. Ejecuta la tarea AUTO.03."`
3. Cierras el browser — el agente sigue
4. Vuelves cuando quieras a ver el resultado

### Aider — alternativa más ligera (sin UI web)

Si prefieres un agente de terminal sin UI:

```bash
pip install aider-chat
aider --model openrouter/anthropic/claude-sonnet-4-6 \
      --read dev.protocol.md \
      --read planning/project.playbook.md
```

Más ligero que OpenHands. Ideal si ya tienes code-server y solo quieres un agente en terminal.

---

## Capa 3 — El freno de emergencia (control de costes)

> **El problema:** Un agente autónomo que entra en un bucle a las 4AM puede quemar todo tu presupuesto antes del desayuno.
>
> **Dos líneas de defensa:**
> 1. **Rollback rule** (en `protocol.md`): si la verificación falla 3 veces seguidas, el agente hace reset al último commit limpio. Primera línea, en el propio protocolo.
> 2. **LiteLLM budget**: si el agente ignora la rollback rule o el bucle no es de verificación, LiteLLM corta la conexión al llegar al límite diario. Salvavidas final.

### NUNCA le des la API key directamente al agente

```
❌  ANTHROPIC_API_KEY=sk-ant-... → agente directamente
✅  ANTHROPIC_API_KEY=sk-ant-... → LiteLLM → agente usa http://localhost:4000
```

El agente solo ve la URL del proxy. No puede hacer llamadas directas.

### LiteLLM — proxy FOSS con budget

```bash
# litellm-config.yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-haiku
    litellm_params:
      model: anthropic/claude-haiku-4-5-20251001
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: openrouter-gemini
    litellm_params:
      model: openrouter/google/gemini-2.5-flash
      api_key: os.environ/OPENROUTER_API_KEY

litellm_settings:
  budget_manager: True

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
  -e OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
  ghcr.io/berriai/litellm:main \
  --config /app/config.yaml --detailed_debug
```

Dashboard de logs: `http://[tailscale-ip]:4000/ui`

Al llegar a $5/día → LiteLLM devuelve 429. El agente para. Tú revisas qué pasó.

---

## Docker Compose completo

```yaml
# docker-compose.yml
services:
  litellm:
    image: ghcr.io/berriai/litellm:main
    ports:
      - "127.0.0.1:4000:4000"
    volumes:
      - ./litellm-config.yaml:/app/config.yaml
    env_file: .env
    command: --config /app/config.yaml
    restart: unless-stopped

  code-server:
    image: codercom/code-server:latest
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - ./workspace:/home/coder/project
      - coder-config:/home/coder/.config
    environment:
      PASSWORD: ${CODE_SERVER_PASSWORD}
    restart: unless-stopped

  openhands:
    image: docker.all-hands.dev/all-hands-ai/openhands:latest
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      LITELLM_BASE_URL: http://litellm:4000
    depends_on:
      - litellm
    restart: unless-stopped

volumes:
  coder-config:
```

```bash
# .env (nunca en git)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
CODE_SERVER_PASSWORD=elige_una_clave

# Arrancar todo:
docker compose up -d
```

---

## Setup en 15 minutos

```bash
# 1. VPS nuevo con Ubuntu 22.04
ssh root@tu-vps-ip

# 2. Tailscale
curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up

# 3. Docker
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER
newgrp docker

# 4. Clonar el protocolo y tu proyecto
mkdir -p ~/workspace
git clone https://github.com/irixzafra/ai-dev-protocol ~/ai-dev-protocol
git clone https://github.com/tu-usuario/tu-proyecto ~/workspace/tu-proyecto

# 5. Copiar archivos Level 0 al proyecto
bash ~/ai-dev-protocol/setup.sh ~/workspace/tu-proyecto

# 6. Configurar LiteLLM y arrancar
cp ~/ai-dev-protocol/docs/litellm-config.yaml ~/litellm-config.yaml
# Editar: añadir tus API keys en .env
docker compose up -d

# 7. Desde el iPad:
# http://[tailscale-ip]:8080  → code-server (VS Code)
# http://[tailscale-ip]:3000  → OpenHands (agente)
# http://[tailscale-ip]:4000/ui → LiteLLM (logs y gasto)
```

---

## Observabilidad opcional (FOSS)

Si quieres un dashboard de trazas y evaluación de prompts:

| Herramienta | Qué hace | Self-hosted |
|---|---|---|
| [Langfuse](https://github.com/langfuse/langfuse) | Trazas, costs, evaluación de prompts | ✅ Docker |
| [Phoenix (Arize)](https://github.com/Arize-ai/phoenix) | Observabilidad de agentes, spans | ✅ pip install |

LiteLLM ya integra con ambos via callbacks. Para la mayoría de casos el dashboard de LiteLLM es suficiente.

---

## Coste total estimado

| Concepto | Coste |
|---|---|
| VPS Hetzner CX22 | ~4€/mes |
| LiteLLM, code-server, OpenHands | 0€ (FOSS) |
| Tailscale (personal) | 0€ |
| API (Claude Sonnet) | ~$0.003 por 1K tokens — budget propio |
| **Total infra** | **~4€/mes + lo que uses de API** |

El budget de LiteLLM garantiza que el "lo que uses de API" nunca supere tu límite diario.
