const USER_ID_PATTERN = /^u_[a-zA-Z0-9_-]+$/;

export function getRequestUserId(request: Request): string | null {
  const headerValue = request.headers.get("x-user-id")?.trim();
  if (!headerValue || !USER_ID_PATTERN.test(headerValue)) {
    return null;
  }
  return headerValue;
}
