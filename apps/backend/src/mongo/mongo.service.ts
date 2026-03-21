import {
  Injectable,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db, Collection, Document } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private readonly config: ConfigService) {}

  async connect(): Promise<void> {
    const uri = this.config.get<string>('mongo.uri');
    if (!uri) {
      this.logger.warn('MONGO_URI not set – Atlas features disabled');
      return;
    }

    const dbName = this.config.get<string>('mongo.dbName', 'jefflink');
    const appName = this.config.get<string>('mongo.appName', 'jefflink-api');

    this.client = new MongoClient(uri, {
      appName,
      maxPoolSize: this.config.get<string>('app.nodeEnv') === 'production' ? 50 : 20,
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
      retryWrites: true,
      retryReads: true,
      compressors: ['zstd'],
      tls: true,
    });

    try {
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.logger.log(`✓ MongoDB connected → ${dbName}`);
    } catch (err) {
      this.logger.error(`MongoDB connection failed – Atlas features disabled: ${err instanceof Error ? err.message : err}`);
      this.client = null;
      this.db = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.logger.log('MongoDB connection closed');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Is MONGO_URI set?');
    }
    return this.db;
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  /** Lightweight ping for health checks */
  async ping(): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
