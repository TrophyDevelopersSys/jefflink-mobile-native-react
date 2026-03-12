import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as schema from './schema';

// Required for TCP/WebSocket connections in non-edge environments
neonConfig.webSocketConstructor = ws;

export type DrizzleDB = NeonDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;
  private _db!: DrizzleDB;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url =
      this.config.get<string>('database.url') ??
      this.config.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL is not configured');
    }

    this.pool = new Pool({ connectionString: url });
    this._db = drizzle(this.pool, { schema });

    // Verify connectivity
    await this._db.execute(sql`SELECT 1`);
    this.logger.log('✓ Neon PostgreSQL connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  get db(): DrizzleDB {
    return this._db;
  }

  /**
   * Execute raw SQL (for calling legacy stored procedures)
   */
  async executeRaw<T = unknown>(
    query: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  /**
   * Execute raw SQL inside an explicit transaction
   */
  async withTransaction<T>(
    handler: (client: { query: (q: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await handler(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
