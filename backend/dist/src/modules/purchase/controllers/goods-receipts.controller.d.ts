import { GoodsReceiptsService } from '../services/goods-receipts.service';
import { CreateGoodsReceiptDto } from '../dto';
export declare class GoodsReceiptsController {
    private goodsReceiptsService;
    constructor(goodsReceiptsService: GoodsReceiptsService);
    create(dto: CreateGoodsReceiptDto, userId: number): Promise<{
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
            receiptId: number | null;
        })[];
    } & {
        id: number;
        status: string | null;
        createdAt: Date;
        note: string | null;
        createdBy: number | null;
        poId: number | null;
        receiptDate: Date;
        receiptCode: string;
    }>;
}
