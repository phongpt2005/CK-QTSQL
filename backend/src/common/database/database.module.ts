import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PartitionManagerService } from './partition-manager.service';
import { ShardingDemoService } from './sharding-demo.service';
import { ArchitectureController } from './architecture.controller';

@Global()
@Module({
  controllers: [ArchitectureController],
  providers: [PrismaService, PartitionManagerService, ShardingDemoService],
  exports: [PrismaService, PartitionManagerService, ShardingDemoService],
})
export class DatabaseModule {}
