/**
 * Deterministically stringifies a JSON-serializable value with object keys
 * sorted recursively, so the same logical record always serializes to the
 * same bytes regardless of property insertion order. This is required
 * upstream of hashing — two structurally identical records must hash
 * identically no matter how they were constructed.
 */
export function canonicalJsonStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const sorted: Record<string, unknown> = {};
    for (const [key, entryValue] of entries) {
      sorted[key] = sortKeysDeep(entryValue);
    }
    return sorted;
  }

  return value;
}
