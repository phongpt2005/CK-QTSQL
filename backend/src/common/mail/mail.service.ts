import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: false, // true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendResetCode(toEmail: string, code: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.MAIL_FROM || '"WMS System" <noreply@wms.com>',
      to: toEmail,
      subject: '🔐 Mã xác thực đặt lại mật khẩu - WMS',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
          <div style="background: #ffffff; border-radius: 12px; padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h2 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 22px;">Đặt lại mật khẩu</h2>
            <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px;">
              Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản WMS. Sử dụng mã xác thực bên dưới:
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff;">
                ${code}
              </span>
            </div>
            
            <p style="color: #ef4444; font-size: 13px; margin: 0 0 16px 0; font-weight: 500;">
              ⏰ Mã này sẽ hết hạn sau 10 phút
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.<br/>
              © ${new Date().getFullYear()} WMS - Warehouse Management System
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Reset code sent to ${toEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send reset code to ${toEmail}`, error);
      throw error;
    }
  }
}
