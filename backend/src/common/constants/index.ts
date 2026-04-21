export const USER_ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
} as const;

export const ORDER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  RECEIVED: 'Received',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PARTIAL: 'Partial',
} as const;

export const TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export const REFERENCE_TYPE = {
  GOODS_RECEIPT: 'GoodsReceipt',
  DELIVERY_NOTE: 'DeliveryNote',
  SALES_ORDER: 'SalesOrder',
} as const;

export const RESERVATION_STATUS = {
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;
