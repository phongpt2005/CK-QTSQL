import {
  Controller, Get, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory with filters' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findAll({
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      productId: productId ? parseInt(productId) : undefined,
      locationId: locationId ? parseInt(locationId) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List inventory transactions' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTransactions(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getTransactions({
      productId: productId ? parseInt(productId) : undefined,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get stock summary for a product (all locations)' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findByProduct(productId);
  }
}
