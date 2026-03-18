# Testing & QA Standards

> Criterios de testing, benchmarks, y gates de aprobacion.
> Define cuando escribir tests, que tipo, y como se valida antes de produccion.

---

## Filosofia

No hacemos testing por cobertura. Hacemos testing por **confianza.** Un test existe para responder: "puedo deployar esto sin miedo?"

---

## Tipos de test y cuando aplicar

| Tipo | Cuando es obligatorio | Cuando se omite |
|------|----------------------|-----------------|
| **Type-check** (`tsc --noEmit`) | Siempre. Gate G1. | Nunca se omite |
| **Lint** | Siempre. Gate G2. | Nunca se omite |
| **Build** | Siempre. Gate G1. | Nunca se omite |
| **Unit test** | Logica de dominio compleja (engines, parsers, scoring) | UI components, wrappers triviales |
| **Integration test** | API routes, pipelines de datos, migraciones | Endpoints que solo hacen proxy |
| **E2E / Browser** | Flujos criticos de usuario (auth, checkout, onboarding) | Paginas estaticas sin interaccion |
| **Benchmark** | Performance de retrieval, generacion, pipelines | Features sin requisito de latencia |
| **Visual regression** | Cuando haya Chromatic/Percy configurado | Hasta entonces: revision manual |

### Regla practica

> Si la funcion tiene mas de 3 branches logicos o transforma datos no triviales -> unit test.
> Si el endpoint orquesta 2+ servicios -> integration test.
> Si el usuario puede perder datos o acceso -> E2E.

---

## Gate de aprobacion — Checklist de PR

Todo PR debe pasar estos checks antes de merge:

### Gates automaticos (bloquean merge)

- [ ] G1: `tsc --noEmit` + `build` -> 0 errores
- [ ] G2: `lint` -> 0 warnings
- [ ] G3: Sin secrets en diff
- [ ] Tests existentes pasan (no regresiones)

### Revision humana (el owner aprueba)

- [ ] El codigo implementa lo que dice la spec — ni mas ni menos
- [ ] No hay archivos tocados fuera del scope de la spec
- [ ] No hay patrones duplicados (grep realizado)
- [ ] Naming sigue convenciones del proyecto
- [ ] Si hay UI: funciona en light + dark, desktop + mobile
- [ ] Si hay DB: migracion incluida, RLS verificado
- [ ] Si hay API: contrato `{ success, data, error }` respetado

### Para FULL features (adicional)

- [ ] G4: Diff vs spec — nada fuera del plan
- [ ] Browser smoke test del flujo afectado
- [ ] WORKBOARD actualizado
- [ ] MEMORY.md si hubo decisiones

---

## Pipeline completo de verificacion — FULL features

Para tareas FULL (features nuevas), los gates G1-G3 no son suficientes.
El pipeline completo tiene 3 capas: automatica, agente, y humana.

### Capa 1 — Gates automaticos (el agente los ejecuta solo)

| Gate | Comando | Bloquea merge |
|------|---------|---------------|
| G1 Type-check | type-check command del proyecto | Si |
| G2 Lint | lint command del proyecto | Si |
| G3 Secrets | Pre-push hook | Si |
| G4 Scope | `git diff --stat` coincide con spec | Si |

### Capa 2 — Verificacion del agente (antes de entregar al owner)

| Verificacion | Como | Referencia |
|---|---|---|
| **Browser smoke** | Test E2E o Playwright manual sobre las rutas tocadas | Obligatorio si se toco UI visible |
| **Design compliance** | Verificar que se usan tokens del design system, no hex hardcoded | `framework/design-system.md` |
| **Componentes canonicos** | Verificar que se usaron los componentes compartidos, no alternativas ad-hoc | Libreria UI del proyecto |
| **Nomenclatura** | Verificar que nombres de componentes, rutas y variables siguen convenciones | Playbook del proyecto |
| **Scope match** | El diff coincide exactamente con la spec — nada mas, nada menos | La spec aprobada |

### Capa 3 — Revision humana del owner (gate final)

El owner entra en dos momentos:
1. **Al principio:** aprueba la spec (intake -> propuesta -> "aprobada")
2. **Al final:** revisa la entrega y da el OK para merge

**Checklist del owner (en lenguaje no tecnico):**

- [ ] Hace lo que pedi? (funcionalidad)
- [ ] Se ve bien? (si hay UI: verificar en el navegador)
- [ ] Tocaron solo lo que debian? (revisar `git diff --stat`)
- [ ] Algo se rompio? (el agente debe mostrar gates verdes)
- [ ] Puedo revertirlo facilmente? (es un commit, no una migracion irreversible)

**Si el owner no dice "OK":** el agente corrige y vuelve a presentar.
**Si el owner dice "OK":** se mergea/pushea y se cierra la tarea en WORKBOARD.

### Cuando se aplica cada capa

| Talla | Capa 1 (auto) | Capa 2 (agente) | Capa 3 (owner) |
|-------|:---:|:---:|:---:|
| NANO | yes | — | — |
| MINI | yes | Solo browser si toco UI | Solo si el owner quiere |
| FULL | yes | yes completa | yes obligatoria |
| AUTO.* | yes | — | Otro dev audita (no el owner) |

---

## Benchmarks

### Cuando crear un benchmark

- Hay un requisito de performance medible (latencia, throughput, accuracy)
- Se necesita comparar antes/despues de un cambio
- El producto tiene un gate de calidad basado en metricas

### Estructura de un benchmark

```
app/benchmarks/
├── {nombre}-{contexto}.json       <- fixture de casos
└── ...

API: POST /api/benchmarks/{nombre}
CLI: npm run benchmark:{nombre}
```

### Reglas

| Regla | Razon |
|-------|-------|
| Fixture en JSON, no hardcodeada en codigo | Reproducible, editable |
| Ejecutar contra el runtime real (no mocks) | El benchmark mide lo que usa el usuario |
| Guardar resultados con commit hash | Trazabilidad |
| No optimizar para el benchmark | Goodhart's law — optimizar para el usuario |

---

## Criterios de aceptacion por tipo de cambio

| Tipo | Criterio minimo | Criterio deseable |
|------|-----------------|-------------------|
| **NANO** (1-5 LOC) | G1 + G2 + G3 | — |
| **MINI** (fix/mejora) | G1 + G2 + G3 + no regresiones | Browser check manual |
| **FULL** (feature) | Todos los gates + browser smoke + spec match | E2E del flujo + benchmark si aplica |
| **Migracion DB** | Apply OK + API expone + RLS verificado | Query de validacion documentada |
| **Hotfix produccion** | G1 + G2 + verificar en prod inmediatamente | Post-mortem en MEMORY.md |

---

## Testing de agentes autonomos

Cuando un agente trabaja sin supervision humana directa:

| Regla | Razon |
|-------|-------|
| El agente ejecuta G1+G2 antes de commitear | No se permite codigo que no compila |
| Si falla 3 veces -> `git stash` + volver a planear | No parchear en circulos |
| Browser test despues de cambios de UI | El agente no "ve" — debe verificar |
| No mergear a main sin gates verdes | Aunque el agente este "seguro" |
| Dejar rastro en WORKBOARD + MEMORY | El siguiente agente/humano necesita contexto |

---

## AI Evals — Gate de calidad para features con IA

Si una feature usa IA (RAG, generacion, embeddings, clasificacion), los gates G1-G3 no son suficientes. El codigo puede compilar y el lint puede pasar, pero la calidad de las respuestas de la IA puede degradarse sin que ningun test lo detecte.

### G5 — AI Eval (obligatorio para tareas P0/P1 que tocan IA)

| Que | Como |
|-----|------|
| **Benchmark de accuracy** | Fixture JSON con casos reales -> medir % pass/partial/fail |
| **Regression check** | Comparar resultado actual vs baseline del ultimo deploy |
| **Guardrails** | Verificar que la IA no alucina, no atribuye mal, no sale del contexto |

### Cuando ejecutar AI Evals

| Cambio | Eval obligatorio? |
|--------|-------------------|
| Cambio en prompts o system message | **Si** — siempre |
| Cambio en retrieval (embeddings, scoring) | **Si** — siempre |
| Cambio en modelo LLM o temperatura | **Si** — siempre |
| Cambio en UI de chat (solo presentacion) | No |
| Cambio en backend no relacionado con IA | No |

### Estructura de un eval

```
app/benchmarks/
├── {nombre}-{contexto}.json       <- fixture de casos
└── ...

Fixture format:
{
  "cases": [
    {
      "id": "example-case",
      "query": "What is X?",
      "expectedKeywords": ["keyword1", "keyword2"],
      "minCitations": 2
    }
  ]
}
```

### Criterios de pass/fail

| Resultado | Definicion |
|-----------|-----------|
| **Pass** | Resultado correcto + keywords presentes + citas suficientes |
| **Partial** | Resultado correcto pero citas insuficientes o keywords debiles |
| **Fail** | Resultado incorrecto, alucinacion, o 0 citas |

### Gate de merge

- **P0/P1 que toca IA:** eval debe dar >= baseline del ultimo deploy. Si baja, no se mergea.
- **Registrar resultado** del eval en el commit message o en la spec: `AI Eval: 95% (19/20 pass, 1 partial)`

---

## Observabilidad en produccion

| Que | Como |
|-----|------|
| Health check | `GET /api/version` — debe responder con commit hash y timestamp |
| Errores de API | Log estructurado con `{ code, message, endpoint, timestamp }` |
| Dependencias caidas | `503` con `DEPENDENCY_UNAVAILABLE` — no silenciar |
| Performance | Medir latencia de endpoints criticos |
| Diagnostico | `docker logs {container} --tail 50` como primer paso |

### Anti-patterns de observabilidad

- ~~`console.log("here")`~~ -> Log estructurado con contexto
- ~~Silenciar errores con `catch() {}`~~ -> Siempre loguear o propagar
- ~~Estado vacio cuando falla el backend~~ -> Mensaje de error explicito
- ~~Retry infinito~~ -> Max 3 reintentos con backoff exponencial
