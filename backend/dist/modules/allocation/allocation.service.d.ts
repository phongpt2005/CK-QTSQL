import { PrismaService } from '../../common/database/prisma.service';
export interface DraftAllocation {
    warehouseId: number;
    warehouseName?: string;
    locationId: number;
    locationCode?: string;
    availableQty: number;
    allocatedQty: number;
}
export interface DraftReservation {
    draftId: string;
    userId: number;
    productId: number;
    productName: string;
    requiredQty: number;
    allocations: DraftAllocation[];
    createdAt: number;
    confirmed: boolean;
}
export declare class AllocationService {
    private prisma;
    private readonly logger;
    private readonly drafts;
    private readonly DRAFT_TTL_MS;
    private cleanupInterval;
    constructor(prisma: PrismaService);
    private generateDraftId;
    suggestAllocation(userId: number, productCode: string, requiredQty: number): Promise<DraftReservation | null>;
    updateDraft(draftId: string, allocations: DraftAllocation[]): DraftReservation | null;
    confirmDraft(draftId: string): DraftReservation | null;
    cancelDraft(draftId: string): boolean;
    getDraft(draftId: string): DraftReservation | null;
    getDraftsForProduct(productId: number, excludeUserId?: number): DraftReservation[];
    getDraftHoldForLocation(productId: number, warehouseId: number, locationId: number, excludeUserId: number): number;
    cancelAllDraftsForUser(userId: number): string[];
    private cleanupExpiredDrafts;
}
