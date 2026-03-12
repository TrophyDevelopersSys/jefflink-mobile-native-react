import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: 'DB_CONFIG',
      useFactory: (config: ConfigService) => ({
        url: config.get<string>('database.url') ?? config.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
