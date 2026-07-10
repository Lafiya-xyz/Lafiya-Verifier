import { describe, expect, it } from "vitest";
import { extractBearerToken } from "@/lib/auth/bearerToken";

function requestWithAuth(header: string | null): Request {
  const headers = new Headers();
  if (header !== null) headers.set("authorization", header);
  return new Request("https://example.com", { headers });
}

describe("extractBearerToken", () => {
  it("extracts the token from a well-formed header", () => {
    expect(extractBearerToken(requestWithAuth("Bearer abc123"))).toBe("abc123");
  });

  it("returns null when there is no authorization header", () => {
    expect(extractBearerToken(requestWithAuth(null))).toBeNull();
  });

  it("returns null when the scheme is not Bearer", () => {
    expect(extractBearerToken(requestWithAuth("Basic abc123"))).toBeNull();
  });

  it("returns null when the token is empty", () => {
    expect(extractBearerToken(requestWithAuth("Bearer    "))).toBeNull();
  });
});
