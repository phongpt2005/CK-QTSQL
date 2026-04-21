import { PrismaService } from '../../../common/database/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CreateDeliveryNoteDto } from '../dto';
export declare class DeliveryNotesService {
    private prisma;
    private inventoryService;
    private readonly logger;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    create(dto: CreateDeliveryNoteDto, userId: number): Promise<{
        details: ({
            product: {
                id: number;
                productCode: string;
                productName: string;
            } | null;
            location: {
                id: number;
                locationCode: string;
                warehouseId: number | null;
            } | null;
        } & {
            id: number;
            productId: number | null;
            locationId: number | null;
            quantity: number;
            deliveryId: number | null;
        })[];
    } & {
        id: number;
        status: string | null;
        createdAt: Date;
        note: string | null;
        createdBy: number | null;
        soId: number | null;
        deliveryDate: Date;
        deliveryCode: string;
    }>;
}
