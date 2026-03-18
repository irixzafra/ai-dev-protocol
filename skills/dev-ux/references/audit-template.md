# Template de Auditoría UX

Usar este formato para presentar los resultados.

---

## Formato de reporte

```markdown
# Auditoría UX — [Nombre del proyecto/sección]

## UX Score: [X]/100 — Grade [A-F]

| Categoría | Checks | Pass | Fail | Score parcial |
|---|---|---|---|---|
| Navegación (15) | 15 | X | Y | -Z pts |
| Formularios (12) | N/A o 12 | X | Y | -Z pts |
| Feedback (10) | 10 | X | Y | -Z pts |
| Estados vacíos (8) | 8 | X | Y | -Z pts |
| Accesibilidad (10) | 10 | X | Y | -Z pts |
| Carga cognitiva (8) | 8 | X | Y | -Z pts |
| Onboarding (7) | 7 | X | Y | -Z pts |
| **Total** | **70** | **X** | **Y** | **Score** |

Grades: A (90-100) · B (80-89) · C (70-79) · D (60-69) · F (<60)

---

## Resumen ejecutivo

[2-3 frases sin jerga técnica. Qué problema hay, cuánto afecta, dirección de la solución.]

---

## Métricas de navegación

| Métrica | Actual | Target | Estado |
|---|---|---|---|
| Items en nav principal | X | 5-7 | ✅/⚠️/❌ |
| Niveles de profundidad | X | ≤ 3 | ✅/⚠️/❌ |
| Clics al destino más lejano | X | ≤ 3 | ✅/⚠️/❌ |
| Pantallas con empty state | X% | 100% | ✅/⚠️/❌ |
| Consistencia de patrones | X% | >90% | ✅/⚠️/❌ |
| Callejones sin salida | X | 0 | ✅/⚠️/❌ |

---

## Mapa de navegación actual

```
Sidebar (N items)
├── Item 1 ──── página directa ─── 1 clic
├── Item 2 ──┬── Tab A ─── 2 clics
│            └── Tab B ─── 2 clics
└── Item N ──── (⚠️ ¿se usa?)
```

---

## Hallazgos

### ❌ ESENCIAL (bloquea al usuario)

| # | Hallazgo | Diagnosis | Sev × Freq | Dónde | Archivo |
|---|---|---|---|---|---|
| 1 | [qué pasa] | [exec/eval gulf] + [slip/mistake] | Crítico × Todos (-15) | [sección] | `file:L42` |

### ⚠️ IMPACTANTE (fricción real)

| # | Hallazgo | Diagnosis | Sev × Freq | Dónde | Archivo |
|---|---|---|---|---|---|
| 2 | [qué pasa] | [exec/eval gulf] + [slip/mistake] | Alto × Muchos (-6) | [sección] | `file:L42` |

### 💡 DETALLE (mejora de calidad)

| # | Hallazgo | Diagnosis | Sev × Freq | Dónde | Archivo |
|---|---|---|---|---|---|
| 3 | [qué pasa] | [exec/eval gulf] + [slip/mistake] | Medio × Algunos (-1) | [sección] | `file:L42` |

---

## Propuestas concretas

### Propuesta 1: [título]
**Resuelve:** Hallazgo #X
**Diagnosis:** [execution/evaluation gulf — qué falla en la experiencia]
**Qué cambiar:** [descripción precisa]
**Archivo:** `path/file.tsx` líneas X-Y
**Antes → después:** [1 frase]
**Esfuerzo:** Trivial / Pequeño / Medio
**Impacto en score:** +N puntos

---

## Navegación propuesta

```
Sidebar (N → M items)
├── Item 1 (sin cambios)
├── Item 2 (fusionado con Item 5)
└── Item M
```

**Cambios:**
- Eliminado: [qué y por qué]
- Movido: [qué y a dónde]
- Fusionado: [qué items y bajo qué nombre]
- Añadido: [accesos directos nuevos]

---

## Flujos revisados

### Flujo: [nombre]
**Antes:** X pasos, Y clics
**Después:** X' pasos, Y' clics
**Cambio clave:** [qué se simplificó]
**P(éxito novato):** X% → Y%

---

## Quick wins (hacer primero)

1. [Propuesta X] — alto impacto, trivial (+N pts)
2. [Propuesta Y] — alto impacto, pequeño esfuerzo (+N pts)
3. [Propuesta Z] — medio impacto, trivial (+N pts)

**Score estimado tras quick wins:** [X → Y]/100

---

## Delta tracking (si es re-auditoría)

| Categoría | Anterior | Actual | Δ |
|---|---|---|---|
| Fixed | — | X issues resueltos | ✅ |
| New | — | X issues nuevos | ⚠️ |
| Persistent | — | X sin resolver | ❌ |
| Regressed | — | X que empeoraron | ❌❌ |
```

---

## Notas para el auditor

- Siempre cuantificar: "14 items cuando target es 7", no "demasiados items"
- Siempre dar archivos y líneas concretas
- Cada hallazgo DEBE tener diagnosis label (gulf + error type)
- Las propuestas deben ser accionables por dev-builder sin ambigüedad
- Nunca proponer "simplificar" — decir exactamente qué quitar, mover o fusionar
- Quick wins primero: máximo impacto, mínimo esfuerzo
- El score da una foto comparable entre auditorías
- El mapa de navegación propuesto es el entregable más valioso
- Si no puedes determinar algo desde código/screenshots, marca "requiere test con usuarios"
