import { PrismaService } from '../../../common/database/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from '../dto';
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        symbol: string | null;
        unitName: string;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        symbol: string | null;
        unitName: string;
        id: number;
    }>;
    create(dto: CreateUnitDto): Promise<{
        symbol: string | null;
        unitName: string;
        id: number;
    }>;
    update(id: number, dto: UpdateUnitDto): Promise<{
        symbol: string | null;
        unitName: string;
        id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
