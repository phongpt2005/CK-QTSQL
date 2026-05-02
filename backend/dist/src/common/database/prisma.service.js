"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    _readerClient = null;
    _replicaMode = false;
    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ [Master] Write database connected');
        await this.initReadReplica();
    }
    async initReadReplica() {
        const replicaUrl = process.env.DATABASE_URL_READ;
        if (!replicaUrl) {
            this._replicaMode = false;
            this.logger.log('ℹ️  [Replica] DATABASE_URL_READ not set → using master for reads');
            return;
        }
        this._readerClient = new client_1.PrismaClient({
            datasources: { db: { url: replicaUrl } },
        });
        await this._readerClient.$connect();
        this._replicaMode = true;
        const isSameServer = replicaUrl === process.env.DATABASE_URL;
        this.logger.log(isSameServer
            ? '✅ [Replica] Read connection pool created (same server, separate pool)'
            : '✅ [Replica] Read database connected (separate server)');
    }
    get reader() {
        return this._readerClient ?? this;
    }
    get isReplicaActive() {
        return this._replicaMode;
    }
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
                url: this.maskUrl(process.env.DATABASE_URL_READ || process.env.DATABASE_URL),
            },
            mode: this._replicaMode ? 'READ_WRITE_SPLIT' : 'SINGLE_SERVER',
        };
    }
    async onModuleDestroy() {
        await this.$disconnect();
        if (this._readerClient) {
            await this._readerClient.$disconnect();
        }
    }
    maskUrl(url) {
        if (!url)
            return 'N/A';
        return url.replace(/\/\/.*@/, '//***:***@');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map