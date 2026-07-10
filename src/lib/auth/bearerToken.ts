const BEARER_PREFIX = "Bearer ";

/** Extracts the bearer token from a request's Authorization header, or null. */
export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}
