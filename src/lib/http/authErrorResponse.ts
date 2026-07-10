import { NextResponse } from "next/server";
import { NotAllowlistedError, UnauthorizedError } from "@/lib/auth/requireAuthenticatedChw";

/**
 * Maps the errors thrown by `requireAuthenticatedChw` to HTTP responses.
 * Re-throws anything else so route handlers surface unexpected errors
 * instead of silently swallowing them.
 */
export function authErrorResponse(error: unknown): Response {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof NotAllowlistedError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  throw error;
}
