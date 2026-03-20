import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
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
  private readonly startupMigrations = [
    '0000_fancy_raza.sql',
    '0001_admin_infrastructure.sql',
    '0003_align_prod_schema.sql',
    '0004_add_password_hash.sql',
    '0005_admin_recovery.sql',
  ];
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
    await this.runStartupCompatibilityMigrations();
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

  private async runStartupCompatibilityMigrations(): Promise<void> {
    const drizzleDir = this.resolveDrizzleDirectory();
    if (!drizzleDir) {
      this.logger.warn('Startup compatibility migrations skipped: drizzle directory not found');
      return;
    }

    this.logger.log('Applying startup compatibility migrations');

    await this.withTransaction(async (client) => {
      for (const migration of this.startupMigrations) {
        const migrationPath = join(drizzleDir, migration);
        const sqlText = readFileSync(migrationPath, 'utf-8');

        this.logger.log(`Applying ${migration}`);
        await client.query(sqlText);
      }
    });

    this.logger.log('Startup compatibility migrations applied successfully');
  }

  private resolveDrizzleDirectory(): string | null {
    const candidates = [
      join(process.cwd(), 'drizzle'),
      join(process.cwd(), 'apps', 'backend', 'drizzle'),
      join(__dirname, '..', '..', 'drizzle'),
      join(__dirname, '..', '..', '..', 'drizzle'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }
}
