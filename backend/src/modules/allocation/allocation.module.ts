import { Module } from '@nestjs/common';
import { AllocationGateway } from './allocation.gateway';
import { AllocationService } from './allocation.service';
import { DatabaseModule } from '../../common/database';

@Module({
  imports: [DatabaseModule],
  providers: [AllocationGateway, AllocationService],
  exports: [AllocationService],
})
export class AllocationModule {}
