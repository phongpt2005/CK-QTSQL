import { PrismaService } from '../../../common/database/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from '../dto';
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        symbol: string | null;
        id: number;
        unitName: string;
    }[]>;
    findOne(id: number): Promise<{
        symbol: string | null;
        id: number;
        unitName: string;
    }>;
    create(dto: CreateUnitDto): Promise<{
        symbol: string | null;
        id: number;
        unitName: string;
    }>;
    update(id: number, dto: UpdateUnitDto): Promise<{
        symbol: string | null;
        id: number;
        unitName: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
