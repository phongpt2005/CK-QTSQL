import { test, expect } from '@playwright/test';

/**
 * WMS E2E Test Suite
 * ====================
 * Các test chạy tuần tự (serial) vì chúng phụ thuộc lẫn nhau:
 *   Test 1: Nhập hàng (PO → Goods Receipt) → tạo tồn kho
 *   Test 2: Chặn âm kho – cố xuất vượt tồn → bị chặn
 *   Test 3: Xuất hàng thành công (SO → Delivery Note)
 *
 * Yêu cầu:
 *   - Backend đang chạy tại http://localhost:3000
 *   - Frontend đang chạy tại http://localhost:5173
 *   - DB đã seed (có Supplier, Customer, Product, Warehouse, Location)
 */

test.describe.serial('WMS Core Flows (Inbound, Outbound & Stock Prevention)', () => {

  // ──────────────────────────────────────────────────────────
  // TEST 1 — Luồng Nhập Hàng: Tạo Purchase Order → Goods Receipt
  // ──────────────────────────────────────────────────────────
  test('1. Luồng Nhập Hàng: Tạo Purchase Order và Goods Receipt', async ({ page }) => {
    // ── Bước 1: Đi tới trang danh sách Purchase Orders ──
    await page.goto('/purchase-orders');
    await expect(page.locator('.page-title')).toContainText('Đơn nhập hàng', { timeout: 10000 });

    // ── Bước 2: Bấm nút "Tạo đơn nhập" để sang trang tạo mới ──
    await page.getByRole('button', { name: 'Tạo đơn nhập' }).click();
    await expect(page).toHaveURL(/\/purchase-orders\/new/);
    await expect(page.locator('.page-title')).toContainText('Tạo đơn nhập hàng');

    // ── Bước 3: Chọn Nhà cung cấp ──
    await page.getByText('Chọn NCC').click({ force: true });
    // Đợi dropdown mở ra và chọn option đầu tiên
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // ── Bước 4: Thêm dòng sản phẩm ──
    await page.getByRole('button', { name: 'Thêm dòng' }).click();

    // ── Bước 5: Chọn sản phẩm trong dòng vừa thêm ──
    const productRow = page.locator('.ant-table-row').first();
    // Cột "Sản phẩm" có Select -> Bấm vào ô chọn Sản phẩm
    await productRow.getByText('Chọn sản phẩm').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // ── Bước 6: Sửa số lượng thành 100 ──
    const qtyInput = productRow.locator('.ant-input-number-input').first();
    await qtyInput.fill('100');

    // ── Bước 7: Submit → Tạo đơn nhập hàng ──
    await page.getByRole('button', { name: 'Tạo đơn nhập hàng' }).click();

    // Chờ thông báo thành công (từ mutation hook)
    await expect(page.locator('.ant-message')).toContainText('Tạo đơn nhập hàng thành công', { timeout: 15000 });

    // Kiểm tra redirect về trang danh sách PO
    await expect(page).toHaveURL(/\/purchase-orders$/, { timeout: 10000 });

    // ── Bước 8: Nhập kho (Goods Receipt) ──
    // Vào chi tiết đơn mới nhất bằng nút "eye" icon
    await page.locator('.ant-table-row').first().locator('button').click();
    await expect(page).toHaveURL(/\/purchase-orders\/\d+/);

    // Chờ trang detail load xong
    await expect(page.locator('.page-title')).toContainText('PO-', { timeout: 10000 });

    // Bấm nút "Nhập kho (Goods Receipt)"
    await page.getByRole('button', { name: /Nhập kho/i }).click();

    // Modal "Nhập kho – Goods Receipt" phải mở
    await expect(page.locator('.ant-modal-title')).toContainText('Nhập kho', { timeout: 5000 });

    // Chọn vị trí kho cho sản phẩm trong modal (click dòng 'Chọn vị trí')
    const modalContent = page.locator('.ant-modal-content');
    await modalContent.getByText('Chọn vị trí').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Xác nhận nhập kho → bấm "Xác nhận nhập kho" (okText của Modal)
    await modalContent.getByRole('button', { name: 'Xác nhận nhập kho' }).click();

    // Kiểm tra thông báo thành công
    await expect(page.locator('.ant-message')).toContainText('Nhập kho thành công', { timeout: 15000 });
  });


  // ──────────────────────────────────────────────────────────
  // TEST 2 — Chặn Âm Kho (Negative Stock Prevention)
  // ──────────────────────────────────────────────────────────
  test('2. Chặn Âm Kho (Negative Stock Prevention)', async ({ page }) => {
    // 1. Đi tới trang tạo đơn xuất
    await page.goto('/sales-orders/new');
    await expect(page.locator('.page-title')).toContainText('Tạo đơn xuất hàng', { timeout: 10000 });

    // 2. Chọn Khách hàng
    await page.getByText('Chọn khách hàng').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 3. Thêm dòng sản phẩm
    await page.getByRole('button', { name: 'Thêm dòng' }).click();

    const row = page.locator('.ant-table-row').first();

    // 4. Chọn Sản phẩm
    await row.getByText('Chọn SP').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 5. Chọn Kho
    await row.getByText('Chọn kho').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 6. Chọn Vị trí (cần đợi vị trí load theo kho)
    await page.waitForTimeout(500);
    await row.getByText('Chọn vị trí').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 7. Đợi hệ thống kiểm tra tồn khả dụng xong (tag "Đang kiểm..." biến mất)
    await expect(row.locator('.ant-tag')).not.toContainText('Đang kiểm', { timeout: 15000 });

    // 8. Lấy số lượng tồn khả dụng
    const availableTag = row.locator('.ant-tag');
    const availableText = await availableTag.innerText();
    const availableQty = parseInt(availableText.replace(/\D/g, ''), 10);

    // 9. Cố tình nhập số lượng VƯỢT QUÁ khả dụng
    const overQty = (availableQty + 9999).toString();
    await row.locator('.ant-input-number-input').fill(overQty);

    // 10. Đợi UI phản hồi
    await page.waitForTimeout(1000);

    // 11. Kiểm tra: Alert "Không đủ tồn kho" phải hiện ra
    await expect(page.locator('.ant-alert')).toContainText('Không đủ tồn kho', { timeout: 5000 });

    // 12. Nút submit phải bị disabled
    const submitBtn = page.getByRole('button', { name: /Tạo đơn xuất/ });
    await expect(submitBtn).toBeDisabled();
  });


  // ──────────────────────────────────────────────────────────
  // TEST 3 — Luồng Xuất Hàng Thành Công (SO → Delivery Note)
  // ──────────────────────────────────────────────────────────
  test('3. Luồng Xuất Hàng Thành Công', async ({ page }) => {
    // 1. Tạo Sales Order
    await page.goto('/sales-orders/new');
    await expect(page.locator('.page-title')).toContainText('Tạo đơn xuất hàng', { timeout: 10000 });

    // Chọn Khách hàng
    await page.getByText('Chọn khách hàng').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Thêm dòng SP
    await page.getByRole('button', { name: 'Thêm dòng' }).click();
    const row = page.locator('.ant-table-row').first();

    // Chọn SP → Kho → Vị trí (tuần tự)
    await row.getByText('Chọn SP').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await row.getByText('Chọn kho').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);
    await row.getByText('Chọn vị trí').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Đợi check tồn kho xong
    await expect(row.locator('.ant-tag')).not.toContainText('Đang kiểm', { timeout: 15000 });

    // Nhập số lượng 1 (chắc chắn đủ nếu test 1 đã nhập 100)
    await row.locator('.ant-input-number-input').fill('1');

    // Submit đơn xuất
    const submitBtn = page.getByRole('button', { name: /Tạo đơn xuất/ });
    // Đợi nút enabled (stock check hoàn tất)
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // Chờ thông báo thành công
    await expect(page.locator('.ant-message')).toContainText('Tạo đơn xuất hàng thành công', { timeout: 15000 });

    // Redirect về danh sách SO
    await expect(page).toHaveURL(/\/sales-orders$/, { timeout: 10000 });

    // 2. Tạo Delivery Note (xuất kho)
    // Vào chi tiết đơn mới nhất
    await page.locator('.ant-table-row').first().locator('button').click();
    await expect(page).toHaveURL(/\/sales-orders\/\d+/, { timeout: 10000 });

    // Bấm nút "Xuất kho (Delivery Note)"
    await page.getByRole('button', { name: /Xuất kho/i }).click();

    // Modal "Xuất kho – Delivery Note" phải mở
    await expect(page.locator('.ant-modal-title')).toContainText('Xuất kho', { timeout: 5000 });

    // Chọn vị trí xuất kho cho SP trong modal
    const modalContent = page.locator('.ant-modal-content');
    await modalContent.getByText('Chọn vị trí').click({ force: true });
    await page.waitForSelector('.ant-select-item-option:visible');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Xác nhận xuất kho
    await modalContent.getByRole('button', { name: 'Xác nhận xuất kho' }).click();

    // Kiểm tra thông báo thành công
    await expect(page.locator('.ant-message')).toContainText('Xuất kho thành công', { timeout: 15000 });
  });
});

