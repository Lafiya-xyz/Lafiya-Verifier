import { describe, expect, it } from "vitest";
import { authErrorResponse } from "@/lib/http/authErrorResponse";
import { NotAllowlistedError, UnauthorizedError } from "@/lib/auth/requireAuthenticatedChw";

describe("authErrorResponse", () => {
  it("maps UnauthorizedError to a 401", async () => {
    const response = authErrorResponse(new UnauthorizedError("Invalid or expired session"));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid or expired session" });
  });

  it("maps NotAllowlistedError to a 403", async () => {
    const response = authErrorResponse(new NotAllowlistedError("Not allowlisted"));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Not allowlisted" });
  });

  it("re-throws any other error", () => {
    expect(() => authErrorResponse(new Error("boom"))).toThrow("boom");
  });
});
