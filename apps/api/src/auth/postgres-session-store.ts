import pg from "pg";

import type { SessionDatabaseConnection } from "./session-database.js";
import type { ApplicationSessionStore, StoredApplicationSession } from "./session-store.js";

const { Pool } = pg;

type PostgresSessionRow = {
  id_hash: string;
  user_id: string;
  email: string | null;
  csrf_token: string;
  csrf_token_hash: string;
  encrypted_refresh_token: string;
  created_at_ms: string;
  expires_at_ms: string;
  access_token_expires_at_ms: string;
};

export class PostgresApplicationSessionStore implements ApplicationSessionStore {
  private readonly pool: pg.Pool;

  constructor(options: { databaseUrl: string } | { databaseConnection: SessionDatabaseConnection }) {
    this.pool = new Pool({ connectionString: resolveConnectionString(options) });
  }

  async create(session: StoredApplicationSession): Promise<void> {
    await this.pool.query(
      `insert into app_private.application_sessions (
        id_hash,
        user_id,
        email,
        csrf_token,
        csrf_token_hash,
        encrypted_refresh_token,
        created_at,
        expires_at,
        access_token_expires_at
      ) values ($1, $2, $3, $4, $5, $6, to_timestamp($7 / 1000.0), to_timestamp($8 / 1000.0), to_timestamp($9 / 1000.0))`,
      [
        session.idHash,
        session.userId,
        session.email,
        session.csrfToken,
        session.csrfTokenHash,
        session.encryptedRefreshToken,
        session.createdAt,
        session.expiresAt,
        session.accessTokenExpiresAt,
      ],
    );
  }

  async get(idHash: string): Promise<StoredApplicationSession | null> {
    const result = await this.pool.query<PostgresSessionRow>(
      `select
        id_hash,
        user_id,
        email,
        csrf_token,
        csrf_token_hash,
        encrypted_refresh_token,
        (extract(epoch from created_at) * 1000)::bigint::text as created_at_ms,
        (extract(epoch from expires_at) * 1000)::bigint::text as expires_at_ms,
        (extract(epoch from access_token_expires_at) * 1000)::bigint::text as access_token_expires_at_ms
      from app_private.application_sessions
      where id_hash = $1
        and revoked_at is null
        and expires_at > now()
      limit 1`,
      [idHash],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      idHash: row.id_hash,
      userId: row.user_id,
      email: row.email,
      csrfToken: row.csrf_token,
      csrfTokenHash: row.csrf_token_hash,
      encryptedRefreshToken: row.encrypted_refresh_token,
      createdAt: Number(row.created_at_ms),
      expiresAt: Number(row.expires_at_ms),
      accessTokenExpiresAt: Number(row.access_token_expires_at_ms),
    };
  }

  async delete(idHash: string): Promise<void> {
    await this.pool.query(
      "update app_private.application_sessions set revoked_at = now() where id_hash = $1 and revoked_at is null",
      [idHash],
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async replace(oldIdHash: string, session: StoredApplicationSession): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const revoked = await client.query(
        `update app_private.application_sessions
         set revoked_at = now()
         where id_hash = $1
           and revoked_at is null
           and expires_at > now()
         returning id_hash`,
        [oldIdHash],
      );
      if (revoked.rowCount !== 1) {
        await client.query("rollback");
        return false;
      }
      await client.query(
        `insert into app_private.application_sessions (
          id_hash,
          user_id,
          email,
          csrf_token,
          csrf_token_hash,
          encrypted_refresh_token,
          created_at,
          expires_at,
          access_token_expires_at
        ) values ($1, $2, $3, $4, $5, $6, to_timestamp($7 / 1000.0), to_timestamp($8 / 1000.0), to_timestamp($9 / 1000.0))`,
        [
          session.idHash,
          session.userId,
          session.email,
          session.csrfToken,
          session.csrfTokenHash,
          session.encryptedRefreshToken,
          session.createdAt,
          session.expiresAt,
          session.accessTokenExpiresAt,
        ],
      );
      await client.query("commit");
      return true;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

function resolveConnectionString(options: { databaseUrl: string } | { databaseConnection: SessionDatabaseConnection }): string {
  if ("databaseConnection" in options) {
    return options.databaseConnection.getConnectionString();
  }
  return options.databaseUrl;
}
