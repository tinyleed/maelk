import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import pg from "pg";

import { PostgresApplicationSessionStore } from "../dist/auth/index.js";

const { Pool } = pg;
const databaseUrl = process.env.MAELK_TEST_DATABASE_URL;

function sessionFixture({ idHash, userId, offset = 0 }) {
  const now = Date.now() + offset;
  return {
    idHash,
    userId,
    email: `postgres-session-${userId}@example.test`,
    csrfToken: `csrf-${idHash}`,
    csrfTokenHash: `csrf-hash-${idHash}`,
    encryptedRefreshToken: `encrypted-refresh-${idHash}`,
    createdAt: now,
    expiresAt: now + 60_000,
    accessTokenExpiresAt: now + 30_000,
  };
}

test(
  "Postgres session replacement permits exactly one concurrent winner",
  { skip: databaseUrl ? false : "MAELK_TEST_DATABASE_URL is required for local Postgres integration" },
  async () => {
    const admin = new Pool({ connectionString: databaseUrl });
    const store = new PostgresApplicationSessionStore({ databaseUrl });
    const userId = randomUUID();
    const email = `postgres-session-${userId}@example.test`;

    try {
      await admin.query(
        `insert into auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        ) values (
          '00000000-0000-0000-0000-000000000000',
          $1,
          'authenticated',
          'authenticated',
          $2,
          crypt('local-only-session-test', gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          now(),
          now(),
          '',
          '',
          '',
          ''
        )`,
        [userId, email],
      );

      const oldSession = sessionFixture({ idHash: `old-${randomUUID()}`, userId });
      const firstReplacement = sessionFixture({ idHash: `first-${randomUUID()}`, userId, offset: 1 });
      const secondReplacement = sessionFixture({ idHash: `second-${randomUUID()}`, userId, offset: 2 });
      await store.create(oldSession);

      const outcomes = await Promise.all([
        store.replace(oldSession.idHash, firstReplacement),
        store.replace(oldSession.idHash, secondReplacement),
      ]);

      assert.deepEqual([...outcomes].sort(), [false, true]);
      assert.equal(await store.get(oldSession.idHash), null);

      const activeRows = await admin.query(
        `select id_hash
         from app_private.application_sessions
         where user_id = $1
           and revoked_at is null
           and expires_at > now()`,
        [userId],
      );
      assert.equal(activeRows.rowCount, 1);
      assert.ok(
        [firstReplacement.idHash, secondReplacement.idHash].includes(activeRows.rows[0].id_hash),
        "the sole active row must be one of the two replacement candidates",
      );
    } finally {
      await admin.query("delete from auth.users where id = $1", [userId]);
      await store.close();
      await admin.end();
    }
  },
);
