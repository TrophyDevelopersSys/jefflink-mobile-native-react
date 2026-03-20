import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { SendMailOptions, Transporter } from 'nodemailer';

interface PasswordResetEmailInput {
  to: string;
  name?: string;
  resetUrl: string;
  expiresInMinutes: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly replyTo?: string;

  constructor(private readonly config: ConfigService) {
    this.transporter = this.createTransporter();
    this.fromAddress = this.config.get<string>('mail.from') ?? 'no-reply@jefflinkcars.com';
    this.fromName = this.config.get<string>('mail.fromName') ?? 'JeffLink';
    this.replyTo = this.config.get<string>('mail.replyTo') ?? undefined;
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP is not configured. Password reset email was skipped for ${input.to}.`,
      );
      return false;
    }

    const recipientName = input.name?.trim() || 'there';
    const subject = 'Reset your JeffLink password';
    const text = [
      `Hi ${recipientName},`,
      '',
      'We received a request to reset your JeffLink password.',
      `Use the link below within ${input.expiresInMinutes} minutes:`,
      input.resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
      '',
      'JeffLink Support',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;margin:0 auto;">
        <h2 style="margin-bottom:16px;">Reset your JeffLink password</h2>
        <p>Hi ${this.escapeHtml(recipientName)},</p>
        <p>We received a request to reset your JeffLink password.</p>
        <p>This link expires in ${input.expiresInMinutes} minutes.</p>
        <p style="margin:24px 0;">
          <a
            href="${this.escapeHtml(input.resetUrl)}"
            style="display:inline-block;background:#0e7c3a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;"
          >
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${this.escapeHtml(input.resetUrl)}">${this.escapeHtml(input.resetUrl)}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>JeffLink Support</p>
      </div>
    `;

    const options: SendMailOptions = {
      to: input.to,
      from: this.formatFromHeader(),
      subject,
      text,
      html,
    };

    if (this.replyTo) {
      options.replyTo = this.replyTo;
    }

    try {
      await this.transporter.sendMail(options);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${input.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  private createTransporter(): Transporter | null {
    const smtpUrl = this.config.get<string>('mail.url') ?? this.config.get<string>('SMTP_URL');
    if (smtpUrl) {
      return nodemailer.createTransport(smtpUrl);
    }

    const host = this.config.get<string>('mail.host') ?? this.config.get<string>('SMTP_HOST');
    if (!host) {
      return null;
    }

    const port = this.config.get<number>('mail.port') ?? 587;
    const secure = this.config.get<boolean>('mail.secure') ?? false;
    const user =
      this.config.get<string>('mail.user') ??
      this.config.get<string>('SMTP_USER') ??
      this.config.get<string>('SMTP_BREVO_LOGIN') ??
      this.config.get<string>('BREVO_SMTP_LOGIN');
    const pass =
      this.config.get<string>('mail.pass') ??
      this.config.get<string>('SMTP_PASS') ??
      this.config.get<string>('SMTP_BREVO_API_KEY') ??
      this.config.get<string>('BREVO_SMTP_KEY') ??
      this.config.get<string>('SMTP_Brevo_API_KEY');

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  private formatFromHeader(): string {
    return `${this.fromName} <${this.fromAddress}>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}