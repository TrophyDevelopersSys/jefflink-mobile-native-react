import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env['STORAGE_PROVIDER'] ?? 'r2',
  // Cloudflare R2
  r2AccountId: process.env['R2_ACCOUNT_ID'],
  r2AccessKeyId: process.env['R2_ACCESS_KEY_ID'],
  r2SecretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
  r2BucketName: process.env['R2_BUCKET_NAME'] ?? 'jefflink-media',
  r2PublicUrl: process.env['R2_PUBLIC_URL'],
  // AWS S3
  awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'],
  awsSecretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
  awsRegion: process.env['AWS_REGION'] ?? 'us-east-1',
  s3BucketName: process.env['S3_BUCKET_NAME'],
}));
