import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateGoodsReceiptDto } from '../dto';
export declare class GoodsReceiptsService {
    private prisma;
    private inventoryService;
    private readonly logger;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    create(dto: CreateGoodsReceiptDto, userId: number): Promise<{
        details: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
            location: {
                id: number;
                warehouseId: number | null;
                locationCode: string;
            } | null;
        } & {
            id: number;
            productId: number | null;
            quantity: number;
            locationId: number | null;
            receiptId: number | null;
        })[];
    } & {
        id: number;
        status: string | null;
        createdAt: Date;
        note: string | null;
        poId: number | null;
        receiptDate: Date;
        createdBy: number | null;
        receiptCode: string;
    }>;
}
