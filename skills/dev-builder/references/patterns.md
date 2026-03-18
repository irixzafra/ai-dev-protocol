# dev-builder — Code Patterns Reference
_Copy-paste-ready templates for each implementation layer. Read the relevant section when implementing that layer._

## Table of Contents
1. [3A. DB Schema (Drizzle)](#3a-db-schema-drizzle)
2. [3B. Zod Contracts](#3b-zod-contracts)
3. [3C. Core Engine](#3c-core-engine)
4. [3D. Server Action](#3d-server-action)
5. [3E. UI Components](#3e-ui-components)
6. [3F. Test Pattern](#3f-test-pattern)

---

## 3A. DB Schema (Drizzle)

```typescript
// packages/db/schema/[name].ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const myTable = pgTable("my_table", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

After writing:
1. Export from `packages/db/schema/index.ts`
2. Write SQL migration: `packages/db/migrations/YYYYMMDDHHMMSS_[description].sql`
3. `pnpm tsc --noEmit`

---

## 3B. Zod Contracts

```typescript
// packages/contracts/src/[feature].ts
import { z } from "zod";

export const CreateFeatureInputSchema = z.object({
  name:        z.string().min(1).max(256),
  description: z.string().max(2048).optional(),
});
export type CreateFeatureInput = z.infer<typeof CreateFeatureInputSchema>;

export const FeatureSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  createdAt: z.string().datetime(),
});
export type Feature = z.infer<typeof FeatureSchema>;
```

Export from `packages/contracts/src/index.ts`. Type-check.

---

## 3C. Core Engine

```typescript
// packages/core/src/engines/[feature]-engine.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { CreateFeatureInput, Feature } from "@repo/contracts";
import { AuthContext, AppResponse } from "../types";

export class FeatureEngine {
  constructor(private supabase: SupabaseClient) {}

  async create(
    ctx: AuthContext,
    input: CreateFeatureInput,
  ): Promise<AppResponse<Feature>> {
    try {
      const { data, error } = await this.supabase
        .from("my_table")
        .insert({ ...input, organization_id: ctx.organizationId })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Feature };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
}
```

Export from `packages/core/src/engines/index.ts`. Type-check.

---

## 3D. Server Action

```typescript
// apps/platform/app/[feature]/actions.ts
"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getServerAuthContextFromClient } from "@/lib/engine-clients";
import { CreateFeatureInputSchema } from "@repo/contracts";

export async function createFeature(
  input: z.infer<typeof CreateFeatureInputSchema>,
) {
  const parsed = CreateFeatureInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const supabase = await createClient();
  const ctx = await getServerAuthContextFromClient(supabase);
  if (!ctx) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("my_table")
    .insert({ ...parsed.data, organization_id: ctx.organizationId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
```

Rules:
- Always `"use server"` at top
- Always Zod `safeParse` before any DB call
- Always check auth context — never trust the caller
- Return `{ success: boolean, data?, error? }` consistently
- Never throw — return `{ success: false, error }`

---

## 3E. UI Components

### Shared (reusable across routes) — `packages/ui/src/components/[feature].tsx`

```typescript
// packages/ui/src/components/[feature].tsx
import * as React from "react";
import { cn } from "../lib/utils";

interface FeatureCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FeatureCard({
  title,
  description,
  className,
  children,
}: FeatureCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h3 className="text-sm font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
```

After writing:
1. Export from `packages/ui/src/index.ts`
2. `pnpm tsc --noEmit`

### Page-specific (single route) — `apps/platform/app/[feature]/_components/[name].tsx`

```typescript
// apps/platform/app/[feature]/_components/feature-detail.tsx
"use client";
import { useState, useCallback } from "react";
import { Button } from "@repo/ui/components/ui/button";
import type { Feature } from "@repo/contracts";

interface FeatureDetailProps {
  feature: Feature;
  onSave: (updated: Feature) => Promise<{ success: boolean; error?: string }>;
}

export function FeatureDetail({ feature, onSave }: FeatureDetailProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await onSave(feature);
      if (!result.success) {
        // handle error — never swallow silently
      }
    } finally {
      setSaving(false);
    }
  }, [feature, onSave]);

  return (
    <div>
      <h2 className="text-lg font-semibold">{feature.name}</h2>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
}
```

Rules:
- Never put page-specific components in `packages/ui`
- Named exports, props interface, `cn()` for className merging
- `"use client"` only when the component uses hooks or browser APIs

### Data list pages — mandatory pattern

All data list pages MUST use `ListToolbar -> EntityContainer`. See `docs/DATA_PAGE_PATTERN.md`.
No custom layouts, no PageHeader on data pages, no direct KanbanBoard.

---

## 3F. Test Pattern

```typescript
// apps/platform/__tests__/[feature]-actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFeature } from "../app/[feature]/actions";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/engine-clients", () => ({
  getServerAuthContextFromClient: vi.fn(),
}));

// Fluent mock: each method returns `this` until .single() which resolves
const mockSingle = vi.fn();
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: mockSingle,
};

beforeEach(() => {
  vi.mocked(require("@/lib/supabase/server").createClient)
    .mockResolvedValue(mockSupabase);
  vi.mocked(require("@/lib/engine-clients").getServerAuthContextFromClient)
    .mockResolvedValue({ organizationId: "org-123", userId: "user-456" });
});

describe("createFeature", () => {
  it("rejects invalid input without hitting DB", async () => {
    const result = await createFeature({ name: "" });
    expect(result.success).toBe(false);
    expect(mockSingle).not.toHaveBeenCalled();
  });

  it("returns data on success", async () => {
    mockSingle.mockResolvedValue({ data: { id: "abc", name: "Test" }, error: null });
    const result = await createFeature({ name: "Test" });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test");
  });

  it("surfaces DB error as success:false", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "unique violation" } });
    const result = await createFeature({ name: "Dup" });
    expect(result.success).toBe(false);
  });
});
```

Naming: `[engine]-[feature].test.ts` (engine unit) · `[feature]-actions.test.ts` (server action).
Run: `pnpm test`
