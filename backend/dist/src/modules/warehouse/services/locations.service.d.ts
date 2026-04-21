import { PrismaService } from '../../../common/database/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto';
export declare class LocationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(warehouseId?: number): Promise<({
        warehouse: {
            id: number;
            warehouseName: string;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        locationCode: string;
        capacity: number;
        warehouseId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        warehouse: {
            id: number;
            status: number;
            createdAt: Date;
            updatedAt: Date;
            warehouseName: string;
            address: string | null;
            phone: string | null;
            managerName: string | null;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        locationCode: string;
        capacity: number;
        warehouseId: number | null;
    }>;
    create(dto: CreateLocationDto): Promise<{
        warehouse: {
            id: number;
            warehouseName: string;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        locationCode: string;
        capacity: number;
        warehouseId: number | null;
    }>;
    update(id: number, dto: UpdateLocationDto): Promise<{
        warehouse: {
            id: number;
            warehouseName: string;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        description: string | null;
        updatedAt: Date;
        locationCode: string;
        capacity: number;
        warehouseId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
