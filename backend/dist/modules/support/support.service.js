"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let SupportService = class SupportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTicket(userId, subject, description) {
        await this.prisma.$executeRaw `
      INSERT INTO SupportTickets (UserID, Subject, Description, Status, CreatedAt, UpdatedAt)
      VALUES (${userId}, ${subject}, ${description}, 'PENDING', NOW(), NOW())
    `;
        return { success: true, message: 'Yêu cầu hỗ trợ đã được gửi thành công' };
    }
    async getAllTickets() {
        const tickets = await this.prisma.$queryRaw `
      SELECT 
        t.id, 
        t.UserID as userId, 
        t.Subject as subject, 
        t.Description as description, 
        t.Status as status, 
        t.CreatedAt as createdAt, 
        t.UpdatedAt as updatedAt,
        u.Username as username 
      FROM SupportTickets t
      JOIN Users u ON t.UserID = u.id
      ORDER BY t.CreatedAt DESC
    `;
        return tickets;
    }
    async updateStatus(id, status) {
        await this.prisma.$executeRaw `
      UPDATE SupportTickets 
      SET Status = ${status}, UpdatedAt = NOW()
      WHERE id = ${id}
    `;
        return { success: true };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map