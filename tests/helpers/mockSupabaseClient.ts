import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Builds a fake Supabase client whose query builder chain (`.from().select()
 * .eq().single()`, etc.) resolves to `result` on every terminal call. Good
 * enough for repository unit tests that only assert on the mapped output
 * and on which table/filters were used, without a real database.
 */
export function createMockSupabaseClient(result: { data: unknown; error: { message: string } | null }) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  const chain = new Proxy(builder, {
    get(target, prop: string) {
      // Lets list queries (`.select().eq().order()`, no `.single()`) be
      // awaited directly, since Supabase's real query builder is itself
      // thenable.
      if (prop === "then") {
        return (
          onFulfilled: (value: typeof result) => unknown,
          onRejected?: (reason: unknown) => unknown,
        ) => Promise.resolve(result).then(onFulfilled, onRejected);
      }
      if (!target[prop]) {
        target[prop] = vi.fn(() => chain);
      }
      return target[prop];
    },
  });

  // Terminal methods resolve the chain instead of returning it.
  for (const terminal of ["single", "maybeSingle"]) {
    builder[terminal] = vi.fn(() => Promise.resolve(result));
  }

  const from = vi.fn(() => chain);
  return { client: { from } as unknown as SupabaseClient, from, builder: chain };
}
