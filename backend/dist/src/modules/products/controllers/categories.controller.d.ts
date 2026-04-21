import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        categoryName: string;
        description: string | null;
        updatedAt: Date;
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
        categoryName: string;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        categoryName: string;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        categoryName: string;
        description: string | null;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
