import {
  Controller, Get, Post, Put, Delete, Body, Param,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from '../services/warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'List all warehouses' })
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID with locations' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a warehouse' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a warehouse' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.remove(id);
  }
}
