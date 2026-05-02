-- ==============================================================================
-- REAL TABLE PARTITIONING (SHARDING Ở TẦNG DATABASE)
--
-- Đây KHÔNG phải code mô phỏng. Khi chạy file này trên MySQL Workbench,
-- MySQL sẽ THỰC SỰ phân chia bảng InventoryTransactions thành các phân vùng
-- vật lý riêng biệt trên ổ cứng.
--
-- Kỹ thuật: RANGE PARTITIONING theo TransactionDate (Ngày giao dịch)
-- Lợi ích: Khi hệ thống có hàng triệu bản ghi, MySQL chỉ đọc phân vùng
--          chứa dữ liệu cần thiết (Partition Pruning) thay vì quét toàn bộ.
-- ==============================================================================

USE wms_db;

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ BƯỚC 1: Kiểm tra Foreign Key cần xóa trước khi Partition    ║
-- ║ MySQL KHÔNG hỗ trợ Partitioning trên bảng có Foreign Key.   ║
-- ║ Referential Integrity được đảm bảo bởi tầng Application.    ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Trước tiên, kiểm tra tên FK constraints hiện tại:
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'wms_db'
  AND TABLE_NAME = 'InventoryTransactions'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Xóa FK constraints (tên FK do Prisma sinh ra, thường theo format này):
ALTER TABLE `InventoryTransactions`
  DROP FOREIGN KEY `InventoryTransactions_ProductID_fkey`;

ALTER TABLE `InventoryTransactions`
  DROP FOREIGN KEY `InventoryTransactions_WarehouseID_fkey`;

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ BƯỚC 2: Chỉnh sửa Primary Key                               ║
-- ║ MySQL yêu cầu cột phân vùng phải nằm trong Primary Key.     ║
-- ╚═══════════════════════════════════════════════════════════════╝

ALTER TABLE `InventoryTransactions`
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`id`, `TransactionDate`);

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ BƯỚC 3: Tạo Partitions theo Quý                              ║
-- ║ Mỗi Partition = 1 file vật lý riêng trên ổ cứng.            ║
-- ║ Khi query WHERE TransactionDate BETWEEN '2026-04-01'         ║
-- ║ AND '2026-06-30', MySQL CHỈ đọc partition p_2026_q2.         ║
-- ╚═══════════════════════════════════════════════════════════════╝

ALTER TABLE `InventoryTransactions`
PARTITION BY RANGE COLUMNS(`TransactionDate`) (
  PARTITION p_history   VALUES LESS THAN ('2026-01-01') COMMENT 'Dữ liệu lịch sử trước 2026',
  PARTITION p_2026_q1   VALUES LESS THAN ('2026-04-01') COMMENT 'Quý 1/2026 (T1-T3)',
  PARTITION p_2026_q2   VALUES LESS THAN ('2026-07-01') COMMENT 'Quý 2/2026 (T4-T6)',
  PARTITION p_2026_q3   VALUES LESS THAN ('2026-10-01') COMMENT 'Quý 3/2026 (T7-T9)',
  PARTITION p_2026_q4   VALUES LESS THAN ('2027-01-01') COMMENT 'Quý 4/2026 (T10-T12)',
  PARTITION p_2027_q1   VALUES LESS THAN ('2027-04-01') COMMENT 'Quý 1/2027',
  PARTITION p_2027_q2   VALUES LESS THAN ('2027-07-01') COMMENT 'Quý 2/2027',
  PARTITION p_future    VALUES LESS THAN (MAXVALUE)     COMMENT 'Dữ liệu tương lai'
);

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ BƯỚC 4: Kiểm tra kết quả Partitioning                       ║
-- ╚═══════════════════════════════════════════════════════════════╝

SELECT
  PARTITION_NAME        AS 'Tên Partition',
  TABLE_ROWS            AS 'Số dòng',
  ROUND(DATA_LENGTH / 1024, 2) AS 'Dung lượng (KB)',
  PARTITION_DESCRIPTION AS 'Giới hạn trên'
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_SCHEMA = 'wms_db'
  AND TABLE_NAME = 'InventoryTransactions'
  AND PARTITION_NAME IS NOT NULL
ORDER BY PARTITION_ORDINAL_POSITION;

-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ BƯỚC 5: Kiểm chứng Partition Pruning bằng EXPLAIN           ║
-- ║ Cột "partitions" trong kết quả sẽ chỉ hiện 1 partition      ║
-- ║ thay vì tất cả → Chứng minh MySQL đang tối ưu truy vấn.    ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Truy vấn chỉ đọc Quý 2/2026:
EXPLAIN
SELECT * FROM `InventoryTransactions`
WHERE `TransactionDate` >= '2026-04-01'
  AND `TransactionDate` < '2026-07-01';
-- → Kết quả: partitions = p_2026_q2 (chỉ 1 phân vùng)

-- So sánh: Truy vấn không có điều kiện ngày (đọc TẤT CẢ partitions):
EXPLAIN
SELECT * FROM `InventoryTransactions`;
-- → Kết quả: partitions = p_history,p_2026_q1,...,p_future (tất cả)
