import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY', '');
    this.from = config.get<string>('EMAIL_FROM', 'hub02 <noreply@hub02.io>');
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  async sendInvitation(opts: {
    to: string;
    inviteUrl: string;
    workspaceName: string;
  }): Promise<void> {
    const { to, inviteUrl, workspaceName } = opts;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0d0d0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1f;border:1px solid #2a2a32;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px;border-bottom:1px solid #2a2a32;">
            <span style="font-size:20px;font-weight:700;color:#f0f0f3;letter-spacing:-0.5px;">
              hub<span style="color:#7c6af7;">02</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#f0f0f3;line-height:1.3;">
              You're invited to join ${workspaceName}
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#9090a0;line-height:1.6;">
              Click the button below to accept your invitation and sign in with Google.
            </p>
            <a href="${inviteUrl}"
               style="display:inline-block;background:#7c6af7;color:#ffffff;font-size:14px;font-weight:600;
                      text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:0.1px;">
              Accept invitation →
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#606070;line-height:1.6;">
              This link expires in 24 hours. If you didn't expect this invitation, you can ignore this email.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a32;">
            <p style="margin:0;font-size:11px;color:#50505f;">
              hub02 · Your team's workspace
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    if (!this.resend) {
      this.logger.log(`[EMAIL DRY-RUN] To: ${to} | Invite URL: ${inviteUrl}`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `You've been invited to ${workspaceName}`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send invitation email to ${to}: ${JSON.stringify(error)}`);
    } else {
      this.logger.log(`Invitation email sent to ${to}`);
    }
  }
}
