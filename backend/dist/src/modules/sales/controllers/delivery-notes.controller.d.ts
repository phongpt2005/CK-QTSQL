import { DeliveryNotesService } from '../services/delivery-notes.service';
import { CreateDeliveryNoteDto } from '../dto';
export declare class DeliveryNotesController {
    private deliveryNotesService;
    constructor(deliveryNotesService: DeliveryNotesService);
    create(dto: CreateDeliveryNoteDto, userId: number): Promise<{
        details: ({
            location: {
                id: number;
                warehouseId: number | null;
                locationCode: string;
            } | null;
            product: {
                id: number;
                productCode: string;
                productName: string;
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
