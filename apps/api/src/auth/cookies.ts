import type { AuthConfig } from "./config.js";

export function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) {
    return cookies;
  }

  for (const segment of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = segment.trim().split("=");
    if (!rawName || rawValueParts.length === 0) continue;
    const rawValue = rawValueParts.join("=");
    try {
      cookies.set(rawName, decodeURIComponent(rawValue));
    } catch {
      cookies.set(rawName, rawValue);
    }
  }

  return cookies;
}

export function getSessionCookie(cookieHeader: string | undefined, config: AuthConfig): string | null {
  return parseCookies(cookieHeader).get(config.cookieName) ?? null;
}

export function serializeSessionCookie(value: string, config: AuthConfig, maxAgeSeconds = config.sessionTtlSeconds): string {
  return serializeCookie(config.cookieName, value, {
    httpOnly: true,
    maxAgeSeconds,
    path: "/",
    sameSite: "Lax",
    secure: config.cookieSecure,
  });
}

export function serializeClearSessionCookie(config: AuthConfig): string {
  return serializeCookie(config.cookieName, "", {
    httpOnly: true,
    maxAgeSeconds: 0,
    path: "/",
    sameSite: "Lax",
    secure: config.cookieSecure,
  });
}

type CookieOptions = {
  httpOnly: boolean;
  maxAgeSeconds: number;
  path: string;
  sameSite: "Lax";
  secure: boolean;
};

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const encodedValue = encodeURIComponent(value);
  const parts = [
    `${name}=${encodedValue}`,
    `Max-Age=${options.maxAgeSeconds}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}
