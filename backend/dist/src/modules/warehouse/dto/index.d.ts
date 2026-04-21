export declare class CreateWarehouseDto {
    warehouseName: string;
    address?: string;
    phone?: string;
    managerName?: string;
}
export declare class UpdateWarehouseDto {
    warehouseName?: string;
    address?: string;
    phone?: string;
    managerName?: string;
    status?: number;
}
export declare class CreateLocationDto {
    warehouseId: number;
    locationCode: string;
    description?: string;
    capacity?: number;
}
export declare class UpdateLocationDto {
    locationCode?: string;
    description?: string;
    capacity?: number;
    status?: number;
}
