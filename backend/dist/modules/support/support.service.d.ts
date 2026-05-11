import { PrismaService } from '../../common/database/prisma.service';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    createTicket(userId: number, subject: string, description: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllTickets(): Promise<unknown>;
    updateStatus(id: number, status: string): Promise<{
        success: boolean;
    }>;
}
