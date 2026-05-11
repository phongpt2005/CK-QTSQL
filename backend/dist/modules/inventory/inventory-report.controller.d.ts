import { InventoryReportService } from './services/inventory-report.service';
export declare class InventoryReportController {
    private readonly reportService;
    constructor(reportService: InventoryReportService);
    getFromView(): Promise<unknown>;
    getAggregatedByCTE(): Promise<unknown>;
}
