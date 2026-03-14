import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import compression from 'compression';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);

  // ── Sentry error monitoring ──────────────────────────────────────────────
  const sentryDsn = config.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: config.get('NODE_ENV', 'development'),
      tracesSampleRate: 0.1,
    });
  }

  // ── Structured logging via Pino ──────────────────────────────────────────
  app.useLogger(app.get(Logger));

  // ── CORS — must be registered before helmet so headers are never stripped ─
  const rawOrigins = config.get<string>('CORS_ORIGINS', '');
  const configuredOrigins = (rawOrigins ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Hardcoded production + dev origins (supplemented by CORS_ORIGINS env var)
  const defaultOrigins = new Set([
    'https://jefflinkcars.com',
    'https://www.jefflinkcars.com',
    'https://admin.jefflinkcars.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
    'http://localhost:19006',
    'exp://localhost:8081',
    'http://10.0.2.2:8081',
    ...configuredOrigins,
  ]);

  // Belt-and-suspenders: explicit middleware that handles OPTIONS before any
  // other handler so proxy-level preflight requests always get a response.
  app.use((req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const origin = req.headers['origin'] as string | undefined;
    if (origin && defaultOrigins.has(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || defaultOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(helmet());

  // ── Gzip compression ─────────────────────────────────────────────────────
  app.use(compression());

  // ── Global validation pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filters & interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // ── URI versioning: /api/v1/... ───────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ── OpenAPI / Swagger docs ────────────────────────────────────────────────
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('JeffLink API')
      .setDescription('JeffLink multi-vendor marketplace REST API v2')
      .setVersion('2.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swaggerCfg),
    );
  }

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  app.enableShutdownHooks();

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`✓ JeffLink API v2 listening at ${url}`);
  if (config.get('NODE_ENV') !== 'production') {
    console.log(`✓ Swagger docs:  ${url}/api/docs`);
  }
}

void bootstrap();
