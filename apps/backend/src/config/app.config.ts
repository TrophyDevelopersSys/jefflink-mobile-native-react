import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  host: process.env['HOST'] ?? '0.0.0.0',
  corsOrigins: (process.env['CORS_ORIGINS'] ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  throttleTtl: parseInt(process.env['THROTTLE_TTL'] ?? '60000', 10),
  throttleLimit: parseInt(process.env['THROTTLE_LIMIT'] ?? '120', 10),
  cacheTtlListings: parseInt(process.env['CACHE_TTL_LISTINGS'] ?? '300', 10),
  cacheTtlSearch: parseInt(process.env['CACHE_TTL_SEARCH'] ?? '120', 10),
  cacheTtlProfile: parseInt(process.env['CACHE_TTL_PROFILE'] ?? '600', 10),
}));
