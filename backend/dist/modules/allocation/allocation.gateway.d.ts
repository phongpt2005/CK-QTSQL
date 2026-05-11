import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllocationService, DraftAllocation } from './allocation.service';
export declare class AllocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private allocationService;
    server: Server;
    private readonly logger;
    private socketUserMap;
    constructor(allocationService: AllocationService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private extractUserId;
    handleScanProduct(client: Socket, data: {
        productCode: string;
        requiredQty: number;
        targetUserId?: number;
    }): Promise<void>;
    handleScanLocation(client: Socket, data: {
        draftId: string;
        locationCode: string;
    }): void;
    handleDraftUpdate(client: Socket, data: {
        draftId: string;
        allocations: DraftAllocation[];
    }): void;
    handleDraftConfirm(client: Socket, data: {
        draftId: string;
    }): void;
    handleDraftCancel(client: Socket, data: {
        draftId: string;
    }): void;
}
