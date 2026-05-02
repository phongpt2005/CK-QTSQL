import { PartitionManagerService } from '../../common/database/partition-manager.service';
import { ShardingDemoService } from '../../common/database/sharding-demo.service';
export declare class ArchitectureController {
    private readonly partitionManager;
    private readonly shardingDemo;
    constructor(partitionManager: PartitionManagerService, shardingDemo: ShardingDemoService);
    getOverview(): Promise<{
        sharding: {
            strategy: string;
            shard_key: string;
            description: string;
            shards: {
                shard_north: {
                    name: string;
                    host: string;
                    port: number;
                    warehouseRange: {
                        from: number;
                        to: number;
                    };
                    region: string;
                };
                shard_south: {
                    name: string;
                    host: string;
                    port: number;
                    warehouseRange: {
                        from: number;
                        to: number;
                    };
                    region: string;
                };
            };
            production_setup: {
                step1: string;
                step2: string;
                step3: string;
                step4: string;
            };
        };
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
            partitions: import("../../common/database/partition-manager.service").PartitionInfo[];
        };
    }>;
    getPartitions(): Promise<import("../../common/database/partition-manager.service").PartitionInfo[]>;
    explainPruning(startDate?: string, endDate?: string): Promise<{
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
    getShardingOverview(): {
        strategy: string;
        shard_key: string;
        description: string;
        shards: {
            shard_north: {
                name: string;
                host: string;
                port: number;
                warehouseRange: {
                    from: number;
                    to: number;
                };
                region: string;
            };
            shard_south: {
                name: string;
                host: string;
                port: number;
                warehouseRange: {
                    from: number;
                    to: number;
                };
                region: string;
            };
        };
        production_setup: {
            step1: string;
            step2: string;
            step3: string;
            step4: string;
        };
    };
    demoRouting(warehouseId?: number): Promise<{
        input: {
            warehouseId: number;
        };
        routing: {
            shardKey: string;
            shardName: string;
            targetServer: string;
            region: string;
            warehouseRange: string;
        };
        warehouse: string | {
            id: number;
            name: string;
            address: string | null;
        };
        explanation: string;
    }>;
    demoDistribution(): Promise<{
        sharding_strategy: string;
        shard_north: {
            warehouses: {
                id: number;
                name: string;
            }[];
            warehouseCount: number;
            transactionCount: number;
            inventoryRecords: number;
            name: string;
            host: string;
            port: number;
            warehouseRange: {
                from: number;
                to: number;
            };
            region: string;
        };
        shard_south: {
            warehouses: {
                id: number;
                name: string;
            }[];
            warehouseCount: number;
            transactionCount: number;
            inventoryRecords: number;
            name: string;
            host: string;
            port: number;
            warehouseRange: {
                from: number;
                to: number;
            };
            region: string;
        };
        summary: {
            totalWarehouses: number;
            totalTransactions: number;
            benefit: string;
        };
    }>;
    demoWrite(warehouseId?: number): Promise<{
        operation: string;
        input: {
            warehouseId: number;
        };
        routing_decision: {
            step1_resolve_shard: string;
            step2_get_connection: string;
            step3_execute: string;
        };
        code_example: {
            description: string;
            code: string[];
        };
        comparison: {
            without_sharding: string;
            with_sharding: string;
        };
    }>;
    demoRead(warehouseId?: number): Promise<{
        operation: string;
        input: {
            warehouseId: number;
        };
        routing_decision: {
            step1_resolve_shard: string;
            step2_get_connection: string;
            step3_execute: string;
        };
        real_data: {
            inventoryRecordCount: number;
            recentTransactions: {
                id: number;
                quantity: number;
                transactionType: string | null;
                transactionDate: Date;
            }[];
            note: string;
        };
        comparison: {
            without_sharding: string;
            with_sharding: string;
        };
    }>;
}
