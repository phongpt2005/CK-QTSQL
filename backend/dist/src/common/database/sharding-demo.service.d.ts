import { PrismaService } from './prisma.service';
export declare class ShardingDemoService {
    private readonly prisma;
    private readonly logger;
    private readonly SHARD_CONFIG;
    constructor(prisma: PrismaService);
    private resolveShardKey;
    demoShardRouting(warehouseId: number): Promise<{
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
    demoShardDistribution(): Promise<{
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
    demoWriteRouting(warehouseId: number): Promise<{
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
    demoReadRouting(warehouseId: number): Promise<{
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
}
