"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: adminPassword,
            role: 'Admin',
            status: 1,
        },
    });
    console.log(`✅ Admin user created: ${admin.username} (password: admin123)`);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await prisma.user.upsert({
        where: { username: 'staff01' },
        update: {},
        create: {
            username: 'staff01',
            passwordHash: staffPassword,
            role: 'Staff',
            status: 1,
        },
    });
    console.log(`✅ Staff user created: ${staff.username} (password: staff123)`);
    const cat1 = await prisma.productCategory.create({
        data: { categoryName: 'Electronics', description: 'Electronic devices and components' },
    });
    const cat2 = await prisma.productCategory.create({
        data: { categoryName: 'Office Supplies', description: 'Stationery and office equipment' },
    });
    const cat3 = await prisma.productCategory.create({
        data: { categoryName: 'Raw Materials', description: 'Manufacturing raw materials' },
    });
    console.log('✅ Categories created');
    const unit1 = await prisma.unit.create({ data: { unitName: 'Piece', symbol: 'pcs' } });
    const unit2 = await prisma.unit.create({ data: { unitName: 'Kilogram', symbol: 'kg' } });
    const unit3 = await prisma.unit.create({ data: { unitName: 'Box', symbol: 'box' } });
    const unit4 = await prisma.unit.create({ data: { unitName: 'Meter', symbol: 'm' } });
    console.log('✅ Units created');
    const prod1 = await prisma.product.create({
        data: {
            productCode: 'ELEC-001',
            productName: 'Laptop Dell Inspiron 15',
            categoryId: cat1.id,
            unitId: unit1.id,
            price: 15000000,
            description: 'Dell Inspiron 15 inch laptop',
        },
    });
    const prod2 = await prisma.product.create({
        data: {
            productCode: 'ELEC-002',
            productName: 'Wireless Mouse Logitech',
            categoryId: cat1.id,
            unitId: unit1.id,
            price: 350000,
            description: 'Logitech wireless mouse',
        },
    });
    const prod3 = await prisma.product.create({
        data: {
            productCode: 'OFF-001',
            productName: 'A4 Paper (500 sheets)',
            categoryId: cat2.id,
            unitId: unit3.id,
            price: 85000,
            description: 'Standard A4 paper pack',
        },
    });
    const prod4 = await prisma.product.create({
        data: {
            productCode: 'RAW-001',
            productName: 'Steel Wire 2mm',
            categoryId: cat3.id,
            unitId: unit4.id,
            price: 25000,
            description: 'Steel wire 2mm diameter',
        },
    });
    console.log('✅ Products created');
    const wh1 = await prisma.warehouse.create({
        data: {
            warehouseName: 'Main Warehouse',
            address: '123 Industrial Zone, District 9, HCMC',
            phone: '028-1234-5678',
            managerName: 'Nguyen Van A',
        },
    });
    const wh2 = await prisma.warehouse.create({
        data: {
            warehouseName: 'Secondary Warehouse',
            address: '456 Storage Area, Thu Duc, HCMC',
            phone: '028-8765-4321',
            managerName: 'Tran Thi B',
        },
    });
    const loc1 = await prisma.location.create({
        data: { warehouseId: wh1.id, locationCode: 'A-01-01', description: 'Zone A, Shelf 1, Slot 1', capacity: 500 },
    });
    const loc2 = await prisma.location.create({
        data: { warehouseId: wh1.id, locationCode: 'A-01-02', description: 'Zone A, Shelf 1, Slot 2', capacity: 500 },
    });
    const loc3 = await prisma.location.create({
        data: { warehouseId: wh1.id, locationCode: 'B-01-01', description: 'Zone B, Shelf 1, Slot 1', capacity: 1000 },
    });
    const loc4 = await prisma.location.create({
        data: { warehouseId: wh2.id, locationCode: 'C-01-01', description: 'Zone C, Shelf 1, Slot 1', capacity: 800 },
    });
    console.log('✅ Warehouses & Locations created');
    await prisma.supplier.create({
        data: {
            supplierCode: 'SUP-001',
            name: 'Dell Vietnam',
            phone: '028-1111-2222',
            email: 'sales@dell.vn',
            address: '789 Tech Park, District 7, HCMC',
        },
    });
    await prisma.supplier.create({
        data: {
            supplierCode: 'SUP-002',
            name: 'Office Mart Co.',
            phone: '028-3333-4444',
            email: 'contact@officemart.vn',
            address: '321 Commerce St, District 1, HCMC',
        },
    });
    console.log('✅ Suppliers created');
    await prisma.customer.create({
        data: {
            customerCode: 'CUS-001',
            name: 'ABC Corporation',
            phone: '028-5555-6666',
            email: 'procurement@abc-corp.vn',
            address: '100 Business Ave, District 2, HCMC',
        },
    });
    await prisma.customer.create({
        data: {
            customerCode: 'CUS-002',
            name: 'XYZ Trading Ltd.',
            phone: '028-7777-8888',
            email: 'orders@xyz-trading.vn',
            address: '200 Trade Center, Binh Thanh, HCMC',
        },
    });
    console.log('✅ Customers created');
    console.log('\n🎉 Seed completed successfully!');
    console.log('──────────────────────────────────────');
    console.log('Default login credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Staff: staff01 / staff123');
    console.log('──────────────────────────────────────');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map