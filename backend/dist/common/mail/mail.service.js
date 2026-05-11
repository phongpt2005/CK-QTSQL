"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.MAIL_PORT || '587', 10),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async sendResetCode(toEmail, code) {
        const mailOptions = {
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send reset code to ${toEmail}`, error);
            throw error;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map