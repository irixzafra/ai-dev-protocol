# S{NNN} — {Titulo corto}

**Estado:** borrador | aprobada | en-progreso | hecha
**Talla:** FULL | MINI
**Fecha:** YYYY-MM-DD
**Sprint:** S{X}.{NN} (referencia en WORKBOARD)

---

## Que se construye

[1 parrafo maximo — el entregable concreto. Que cambia para el usuario o el sistema.]

## Que NO se construye

- [exclusion explicita 1]
- [exclusion explicita 2]
- [cualquier cosa que alguien podria asumir que esta incluida pero no lo esta]

## Pantalla (si hay UI)

[ASCII mockup o descripcion de las zonas del layout que se ven afectadas.]

```
+-----------------------------+
|  [zona afectada]            |
|                             |
+-----------------------------+
```

[Si no hay UI, eliminar esta seccion entera.]

## Archivos afectados

- `path/to/file.ts` — [que cambia en este archivo]
- `path/to/other.tsx` — [que cambia]

## Dependencias

- [Otra spec que debe estar hecha antes: `S{NNN}`]
- [Migracion SQL requerida]
- [API externa que debe estar disponible]

[Si no hay dependencias, eliminar esta seccion.]

## Riesgos

- [que puede romperse]
- [duplicados detectados con `grep`]
- [impacto en otras superficies]

## Criterios de aceptacion

- [ ] [criterio verificable 1 — "el usuario puede X"]
- [ ] [criterio verificable 2]
- [ ] G1: type-check -> 0 errores
- [ ] G2: lint -> 0 warnings
- [ ] G3: sin secrets en diff

## Decisiones tomadas

[Solo si hubo decisiones caras de revertir durante la definicion de esta spec.
Si la decision es transversal (afecta mas de esta spec), documentar tambien en `planning/MEMORY.md`.
Si no hubo decisiones, eliminar esta seccion.]

---

_Template: `protocol/framework/spec-template.md` -- Protocolo: `dev.protocol.md`_
