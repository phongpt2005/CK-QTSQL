import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: number, subject: string, description: string) {
    await this.prisma.$executeRaw`
      INSERT INTO SupportTickets (UserID, Subject, Description, Status, CreatedAt, UpdatedAt)
      VALUES (${userId}, ${subject}, ${description}, 'PENDING', NOW(), NOW())
    `;
    return { success: true, message: 'Yêu cầu hỗ trợ đã được gửi thành công' };
  }

  async getAllTickets() {
    const tickets = await this.prisma.$queryRaw`
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

  async updateStatus(id: number, status: string) {
    await this.prisma.$executeRaw`
      UPDATE SupportTickets 
      SET Status = ${status}, UpdatedAt = NOW()
      WHERE id = ${id}
    `;
    return { success: true };
  }
}
