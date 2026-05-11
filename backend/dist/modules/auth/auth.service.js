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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../common/database/prisma.service");
const mail_service_1 = require("../../common/mail/mail.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    mailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { username: loginDto.username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Thông tin đăng nhập không chính xác');
        }
        if (user.status !== 1) {
            throw new common_1.UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Thông tin đăng nhập không chính xác');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { username: registerDto.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Tên người dùng (Email) đã được sử dụng');
        }
        const passwordHash = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: registerDto.username,
                passwordHash,
                role: 'Staff',
                status: 1,
            },
        });
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.status !== 1) {
            throw new common_1.UnauthorizedException('Không tìm thấy người dùng hoặc tài khoản bị vô hiệu hóa');
        }
        return user;
    }
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.email },
        });
        if (!user) {
            throw new common_1.BadRequestException('Không tìm thấy tài khoản với email này');
        }
        if (user.status !== 1) {
            throw new common_1.BadRequestException('Tài khoản đã bị vô hiệu hóa');
        }
        await this.prisma.passwordReset.updateMany({
            where: {
                userId: user.id,
                used: false,
            },
            data: {
                used: true,
            },
        });
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                code,
                expiresAt,
            },
        });
        await this.mailService.sendResetCode(dto.email, code);
        this.logger.log(`Password reset code sent to ${dto.email}`);
        return {
            message: 'Mã xác thực đã được gửi đến email của bạn',
        };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.email },
        });
        if (!user) {
            throw new common_1.BadRequestException('Không tìm thấy tài khoản với email này');
        }
        const resetRecord = await this.prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                code: dto.code,
                used: false,
                expiresAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!resetRecord) {
            throw new common_1.BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { passwordHash },
            }),
            this.prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { used: true },
            }),
        ]);
        this.logger.log(`Password reset successful for ${dto.email}`);
        return {
            message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map