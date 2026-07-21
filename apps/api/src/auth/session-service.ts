import type { AuthConfig } from "./config.js";
import { getSessionCookie } from "./cookies.js";
import {
  generateOpaqueToken,
  hashCsrfToken,
  hashSessionIdentifier,
  RefreshTokenCipher,
  safeEqualHash,
} from "./crypto.js";
import type { ApplicationSessionStore, StoredApplicationSession } from "./session-store.js";

export type PublicSession = {
  idHash: string;
  user: {
    id: string;
    email: string | null;
  };
  csrfTokenHash: string;
  expiresAt: number;
  accessTokenExpiresAt: number;
};

export type NewSessionResult = {
  cookieValue: string;
  csrfToken: string;
  session: StoredApplicationSession;
};

export class ApplicationSessionService {
  private readonly config: AuthConfig;
  private readonly cipher: RefreshTokenCipher;
  private readonly store: ApplicationSessionStore;
  private readonly now: () => number;

  constructor(options: {
    config: AuthConfig;
    cipher: RefreshTokenCipher;
    store: ApplicationSessionStore;
    now?: () => number;
  }) {
    this.config = options.config;
    this.cipher = options.cipher;
    this.store = options.store;
    this.now = options.now ?? Date.now;
  }

  async create(input: { userId: string; email: string | null; refreshToken: string; accessTokenExpiresAt: number }): Promise<NewSessionResult> {
    const cookieValue = generateOpaqueToken();
    const csrfToken = generateOpaqueToken();
    const createdAt = this.now();
    const session: StoredApplicationSession = {
      idHash: hashSessionIdentifier(cookieValue),
      userId: input.userId,
      email: input.email,
      csrfToken,
      csrfTokenHash: hashCsrfToken(csrfToken),
      encryptedRefreshToken: this.cipher.encrypt(input.refreshToken),
      createdAt,
      expiresAt: createdAt + this.config.sessionTtlSeconds * 1000,
      accessTokenExpiresAt: input.accessTokenExpiresAt,
    };
    await this.store.create(session);
    return { cookieValue, csrfToken, session };
  }

  async getFromCookieHeader(cookieHeader: string | undefined): Promise<StoredApplicationSession | null> {
    const cookieValue = getSessionCookie(cookieHeader, this.config);
    if (!cookieValue) {
      return null;
    }

    return this.store.get(hashSessionIdentifier(cookieValue));
  }

  async getCookieValueAndSession(cookieHeader: string | undefined): Promise<{ cookieValue: string; session: StoredApplicationSession } | null> {
    const cookieValue = getSessionCookie(cookieHeader, this.config);
    if (!cookieValue) {
      return null;
    }

    const session = await this.store.get(hashSessionIdentifier(cookieValue));
    if (!session) {
      return null;
    }

    return { cookieValue, session };
  }

  assertCsrf(session: StoredApplicationSession, csrfToken: string | undefined): boolean {
    if (!csrfToken) {
      return false;
    }
    return safeEqualHash(hashCsrfToken(csrfToken), session.csrfTokenHash);
  }

  decryptRefreshToken(session: StoredApplicationSession): string {
    return this.cipher.decrypt(session.encryptedRefreshToken);
  }

  async rotate(
    oldSession: StoredApplicationSession,
    input: { userId: string; email: string | null; refreshToken: string; accessTokenExpiresAt: number },
  ): Promise<NewSessionResult> {
    const cookieValue = generateOpaqueToken();
    const csrfToken = generateOpaqueToken();
    const createdAt = this.now();
    const session: StoredApplicationSession = {
      idHash: hashSessionIdentifier(cookieValue),
      userId: input.userId,
      email: input.email,
      csrfToken,
      csrfTokenHash: hashCsrfToken(csrfToken),
      encryptedRefreshToken: this.cipher.encrypt(input.refreshToken),
      createdAt,
      expiresAt: createdAt + this.config.sessionTtlSeconds * 1000,
      accessTokenExpiresAt: input.accessTokenExpiresAt,
    };
    const replaced = await this.store.replace(oldSession.idHash, session);
    if (!replaced) {
      throw new Error("session_rotation_conflict");
    }
    return { cookieValue, csrfToken, session };
  }

  async destroy(session: StoredApplicationSession): Promise<void> {
    await this.store.delete(session.idHash);
  }

  shouldRefresh(session: StoredApplicationSession): boolean {
    return session.accessTokenExpiresAt <= this.now() + this.config.refreshSkewSeconds * 1000;
  }
}
