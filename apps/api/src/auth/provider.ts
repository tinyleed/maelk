import type { AuthConfig } from "./config.js";

export type SupabaseTokenBundle = {
  accessToken: string;
  refreshToken: string;
};

export type SupabaseAuthProvider = {
  startEmailOtp(input: { email: string; shouldCreateUser: false }): Promise<void>;
  verifyEmailOtp(input: { email: string; token: string }): Promise<SupabaseTokenBundle>;
  refreshSession(input: { refreshToken: string }): Promise<SupabaseTokenBundle>;
};

type SupabaseAuthResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
};

export function createSupabaseAuthProvider(config: AuthConfig, fetchImpl: typeof fetch = fetch): SupabaseAuthProvider {
  const authBaseUrl = `${config.supabaseUrl.replace(/\/$/u, "")}/auth/v1`;
  const headers = {
    apikey: config.supabaseAnonKey,
    authorization: `Bearer ${config.supabaseAnonKey}`,
    "content-type": "application/json",
  };

  return {
    async startEmailOtp(input) {
      const response = await fetchImpl(`${authBaseUrl}/otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: input.email,
          type: "email",
          create_user: input.shouldCreateUser,
        }),
      });

      if (!response.ok) {
        throw new Error("supabase_otp_start_failed");
      }
    },

    async verifyEmailOtp(input) {
      const response = await fetchImpl(`${authBaseUrl}/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: input.email,
          token: input.token,
          type: "email",
        }),
      });

      if (!response.ok) {
        throw new Error("supabase_otp_verify_failed");
      }

      return parseTokenBundle(await response.json());
    },

    async refreshSession(input) {
      const response = await fetchImpl(`${authBaseUrl}/token?grant_type=refresh_token`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refresh_token: input.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("supabase_refresh_failed");
      }

      return parseTokenBundle(await response.json());
    },
  };
}

function parseTokenBundle(value: SupabaseAuthResponse): SupabaseTokenBundle {
  if (typeof value.access_token !== "string" || typeof value.refresh_token !== "string") {
    throw new Error("supabase_auth_response_invalid");
  }

  return {
    accessToken: value.access_token,
    refreshToken: value.refresh_token,
  };
}
