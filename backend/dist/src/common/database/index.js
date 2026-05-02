"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingDemoService = exports.PartitionManagerService = exports.PrismaService = exports.DatabaseModule = void 0;
var database_module_1 = require("./database.module");
Object.defineProperty(exports, "DatabaseModule", { enumerable: true, get: function () { return database_module_1.DatabaseModule; } });
var prisma_service_1 = require("./prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });
var partition_manager_service_1 = require("./partition-manager.service");
Object.defineProperty(exports, "PartitionManagerService", { enumerable: true, get: function () { return partition_manager_service_1.PartitionManagerService; } });
var sharding_demo_service_1 = require("./sharding-demo.service");
Object.defineProperty(exports, "ShardingDemoService", { enumerable: true, get: function () { return sharding_demo_service_1.ShardingDemoService; } });
//# sourceMappingURL=index.js.map