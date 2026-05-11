import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryName: string;
        isDeleted: boolean;
    }[]>;
    findOne(id: number): Promise<{
        products: {
            id: number;
            productCode: string;
            productName: string;
        }[];
    } & {
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryName: string;
        isDeleted: boolean;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryName: string;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        categoryName: string;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
