import { LocationsService } from '../services/locations.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto';
export declare class LocationsController {
    private locationsService;
    constructor(locationsService: LocationsService);
    findAll(warehouseId?: string): Promise<({
        warehouse: {
            warehouseName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        status: number;
        warehouseId: number | null;
        locationCode: string;
        capacity: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: number): Promise<{
        warehouse: {
            warehouseName: string;
            address: string | null;
            phone: string | null;
            managerName: string | null;
            status: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        description: string | null;
        status: number;
        warehouseId: number | null;
        locationCode: string;
        capacity: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateLocationDto): Promise<{
        warehouse: {
            warehouseName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        status: number;
        warehouseId: number | null;
        locationCode: string;
        capacity: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateLocationDto): Promise<{
        warehouse: {
            warehouseName: string;
            id: number;
        } | null;
    } & {
        description: string | null;
        status: number;
        warehouseId: number | null;
        locationCode: string;
        capacity: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
