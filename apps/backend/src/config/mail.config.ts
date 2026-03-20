import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  url: process.env['SMTP_URL'],
  host: process.env['SMTP_HOST'],
  port: parseInt(process.env['SMTP_PORT'] ?? '587', 10),
  secure: process.env['SMTP_SECURE'] === 'true',
  user:
    process.env['SMTP_USER'] ??
    process.env['SMTP_BREVO_LOGIN'] ??
    process.env['BREVO_SMTP_LOGIN'],
  pass:
    process.env['SMTP_PASS'] ??
    process.env['SMTP_BREVO_API_KEY'] ??
    process.env['BREVO_SMTP_KEY'] ??
    process.env['SMTP_Brevo_API_KEY'],
  from: process.env['MAIL_FROM'] ?? 'no-reply@jefflinkcars.com',
  fromName: process.env['MAIL_FROM_NAME'] ?? 'JeffLink',
  replyTo: process.env['MAIL_REPLY_TO'],
}));