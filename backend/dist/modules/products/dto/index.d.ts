export declare class CreateProductDto {
    productCode: string;
    productName: string;
    categoryId?: number;
    unitId?: number;
    price?: number;
    description?: string;
}
export declare class UpdateProductDto {
    productName?: string;
    categoryId?: number;
    unitId?: number;
    price?: number;
    description?: string;
    status?: number;
}
export declare class CreateCategoryDto {
    categoryName: string;
    description?: string;
}
export declare class UpdateCategoryDto {
    categoryName?: string;
    description?: string;
    status?: number;
}
export declare class CreateUnitDto {
    unitName: string;
    symbol?: string;
}
export declare class UpdateUnitDto {
    unitName?: string;
    symbol?: string;
}
export declare class CreateSupplierDto {
    supplierCode: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}
export declare class UpdateSupplierDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: number;
}
export declare class CreateCustomerDto {
    customerCode: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: number;
}
