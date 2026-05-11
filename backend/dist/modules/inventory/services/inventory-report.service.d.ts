import { PrismaService } from '../../../common/database/prisma.service';
export declare class InventoryReportService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAggregatedInventoryByCTE(): Promise<unknown>;
    getInventoryFromView(): Promise<unknown>;
    decreaseInventoryStockRawAcid(productId: number, locationId: number, qtyToDecrease: number): Promise<{
        success: boolean;
        oldStock: any;
        newStock: number;
    }>;
}
