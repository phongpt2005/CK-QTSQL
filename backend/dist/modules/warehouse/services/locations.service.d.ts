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
        updatedAt: Date;
        warehouseId: number | null;
        description: string | null;
        locationCode: string;
        capacity: number;
    })[]>;
    findOne(id: number): Promise<{
        warehouse: {
            id: number;
            warehouseName: string;
            address: string | null;
            phone: string | null;
            managerName: string | null;
            status: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: number | null;
        description: string | null;
        locationCode: string;
        capacity: number;
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
        updatedAt: Date;
        warehouseId: number | null;
        description: string | null;
        locationCode: string;
        capacity: number;
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
        updatedAt: Date;
        warehouseId: number | null;
        description: string | null;
        locationCode: string;
        capacity: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
