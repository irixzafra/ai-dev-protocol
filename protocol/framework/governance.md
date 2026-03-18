# Governance — Control del Proyecto para No-Tecnicos

> Como el owner (no tecnico) mantiene el control del proyecto
> cuando los agentes de desarrollo son IA que pueden alucinar,
> desviarse, o crear trabajo innecesario.

---

## El problema que resuelve este documento

Los agentes de IA (Claude, Codex, Gemini, Qwen) son herramientas poderosas pero tienen estos riesgos:

| Riesgo | Ejemplo real | Consecuencia |
|--------|-------------|-------------|
| **Scope creep** | "Ya que estamos, refactorizamos esto tambien" | 150 archivos tocados, bugs nuevos |
| **Duplicacion** | Crear un componente que ya existe con otro nombre | 2 versiones que divergen |
| **Creacion de docs innecesarios** | Crear specs vacias "por si acaso" | 300+ archivos de documentacion |
| **Decisiones unilaterales** | Cambiar la arquitectura sin preguntar | Trabajo que hay que deshacer |
| **Alucinacion** | "Ya esta funcionando" cuando no compila | Falsa sensacion de progreso |

---

## Las 5 reglas del owner

### Regla 1: No hay codigo sin spec aprobada

**Antes de escribir codigo, el agente presenta una spec de 1 pagina.**

La spec debe estar en lenguaje que el owner entienda:
- **Que cambia para el usuario** (no "refactorizo el hook de estado")
- **Que archivos se tocan** (lista explicita)
- **Que NO se toca** (exclusiones claras)
- **Cuanto tarda** (NANO/MINI/FULL)

**El owner dice "aprobada" o "no". Sin esa palabra, no se empieza.**

Excepciones:
- NANO (1-5 lineas, fix obvio): no necesita spec, pero si descripcion en el commit
- Hotfix en produccion: se hace y se documenta despues

### Regla 2: Diff gate — verificar que se toco

**Al terminar, el agente muestra:**

```
Archivos creados:  (lista)
Archivos modificados:  (lista)
Archivos eliminados:  (lista)
```

**El owner compara con la spec.** Si hay archivos que no estaban en la spec -> preguntar por que.

Comando para verificar:
```bash
git diff --stat HEAD~1   # que cambio en el ultimo commit
```

### Regla 3: No crear archivos sin buscar primero

**Antes de crear CUALQUIER archivo nuevo (codigo o doc), el agente debe:**

1. `grep` / buscar si ya existe algo similar
2. Documentar que busco y por que no sirve lo existente
3. Si existe algo similar: extender, no duplicar

**Senal de alarma:** Si un agente dice "voy a crear X", preguntar: "Ya existe algo parecido?"

### Regla 4: Scope lock por sprint

**Al inicio de cada sprint, se define un `SCOPE_LOCK`:**

```markdown
## Sprint N — Scope Lock

### Puede tocar:
- [lista de paths permitidos]

### NO puede tocar (sin aprobacion explicita):
- Cualquier migracion de base de datos
- La navegacion principal
- El sistema de auth
- Crear nuevos paquetes
- Crear nuevas rutas
```

**El pre-commit hook valida** que los archivos tocados estan dentro del scope permitido.

### Regla 5: Checkpoint cada 2 horas

**Cada 2 horas de trabajo, el agente debe:**

1. Mostrar progreso: "Hice X, Y, Z"
2. Mostrar estado de gates: "Build OK / Build FAIL"
3. Preguntar: "Sigo o paro?"

**No se permite "sesion de 8 horas sin checkpoint".** La deriva ocurre en las horas 3-8.

---

## Senales de alarma — cuando el owner debe parar al agente

| Senal | Que hacer |
|-------|----------|
| "Voy a refactorizar X de paso" | **STOP.** Eso es scope creep. Estaba en la spec? |
| "He tocado 50+ archivos" | **STOP.** Revisar que se toco y por que. |
| "Voy a crear una nueva abstraccion/utilidad/helper" | **STOP.** Ya existe algo que sirve? |
| "He creado un nuevo archivo de documentacion" | **STOP.** Donde se supone que va? Hay doc existente que cubra esto? |
| "He cambiado la estructura de carpetas" | **STOP.** Estaba en la spec? |
| "No pude hacer X asi que hice Y" | **STOP.** Y fue la decision correcta? Documentar en MEMORY.md. |
| "Ya esta listo" sin mostrar gates | **STOP.** Compila? Build OK? Lint OK? |
| El agente no responde a preguntas directas | **STOP.** Esta divagando o alucinando. Reiniciar contexto. |

---

## Preguntas que el owner puede hacer en cualquier momento

Estas preguntas no requieren conocimiento tecnico. El agente DEBE poder responderlas en lenguaje claro:

| Pregunta | Respuesta esperada |
|----------|-------------------|
| "Que archivos has tocado?" | Lista de archivos, no "varios componentes" |
| "Compila?" | Si o No. Si no: que falla. |
| "Esto estaba en la spec?" | Si (con referencia) o No (con justificacion) |
| "Esto ya existia?" | Si, lo extendi / No, lo busque con grep y no existe |
| "Que cambia para el usuario?" | Descripcion funcional, no tecnica |
| "Puedo revertir esto facilmente?" | Si (es un commit) / No (es una migracion de DB) |
| "Cuanto falta?" | X de Y tareas completadas |

---

## Como leer un diff sin ser tecnico

Cuando un agente dice "he terminado", pedir:

```bash
git diff --stat HEAD~1
```

Esto muestra algo como:
```
 app/settings/page.tsx        |  81 +
 app/profile/page.tsx         |  30 +-
 3 files changed, 100 insertions(+), 20 deletions(-)
```

**Que mirar:**
- **Cuantos archivos?** Si la spec decia 3 y hay 30 -> preguntar
- **Que carpetas?** Si la spec era sobre "settings" y hay cambios en "billing" -> preguntar
- **Archivos nuevos?** Si hay un `+` al final del nombre -> es nuevo. Estaba planeado?

---

## Ritual de inicio de sesion

Antes de dar una tarea al agente:

1. **Hay spec?** Si no, crearla primero (el agente puede ayudar a redactarla)
2. **Que sprint estamos?** Revisar WORKBOARD.md
3. **Hay scope lock?** Si no, definirlo
4. **Que paso en la ultima sesion?** Revisar `planning/dev-log.md` ultimas 3 entradas

## Ritual de cierre de sesion

Al terminar:

1. El agente muestra `git diff --stat` (que se toco)
2. El agente muestra gates (Build OK? Lint OK?)
3. El agente actualiza WORKBOARD.md
4. Si hubo decisiones -> MEMORY.md
5. Si hubo lecciones -> LESSONS.md

---

## Escalamiento — cuando NO usar agentes

| Situacion | Accion |
|-----------|--------|
| Decision de producto (que construir) | El owner decide, agente ejecuta |
| Decision de arquitectura mayor (cambiar DB, cambiar framework) | El owner aprueba, no el agente |
| El agente lleva 3 intentos y no funciona | Parar. Replantear el enfoque. |
| El agente quiere tocar algo fuera del sprint | Decir "no, eso va al backlog" |
| Dos agentes quieren tocar el mismo archivo | Uno espera. No se trabaja en paralelo en lo mismo. |
