import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InventoryReportService } from './services/inventory-report.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory/report')
@UseGuards(JwtAuthGuard)
export class InventoryReportController {
  constructor(private readonly reportService: InventoryReportService) {}

  /**
   * Báo cáo tồn kho từ Database View (InventoryReportView).
   * Truy vấn tối ưu: View đã được JOIN sẵn ở tầng MySQL,
   * giảm tải cho ORM và tăng tốc phản hồi.
   */
  @Get('view')
  @ApiOperation({
    summary: 'Báo cáo tồn kho từ Database View (SQL View)',
    description:
      'Lấy dữ liệu tồn kho từ InventoryReportView đã được tạo sẵn trong MySQL. ' +
      'View này JOIN 4 bảng (Inventory, Products, Warehouses, Locations) ở tầng Database, ' +
      'giúp truy vấn nhanh hơn so với ORM findMany() kèm include.',
  })
  getFromView() {
    return this.reportService.getInventoryFromView();
  }

  /**
   * Báo cáo tổng hợp tồn kho bằng kỹ thuật CTE (Common Table Expression).
   * Gom nhóm tổng số lượng theo từng sản phẩm trên toàn bộ kho.
   */
  @Get('cte')
  @ApiOperation({
    summary: 'Báo cáo tổng hợp tồn kho bằng CTE (Common Table Expression)',
    description:
      'Sử dụng SQL thuần với CTE (WITH clause) để tính tổng tồn kho ' +
      'theo từng sản phẩm trên toàn bộ các kho và vị trí. ' +
      'Phù hợp cho Kế toán kho và Quản lý tổng quan.',
  })
  getAggregatedByCTE() {
    return this.reportService.getAggregatedInventoryByCTE();
  }
}
