import {
  Controller, Get, Post, Body, Param, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchaseOrdersService } from '../services/purchase-orders.service';
import { CreatePurchaseOrderDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseOrdersService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID with details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.purchaseOrdersService.create(dto, userId);
  }
}
