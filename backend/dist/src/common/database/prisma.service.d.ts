import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private _readerClient;
    private _replicaMode;
    onModuleInit(): Promise<void>;
    private initReadReplica;
    get reader(): PrismaClient;
    get isReplicaActive(): boolean;
    getReplicationStatus(): {
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
    onModuleDestroy(): Promise<void>;
    private maskUrl;
}
