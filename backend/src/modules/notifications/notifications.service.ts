import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

    // Sort all by time descending
    return notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);
  }
}
