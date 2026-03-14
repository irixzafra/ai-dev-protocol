# AI Dev Protocol

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-v0.2.0-blue)
![No dependencies](https://img.shields.io/badge/dependencies-none-green)

**Un conjunto de reglas + templates que le dicen a tu agente de IA cómo trabajar en tu proyecto.**

Sin código. Sin dependencias. Solo archivos Markdown que copias a tu repo y tu agente lee.
Funciona con Claude Code, Codex, Gemini, Qwen, o cualquier LLM.

---

## Si no eres desarrollador/a

No necesitas tocar código para usar este sistema.

```
[Tú — desde el navegador]
   → Abres GitHub y creas una tarjeta: "Quiero que los usuarios puedan restablecer su contraseña"
   → Rellenas un formulario simple: qué quieres, quién se beneficia, qué no debe cambiar

[La IA — en el servidor]
   → Lee tu tarjeta
   → Te pide confirmación antes de tocar nada
   → Implementa el código, pasa los tests, cierra la tarjeta

[Tú — a la mañana siguiente]
   → Ves la tarjeta en "Hecho"
   → Revisas el resultado
   → Apruebas o pides ajustes con un comentario
```

El desarrollador instala el protocolo una vez. Después, tú y la IA trabajáis directamente.

→ Guía completa para perfiles no técnicos: [`docs/stakeholders.md`](docs/stakeholders.md)

---

## El problema (para desarrolladores)

Si usas IA para programar, estos 3 fallos te son familiares:

- **Construye lo que no querías** — asumió en vez de preguntar
- **Repite los mismos errores** — cada sesión empieza desde cero
- **Dice "terminado" y no lo está** — sin verificación real

Los 3 se resuelven con 3 reglas mínimas, aplicadas de forma consistente.

---

## Empieza aquí — 5 minutos

```bash
# Opción A: script automático
bash <(curl -fsSL https://raw.githubusercontent.com/irixzafra/ai-dev-protocol/main/setup.sh)

# Opción B: manual
cp level-0-core/protocol.md        tu-proyecto/dev.protocol.md
cp level-0-core/templates/agent-config.template.md  tu-proyecto/CLAUDE.md
cp level-0-core/templates/lessons.template.md       tu-proyecto/planning/LESSONS.md
```

Luego dile a tu agente:
```
Lee dev.protocol.md antes de hacer cualquier cosa.
```

Eso es todo para empezar.

---

## Cómo funciona

Tres reglas que el agente sigue en cada tarea:

| Regla | Qué hace | Fallo que previene |
|---|---|---|
| **R1 — Alinear** | Escribe una spec, tú la apruebas, luego codifica | Construye lo que no querías |
| **R2 — Recordar** | Cada corrección se captura en un archivo que lee siempre | Los mismos errores se repiten |
| **R3 — Verificar** | Type-check + tests + secrets antes de "done" | Código roto llega al repo |

Con R1+R2+R3 ya tienes un sistema estructurado. El resto del protocolo son capas opcionales.

---

## Niveles — empieza donde estás, escala cuando lo necesites

### Nivel 0 — Un agente, cualquier proyecto

**Para:** cualquier dev con 1 agente de IA. Fix rápido, feature nueva, proyecto personal.

**Incluye:** `protocol.md` + `LESSONS.md` + `pre-commit` lite

**Setup:** 5 minutos — [ver `level-0-core/`](level-0-core/)

---

### Nivel 1 — Varios agentes o varios modelos

**Para:** 2+ agentes en paralelo, o cambias entre Claude/Grok/Qwen según la tarea.

**Añade:**
- Entrevista de alineación estructurada (con "non-goals" explícitos)
- Cola de tareas con claim atómico (los agentes no se pisan)
- Adaptadores por modelo: el protocolo funciona igual en cualquier LLM
- `scratchpad.md` (gitignored): estado en-vuelo entre sesiones — si cambia el modelo, el siguiente agente sabe exactamente dónde se quedó el anterior

**→ [`level-1-multi-agent/`](level-1-multi-agent/)**

---

### Nivel 2 — Calidad y autonomía en producción

**Para:** UI generada por IA que no puede verse genérica, loops de optimización sin supervisión, proyectos serios con múltiples skills.

**Añade:**
- Skills por dominio: backend, security, architecture, UI design
- Playbook de proyecto (SSOT del stack y patrones específicos)
- `program.md` — loop autónomo: init → run → log → compare → iterate

**→ [`level-2-production/`](level-2-production/)**

---

## Cuándo usar cada nivel

| Situación | Nivel |
|---|---|
| Fix rápido en tu app personal con Claude | 0 |
| Feature nueva — quieres spec aprobada antes de código | 0 |
| 2+ agentes en el mismo repo sin que se pisen | 0 + 1 |
| Cambias de modelo según la tarea | 0 + 1 |
| UI generada que no puede parecer "genérica de IA" | 0 + 1 + 2 |
| Optimización autónoma overnight (RAG, bundle, queries) | 0 + 1 + 2 |

---

## Estructura

```
ai-dev-protocol/
├── setup.sh                              ← Level 0 en un comando
│
├── level-0-core/                         ← las 3 reglas mínimas
│   ├── protocol.md                       ← el loop completo
│   ├── pre-commit                        ← hook lite: secrets + graduación
│   ├── discovery.md                      ← genera el playbook de tu proyecto
│   └── templates/
│       ├── README.md                     ← qué copiar al proyecto vs qué es referencia
│       ├── agent-config.template.md      ← config del agente (punto de partida)
│       ├── lessons.template.md           ← inbox de correcciones
│       ├── dev-log.template.md           ← memoria episódica (lo que pasó esta semana)
│       ├── feature-request.issue.md      ← template de Issue para perfiles no técnicos
│       ├── backlog.template.md           ← captura de ideas antes de ser tareas
│       ├── adr.template.md               ← Architecture Decision Record
│       └── pdr.template.md               ← Preliminary Design Review
│
├── level-1-multi-agent/                  ← coordinación + portabilidad
│   ├── alignment.md
│   ├── autonomous.md
│   ├── self-improvement.md
│   └── adapters/
│       ├── universal-core.md             ← 6 reglas base, todos los agentes
│       ├── claude.md
│       ├── codex.md
│       ├── gemini.md
│       └── qwen.md
│
├── level-2-production/                   ← calidad + autonomía
│   ├── templates/
│   │   ├── playbook.template.md          ← SSOT del proyecto
│   │   ├── workboard.template.md         ← tracking con cola autónoma
│   │   └── program.template.md           ← loop de optimización
│   └── skills/
│       ├── dev-design/        ← 10 patrones UI de IA a eliminar
│       ├── dev-backend/       ← 10 anti-patterns backend
│       ├── dev-security/      ← OWASP Top 10 para agentes
│       ├── dev-architecture/  ← ADR/PDR + anti-patterns estructurales
│       ├── dev-performance/   ← waterfalls, listas sin virtualizar, bundle size
│       ├── dev-accessibility/ ← WCAG 2.1 AA — los LLMs ignoran a11y por defecto
│       └── dev-testing-strategy/ ← tests de comportamiento, no de implementación
│
├── examples/
│   ├── saas-nextjs/                      ← playbook de ejemplo (Next.js + Supabase)
│   └── protocol-evolution/               ← loop autónomo de descubrimiento de tendencias
│
└── docs/
    ├── inspirations.md                   ← en qué nos basamos y qué hacemos diferente
    ├── runtime-guide.md                  ← cómo ejecutar agentes 24/7 (VPS + FOSS)
    ├── stakeholders.md                   ← guía para perfiles no técnicos
    └── litellm-config.yaml               ← proxy de API con budget — el freno de emergencia
```

---

## Diferencias con otras aproximaciones

| Problema | Boris Cherny (6 reglas) | karpathy | Este protocolo |
|---|---|---|---|
| La IA construye lo que no querías | ⚠️ plan mode | ❌ | ✅ entrevista de alineación estructurada |
| Las lecciones desaparecen | ⚠️ actualizar CLAUDE.md | ❌ | ✅ sistema de graduación + gate en pre-commit |
| 4 agentes colisionando | ❌ | ❌ | ✅ mecanismo de claim atómico |
| UI genérica de LLM | ❌ | ❌ | ✅ Uncodixify (10 patrones con alternativas) |
| Loops de optimización autónomos | ❌ | ✅ ML only | ✅ program.md (cualquier sistema) |
| Correcciones a mitad de sesión perdidas | ⚠️ solo al cerrar | ❌ | ✅ captura con latencia cero |
| Funciona con múltiples LLMs | ❌ | ❌ | ✅ adaptadores por modelo |
| Adopción progresiva | ❌ | ❌ | ✅ empieza con 3 archivos |
| Accesible a perfiles no técnicos | ❌ | ❌ | ✅ GitHub Issues + tablero visual |

→ Análisis completo de inspiraciones: [`docs/inspirations.md`](docs/inspirations.md)

→ Cómo ejecutar agentes 24/7 con FOSS (VPS + OpenHands + LiteLLM): [`docs/runtime-guide.md`](docs/runtime-guide.md)

→ Cómo exponer el sistema a perfiles no técnicos (GitHub Projects + Pages + DEV_LOG): [`docs/stakeholders.md`](docs/stakeholders.md)

---

## Probado en producción

- Monorepo Next.js 15 con TypeScript strict mode
- 4 agentes concurrentes: Claude Code, Codex, Gemini, Qwen
- 1700+ tests, 9 quality gates en pre-commit
- SaaS multi-tenant en beta

---

## Contribuir

Cada patrón aquí viene de uso real en producción.

- **Nueva skill:** abre un issue con la plantilla "New skill suggestion"
- **Mejora al protocolo:** issue con "Protocol improvement"
- **El issue es la spec. El PR es la implementación.**

---

## Licencia

MIT
