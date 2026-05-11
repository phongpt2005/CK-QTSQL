"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecentActivities() {
        console.log('Fetching recent activities for notifications...');
        const [purchaseOrders, salesOrders, transactions] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { supplier: true },
            }),
            this.prisma.salesOrder.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { customer: true },
            }),
            this.prisma.inventoryTransaction.findMany({
                take: 10,
                orderBy: { transactionDate: 'desc' },
                include: { product: true },
            }),
        ]);
        const notifications = [
            ...purchaseOrders.map(po => ({
                id: `po-${po.id}`,
                type: 'import',
                title: 'Đơn nhập hàng mới',
                description: `${po.poCode} - NCC: ${po.supplier?.name || 'Không xác định'}`,
                time: po.createdAt,
            })),
            ...salesOrders.map(so => ({
                id: `so-${so.id}`,
                type: 'export',
                title: 'Đơn xuất hàng mới',
                description: `${so.soCode} - KH: ${so.customer?.name || 'Khách lẻ'}`,
                time: so.createdAt,
            })),
            ...transactions.map(tr => ({
                id: `tr-${tr.id}`,
                type: 'transaction',
                title: tr.transactionType === 'IN' ? 'Giao dịch Nhập kho' : 'Giao dịch Xuất kho',
                description: `${tr.product?.productName || 'Sản phẩm'} - Số lượng: ${tr.quantity}`,
                time: tr.transactionDate,
            })),
        ];
        return notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map