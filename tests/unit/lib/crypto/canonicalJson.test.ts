import { describe, expect, it } from "vitest";
import { canonicalJsonStringify } from "@/lib/crypto/canonicalJson";

describe("canonicalJsonStringify", () => {
  it("produces identical output regardless of key order", () => {
    const a = canonicalJsonStringify({ b: 2, a: 1 });
    const b = canonicalJsonStringify({ a: 1, b: 2 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":1,"b":2}');
  });

  it("sorts keys recursively in nested objects", () => {
    const a = canonicalJsonStringify({ z: { d: 4, c: 3 }, y: 1 });
    const b = canonicalJsonStringify({ y: 1, z: { c: 3, d: 4 } });
    expect(a).toBe(b);
  });

  it("preserves array order (arrays are not sorted)", () => {
    const a = canonicalJsonStringify({ list: [3, 1, 2] });
    const b = canonicalJsonStringify({ list: [1, 2, 3] });
    expect(a).not.toBe(b);
  });

  it("sorts keys within objects nested inside arrays", () => {
    const a = canonicalJsonStringify([{ b: 1, a: 2 }]);
    expect(a).toBe('[{"a":2,"b":1}]');
  });

  it("round-trips primitives and null", () => {
    expect(canonicalJsonStringify(null)).toBe("null");
    expect(canonicalJsonStringify(42)).toBe("42");
    expect(canonicalJsonStringify("hi")).toBe('"hi"');
  });
});
