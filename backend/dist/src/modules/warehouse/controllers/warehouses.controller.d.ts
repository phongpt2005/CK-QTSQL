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
        status: number;
        createdAt: Date;
        updatedAt: Date;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
    })[]>;
    findOne(id: number): Promise<{
        locations: {
            id: number;
            status: number;
            createdAt: Date;
            description: string | null;
            updatedAt: Date;
            locationCode: string;
            capacity: number;
            warehouseId: number | null;
        }[];
        _count: {
            locations: number;
        };
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
    }>;
    create(dto: CreateWarehouseDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
    }>;
    update(id: number, dto: UpdateWarehouseDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        warehouseName: string;
        address: string | null;
        phone: string | null;
        managerName: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
