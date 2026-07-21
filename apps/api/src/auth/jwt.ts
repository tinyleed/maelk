import { createRemoteJWKSet, errors, jwtVerify, type JWTVerifyGetKey } from "jose";

export type VerifiedSupabaseJwt = {
  subject: string;
  email: string | null;
  expiresAt: number;
  issuer: string;
  audience: string | string[];
};

export type SupabaseJwtVerifierOptions = {
  issuer: string;
  audience: string;
  algorithms: string[];
  jwksUrl?: string;
  getKey?: JWTVerifyGetKey;
  now?: () => number;
};

export class SupabaseJwtVerifier {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly algorithms: string[];
  private readonly getKey: JWTVerifyGetKey;
  private readonly now: () => number;

  constructor(options: SupabaseJwtVerifierOptions) {
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.algorithms = options.algorithms;
    this.getKey = options.getKey ?? createRemoteJWKSet(new URL(requiredJwksUrl(options.jwksUrl)));
    this.now = options.now ?? Date.now;
  }

  async verify(accessToken: string): Promise<VerifiedSupabaseJwt> {
    try {
      const result = await jwtVerify(accessToken, this.getKey, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: this.algorithms,
        currentDate: new Date(this.now()),
      });

      if (!result.protectedHeader.kid) {
        throw new Error("jwt_missing_kid");
      }
      if (!result.protectedHeader.alg || !this.algorithms.includes(result.protectedHeader.alg)) {
        throw new Error("jwt_disallowed_alg");
      }
      if (!result.payload.sub) {
        throw new Error("jwt_missing_subject");
      }
      if (!result.payload.exp) {
        throw new Error("jwt_missing_expiry");
      }
      if (!result.payload.iss) {
        throw new Error("jwt_missing_issuer");
      }
      if (!result.payload.aud) {
        throw new Error("jwt_missing_audience");
      }

      return {
        subject: result.payload.sub,
        email: typeof result.payload.email === "string" ? result.payload.email : null,
        expiresAt: result.payload.exp * 1000,
        issuer: result.payload.iss,
        audience: result.payload.aud,
      };
    } catch (error) {
      if (error instanceof errors.JOSEError || error instanceof Error) {
        throw new Error("jwt_verification_failed");
      }
      throw error;
    }
  }
}

function requiredJwksUrl(jwksUrl: string | undefined): string {
  if (!jwksUrl) {
    throw new Error("jwks_url_required");
  }
  return jwksUrl;
}
