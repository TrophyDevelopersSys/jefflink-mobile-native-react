import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  // Cloudflare R2 — primary media storage (jefflink-storage bucket)
  accountId: process.env['R2_ACCOUNT_ID'],
  accessKeyId: process.env['R2_ACCESS_KEY_ID'],
  secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
  bucket: process.env['R2_BUCKET'] ?? 'jefflink-storage',
  publicUrl: process.env['R2_PUBLIC_URL'] ?? 'https://cdn.jefflinkcars.com',
}));
