-- =========================================================================
-- HTSOFTTECH CNC-ERP - BỘ DỮ LIỆU KIỂM THỬ LUỒNG END-TO-END (TEST DATASET)
-- Kịch bản: Gia công chi tiết "Thân gối đỡ trục Robot CNC-RB01" (100 chiếc)
-- Khách hàng: Công ty CP Chế tạo Robot VinaTech
-- Ngày tạo: 15/10/2026
-- =========================================================================

USE cnc_erp;

-- 1. THIẾT LẬP VẬT TƯ & PHÔI TRONG KHO (MATERIALS)
INSERT INTO materials (code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no)
VALUES 
('PHOI-AL6061-D120', 'Phôi Nhôm A6061-T6 tròn đặc', 'Phôi kim loại', 'Phi 120mm x L3000mm', 'Cây', 35.00, 10.00, 1850000.00, 'Kệ A-05', 'LO-AL-VINA-01'),
('DAO-EM-D10-ROBOT', 'Dao phay ngón hợp kim 4F D10 TiAlN', 'Dao cụ & Phụ tùng', 'D10 x 75L x 4F Kyocera', 'Cái', 12.00, 5.00, 420000.00, 'Tủ dao C1-03', 'DAO-ROBOT-01')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), unit_price = VALUES(unit_price);

-- 2. THIẾT LẬP BÁO GIÁ GIA CÔNG CNC (QUOTATIONS)
INSERT INTO quotations (code, customer_name, customer_phone, part_name, drawing_code, quantity, raw_material_cost, machine_hours, machine_hourly_rate, subcontract_cost, transport_cost, total_amount, status)
VALUES
('BG-2026-TEST01', 'Công ty CP Chế tạo Robot VinaTech', '0938.889.999', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 16500000.00, 65.00, 320000.00, 3500000.00, 800000.00, 41600000.00, 'converted_to_so')
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), status = VALUES(status);

-- 3. THIẾT LẬP ĐƠN ĐẶT HÀNG BÁN HÀNG (SALES ORDERS)
INSERT INTO sales_orders (code, quotation_id, customer_name, part_name, drawing_code, order_qty, machined_qty, delivered_qty, wip_qty, total_price, delivery_deadline, status)
VALUES
('SO-2026-TEST01', LAST_INSERT_ID(), 'Công ty CP Chế tạo Robot VinaTech', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 98, 98, 0, 41600000.00, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'completed')
ON DUPLICATE KEY UPDATE delivered_qty = VALUES(delivered_qty), status = VALUES(status);

-- 4. THIẾT LẬP LỆNH SẢN XUẤT (PRODUCTION ORDERS)
INSERT INTO production_orders (code, so_id, part_name, drawing_code, target_qty, completed_qty, ng_qty, routing, current_step, status, start_date, end_date)
VALUES
('LSX-2026-TEST01', 3, 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 98, 2, '["1. Cắt phôi Amada", "2. Phay CNC Mazak mặt A/B", "3. Tiện CNC Doosan lỗ bạc", "4. Xi mạ Anode đen ngoài", "5. KCS Kiểm tra CMM & Đóng gói"]', 'KCS Kiểm tra CMM & Đóng gói', 'finished', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 DAY))
ON DUPLICATE KEY UPDATE completed_qty = VALUES(completed_qty), status = VALUES(status);

-- 5. THIẾT LẬP LUÂN CHUYỂN BTP & KIỂM TRA PHẾ PHẨM (WIP MOVEMENTS)
INSERT INTO wip_movements (code, production_order_id, from_step, to_step, operator, machine_name, qty_passed, qty_failed, fail_reason)
VALUES
('WIP-2026-TEST01', 3, '1. Cắt phôi Amada', '2. Phay CNC Mazak mặt A/B', 'Nguyễn Văn Tuấn', 'Máy cưa vòng Amada', 100, 0, ''),
('WIP-2026-TEST02', 3, '2. Phay CNC Mazak mặt A/B', '3. Tiện CNC Doosan lỗ bạc', 'Lê Văn Sản Xuất', 'Phay CNC Mazak VCN-530C', 98, 2, 'Lệch tâm phay rãnh then 0.04mm do mòn dao Endmill D10'),
('WIP-2026-TEST03', 3, '3. Tiện CNC Doosan lỗ bạc', '4. Xi mạ Anode đen ngoài', 'Trần Văn Thợ Tiện CNC', 'Tiện CNC Doosan Lynx 2100', 98, 0, '')
ON DUPLICATE KEY UPDATE qty_passed = VALUES(qty_passed);

-- 6. THIẾT LẬP ĐƠN GIA CÔNG NGOÀI (SUBCONTRACTING ORDERS)
INSERT INTO subcontracting_orders (code, production_order_id, vendor_name, process_type, part_name, send_qty, received_qty, qc_passed_qty, unit_cost, total_cost, promise_date, status)
VALUES
('GC-2026-TEST01', 3, 'Xưởng Mạ Anode Kim Phát', 'Xi mạ Anode nhôm đen mờ', 'Thân gối đỡ trục Robot CNC-RB01', 98, 98, 98, 28000.00, 2744000.00, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'completed')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 7. THIẾT LẬP ĐỀ NGHỊ TẠM ỨNG (ADVANCES)
INSERT INTO advances (code, requester, purpose, amount, status, approved_by)
VALUES
('TU-2026-TEST01', 'Lê Văn Sản Xuất (Quản đốc)', 'Tạm ứng thanh toán chi phí Anode xưởng Kim Phát cho đơn Robot VinaTech', 2744000.00, 'approved', 'Nguyễn Văn Quản Trị (Admin)')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 8. THIẾT LẬP ĐỀ NGHỊ THANH TOÁN NCC CẤN TRỪ TẠM ỨNG (PAYMENT REQUESTS)
INSERT INTO payment_requests (code, recipient, category, gross_amount, deduct_advance_amount, net_amount, status, note)
VALUES
('TT-2026-TEST01', 'Xưởng Mạ Anode Kim Phát', 'Gia công ngoài (Subcontracting)', 2744000.00, 2744000.00, 0.00, 'paid', 'Quyết toán chi phí mạ Anode đơn LSX-2026-TEST01 - Cấn trừ 100% vào phiếu tạm ứng TU-2026-TEST01')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 9. THIẾT LẬP PHIẾU XUẤT KHO BÁN HÀNG GIAO CHO KHÁCH (DELIVERY NOTES)
INSERT INTO delivery_notes (code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note)
VALUES
('XK-2026-TEST01', 3, 'Công ty CP Chế tạo Robot VinaTech', 'DWG-ROBOT-RB01-REV2', 98, 'Nguyễn Văn Tuấn (KCS VinaTech)', 'Giao đủ đợt kèm CO/CQ phôi Nhôm A6061 và Bản kiểm tra dung sai 3D máy đo CMM đạt 100%')
ON DUPLICATE KEY UPDATE delivery_qty = VALUES(delivery_qty);

-- 10. THIẾT LẬP SỔ CÔNG NỢ DOANH NGHIỆP (DEBTS)
INSERT INTO debts (partner_name, type, total_amount, paid_amount, remaining_amount, due_date, status)
VALUES
('Công ty CP Chế tạo Robot VinaTech', 'receivable', 41600000.00, 41600000.00, 0.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'paid'),
('Xưởng Mạ Anode Kim Phát', 'payable', 2744000.00, 2744000.00, 0.00, CURDATE(), 'paid')
ON DUPLICATE KEY UPDATE remaining_amount = VALUES(remaining_amount), status = VALUES(status);

-- =========================================================================
-- KẾT QUẢ KỲ VỌNG SAU KHI CHẠY TRỌN VẸN KỊCH BẢN:
-- 1. Doanh thu bán hàng SO: 41,600,000 đ
-- 2. Giá vốn đơn hàng (COGS): 26,044,000 đ (Phôi 16.5M + Giờ máy 6.8M + Anode 2.744M)
-- 3. Lợi nhuận gộp thực tế: 15,556,000 đ (Biên lợi nhuận: 37.4%)
-- 4. Tỷ lệ phế phẩm NG: 2/100 = 2.0% (Đạt tiêu chuẩn < 3.0%)
-- 5. Công nợ & Tạm ứng: Quyết toán sạch sẽ, đã cấn trừ 100% tạm ứng, không còn dư nợ
-- =========================================================================
