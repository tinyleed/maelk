export type SessionDatabaseConnectionSource = "node-database-url" | "worker-hyperdrive";

export type SessionDatabaseConnection = {
  readonly source: SessionDatabaseConnectionSource;
  getConnectionString(): string;
  toJSON(): { configured: true; source: SessionDatabaseConnectionSource };
};

export function createSessionDatabaseConnection(options: {
  connectionString: string;
  source: SessionDatabaseConnectionSource;
}): SessionDatabaseConnection {
  const connectionString = options.connectionString.trim();
  if (!connectionString) {
    throw new Error("session_database_connection_string_required");
  }
  return new ServerOnlySessionDatabaseConnection(options.source, connectionString);
}

class ServerOnlySessionDatabaseConnection implements SessionDatabaseConnection {
  readonly source: SessionDatabaseConnectionSource;
  readonly #connectionString: string;

  constructor(source: SessionDatabaseConnectionSource, connectionString: string) {
    this.source = source;
    this.#connectionString = connectionString;
  }

  getConnectionString(): string {
    return this.#connectionString;
  }

  toJSON(): { configured: true; source: SessionDatabaseConnectionSource } {
    return {
      configured: true,
      source: this.source,
    };
  }
}
