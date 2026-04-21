import {
  Controller, Post, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryNotesService } from '../services/delivery-notes.service';
import { CreateDeliveryNoteDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Delivery Notes')
@ApiBearerAuth()
@Controller('delivery-notes')
@UseGuards(JwtAuthGuard)
export class DeliveryNotesController {
  constructor(private deliveryNotesService: DeliveryNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create delivery note (delivers goods → decreases inventory)' })
  create(
    @Body() dto: CreateDeliveryNoteDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.deliveryNotesService.create(dto, userId);
  }
}
