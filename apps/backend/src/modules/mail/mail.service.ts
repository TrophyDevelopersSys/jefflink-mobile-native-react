import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { SendMailOptions, Transporter } from 'nodemailer';

interface PasswordResetEmailInput {
  to: string;
  name?: string;
  resetUrl: string;
  resendUrl: string;
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
      'Need a fresh link? Request another password reset here:',
      input.resendUrl,
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
        <p style="margin-top:16px;">Need a fresh link? <a href="${this.escapeHtml(input.resendUrl)}">Request another password reset email</a>.</p>
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

  async sendAdminRecoveryEmail(input: {
    to: string;
    name?: string;
    resetUrl: string;
    resendUrl: string;
    expiresInMinutes: number;
    initiatedBy?: string;
    requestIp?: string;
    requestTimestamp?: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP is not configured. Admin recovery email was skipped for ${input.to}.`,
      );
      return false;
    }

    const recipientName = input.name?.trim() || 'Admin';
    const initiatorNote = input.initiatedBy
      ? '<p style="color:#b45309;"><strong>Note:</strong> This recovery was initiated by a Super Admin on your behalf.</p>'
      : '';
    const initiatorText = input.initiatedBy
      ? '\nNote: This recovery was initiated by a Super Admin on your behalf.\n'
      : '';

    // Point #6: Request context for security awareness
    const requestContextParts: string[] = [];
    const requestContextHtmlParts: string[] = [];
    if (input.requestIp) {
      requestContextParts.push(`IP address: ${input.requestIp}`);
      requestContextHtmlParts.push(`<strong>IP address:</strong> ${this.escapeHtml(input.requestIp)}`);
    }
    if (input.requestTimestamp) {
      const ts = new Date(input.requestTimestamp).toUTCString();
      requestContextParts.push(`Time: ${ts}`);
      requestContextHtmlParts.push(`<strong>Time:</strong> ${this.escapeHtml(ts)}`);
    }
    const requestContextText = requestContextParts.length
      ? `\nRequest details:\n${requestContextParts.map((p) => `  - ${p}`).join('\n')}\n`
      : '';
    const requestContextHtml = requestContextHtmlParts.length
      ? `<div style="margin:12px 0;padding:10px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;font-size:13px;color:#475569;">
           <p style="margin:0 0 4px;font-weight:600;">Request details:</p>
           ${requestContextHtmlParts.map((p) => `<p style="margin:2px 0;">${p}</p>`).join('')}
         </div>`
      : '';

    const subject = 'JeffLink Admin Account Recovery';
    const text = [
      `Hi ${recipientName},`,
      '',
      'An account recovery request was made for your JeffLink admin account.',
      initiatorText,
      requestContextText,
      `Use the link below within ${input.expiresInMinutes} minutes to reset your password:`,
      input.resetUrl,
      '',
      'Need a fresh link? Request another recovery here:',
      input.resendUrl,
      '',
      'SECURITY NOTICE: If you did not request this, your account may be at risk.',
      'Please contact the JeffLink platform team immediately.',
      '',
      'JeffLink Security',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;margin:0 auto;">
        <div style="background:#1e293b;padding:16px 20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#ffffff;">&#x1f512; Admin Account Recovery</h2>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
          <p>Hi ${this.escapeHtml(recipientName)},</p>
          <p>An account recovery request was made for your <strong>JeffLink admin account</strong>.</p>
          ${initiatorNote}
          ${requestContextHtml}
          <p>This link expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
          <p style="margin:24px 0;">
            <a
              href="${this.escapeHtml(input.resetUrl)}"
              style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;"
            >
              Reset Admin Password
            </a>
          </p>
          <p style="font-size:13px;">If the button does not work, copy and paste this link into your browser:</p>
          <p style="font-size:13px;word-break:break-all;"><a href="${this.escapeHtml(input.resetUrl)}">${this.escapeHtml(input.resetUrl)}</a></p>
          <p>Need a fresh link? <a href="${this.escapeHtml(input.resendUrl)}">Request another recovery email</a>.</p>
          <div style="margin-top:24px;padding:12px;background:#fef2f2;border-radius:6px;border:1px solid #fecaca;">
            <p style="margin:0;font-size:13px;color:#991b1b;">
              <strong>&#x26a0; Security Notice:</strong> If you did not request this,
              your admin account may be at risk. Contact the JeffLink team immediately.
            </p>
          </div>
          <p style="margin-top:24px;color:#64748b;font-size:12px;">JeffLink Security</p>
        </div>
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
        `Failed to send admin recovery email to ${input.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
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