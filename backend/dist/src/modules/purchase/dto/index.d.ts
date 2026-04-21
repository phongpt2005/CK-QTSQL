export declare class PurchaseOrderItemDto {
    productId: number;
    quantity: number;
    unitPrice: number;
}
export declare class CreatePurchaseOrderDto {
    supplierId: number;
    orderDate: string;
    note?: string;
    items: PurchaseOrderItemDto[];
}
export declare class GoodsReceiptItemDto {
    productId: number;
    locationId: number;
    quantity: number;
}
export declare class CreateGoodsReceiptDto {
    poId: number;
    receiptDate: string;
    note?: string;
    items: GoodsReceiptItemDto[];
}
