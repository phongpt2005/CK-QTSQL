import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Core database service implementing Read/Write Splitting (Replication Pattern).
 *
 * Architecture:
 *   ┌──────────────────────────────────────────────────┐
 *   │               PrismaService                      │
 *   │                                                  │
 *   │   this (master)  ──► INSERT / UPDATE / DELETE    │
 *   │   this.reader    ──► SELECT (read-only)          │
 *   └──────────────────────────────────────────────────┘
 *
 * In production, set DATABASE_URL_READ to point to a MySQL replica.
 * In local dev, both connections target the same database automatically.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private _readerClient: PrismaClient | null = null;
  private _replicaMode = false;

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ [Master] Write database connected');

    await this.initReadReplica();
  }

  /**
   * Initialize the read replica connection.
   *
   * When DATABASE_URL_READ is set to a different URL than DATABASE_URL,
   * all read queries routed through `this.reader` will hit the replica server.
   * This distributes load and prevents heavy SELECT queries from blocking writes.
   */
  private async initReadReplica(): Promise<void> {
    const replicaUrl = process.env.DATABASE_URL_READ;

    if (!replicaUrl) {
      this._replicaMode = false;
      this.logger.log(
        'ℹ️  [Replica] DATABASE_URL_READ not set → using master for reads',
      );
      return;
    }

    // Always create a dedicated reader client with its own connection pool.
    // Even when pointing to the same server, this proves the architecture:
    //   - Master pool  → handles WRITE traffic
    //   - Replica pool → handles READ traffic (independent connections)
    this._readerClient = new PrismaClient({
      datasources: { db: { url: replicaUrl } },
    });
    await this._readerClient.$connect();
    this._replicaMode = true;

    const isSameServer = replicaUrl === process.env.DATABASE_URL;
    this.logger.log(
      isSameServer
        ? '✅ [Replica] Read connection pool created (same server, separate pool)'
        : '✅ [Replica] Read database connected (separate server)',
    );
  }

  /**
   * Get the read-optimized Prisma client.
   *
   * Returns the replica client when configured, otherwise falls back to master.
   * Use this for all SELECT / findMany / findFirst / count / aggregate queries.
   *
   * @example
   *   // Write → master (default)
   *   await this.prisma.product.create({ data: { ... } });
   *
   *   // Read → replica
   *   await this.prisma.reader.product.findMany();
   */
  get reader(): PrismaClient {
    return this._readerClient ?? (this as PrismaClient);
  }

  /** Whether a dedicated read replica is active. */
  get isReplicaActive(): boolean {
    return this._replicaMode;
  }

  /** Connection info for diagnostics (no secrets exposed). */
  getReplicationStatus() {
    return {
      master: {
        status: 'connected',
        role: 'WRITE (INSERT / UPDATE / DELETE)',
        url: this.maskUrl(process.env.DATABASE_URL),
      },
      replica: {
        status: this._replicaMode ? 'connected' : 'using_master',
        role: 'READ (SELECT / findMany / aggregate)',
        url: this.maskUrl(
          process.env.DATABASE_URL_READ || process.env.DATABASE_URL,
        ),
      },
      mode: this._replicaMode ? 'READ_WRITE_SPLIT' : 'SINGLE_SERVER',
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    if (this._readerClient) {
      await this._readerClient.$disconnect();
    }
  }

  /** Mask sensitive parts of database URL for safe logging. */
  private maskUrl(url?: string): string {
    if (!url) return 'N/A';
    return url.replace(/\/\/.*@/, '//***:***@');
  }
}
