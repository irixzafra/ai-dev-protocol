# AI Dev Protocol

> Protocolo progresivo para desarrollo con IA.
> Empieza simple. Escala cuando lo necesites.
> Probado en producción con 4 agentes concurrentes en un SaaS real.

---

## El problema que resuelve

Si usas IA para programar, estos 3 fallos te son familiares:

1. **La IA construye lo que no querías** — asumió en vez de preguntar.
2. **Los mismos errores se repiten semana a semana** — cada sesión empieza desde cero.
3. **Dice "terminado" pero no lo está** — sin verificación real.

Estos 3 fallos se resuelven con solo 3 cosas mínimas:

| ID | Regla | Fallo que previene |
|---|---|---|
| **R1** | Alineación — la IA escribe una spec, tú apruebas, luego codifica | La IA construye lo que no querías |
| **R2** | Memoria — cada corrección se captura y llega donde se lee | Los mismos errores se repiten |
| **R3** | Verificación — type-check + tests + secrets antes de "done" | Código roto llega al repo |

Con R1+R2+R3 ya tienes un sistema mucho mejor que hablarle directamente a Claude/Grok/Gemini sin estructura. El resto de este protocolo son capas opcionales que añades cuando el proyecto lo exige.

---

## Niveles progresivos

### Nivel 0 — Básico

> Para cualquier dev con 1 agente. Copia 3 archivos y empieza en 5 minutos.

**Resuelve:** R1 + R2 + R3

**Cuándo usarlo:** Tú solo, Claude Code (o cualquier agente) en tu portátil, un fix o un feature. Sin complejidad extra.

**Qué incluye:**
- `protocol.md` — el loop completo (alinear → ejecutar → verificar → reflexionar)
- `lessons.template.md` — inbox de correcciones con modelo de graduación
- `pre-commit` (lite) — bloquea secrets y fuerza que las lecciones lleguen a destino

**→ [`level-0-core/`](level-0-core/)**

```bash
cp level-0-core/protocol.md your-project/dev.protocol.md
cp level-0-core/claude.template.md your-project/CLAUDE.md
cp level-0-core/lessons.template.md your-project/planning/LESSONS.md
```

---

### Nivel 1 — Multi-agente

> Cuando tienes ≥2 agentes en paralelo, o cambias de modelo (Claude → Grok → Qwen).

**Añade:** R4 (coordinación) + R5 (portabilidad)

**Cuándo usarlo:** Varios agentes en el mismo repo, o quieres que el protocolo funcione igual con cualquier LLM sin reescribirlo para cada uno.

**Qué incluye:**
- Entrevista de alineación estructurada (con sección de "no-goals" explícita)
- Cola autónoma + mecanismo de claim (los agentes no se pisan)
- Loop de auto-mejora con graduación obligada (el pre-commit lo fuerza)
- Adaptadores por modelo: Claude Code, Codex/GPT-4o, Gemini, Qwen

**→ [`level-1-multi-agent/`](level-1-multi-agent/)**

---

### Nivel 2 — Producción y autonomía

> Para calidad UI seria y loops de optimización overnight sin supervisión.

**Añade:** R6 (calidad) + R7 (optimización)

**Cuándo usarlo:** SaaS con CI/CD, UI generada por IA que no puede verse genérica, o quieres que la IA experimente sola mientras duermes.

**Qué incluye:**
- **Uncodixify:** 10 patrones de UI que los LLMs generan por defecto y que señalan "hecho por IA" — con causa raíz y alternativa correcta
- **WORKBOARD** con cola autónoma (tareas pre-aprobadas que los agentes ejecutan sin supervisión)
- **program.md** — loop de optimización autónomo (inspirado en karpathy/autoresearch): init → run → log → compare → iterate

**→ [`level-2-production/`](level-2-production/)**

---

## Ejemplos reales de cuándo usar cada nivel

| Situación | Nivel |
|---|---|
| Tú solo, fix rápido en tu app personal | **Nivel 0** |
| Feature nueva con Claude, quieres spec aprobada antes de código | **Nivel 0** |
| 2-4 agentes en paralelo en el mismo repo | **Nivel 0 + 1** |
| Cambias entre Claude y Qwen según la tarea | **Nivel 0 + 1** |
| UI generada por IA que no puede verse genérica | **Nivel 0 + 1 + 2** |
| Optimización autónoma overnight (RAG, bundle size, etc.) | **Nivel 0 + 1 + 2** |

---

## Estructura de archivos

```
ai-dev-protocol/
├── README.md
│
├── level-0-core/                    ← R1+R2+R3 — mínimo viable
│   ├── protocol.md                  ← el loop completo
│   ├── lessons.template.md          ← inbox de correcciones
│   ├── claude.template.md           ← config de agente (punto de partida)
│   └── pre-commit                   ← hook lite: secrets + graduación
│
├── level-1-multi-agent/             ← R4+R5 — coordinación + portabilidad
│   ├── alignment.md                 ← entrevista de alineación estructurada
│   ├── autonomous.md                ← cola de tareas + mecanismo de claim
│   ├── self-improvement.md          ← loop de auto-mejora + enforcement
│   └── adapters/
│       ├── universal-core.md        ← 6 reglas base (todos los agentes)
│       ├── claude.md                ← overrides Claude Code
│       ├── codex.md                 ← overrides Codex/GPT-4o
│       ├── gemini.md                ← overrides Gemini
│       └── qwen.md                  ← overrides Qwen
│
├── level-2-production/              ← R6+R7 — calidad + optimización
│   ├── workboard.template.md        ← tracking con cola autónoma
│   ├── program.template.md          ← loop de optimización autónomo
│   └── skills/dev-design/references/
│       └── uncodixify.md            ← 10 patrones de UI a eliminar
│
└── docs/
    └── inspirations.md              ← en qué nos inspiramos y qué hacemos diferente
```

---

## Qué hace diferente a este protocolo

| Problema | Boris Cherny (6 reglas) | karpathy | Este protocolo |
|---|---|---|---|
| La IA construye lo que no querías | ⚠️ plan mode | ❌ | ✅ entrevista de alineación estructurada |
| Las lecciones desaparecen | ⚠️ actualizar CLAUDE.md | ❌ | ✅ sistema de graduación + pre-commit gate |
| 4 agentes colisionando | ❌ | ❌ | ✅ mecanismo de claim |
| UI genérica de LLM | ❌ | ❌ | ✅ Uncodixify como referencia de skill |
| Loops de optimización autónoma | ❌ | ✅ | ✅ program.md (generalizado) |
| Tareas pre-aprobadas sin supervisión | ❌ | ❌ | ✅ cola autónoma |
| Correcciones mid-session perdidas | ⚠️ solo al cerrar sesión | ❌ | ✅ captura con latencia cero |
| Funciona con múltiples LLMs | ❌ | ❌ | ✅ patrón de adaptadores |
| Adopción progresiva | ❌ | ❌ | ✅ 3 niveles — empieza con 3 archivos |

→ Análisis completo: [`docs/inspirations.md`](docs/inspirations.md)

---

## Inspiraciones

**Boris Cherny (@bcherny)** — ingeniero que construyó Claude Code en Anthropic.
Sus 6 reglas son la base. Tomamos todas y añadimos:
el sistema de graduación (las lecciones deben llegar donde se leen),
la regla de corrección mid-session (captura con latencia cero), y
coordinación multi-agente (4 agentes en un repo sin colisión).

**karpathy/autoresearch** — el loop de investigación autónoma de Andrej Karpathy.
`init → run → log → compare → iterate`. Lo generalizamos en el patrón
`program.md` para cualquier loop de optimización, no solo ML research.

**Uncodixify** — patrones de UI generados por IA identificados por la comunidad.
Los formalizamos como referencia de skill con causas raíz y alternativas correctas.

**chatgptjunkie** — circuló el "Workflow Orchestration" config (marzo 2026).
La regla "Demand Elegance (Balanced)" viene de ahí.

---

## Probado en producción

- Monorepo Next.js 15 con TypeScript strict mode
- 4 agentes de IA concurrentes: Claude Code, Codex, Gemini, Qwen
- 1700+ tests, pre-commit con 9 quality gates
- SaaS multi-tenant en beta

---

## Contribuir

Cada patrón aquí fue extraído de uso real en producción.
Si tienes una corrección, una skill nueva, o una mejora al protocolo:
abre un PR. El issue es la spec. El PR es la implementación.

---

## Licencia

MIT
