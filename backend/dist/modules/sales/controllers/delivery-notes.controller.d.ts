import { DeliveryNotesService } from '../services/delivery-notes.service';
import { CreateDeliveryNoteDto } from '../dto';
export declare class DeliveryNotesController {
    private deliveryNotesService;
    constructor(deliveryNotesService: DeliveryNotesService);
    create(dto: CreateDeliveryNoteDto, userId: number): Promise<{
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
