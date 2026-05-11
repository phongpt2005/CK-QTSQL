import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateTicketDto, UpdateStatusDto } from './dto/support.dto';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(@Body() body: CreateTicketDto, @Req() req: any) {
    return this.supportService.createTicket(req.user.id, body.subject, body.description);
  }

  @Get()
  @Roles('Admin')
  getAllTickets() {
    return this.supportService.getAllTickets();
  }

  @Patch(':id/status')
  @Roles('Admin')
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.supportService.updateStatus(Number(id), body.status);
  }
}
