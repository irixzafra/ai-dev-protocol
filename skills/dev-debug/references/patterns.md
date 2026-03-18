# Debug Patterns Reference

Concrete code patterns for the dev-debug skill. Each pattern is copy-paste ready.

---

## Regression Test Template

Every fix in Phase 4.5 must have a regression test. Use this structure:

```typescript
// Pattern: regression test for bug fix
// File: __tests__/[feature]-regression.test.ts or append to existing test file

import { describe, it, expect } from "vitest";

describe("[feature] regression", () => {
  it("should not [reproduce the bug description]", async () => {
    // Setup: reproduce the conditions that caused the bug
    // - Create the minimal data/state that triggers the issue
    // - Use real types from the codebase, not arbitrary mocks

    // Act: perform the action that triggered the bug
    // - Call the function / render the component / invoke the API

    // Assert: verify the bug does not occur
    // - Check for the correct behavior, not just absence of error
    // - Be specific: assert the exact value, not truthiness
    expect(result).toEqual(expectedCorrectBehavior);
  });
});
```

### Naming conventions

| Scope | File location |
|---|---|
| Server action bug | `apps/platform/__tests__/[module]-regression.test.ts` |
| Component render bug | `apps/platform/__tests__/[component]-regression.test.tsx` |
| Contract/schema bug | `packages/contracts/__tests__/[schema]-regression.test.ts` |
| Utility function bug | Same `__tests__/` folder as the utility |

### When the test file already exists

Append to the existing describe block or add a new `describe("[feature] regression", ...)` block at the bottom. Do not create a separate file when one already covers the module.

---

## Domain Error Schema

the active project domain error shape. Use this instead of raw infrastructure errors:

```typescript
// Domain error shape — canonical for all the active project error responses
type DomainError = {
  success: false;
  error: string;         // human-readable message
  errorCode:             // machine-readable classification
    | "BACKEND_NOT_READY"      // schema/API not yet exposed
    | "DATASET_MISSING"        // expected data does not exist yet
    | "PROVIDER_UNAVAILABLE"   // your data engine/your agent runtime/external service down
    | "EXTERNAL_DEPENDENCY"    // blocker outside our control
    | "RLS_DENIED"             // user lacks permission
    | "VALIDATION_FAILED"      // input does not match contract
    | "UNEXPECTED";            // genuine bug, investigate
  context?: Record<string, unknown>; // optional debug info (never PII)
};
```

### Usage in server actions

```typescript
// In a server action — return domain error instead of throwing
export async function someAction(input: Input): Promise<AppResponse<Output>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select("*");

  if (error) {
    // Classify: is this RLS? Schema not ready? Unexpected?
    if (error.code === "42501" || error.code === "PGRST301") {
      return { success: false, error: "No tienes acceso a este recurso", errorCode: "RLS_DENIED" };
    }
    return { success: false, error: error.message, errorCode: "UNEXPECTED", context: { code: error.code } };
  }

  return { success: true, data };
}
```

---

## Honest Degradation UI Pattern

When the backend does not expose a schema yet, show honest state instead of an error boundary:

```tsx
import { AlertTriangle } from "lucide-react";

// Use when errorCode is BACKEND_NOT_READY or DATASET_MISSING
function HonestDegradation({ feature, reason }: { feature: string; reason: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border/70 bg-card/70 p-10 text-center">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500/60" />
      <p className="text-sm font-medium">Verificacion parcial</p>
      <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}
```

### Decision logic for rendering

```typescript
// Map errorCode to UI treatment
function renderErrorState(error: DomainError) {
  switch (error.errorCode) {
    case "BACKEND_NOT_READY":
    case "DATASET_MISSING":
    case "PROVIDER_UNAVAILABLE":
      return <HonestDegradation feature="..." reason={error.error} />;

    case "RLS_DENIED":
      return <AccessDenied />;  // existing component

    case "VALIDATION_FAILED":
      return null;  // handled by form validation UI

    case "EXTERNAL_DEPENDENCY":
      return <HonestDegradation feature="..." reason="Servicio externo no disponible" />;

    case "UNEXPECTED":
    default:
      throw error;  // let error boundary catch genuine bugs
  }
}
```

---

## External Dependency Blocker Stub

When the blocker is your data engine/your agent runtime/etc — do NOT write a code fix.

```typescript
// 1. Return a domain error
return {
  success: false,
  error: "El servicio de agentes no esta disponible en este momento",
  errorCode: "PROVIDER_UNAVAILABLE",
  context: { service: "agent-runtime", endpoint: "/api/agents" },
};

// 2. Document in planning/WORKBOARD.md:
//    - What is blocked
//    - Which service
//    - What unblocks it

// 3. Add a comment in code:
// BLOCKED: your agent runtime does not expose /api/agents/skills endpoint yet — see WORKBOARD.md

// 4. Do NOT create:
//    - Fake data to make the UI look populated
//    - Mock endpoints that simulate the service
//    - Workaround code that will need to be ripped out later
```

---

## Expected vs Unexpected Logging

Separate expected degradation (info) from genuine errors:

```typescript
// Expected degradation — log as info, not error
const EXPECTED_DEGRADATIONS = [
  "BACKEND_NOT_READY",
  "DATASET_MISSING",
  "PROVIDER_UNAVAILABLE",
] as const;

function logDiagnostic(error: DomainError) {
  if (EXPECTED_DEGRADATIONS.includes(error.errorCode as any)) {
    console.info(`[degradation] ${error.errorCode}: ${error.error}`);
  } else {
    console.error(`[unexpected] ${error.errorCode}: ${error.error}`, error.context);
  }
}
```

### Rules

- **Expected noise** -> `console.info` (filtered in prod monitoring, does not trigger alerts)
- **Unexpected noise** -> `console.error` (always visible, triggers alerts)
- **Never** use `console.log` for error paths — it is invisible in structured logging
- **Never** swallow errors silently — even expected degradation must be logged at info level

---

## Supabase Mock Pattern for Server Actions

When testing "use server" actions that depend on Supabase:

```typescript
import { vi, describe, it, expect } from "vitest";

// Mock the server client
const createClientMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: createClientMock }));
vi.mock("@/lib/engine-clients", () => ({
  getServerAuthContextFromClient: vi.fn().mockResolvedValue({ orgId: "org-1", userId: "user-1" }),
}));

// Fluent chain builder — mimics Supabase query builder
function buildChain(result: any) {
  const chain: any = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    single: () => chain,
    maybeSingle: () => chain,
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

// Full Supabase mock with schema routing
function buildSupabase(data_mgmtMapping: Record<string, any>, rpcResult?: any) {
  return {
    schema: (name: string) => ({
      from: (table: string) => buildChain(data_mgmtMapping[table] ?? { data: null, error: null }),
    }),
    from: (table: string) => buildChain(data_mgmtMapping[table] ?? { data: null, error: null }),
    rpc: vi.fn().mockImplementation(() => buildChain(rpcResult ?? { data: true, error: null })),
  };
}
```
