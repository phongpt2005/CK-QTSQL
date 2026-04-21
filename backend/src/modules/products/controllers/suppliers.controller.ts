import {
  Controller, Get, Post, Put, Delete, Body, Param,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a supplier' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
