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
        id: number;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        locations: {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            warehouseId: number | null;
            description: string | null;
            locationCode: string;
            capacity: number;
        }[];
        _count: {
            locations: number;
        };
    } & {
        id: number;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        id: number;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateWarehouseDto): Promise<{
        id: number;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
        status: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
