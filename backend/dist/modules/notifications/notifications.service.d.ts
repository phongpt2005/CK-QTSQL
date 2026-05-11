import { PrismaService } from '../../common/database/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getRecentActivities(): Promise<{
        id: string;
        type: string;
        title: string;
        description: string;
        time: Date;
    }[]>;
}
