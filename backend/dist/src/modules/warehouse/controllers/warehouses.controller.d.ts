import { WarehousesService } from '../services/warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto';
export declare class WarehousesController {
    private warehousesService;
    constructor(warehousesService: WarehousesService);
    findAll(): Promise<({
        _count: {
            locations: number;
        };
    } & {
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        locations: {
            description: string | null;
            status: number;
            warehouseId: number | null;
            locationCode: string;
            capacity: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            locations: number;
        };
    } & {
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateWarehouseDto): Promise<{
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
