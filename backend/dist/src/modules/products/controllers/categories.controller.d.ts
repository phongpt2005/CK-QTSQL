import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        description: string | null;
        status: number;
        categoryName: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }[]>;
    findOne(id: number): Promise<{
        products: {
            productCode: string;
            productName: string;
            id: number;
        }[];
    } & {
        description: string | null;
        status: number;
        categoryName: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        description: string | null;
        status: number;
        categoryName: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<{
        description: string | null;
        status: number;
        categoryName: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
