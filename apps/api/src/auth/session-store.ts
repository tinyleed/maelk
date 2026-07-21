export type StoredApplicationSession = {
  idHash: string;
  userId: string;
  email: string | null;
  csrfToken: string;
  csrfTokenHash: string;
  encryptedRefreshToken: string;
  createdAt: number;
  expiresAt: number;
  accessTokenExpiresAt: number;
};

export type ApplicationSessionStore = {
  create(session: StoredApplicationSession): Promise<void>;
  get(idHash: string): Promise<StoredApplicationSession | null>;
  delete(idHash: string): Promise<void>;
  replace(oldIdHash: string, session: StoredApplicationSession): Promise<boolean>;
};

export class InMemoryApplicationSessionStore implements ApplicationSessionStore {
  private readonly sessions = new Map<string, StoredApplicationSession>();
  private readonly now: () => number;

  constructor(options: { now?: () => number } = {}) {
    this.now = options.now ?? Date.now;
  }

  async create(session: StoredApplicationSession): Promise<void> {
    this.sessions.set(session.idHash, session);
  }

  async get(idHash: string): Promise<StoredApplicationSession | null> {
    const session = this.sessions.get(idHash) ?? null;
    if (!session) {
      return null;
    }

    if (session.expiresAt <= this.now()) {
      this.sessions.delete(idHash);
      return null;
    }

    return session;
  }

  async delete(idHash: string): Promise<void> {
    this.sessions.delete(idHash);
  }

  async replace(oldIdHash: string, session: StoredApplicationSession): Promise<boolean> {
    const current = this.sessions.get(oldIdHash);
    if (!current || current.expiresAt <= this.now()) {
      this.sessions.delete(oldIdHash);
      return false;
    }
    this.sessions.delete(oldIdHash);
    this.sessions.set(session.idHash, session);
    return true;
  }

  snapshot(): StoredApplicationSession[] {
    return [...this.sessions.values()];
  }
}
