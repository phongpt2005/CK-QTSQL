import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from '../services/locations.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations, optionally filter by warehouseId' })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  findAll(@Query('warehouseId') warehouseId?: string) {
    return this.locationsService.findAll(
      warehouseId ? parseInt(warehouseId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLocationDto) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a location' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.remove(id);
  }
}
