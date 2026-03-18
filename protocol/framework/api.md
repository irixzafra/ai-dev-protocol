# API Standards

> Criterios para API routes, contratos de respuesta y validacion.
> Aplica a todo proyecto con API HTTP (API routes / Server Actions).

---

## Formato de respuesta

Toda API route devuelve el mismo contrato:

```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};
```

### Ejemplos

```typescript
// Exito
return NextResponse.json({ success: true, data: { id: "abc" } });

// Error
return NextResponse.json(
  { success: false, error: { code: "NOT_FOUND", message: "Resource not found" } },
  { status: 404 }
);
```

### Codigos de error estandar

| Codigo | HTTP | Cuando |
|--------|------|--------|
| `VALIDATION_ERROR` | 400 | Input invalido |
| `UNAUTHORIZED` | 401 | Sin sesion |
| `FORBIDDEN` | 403 | Sin permisos |
| `NOT_FOUND` | 404 | Recurso no existe |
| `CONFLICT` | 409 | Duplicado o estado invalido |
| `DEPENDENCY_UNAVAILABLE` | 503 | Servicio externo caido |
| `INTERNAL_ERROR` | 500 | Error no esperado |

---

## Validacion

| Regla | Detalle |
|-------|---------|
| **Validar en el perimetro** | Toda API route valida input con Zod (o equivalente) antes de procesarlo |
| **No validar internamente** | Funciones internas confian en tipos — no re-validan |
| **Schema junto a la route** | En el mismo archivo o en un `schemas.ts` colocated |

### Template de validacion

```typescript
import { z } from "zod";

const RequestSchema = z.object({
  resourceId: z.number().int().positive(),
  query: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  // parsed.data is typed
}
```

---

## Estructura de routes

### Naming

| Patron | Ejemplo |
|--------|---------|
| Recurso CRUD | `app/api/{recurso}/route.ts` |
| Recurso por ID | `app/api/{recurso}/[id]/route.ts` |
| Accion sobre recurso | `app/api/{recurso}/[id]/{accion}/route.ts` |
| Accion global | `app/api/{accion}/route.ts` |

### Reglas

| Regla | Razon |
|-------|-------|
| Un endpoint = una responsabilidad | Sin endpoints "multi-modo" |
| No mezclar GET de listado con POST de creacion en logica compleja | Cada handler es simple |
| Auth check al inicio del handler | Fail fast |
| `try/catch` top-level con `INTERNAL_ERROR` | Nunca dejar un error sin capturar |
| No `console.log` en produccion | Usar error reporting estructurado |

---

## Streaming (SSE)

Para endpoints que hacen streaming (chat, generacion):

```typescript
const encoder = new TextEncoder();
const stream = new ReadableStream({
  async start(controller) {
    // emit chunks
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    // close
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
  },
});

return new Response(stream, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

---

## Degradacion honesta

| Dependencia | Si falla |
|-------------|----------|
| LLM provider | `503` con `DEPENDENCY_UNAVAILABLE` — no devolver respuesta vacia |
| Embedding service | `503` con mensaje claro — no degradar a estado vacio silencioso |
| Database | `500` con log — no degradar silenciosamente |
| Optional services (TTS, etc.) | `503` — informar al usuario, el resto sigue funcionando |

**Regla:** Nunca degradar silenciosamente a estado vacio. Si falla un backend, decirlo explicitamente.

---

## Seguridad IA — Prompt Injection

Si la app pasa input del usuario a un LLM (chat, generacion, resumen), hay riesgo de **prompt injection**: el usuario inyecta instrucciones que secuestran el comportamiento del modelo.

### Reglas obligatorias

| Regla | Detalle |
|-------|---------|
| **Nunca concatenar input crudo al system prompt** | Siempre en un bloque `user` separado |
| **Sanitizar antes de pasar al LLM** | Strip de instrucciones obvias (`ignore previous`, `system:`, `<\|im_start\|>`) |
| **Limitar longitud de input** | Max chars definido por endpoint (ej: 500 para chat, 2000 para documentos) |
| **No exponer el system prompt** | Si el usuario pregunta "cual es tu prompt", no revelarlo |
| **Output guardrails** | Verificar que la respuesta no contiene datos internos (IDs, paths, secrets) |

### Template de sanitizacion

```typescript
function sanitizeLlmInput(input: string, maxLength: number = 500): string {
  const stripped = input
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/<\|im_start\|>/g, '')
    .replace(/system\s*:/gi, '')
    .slice(0, maxLength);
  return stripped.trim();
}
```

### Cuando aplicar

- Todo endpoint que pase input del usuario a un LLM
- Todo endpoint que construya prompts dinamicos con datos del usuario
- No aplica a endpoints que solo leen datos sin LLM

---

## Rate limiting y seguridad

| Criterio | Regla |
|----------|-------|
| Auth en endpoints privados | Verificar sesion |
| Admin endpoints | Verificar `role = 'admin'` ademas de sesion |
| No exponer IDs internos sensibles | UUIDs OK, nunca sequential IDs para auth |
| No incluir stack traces en respuestas de error | Solo en desarrollo |
| CORS | Solo desde dominios conocidos |
| Input sanitization | Escapar caracteres especiales en `ILIKE` patterns (`%`, `_`, `'`) |
| CSP headers | Configurados en el framework web o middleware |
| No eval/innerHTML con input de usuario | XSS prevention |

---

## Error handling — client-side

### Reglas

| Situacion | Patron |
|-----------|--------|
| API devuelve error | Mostrar mensaje del `error.message` al usuario |
| API no responde (network) | Toast: "Sin conexion. Intenta de nuevo." |
| Error inesperado en componente | Error boundary con fallback util |
| Carga lenta (>2s) | Skeleton o spinner — nunca pantalla en blanco |
| Dependencia opcional falla | Degradar feature, no la pagina completa |

### Template de fetch con error handling

```typescript
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message);
  }

  return json.data;
}
```

### Anti-patterns client-side

- ~~`catch() {}`~~ vacio — siempre manejar o propagar
- ~~Estado vacio cuando falla API~~ — mostrar error explicito
- ~~Retry infinito en el cliente~~ — max 3, con backoff
- ~~`alert()` para errores~~ — usar toast o inline error

---

## Logging estructurado

### En servidor (API routes)

```typescript
// Bien
console.error(JSON.stringify({
  code: "DEPENDENCY_UNAVAILABLE",
  service: "llm-provider",
  endpoint: "/api/chat",
  timestamp: new Date().toISOString(),
  detail: error.message,
}));

// Mal
console.log("error:", error);
```

### Que loguear

| Evento | Log level | Incluir |
|--------|-----------|---------|
| Request completada OK | No loguear (ruido) | — |
| Validacion fallida | `warn` | Input rechazado, endpoint |
| Dependencia caida | `error` | Servicio, endpoint, timeout |
| Error inesperado | `error` | Stack trace, endpoint, input sanitizado |
| Deploy exitoso | `info` | Commit hash, timestamp |
