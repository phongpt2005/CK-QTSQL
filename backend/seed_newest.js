const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // GET THE NEWEST PRODUCT
  const product = await prisma.product.findFirst({
    where: { isDeleted: false },
    orderBy: { id: 'desc' }
  });
  if (!product) return console.log("No products");

  const warehouse = await prisma.warehouse.findFirst();
  const locations = await prisma.location.findMany({
    where: { warehouseId: warehouse.id },
    take: 2
  });

  if (locations.length < 2) return console.log("Need at least 2 locations");

  // Location 1: 20 units
  const inv1 = await prisma.inventory.findFirst({
    where: { productId: product.id, locationId: locations[0].id }
  });
  if (inv1) {
    await prisma.inventory.update({ where: { id: inv1.id }, data: { quantity: 20 } });
  } else {
    await prisma.inventory.create({ data: { productId: product.id, warehouseId: warehouse.id, locationId: locations[0].id, quantity: 20 } });
  }

  // Location 2: 30 units
  const inv2 = await prisma.inventory.findFirst({
    where: { productId: product.id, locationId: locations[1].id }
  });
  if (inv2) {
    await prisma.inventory.update({ where: { id: inv2.id }, data: { quantity: 30 } });
  } else {
    await prisma.inventory.create({ data: { productId: product.id, warehouseId: warehouse.id, locationId: locations[1].id, quantity: 30 } });
  }

  console.log(`✅ Đã thiết lập xong dữ liệu giả lập cho SP MỚI NHẤT!`);
  console.log(`Sản phẩm: ${product.productName} (Mã: ${product.productCode})`);
  console.log(`- Đang có 20 cái ở Kho: ${warehouse.warehouseName}, Vị trí: ${locations[0].locationCode}`);
  console.log(`- Đang có 30 cái ở Kho: ${warehouse.warehouseName}, Vị trí: ${locations[1].locationCode}`);
  console.log(`Tổng cộng: 50 cái.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
