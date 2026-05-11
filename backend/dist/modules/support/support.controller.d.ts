import { SupportService } from './support.service';
import { CreateTicketDto, UpdateStatusDto } from './dto/support.dto';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createTicket(body: CreateTicketDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllTickets(): Promise<unknown>;
    updateStatus(id: string, body: UpdateStatusDto): Promise<{
        success: boolean;
    }>;
}
