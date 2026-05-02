import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function truncateTables() {
  console.log('🧹 Truncating existing data...');
  const tableNames = [
    'InventoryTransactions', 'StockReservations', 'Inventory', 
    'DeliveryNoteDetails', 'DeliveryNotes', 'SalesOrderDetails', 'SalesOrders',
    'GoodsReceiptDetails', 'GoodsReceipts', 'PurchaseOrderDetails', 'PurchaseOrders',
    'Locations', 'Warehouses', 'Products', 'ProductCategories', 'Units', 
    'Suppliers', 'Customers', 'Users'
  ];

  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
    } catch (e: any) {
      console.log(`Failed to truncate ${tableName}:`, e.message);
    }
  }
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log('✅ Tables truncated.');
}

async function main() {
  console.log('🌱 Starting MASSIVE seed...');
  await truncateTables();

  // 1. Users
  console.log('⏳ Seeding Users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.createMany({
    data: [
      { username: 'admin', passwordHash: adminPassword, role: 'Admin', status: 1 },
      { username: 'staff01', passwordHash: staffPassword, role: 'Staff', status: 1 }
    ]
  });

  const users = await prisma.user.findMany();
  const admin = users.find(u => u.username === 'admin')!;
  const staff = users.find(u => u.username === 'staff01')!;
  console.log('✅ Users seeded.');

  // 2. Categories
  console.log('⏳ Seeding Categories (50)...');
  const categoriesData = Array.from({ length: 50 }).map(() => ({
    categoryName: faker.commerce.department() + ' ' + faker.string.alphanumeric(4),
    description: faker.commerce.productDescription(),
    status: 1
  }));
  await prisma.productCategory.createMany({ data: categoriesData });
  const categories = await prisma.productCategory.findMany();

  // 3. Units
  console.log('⏳ Seeding Units (10)...');
  const unitNames = ['Piece', 'Box', 'Kilogram', 'Meter', 'Liter', 'Pack', 'Roll', 'Set', 'Pair', 'Dozen'];
  const unitsData = unitNames.map(name => ({
    unitName: name,
    symbol: name.substring(0, 3).toLowerCase()
  }));
  await prisma.unit.createMany({ data: unitsData });
  const units = await prisma.unit.findMany();

  // 4. Suppliers & Customers
  console.log('⏳ Seeding Suppliers (200) and Customers (500)...');
  const suppliersData = Array.from({ length: 200 }).map((_, i) => ({
    supplierCode: `SUP-${String(i+1).padStart(4, '0')}`,
    name: faker.company.name(),
    phone: faker.phone.number().substring(0, 20),
    email: faker.internet.email().substring(0, 100),
    address: faker.location.streetAddress().substring(0, 255),
    status: 1
  }));
  await prisma.supplier.createMany({ data: suppliersData });
  const suppliers = await prisma.supplier.findMany();

  const customersData = Array.from({ length: 500 }).map((_, i) => ({
    customerCode: `CUS-${String(i+1).padStart(4, '0')}`,
    name: faker.company.name(),
    phone: faker.phone.number().substring(0, 20),
    email: faker.internet.email().substring(0, 100),
    address: faker.location.streetAddress().substring(0, 255),
    status: 1
  }));
  await prisma.customer.createMany({ data: customersData });
  const customers = await prisma.customer.findMany();

  // 5. Warehouses & Locations
  console.log('⏳ Seeding Warehouses (20) & Locations (200)...');
  const warehousesData = Array.from({ length: 20 }).map((_, i) => ({
    warehouseName: `WH ${faker.location.city()}`.substring(0, 100),
    address: faker.location.streetAddress().substring(0, 255),
    phone: faker.phone.number().substring(0, 20),
    managerName: faker.person.fullName().substring(0, 100),
    status: 1
  }));
  await prisma.warehouse.createMany({ data: warehousesData });
  const warehouses = await prisma.warehouse.findMany();

  const locationsData: any[] = [];
  warehouses.forEach(wh => {
    for (let i = 1; i <= 10; i++) {
      locationsData.push({
        warehouseId: wh.id,
        locationCode: `WH${wh.id}-L${String(i).padStart(2, '0')}`,
        description: `Zone A, Shelf ${i}`,
        capacity: faker.number.int({ min: 100, max: 1000 }),
        status: 1
      });
    }
  });
  await prisma.location.createMany({ data: locationsData });
  const locations = await prisma.location.findMany();

  // 6. Products (10,000)
  console.log('⏳ Seeding Products (10,000) in batches...');
  const BATCH_SIZE = 2000;
  for (let i = 0; i < 10000; i += BATCH_SIZE) {
    const productsData = Array.from({ length: BATCH_SIZE }).map((_, idx) => ({
      productCode: `PRD-${String(i + idx + 1).padStart(6, '0')}`,
      productName: (faker.commerce.productName() + ' ' + faker.string.alphanumeric(4)).substring(0, 255),
      categoryId: faker.helpers.arrayElement(categories).id,
      unitId: faker.helpers.arrayElement(units).id,
      price: faker.commerce.price({ min: 10000, max: 5000000, dec: 0 }),
      description: faker.commerce.productDescription(),
      status: 1
    }));
    await prisma.product.createMany({ data: productsData });
    console.log(`   Created ${i + BATCH_SIZE} products...`);
  }
  const products = await prisma.product.findMany();

  // 7. Inventory
  console.log('⏳ Seeding Initial Inventory (10,000)...');
  const inventoryData = products.map((prod) => {
    const loc = faker.helpers.arrayElement(locations);
    return {
      productId: prod.id,
      warehouseId: loc.warehouseId,
      locationId: loc.id,
      quantity: faker.number.int({ min: 10, max: 1000 })
    };
  });
  
  for (let i = 0; i < inventoryData.length; i += BATCH_SIZE) {
    await prisma.inventory.createMany({
      data: inventoryData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true
    });
  }
  console.log('✅ Inventory seeded.');

  // 8. Purchase Orders & Details (1,000 POs)
  console.log('⏳ Seeding Purchase Orders (1,000)...');
  for (let i = 0; i < 1000; i += 500) {
    const poData = Array.from({ length: 500 }).map((_, idx) => ({
      poCode: `PO-${String(i + idx + 1).padStart(5, '0')}`,
      supplierId: faker.helpers.arrayElement(suppliers).id,
      orderDate: faker.date.recent({ days: 30 }),
      status: 'Completed',
      totalAmount: 0,
      createdBy: admin.id,
    }));
    await prisma.purchaseOrder.createMany({ data: poData });
  }
  
  const purchaseOrders = await prisma.purchaseOrder.findMany({ select: { id: true, poCode: true } });
  
  console.log('⏳ Seeding Purchase Order Details...');
  let poDetailsData: any[] = [];
  purchaseOrders.forEach(po => {
    const itemsCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < itemsCount; j++) {
      const p = faker.helpers.arrayElement(products);
      const qty = faker.number.int({ min: 10, max: 100 });
      poDetailsData.push({
        poId: po.id,
        productId: p.id,
        quantity: qty,
        unitPrice: p.price,
        totalPrice: Number(p.price) * qty
      });
    }
  });
  for (let i = 0; i < poDetailsData.length; i += BATCH_SIZE) {
    await prisma.purchaseOrderDetail.createMany({ data: poDetailsData.slice(i, i + BATCH_SIZE) });
  }

  // 9. Sales Orders & Details (5,000 SOs)
  console.log('⏳ Seeding Sales Orders (5,000)...');
  for (let i = 0; i < 5000; i += BATCH_SIZE) {
    const soData = Array.from({ length: Math.min(BATCH_SIZE, 5000 - i) }).map((_, idx) => ({
      soCode: `SO-${String(i + idx + 1).padStart(5, '0')}`,
      customerId: faker.helpers.arrayElement(customers).id,
      orderDate: faker.date.recent({ days: 30 }),
      status: 'Completed',
      totalAmount: 0,
      createdBy: admin.id,
    }));
    await prisma.salesOrder.createMany({ data: soData });
    console.log(`   Created ${i + Math.min(BATCH_SIZE, 5000 - i)} SOs...`);
  }

  console.log('⏳ Seeding Sales Order Details...');
  const salesOrders = await prisma.salesOrder.findMany({ select: { id: true } });
  let soDetailsData: any[] = [];
  salesOrders.forEach(so => {
    const itemsCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < itemsCount; j++) {
      const p = faker.helpers.arrayElement(products);
      const qty = faker.number.int({ min: 1, max: 20 });
      soDetailsData.push({
        soId: so.id,
        productId: p.id,
        quantity: qty,
        unitPrice: p.price,
        totalPrice: Number(p.price) * qty
      });
    }
  });
  
  for (let i = 0; i < soDetailsData.length; i += BATCH_SIZE) {
    await prisma.salesOrderDetail.createMany({ data: soDetailsData.slice(i, i + BATCH_SIZE) });
  }

  // 10. Inventory Transactions (Random generation)
  console.log('⏳ Seeding Inventory Transactions (~20,000)...');
  const txData = Array.from({ length: 20000 }).map(() => ({
    productId: faker.helpers.arrayElement(products).id,
    warehouseId: faker.helpers.arrayElement(warehouses).id,
    quantity: faker.number.int({ min: 1, max: 50 }),
    transactionType: faker.helpers.arrayElement(['IN', 'OUT']),
    referenceType: faker.helpers.arrayElement(['PurchaseOrder', 'SalesOrder', 'Adjustment']),
    transactionDate: faker.date.recent({ days: 60 }),
    note: 'System generated transaction'
  }));
  
  for (let i = 0; i < txData.length; i += BATCH_SIZE) {
    await prisma.inventoryTransaction.createMany({ data: txData.slice(i, i + BATCH_SIZE) });
  }

  console.log('✅ ALL MASSIVE DATA SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
