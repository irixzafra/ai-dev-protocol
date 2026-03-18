# Cognitive Walkthrough — Simulación de usuario paso a paso

## Cuándo usar

Cuando necesitas evaluar un flujo específico en profundidad. No para auditoría general (usar heuristics.md) sino para responder: "¿puede un usuario nuevo completar esta tarea sin ayuda?"

## Método

### Paso 1: Definir el escenario
- **Tarea**: qué quiere lograr el usuario (ej: "crear un nuevo proyecto")
- **Persona**: quién es (novato, intermedio, experto)
- **Contexto**: desde dónde llega y qué sabe antes de empezar

### Paso 2: Trazar acciones atómicas
Descomponer el flujo en cada acción individual que el usuario debe realizar. Una acción = un clic, una escritura, o una decisión.

Ejemplo:
```
Tarea: "Crear un nuevo cliente"
1. Localizar "Clientes" en el sidebar
2. Clic en "Clientes"
3. Localizar botón "+ Nuevo"
4. Clic en "+ Nuevo"
5. Rellenar campo "Nombre"
6. Rellenar campo "Email"
7. Seleccionar "Tipo" del dropdown
8. Clic en "Guardar"
9. Verificar que se guardó correctamente
```

### Paso 3: Las 4 preguntas (por cada acción)

Para cada acción atómica, responder:

| Pregunta | Qué evalúa | Ejemplo de fallo |
|---|---|---|
| **¿Intentará?** | ¿El usuario sabe que debe hacer esta acción? ¿Encaja en su modelo mental? | No sabe que primero debe ir a "Clientes" para crear uno |
| **¿Lo verá?** | ¿El elemento es visible sin buscar? ¿Está donde el usuario espera? | El botón "+ Nuevo" está debajo del scroll, no lo ve |
| **¿Lo asociará?** | ¿El label/icono comunica que esto hace lo que necesita? | El botón dice "Añadir registro" en vez de "Nuevo cliente" |
| **¿Verá progreso?** | ¿Después de actuar, sabe que avanzó? ¿Hay feedback? | Tras guardar, no hay confirmación. ¿Se guardó o no? |

### Paso 4: Tabla de evaluación

```markdown
| # | Acción | ¿Intentará? | ¿Lo verá? | ¿Lo asociará? | ¿Progreso? | Riesgo |
|---|---|---|---|---|---|---|
| 1 | Ir a Clientes | ✅ Sí | ✅ Visible en sidebar | ✅ Label claro | ✅ Página cambia | Bajo |
| 2 | Clic "+ Nuevo" | ✅ Sí | ❌ Bajo scroll | ✅ Label OK | ✅ Modal abre | ALTO |
| 3 | Campo Nombre | ✅ Sí | ✅ Primer campo | ✅ Label claro | ⚠️ Sin validación | Medio |
| ... | ... | ... | ... | ... | ... | ... |
```

### Paso 5: Probabilidad de éxito

Estimar por tipo de usuario:

| Tipo | P(éxito) | Tiempo estimado | Bloqueadores |
|---|---|---|---|
| Novato | 60% | >3 min | Acción #2 (no ve el botón) |
| Intermedio | 85% | ~1.5 min | — |
| Experto | 95% | <1 min | — |

**Target**: novatos deben tener ≥80% de éxito en tareas core en <3 minutos.

### Paso 6: Propuestas

Para cada acción con ❌ o ⚠️:
- **Qué falla** (cuál de las 4 preguntas)
- **Diagnosis** (execution/evaluation gulf + slip/mistake)
- **Fix concreto** (archivo, línea, cambio)
- **Impacto**: cómo cambia la P(éxito)

## Ejemplo completo de output

```
## Walkthrough: "Crear nuevo cliente"

Persona: usuario nuevo, primera vez en la app
Contexto: acaba de hacer login, dashboard vacío

| # | Acción | Intentará | Verá | Asociará | Progreso | Riesgo |
|---|---|---|---|---|---|---|
| 1 | Buscar "Clientes" en sidebar | ✅ | ✅ | ✅ | ✅ | ○ |
| 2 | Clic en "Clientes" | ✅ | ✅ | ✅ | ✅ | ○ |
| 3 | Buscar botón de crear | ✅ | ❌ | — | — | ● ALTO |
| 4 | Clic en "+ Nuevo" | — | ❌ | ⚠️ | ✅ | ● ALTO |
| 5-7 | Rellenar formulario | ✅ | ✅ | ✅ | ⚠️ | ◐ |
| 8 | Guardar | ✅ | ✅ | ✅ | ❌ | ● ALTO |

Bloqueadores encontrados:
- #3-4: botón "+ Nuevo" solo visible tras scroll → execution gulf
  Fix: mover a header sticky de la sección | `app/clients/page.tsx:L24`
- #8: sin confirmación tras guardar → evaluation gulf
  Fix: toast con "Cliente creado" + link al detalle | `components/client-form.tsx:L89`

Probabilidad de éxito (novato): 45% → con fixes: ~90%
```
