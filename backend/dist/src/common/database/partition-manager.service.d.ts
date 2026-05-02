import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
export interface PartitionInfo {
    name: string;
    rowCount: number;
    dataSizeKB: number;
    rangeUpperBound: string;
}
export declare class PartitionManagerService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private readonly TARGET_TABLE;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    isPartitioned(): Promise<boolean>;
    getPartitionDistribution(): Promise<PartitionInfo[]>;
    explainPartitionPruning(startDate: string, endDate: string): Promise<{
        id: any;
        selectType: any;
        table: any;
        partitions: any;
        type: any;
        possibleKeys: any;
        key: any;
        rows: number;
        extra: any;
    }[]>;
    getArchitectureOverview(): Promise<{
        replication: {
            master: {
                status: string;
                role: string;
                url: string;
            };
            replica: {
                status: string;
                role: string;
                url: string;
            };
            mode: string;
        };
        partitioning: {
            enabled: boolean;
            table: string;
            strategy: string;
            totalPartitions: number;
            partitions: PartitionInfo[];
        };
    }>;
    private queryPartitions;
    private logPartitionStatus;
}
