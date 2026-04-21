import {
  Controller, Post, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoodsReceiptsService } from '../services/goods-receipts.service';
import { CreateGoodsReceiptDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Goods Receipts')
@ApiBearerAuth()
@Controller('goods-receipts')
@UseGuards(JwtAuthGuard)
export class GoodsReceiptsController {
  constructor(private goodsReceiptsService: GoodsReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create goods receipt (receive goods → increase inventory)' })
  create(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.goodsReceiptsService.create(dto, userId);
  }
}
