export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSessionState =
  | {
      authConfigured: false;
      authenticated: false;
      missingConfiguration: string[];
      message: string;
    }
  | {
      authConfigured: true;
      authenticated: false;
    }
  | {
      authConfigured: true;
      authenticated: true;
      user: AuthUser;
      csrfToken: string;
      expiresAt: string;
      csrfTokenRequired: true;
    };

export type AuthOtpStartResult = {
  ok: true;
  message: string;
};

export type AuthOtpVerifyResult = {
  authenticated: true;
  user: AuthUser;
  csrfToken: string;
  expiresAt: string;
};

export async function getServerAuthSession(fetchImpl: typeof fetch = fetch): Promise<AuthSessionState> {
  const response = await fetchImpl("/api/auth/session", {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (response.status === 401) {
    return { authConfigured: true, authenticated: false };
  }
  if (response.status === 503) {
    return parseJsonResponse<AuthSessionState>(new Response(await response.text(), { status: 200 }));
  }

  return parseJsonResponse<AuthSessionState>(response);
}

export async function requestEmailOtp(email: string, fetchImpl: typeof fetch = fetch): Promise<AuthOtpStartResult> {
  const response = await fetchImpl("/api/auth/otp/start", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return parseJsonResponse<AuthOtpStartResult>(response);
}

export async function verifyEmailOtp(email: string, token: string, fetchImpl: typeof fetch = fetch): Promise<AuthOtpVerifyResult> {
  const response = await fetchImpl("/api/auth/otp/verify", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, token }),
  });

  return parseJsonResponse<AuthOtpVerifyResult>(response);
}

export async function logoutServerSession(csrfToken: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const response = await fetchImpl("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "x-maelk-csrf": csrfToken,
    },
  });

  await parseJsonResponse(response);
}

async function parseJsonResponse<T = unknown>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(getPublicErrorMessage(body, response.status));
    error.name = "AuthApiError";
    throw error;
  }

  return body as T;
}

function getPublicErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message;
  }
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error;
  }
  return `Auth request failed with status ${status}`;
}
