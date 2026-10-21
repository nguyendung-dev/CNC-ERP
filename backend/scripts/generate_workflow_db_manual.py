# -*- coding: utf-8 -*-
"""
Script to generate the comprehensive, step-by-step operational and database mutation workflow manual.
Documenting:
- What each feature does in a real precision CNC workshop
- UI operations (Role, screen, buttons, input fields)
- Business workflow transitions
- Exactly how the Database records are created and mutated (table, columns, before/after values, SQL statements)
- Full End-to-End lifecycle from Quotation -> Delivery -> Debt Settlement -> Executive Reports
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_header_footer(doc):
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
        
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("HTSOFTTECH CNC-ERP • HƯỚNG DẪN THAO TÁC LUỒNG NGHIỆP VỤ & BIẾN ĐỔI DATABASE")
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(140, 150, 160)
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài liệu kỹ thuật nội bộ • Cẩm nang vận hành chi tiết & Dữ liệu Database sinh ra từng bước")
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(140, 150, 160)

def create_document():
    doc = Document()
    add_header_footer(doc)

    # Color definitions
    c_blue = RGBColor(30, 64, 175)     # #1E40AF
    c_emerald = RGBColor(16, 185, 129) # #10B981
    c_teal = RGBColor(15, 118, 110)    # #0F766E
    c_amber = RGBColor(217, 119, 6)    # #D97706
    c_slate = RGBColor(15, 23, 42)     # #0F172A
    c_gray = RGBColor(100, 116, 139)   # #64748B

    # Header / Title
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(8)
    p_badge.paragraph_format.space_after = Pt(4)
    rb = p_badge.add_run("HỆ THỐNG QUẢN TRỊ CƠ KHÍ CHÍNH XÁC • HTSOFTTECH CNC-ERP")
    rb.font.bold = True
    rb.font.size = Pt(9.5)
    rb.font.color.rgb = RGBColor(37, 99, 235)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    rt = p_title.add_run("CẨM NANG THAO TÁC LUỒNG NGHIỆP VỤ TỪ ĐẦU ĐẾN CUỐI\n& QUY TRÌNH DỮ LIỆU DATABASE SINH RA TỪNG BƯỚC")
    rt.font.bold = True
    rt.font.size = Pt(17)
    rt.font.color.rgb = c_blue

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(16)
    rsub = p_sub.add_run("Giải thích chi tiết: Chức năng đó làm gì? Thao tác bấm nút nào trên giao diện? Dữ liệu Database sinh ra bảng nào, cột nào thay đổi?")
    rsub.font.size = Pt(10)
    rsub.font.italic = True
    rsub.font.color.rgb = c_gray

    # Intro Callout Box
    tbl_intro = doc.add_table(rows=1, cols=1)
    tbl_intro.alignment = WD_TABLE_ALIGNMENT.CENTER
    icell = tbl_intro.rows[0].cells[0]
    set_cell_background(icell, "F8FAFC")
    set_cell_margins(icell, 140, 140, 180, 180)
    ip = icell.paragraphs[0]
    ir1 = ip.add_run("ĐỐI TƯỢNG VÀ KỊCH BẢN THỰC THI TOÀN BỘ TÀI LIỆU NÀY:\n")
    ir1.font.bold = True
    ir1.font.size = Pt(10)
    ir1.font.color.rgb = c_blue
    ir2 = ip.add_run(
        "Tài liệu này được viết theo dạng Sách hướng dẫn thực chiến (Operational Runbook). "
        "Mỗi bước đều trả lời đủ 4 câu hỏi cốt lõi:\n"
        "1. Chức năng đó là làm cái gì trong thực tế xưởng cơ khí?\n"
        "2. Người dùng thao tác như thế nào trên màn hình giao diện (Ai làm, bấm nút gì, nhập dữ liệu gì)?\n"
        "3. Dòng chảy nghiệp vụ chuyển tiếp đi đâu (Luồng dữ liệu)?\n"
        "4. Dữ liệu Database MySQL sinh ra ra sao (Bảng nào, cột nào được INSERT hoặc UPDATE, giá trị cụ thể)?\n\n"
        "Kịch bản xuyên suốt: Nhận đơn hàng gia công 100 chi tiết \"Thân gối đỡ trục Robot CNC-RB01\" cho khách hàng VinaTech, "
        "trải qua bóc tách giá -> duyệt SO -> xuất phôi -> chạy máy Mazak/Doosan -> phát sinh 2 lỗi NG -> gửi 98 cái đi xi mạ Anode ngoài -> "
        "tạm ứng tiền mặt -> thanh toán cấn trừ 100% tạm ứng -> giao hàng kèm đo CMM -> thu hồi công nợ dứt điểm."
    )
    ir2.font.size = Pt(9.5)
    ir2.font.color.rgb = c_slate

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # =========================================================================
    # THE 14 STEPS WORKFLOW BREAKDOWN
    # =========================================================================
    workflow_steps = [
        {
            "step_num": "BƯỚC 1",
            "title": "THIẾT LẬP KHO VẬT TƯ, ĐỊNH MỨC TỒN AN TOÀN (MIN-STOCK)",
            "purpose": "Quản lý danh mục phôi kim loại (Nhôm, Inox, Thép) và dao cụ CNC (Dao phay Endmill, Mảnh chip tiện). Giúp thủ kho và quản đốc luôn nắm được số lượng tồn thực tế trên giá kệ, cảnh báo tự động khi vật tư chạm ngưỡng tối thiểu để kịp thời đặt hàng, không làm gián đoạn kế hoạch gia công của máy CNC.",
            "ui_actions": [
                ("Người thực hiện", "Thủ kho (Role: warehouse hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Kho vật tư' từ menu bên trái."),
                ("Thao tác 1 (Thêm mới vật tư)", "Bấm nút [+ Thêm vật tư] (màu xanh dương). Điền form: Mã VT: PHOI-AL6061-D120, Tên: Phôi Nhôm A6061-T6 tròn đặc, Phân loại: Phôi kim loại, Quy cách: Phi 120mm x L3000mm, ĐVT: Cây, Số lượng: 35, Tồn tối thiểu: 10, Đơn giá: 1,850,000đ, Vị trí: Kệ A-05, Số lô: LO-AL-VINA-01. Bấm 'Lưu vật tư'."),
                ("Thao tác 2 (Thêm dao cụ)", "Tạo tiếp mã dao: DAO-EM-D10-ROBOT (Dao phay ngón 4F D10 Kyocera, Tủ C1-03, Tồn 12, Tồn tối thiểu: 5, Đơn giá: 420,000đ)."),
                ("Cơ chế cảnh báo", "Nếu số lượng tồn kho <= Tồn tối thiểu, hệ thống tự động gắn nhãn cảnh báo đỏ và đẩy thông báo lên Chuông thông báo xưởng.")
            ],
            "db_impact": {
                "table": "materials",
                "action": "INSERT INTO materials",
                "details": "Sinh ra 2 bản ghi mới trong bảng materials. Trường quantity = 35.00, min_stock = 10.00. Khi quantity > min_stock, API /inventory/materials/alerts/low-stock không báo động.",
                "sql": """INSERT INTO materials (code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no) 
VALUES ('PHOI-AL6061-D120', 'Phôi Nhôm A6061-T6 tròn đặc', 'Phôi kim loại', 'Phi 120mm x L3000mm', 'Cây', 35.00, 10.00, 1850000.00, 'Kệ A-05', 'LO-AL-VINA-01');"""
            }
        },
        {
            "step_num": "BƯỚC 2",
            "title": "BÓC TÁCH BẢN VẼ & LẬP BÁO GIÁ GIA CÔNG CNC (QUOTATION)",
            "purpose": "Nhân viên kinh doanh phối hợp kỹ thuật bóc tách chi tiết bản vẽ khách hàng gửi: tính toán chi phí phôi nguyên liệu, số giờ chạy máy phay/tiện thực tế, chi phí thuê ngoài (xi mạ/nhiệt luyện) và cước vận chuyển để ra được đơn giá chào bán chính xác, đảm bảo biên lợi nhuận mục tiêu.",
            "ui_actions": [
                ("Người thực hiện", "Kinh doanh (Role: sales hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Bán hàng' -> Tab 'Báo giá CNC'."),
                ("Thao tác", "Bấm nút [+ Lập báo giá mới]. Điền form tính toán:\n- Tên khách hàng: Công ty CP Chế tạo Robot VinaTech (SĐT: 0938.889.999)\n- Chi tiết cơ khí: Thân gối đỡ trục Robot CNC-RB01 | Mã bản vẽ: DWG-ROBOT-RB01-REV2\n- Số lượng đặt: 100 cái\n- Tiền phôi dự tính: 16,500,000đ (dùng 10 cây phôi A6061 Phi 120mm)\n- Giờ chạy máy CNC: 65 giờ (Đơn giá giờ máy: 320,000đ/giờ -> Tiền máy = 20,800,000đ)\n- Chi phí gia công ngoài (Anode mạ): 3,500,000đ\n- Chi phí đóng gói, vận chuyển: 800,000đ\n-> Tổng báo giá hệ thống tự động cộng dồn: 41,600,000 VNĐ.\nBấm 'Tạo & Lưu Báo Giá' -> Báo giá xuất hiện ở trạng thái 'Chờ duyệt' (pending).")
            ],
            "db_impact": {
                "table": "quotations",
                "action": "INSERT INTO quotations",
                "details": "Hệ thống tự động sinh mã báo giá BG-2026-TEST01, tính tổng total_amount = 41600000.00, gán trạng thái status = 'pending'. Đồng thời đẩy một thẻ việc cần duyệt lên Dashboard của Admin.",
                "sql": """INSERT INTO quotations (code, customer_name, customer_phone, part_name, drawing_code, quantity, raw_material_cost, machine_hours, machine_hourly_rate, subcontract_cost, transport_cost, total_amount, status)
VALUES ('BG-2026-TEST01', 'Công ty CP Chế tạo Robot VinaTech', '0938.889.999', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 16500000, 65, 320000, 3500000, 800000, 41600000, 'pending');"""
            }
        },
        {
            "step_num": "BƯỚC 3",
            "title": "KHÁCH CHỐT BÁO GIÁ -> CHUYỂN THÀNH ĐƠN ĐẶT HÀNG BÁN HÀNG (SO)",
            "purpose": "Khi khách hàng VinaTech ký hợp đồng hoặc xác nhận PO đặt hàng, hệ thống chuyển báo giá thành Đơn đặt hàng chính thức (Sales Order - SO). Đây là mốc kích hoạt sản xuất, khóa kế hoạch giao hàng và làm căn cứ kế toán theo dõi doanh thu.",
            "ui_actions": [
                ("Người thực hiện", "Kinh doanh (sales) hoặc Quản trị viên (admin)."),
                ("Màn hình", "Vào phân hệ 'Bán hàng' -> Tab 'Báo giá CNC' (hoặc tại thẻ việc trên Trang chủ Dashboard)."),
                ("Thao tác", "Tại dòng báo giá BG-2026-TEST01, bấm nút [Chuyển thành Đơn hàng SO]. Hệ thống xác nhận và tự động tạo đơn SO-2026-TEST01 với đầy đủ số lượng (100 cái), hạn giao hàng (sau 15 ngày), và tổng tiền 41.6 triệu."),
                ("Kết quả trên UI", "Báo giá chuyển nhãn sang 'Đã lên SO' (converted_to_so). Tab 'Đơn hàng SO' tự động tăng số lượng và hiển thị đơn hàng mới.")
            ],
            "db_impact": {
                "table": "quotations (UPDATE) & sales_orders (INSERT)",
                "action": "UPDATE quotations SET status = 'converted_to_so' ; INSERT INTO sales_orders",
                "details": "1) Bảng quotations: Cột status chuyển từ 'pending' sang 'converted_to_so'.\n2) Bảng sales_orders: Sinh dòng mới với code = 'SO-2026-TEST01', quotation_id trỏ về ID báo giá, order_qty = 100, machined_qty = 0, delivered_qty = 0, wip_qty = 100, total_price = 41600000, status = 'in_progress'.",
                "sql": """UPDATE quotations SET status = 'converted_to_so' WHERE code = 'BG-2026-TEST01';
INSERT INTO sales_orders (code, quotation_id, customer_name, part_name, drawing_code, order_qty, machined_qty, delivered_qty, wip_qty, total_price, delivery_deadline, status)
VALUES ('SO-2026-TEST01', 1, 'Công ty CP Chế tạo Robot VinaTech', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 0, 0, 100, 41600000, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'in_progress');"""
            }
        },
        {
            "step_num": "BƯỚC 4",
            "title": "XUẤT PHÔI NGUYÊN LIỆU CHO XƯỞNG SẢN XUẤT",
            "purpose": "Thủ kho căn cứ theo đơn hàng SO tiến hành xuất phôi nguyên liệu từ giá kệ ra khu vực máy cưa để pha phôi chuẩn bị gia công. Số lượng phôi xuất kho được trừ trực tiếp khỏi tồn kho tổng.",
            "ui_actions": [
                ("Người thực hiện", "Thủ kho (Role: warehouse hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Kho vật tư'."),
                ("Thao tác", "Tìm mã phôi 'PHOI-AL6061-D120'. Tại cột Thao tác, bấm nút [Điều chỉnh kho] (icon đổi chiều). Chọn loại điều chỉnh: 'Xuất cho xưởng gia công', nhập số lượng xuất: 10 cây, ghi chú: 'Xuất cắt phôi cho đơn SO-2026-TEST01 chi tiết Gối đỡ Robot VinaTech'. Bấm 'Xác nhận điều chỉnh'."),
                ("Kết quả trên UI", "Số lượng tồn kho của mã PHOI-AL6061-D120 giảm từ 35 cây xuống còn 25 cây. Trạng thái tồn kho vẫn lớn hơn min-stock (10 cây) nên an toàn.")
            ],
            "db_impact": {
                "table": "materials (UPDATE)",
                "action": "UPDATE materials SET quantity = quantity - 10 WHERE code = 'PHOI-AL6061-D120'",
                "details": "Cột quantity của bản ghi vật tư giảm từ 35.00 về 25.00.",
                "sql": """UPDATE materials SET quantity = quantity - 10.00 WHERE code = 'PHOI-AL6061-D120';"""
            }
        },
        {
            "step_num": "BƯỚC 5",
            "title": "LẬP LỆNH SẢN XUẤT XƯỞNG (LSX) & THIẾT LẬP ROUTING CÔNG NGHỆ",
            "purpose": "Quản đốc xưởng căn cứ theo Đơn hàng SO để phát Lệnh sản xuất (LSX). Thiết lập quy trình công nghệ (Routing) gồm chuỗi các bước gia công cơ khí cụ thể, phân công máy móc và đặt mục tiêu số lượng sản phẩm hoàn thành.",
            "ui_actions": [
                ("Người thực hiện", "Sản xuất (Role: production hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Sản xuất' -> Tab 'Lệnh Sản Xuất LSX'."),
                ("Thao tác", "Bấm nút [+ Tạo LSX mới]. Điền thông tin:\n- Liên kết Đơn hàng SO: Chọn SO-2026-TEST01\n- Chi tiết: Thân gối đỡ trục Robot CNC-RB01 | Bản vẽ: DWG-ROBOT-RB01-REV2\n- Số lượng mục tiêu (target_qty): 100 chiếc\n- Quy trình gia công (Routing):\n   + Bước 1: Cắt phôi Amada\n   + Bước 2: Phay CNC Mazak mặt A/B\n   + Bước 3: Tiện CNC Doosan lỗ bạc\n   + Bước 4: Xi mạ Anode đen ngoài\n   + Bước 5: KCS Kiểm tra CMM & Đóng gói\n- Ngày bắt đầu: Hôm nay | Hạn hoàn thành: sau 12 ngày.\nBấm 'Phát Lệnh Sản Xuất'."),
                ("Kết quả trên UI", "Lệnh sản xuất LSX-2026-TEST01 được tạo, công đoạn hiện tại: '1. Cắt phôi Amada', trạng thái: 'Đang chạy' (in_progress).")
            ],
            "db_impact": {
                "table": "production_orders (INSERT)",
                "action": "INSERT INTO production_orders",
                "details": "Tạo bản ghi mới trong production_orders với code = 'LSX-2026-TEST01', so_id = 1, target_qty = 100, completed_qty = 0, ng_qty = 0, routing = JSON string 5 bước, current_step = '1. Cắt phôi Amada', status = 'in_progress'.",
                "sql": """INSERT INTO production_orders (code, so_id, part_name, drawing_code, target_qty, completed_qty, ng_qty, routing, current_step, status, start_date, end_date)
VALUES ('LSX-2026-TEST01', 1, 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 0, 0, 
'["1. Cắt phôi Amada", "2. Phay CNC Mazak mặt A/B", "3. Tiện CNC Doosan lỗ bạc", "4. Xi mạ Anode đen ngoài", "5. KCS Kiểm tra CMM & Đóng gói"]', 
'1. Cắt phôi Amada', 'in_progress', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 DAY));"""
            }
        },
        {
            "step_num": "BƯỚC 6",
            "title": "LUÂN CHUYỂN BÁN THÀNH PHẨM (WIP) & GHI NHẬN PHẾ PHẨM LỖI (NG)",
            "purpose": "Trong sản xuất cơ khí, việc luân chuyển bán thành phẩm giữa các máy phay, máy tiện và kiểm tra chất lượng tại từng công đoạn là cực kỳ sống còn. Bước này ghi nhận số lượng chi tiết đạt chuẩn luân chuyển tiếp, và quan trọng nhất là ghi nhận phế phẩm lỗi NG (kèm nguyên nhân kỹ thuật) để đánh giá tỷ lệ hao hụt xưởng.",
            "ui_actions": [
                ("Người thực hiện", "Tổ trưởng sản xuất / Kỹ thuật viên (production)."),
                ("Màn hình", "Vào phân hệ 'Sản xuất' -> Tab 'Luân Chuyển BTP & NG'."),
                ("Công đoạn 1 (Cưa phôi)", "Bấm [+ Phiếu chuyển công đoạn]. Từ: '1. Cắt phôi Amada' -> Đến: '2. Phay CNC Mazak mặt A/B'. Người làm: Nguyễn Văn Tuấn. Máy: Cưa vòng Amada. Số lượng đạt: 100, Lỗi NG: 0. Bấm Xác nhận."),
                ("Công đoạn 2 (Phay CNC & Phát sinh lỗi NG)", "Bấm [+ Phiếu chuyển công đoạn]. Từ: '2. Phay CNC Mazak mặt A/B' -> Đến: '3. Tiện CNC Doosan lỗ bạc'. Người làm: Lê Văn Sản Xuất. Máy: Phay Mazak VCN-530C. Số lượng đạt: 98 cái; Số lượng lỗi NG: 2 cái; Nguyên nhân lỗi: 'Lệch tâm phay rãnh then 0.04mm do mòn dao Endmill D10'. Bấm Xác nhận."),
                ("Công đoạn 3 (Tiện tinh CNC)", "Bấm [+ Phiếu chuyển công đoạn]. Từ: '3. Tiện CNC Doosan lỗ bạc' -> Đến: '4. Xi mạ Anode đen ngoài'. Máy: Tiện Doosan Lynx 2100. Số lượng đạt: 98 cái, Lỗi NG: 0. Bấm Xác nhận."),
                ("Kết quả trên UI", "Lệnh LSX cập nhật: Số lượng đạt = 98 cái, Phế phẩm NG = 2 cái (Tỷ lệ NG = 2%). Công đoạn hiện tại chuyển sang '4. Xi mạ Anode đen ngoài'.")
            ],
            "db_impact": {
                "table": "wip_movements (INSERT 3 dòng) & production_orders (UPDATE)",
                "action": "INSERT INTO wip_movements (3 records) ; UPDATE production_orders",
                "details": "1) Bảng wip_movements thêm 3 bản ghi: WIP-2026-TEST01 (100 đạt), WIP-2026-TEST02 (98 đạt, 2 lỗi, ghi nhận fail_reason), WIP-2026-TEST03 (98 đạt).\n2) Bảng production_orders: Cập nhật completed_qty = 98, ng_qty = 2, current_step = '4. Xi mạ Anode đen ngoài'.",
                "sql": """INSERT INTO wip_movements (code, production_order_id, from_step, to_step, operator, machine_name, qty_passed, qty_failed, fail_reason) VALUES
('WIP-2026-TEST01', 1, '1. Cắt phôi Amada', '2. Phay CNC Mazak mặt A/B', 'Nguyễn Văn Tuấn', 'Máy cưa vòng Amada', 100, 0, ''),
('WIP-2026-TEST02', 1, '2. Phay CNC Mazak mặt A/B', '3. Tiện CNC Doosan lỗ bạc', 'Lê Văn Sản Xuất', 'Phay CNC Mazak VCN-530C', 98, 2, 'Lệch tâm phay rãnh then 0.04mm do mòn dao Endmill D10'),
('WIP-2026-TEST03', 1, '3. Tiện CNC Doosan lỗ bạc', '4. Xi mạ Anode đen ngoài', 'Trần Văn Thợ Tiện CNC', 'Tiện CNC Doosan Lynx 2100', 98, 0, '');

UPDATE production_orders SET completed_qty = 98, ng_qty = 2, current_step = '4. Xi mạ Anode đen ngoài' WHERE code = 'LSX-2026-TEST01';"""
            }
        },
        {
            "step_num": "BƯỚC 7",
            "title": "GỬI GIA CÔNG NGOÀI (SUBCONTRACTING - XI MẠ ANODE ĐEN)",
            "purpose": "Các công đoạn xưởng cơ khí không tự làm được (như xi mạ bề mặt Anode nhôm, nhiệt luyện tôi thể tích, mạ Crom) sẽ được thuê các xưởng chuyên ngành thực hiện. Bước này quản lý đơn hàng giao hàng ngoài, số lượng gửi đi, giá thành gia công và hạn cam kết giao trả hàng.",
            "ui_actions": [
                ("Người thực hiện", "Quản đốc xưởng (production hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Sản xuất' -> Tab 'Gia Công Ngoài'."),
                ("Thao tác", "Bấm nút [+ Gửi gia công ngoài]. Điền thông tin:\n- Liên kết LSX: Chọn LSX-2026-TEST01\n- Xưởng gia công đối tác: Xưởng Mạ Anode Kim Phát\n- Loại gia công: Xi mạ Anode nhôm đen mờ\n- Số lượng gửi đi (send_qty): 98 chiếc (toàn bộ số hàng đạt chuẩn sau bước tiện)\n- Đơn giá mạ: 28,000 VNĐ / chiếc\n-> Tổng chi phí gia công ngoài: 98 x 28,000 = 2,744,000 VNĐ.\n- Ngày hẹn giao trả: sau 3 ngày.\nBấm 'Gửi Gia Công Ngoài'."),
                ("Kết quả trên UI", "Đơn gia công GC-2026-TEST01 hiển thị ở trạng thái 'Đang gia công' (sent).")
            ],
            "db_impact": {
                "table": "subcontracting_orders (INSERT)",
                "action": "INSERT INTO subcontracting_orders",
                "details": "Tạo bản ghi mới trong subcontracting_orders với code = 'GC-2026-TEST01', vendor_name = 'Xưởng Mạ Anode Kim Phát', process_type = 'Xi mạ Anode nhôm đen mờ', send_qty = 98, unit_cost = 28000, total_cost = 2744000, status = 'sent'.",
                "sql": """INSERT INTO subcontracting_orders (code, production_order_id, vendor_name, process_type, part_name, send_qty, received_qty, qc_passed_qty, unit_cost, total_cost, promise_date, status)
VALUES ('GC-2026-TEST01', 1, 'Xưởng Mạ Anode Kim Phát', 'Xi mạ Anode nhôm đen mờ', 'Thân gối đỡ trục Robot CNC-RB01', 98, 0, 0, 28000, 2744000, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'sent');"""
            }
        },
        {
            "step_num": "BƯỚC 8",
            "title": "LẬP ĐỀ NGHỊ TẠM ỨNG TIỀN MẶT ĐẶT CỌC GIA CÔNG NGOÀI",
            "purpose": "Trong sản xuất cơ khí thực tế, xưởng gia công ngoài thường yêu cầu đặt cọc tiền mặt hoặc trả tiền tươi ngay khi nhận hàng. Quản đốc xưởng cần lập phiếu Đề nghị tạm ứng tiền mặt từ quỹ công ty để giải quyết khẩn cấp chi phí mạ Anode.",
            "ui_actions": [
                ("Người thực hiện", "Quản đốc xưởng / Kỹ thuật viên (production)."),
                ("Màn hình", "Vào phân hệ 'Tài chính' -> Tab 'Đề Nghị Tạm Ứng'."),
                ("Thao tác", "Bấm nút [+ Tạo phiếu tạm ứng]. Điền form:\n- Người đề nghị: Lê Văn Sản Xuất (Quản đốc xưởng)\n- Mục đích tạm ứng: Tạm ứng thanh toán chi phí Anode xưởng Kim Phát cho đơn Robot VinaTech\n- Số tiền đề nghị: 2,744,000 VNĐ.\nBấm 'Gửi Đề Nghị Tạm Ứng'."),
                ("Kết quả trên UI", "Phiếu TU-2026-TEST01 được tạo ở trạng thái 'Chờ duyệt' (pending). Thẻ việc cần duyệt lập tức bắn về màn hình Trang chủ của Admin.")
            ],
            "db_impact": {
                "table": "advances (INSERT)",
                "action": "INSERT INTO advances",
                "details": "Bảng advances sinh bản ghi mới: code = 'TU-2026-TEST01', requester = 'Lê Văn Sản Xuất (Quản đốc)', purpose = '...', amount = 2744000.00, status = 'pending'.",
                "sql": """INSERT INTO advances (code, requester, purpose, amount, status)
VALUES ('TU-2026-TEST01', 'Lê Văn Sản Xuất (Quản đốc)', 'Tạm ứng thanh toán chi phí Anode xưởng Kim Phát cho đơn Robot VinaTech', 2744000, 'pending');"""
            }
        },
        {
            "step_num": "BƯỚC 9",
            "title": "BAN GIÁM ĐỐC / ADMIN PHÊ DUYỆT TẠM ỨNG",
            "purpose": "Kiểm soát dòng tiền công ty: Giám đốc hoặc Admin xem xét lý do chi tiêu và số tiền tạm ứng so với tiến độ đơn hàng để bấm phê duyệt, cho phép thủ quỹ xuất tiền mặt.",
            "ui_actions": [
                ("Người thực hiện", "Quản trị viên (Role: admin)."),
                ("Màn hình", "Vào 'Trang chủ' (Dashboard) -> Mục 'Việc cần xử lý & phê duyệt' (hoặc Tab 'Đề Nghị Tạm Ứng' ở phân hệ Tài chính)."),
                ("Thao tác", "Tại thẻ việc của Lê Văn Sản Xuất đề nghị 2,744,000đ, bấm nút [✓ Duyệt]."),
                ("Kết quả trên UI", "Thẻ việc biến mất khỏi danh sách chờ. Phiếu tạm ứng trong phân hệ Tài chính chuyển sang trạng thái 'Đã duyệt' (approved), người duyệt ghi nhận: 'Nguyễn Văn Quản Trị (Admin)'.")
            ],
            "db_impact": {
                "table": "advances (UPDATE)",
                "action": "UPDATE advances SET status = 'approved', approved_by = 'Nguyễn Văn Quản Trị (Admin)' WHERE code = 'TU-2026-TEST01'",
                "details": "Trường status chuyển từ 'pending' sang 'approved', approved_by được ghi nhận.",
                "sql": """UPDATE advances SET status = 'approved', approved_by = 'Nguyễn Văn Quản Trị (Admin)' WHERE code = 'TU-2026-TEST01';"""
            }
        },
        {
            "step_num": "BƯỚC 10",
            "title": "NHẬN HÀNG GIA CÔNG NGOÀI & KCS KIỂM TRA CHẤT LƯỢNG",
            "purpose": "Khi xưởng mạ Kim Phát giao trả 98 chi tiết sau khi Anode, bộ phận KCS kiểm tra ngoại quan (màu đen mờ đồng nhất, không xước, không rỗ bề mặt, chiều dày lớp mạ đạt 15-20 micron). Sau đó hoàn tất đơn gia công ngoài và kết thúc Lệnh sản xuất LSX.",
            "ui_actions": [
                ("Người thực hiện", "KCS / Quản đốc (production)."),
                ("Màn hình", "Vào phân hệ 'Sản xuất' -> Tab 'Gia Công Ngoài'."),
                ("Thao tác", "Tại dòng đơn GC-2026-TEST01, bấm [Nghiệm thu hàng về]. Xác nhận số lượng nhận: 98 cái, Số lượng đạt KCS: 98 cái, Đánh giá: Đạt yêu cầu kỹ thuật. Bấm Lưu."),
                ("Đồng thời", "Vào Tab 'Lệnh Sản Xuất LSX' -> bấm [Hoàn thành LSX]. LSX-2026-TEST01 chuyển trạng thái sang 'Đã hoàn thành' (finished). Đơn hàng SO cập nhật sản lượng đã gia công (machined_qty = 98).")
            ],
            "db_impact": {
                "table": "subcontracting_orders (UPDATE) & production_orders (UPDATE) & sales_orders (UPDATE)",
                "action": "UPDATE subcontracting_orders ; UPDATE production_orders ; UPDATE sales_orders",
                "details": "1) subcontracting_orders: received_qty = 98, qc_passed_qty = 98, status = 'completed'.\n2) production_orders: current_step = '5. KCS Kiểm tra CMM & Đóng gói', status = 'finished'.\n3) sales_orders: machined_qty = 98, wip_qty = 0.",
                "sql": """UPDATE subcontracting_orders SET received_qty = 98, qc_passed_qty = 98, status = 'completed' WHERE code = 'GC-2026-TEST01';
UPDATE production_orders SET current_step = '5. KCS Kiểm tra CMM & Đóng gói', status = 'finished' WHERE code = 'LSX-2026-TEST01';
UPDATE sales_orders SET machined_qty = 98, wip_qty = 0 WHERE code = 'SO-2026-TEST01';"""
            }
        },
        {
            "step_num": "BƯỚC 11",
            "title": "LẬP ĐỀ NGHỊ THANH TOÁN NCC CẤN TRỪ 100% TIỀN TẠM ỨNG",
            "purpose": "Đây là nghiệp vụ kế toán cực kỳ tinh gọn của hệ thống: Khi quyết toán tiền gia công cho Xưởng mạ Kim Phát (2,744,000đ), kế toán lập phiếu thanh toán có chọn CẤN TRỪ khoản tạm ứng đã chi ở Bước 8. Số tiền thực tế cần chi chuyển khoản bằng 0đ, giúp dòng tiền không bị xuất trùng và sổ sách tất toán minh bạch.",
            "ui_actions": [
                ("Người thực hiện", "Kế toán (Role: accountant hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Tài chính' -> Tab 'Đề Nghị Thanh Toán'."),
                ("Thao tác", "Bấm nút [+ Lập phiếu thanh toán]. Điền form:\n- Đơn vị thụ hưởng: Xưởng Mạ Anode Kim Phát\n- Hạng mục chi: Gia công ngoài (Subcontracting)\n- Tổng số tiền hóa đơn (gross_amount): 2,744,000 VNĐ\n- Số tiền cấn trừ tạm ứng (deduct_advance_amount): 2,744,000 VNĐ (chọn phiếu TU-2026-TEST01)\n-> Số tiền thực chi chuyển khoản (net_amount): 2,744,000 - 2,744,000 = 0 VNĐ.\n- Ghi chú: 'Quyết toán chi phí mạ Anode đơn LSX-2026-TEST01 - Cấn trừ 100% vào phiếu tạm ứng TU-2026-TEST01'.\nBấm 'Tạo & Duyệt Thanh Toán'."),
                ("Kết quả trên UI", "Phiếu TT-2026-TEST01 được lưu ở trạng thái 'Đã thanh toán' (paid).")
            ],
            "db_impact": {
                "table": "payment_requests (INSERT)",
                "action": "INSERT INTO payment_requests",
                "details": "Tạo bản ghi mới trong payment_requests: code = 'TT-2026-TEST01', gross_amount = 2744000.00, deduct_advance_amount = 2744000.00, net_amount = 0.00, status = 'paid'.",
                "sql": """INSERT INTO payment_requests (code, recipient, category, gross_amount, deduct_advance_amount, net_amount, status, note)
VALUES ('TT-2026-TEST01', 'Xưởng Mạ Anode Kim Phát', 'Gia công ngoài (Subcontracting)', 2744000, 2744000, 0, 'paid', 
'Quyết toán chi phí mạ Anode đơn LSX-2026-TEST01 - Cấn trừ 100% vào phiếu tạm ứng TU-2026-TEST01');"""
            }
        },
        {
            "step_num": "BƯỚC 12",
            "title": "XUẤT KHO BÁN HÀNG BÀN GIAO CHO KHÁCH & NGHIỆM THU CMM",
            "purpose": "Kho đóng gói 98 chi tiết cùng hồ sơ chất lượng (Chứng chỉ CO/CQ phôi Nhôm A6061, Biên bản kiểm tra kích thước 3D trên máy đo tọa độ CMM). Xuất Phiếu xuất kho bán hàng (Delivery Note) bàn giao cho đại diện khách hàng VinaTech.",
            "ui_actions": [
                ("Người thực hiện", "Kinh doanh (sales) hoặc Thủ kho (warehouse)."),
                ("Màn hình", "Vào phân hệ 'Bán hàng' -> Tab 'Phiếu Giao Hàng' (hoặc tại dòng đơn hàng SO bấm 'Tạo phiếu giao hàng')."),
                ("Thao tác", "Bấm nút [+ Tạo phiếu giao hàng]. Điền form:\n- Đơn hàng liên kết: SO-2026-TEST01\n- Khách hàng: Công ty CP Chế tạo Robot VinaTech | Bản vẽ: DWG-ROBOT-RB01-REV2\n- Số lượng bàn giao đợt này: 98 chiếc\n- Người đại diện nhận hàng: Nguyễn Văn Tuấn (KCS VinaTech)\n- Ghi chú: 'Giao đủ đợt kèm CO/CQ phôi Nhôm A6061 và Bản kiểm tra dung sai 3D máy đo CMM đạt 100%'.\nBấm 'Lưu Phiếu Giao Hàng'."),
                ("Kết quả trên UI", "Đơn hàng SO-2026-TEST01 cập nhật: Đã giao = 98 chiếc, chuyển trạng thái sang 'Hoàn thành' (completed). Phiếu XK-2026-TEST01 được lưu trữ trên bảng theo dõi.")
            ],
            "db_impact": {
                "table": "delivery_notes (INSERT) & sales_orders (UPDATE)",
                "action": "INSERT INTO delivery_notes ; UPDATE sales_orders",
                "details": "1) Bảng delivery_notes thêm dòng mới: code = 'XK-2026-TEST01', so_id = 1, delivery_qty = 98.\n2) Bảng sales_orders: Cập nhật delivered_qty = 98, status = 'completed'.",
                "sql": """INSERT INTO delivery_notes (code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note)
VALUES ('XK-2026-TEST01', 1, 'Công ty CP Chế tạo Robot VinaTech', 'DWG-ROBOT-RB01-REV2', 98, 'Nguyễn Văn Tuấn (KCS VinaTech)', 
'Giao đủ đợt kèm CO/CQ phôi Nhôm A6061 và Bản kiểm tra dung sai 3D máy đo CMM đạt 100%');

UPDATE sales_orders SET delivered_qty = 98, status = 'completed' WHERE code = 'SO-2026-TEST01';"""
            }
        },
        {
            "step_num": "BƯỚC 13",
            "title": "GHI SỔ CÔNG NỢ & TẤT TOÁN DÒNG TIỀN DOANH NGHIỆP",
            "purpose": "Kế toán ghi nhận khoản Phải thu từ khách hàng VinaTech (41,600,000đ). Khi khách hàng thanh toán chuyển khoản đủ 100% giá trị hợp đồng, kế toán cập nhật đã thu và đóng hồ sơ công nợ về số dư 0đ.",
            "ui_actions": [
                ("Người thực hiện", "Kế toán (Role: accountant hoặc admin)."),
                ("Màn hình", "Vào phân hệ 'Tài chính' -> Tab 'Sổ Quản Lý Công Nợ'."),
                ("Thao tác 1 (Ghi nhận nợ)", "Khoản công nợ phải thu (receivable) của VinaTech: Tổng nợ: 41,600,000 VNĐ."),
                ("Thao tác 2 (Thu tiền & Tất toán)", "Khi nhận sao kê ngân hàng VinaTech chuyển khoản 41,600,000đ, bấm [Thanh toán nợ]. Nhập số tiền thu: 41,600,000đ. Hệ thống cập nhật: Đã trả = 41,600,000đ, Còn lại = 0đ, Trạng thái = 'Đã thanh toán' (paid)."),
                ("Tương tự với nhà cung cấp", "Khoản phải trả Xưởng Anode Kim Phát (2,744,000đ) cũng được cập nhật trạng thái 'paid' (do đã cấn trừ tạm ứng ở Bước 11).")
            ],
            "db_impact": {
                "table": "debts (INSERT / UPDATE)",
                "action": "INSERT INTO debts ... ON DUPLICATE KEY UPDATE",
                "details": "Bảng debts lưu 2 bản ghi: 1 khoản Phải thu VinaTech (total = 41.6M, paid = 41.6M, remaining = 0, status = 'paid'); 1 khoản Phải trả Kim Phát (total = 2.744M, paid = 2.744M, remaining = 0, status = 'paid').",
                "sql": """INSERT INTO debts (partner_name, type, total_amount, paid_amount, remaining_amount, due_date, status) VALUES
('Công ty CP Chế tạo Robot VinaTech', 'receivable', 41600000.00, 41600000.00, 0.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'paid'),
('Xưởng Mạ Anode Kim Phát', 'payable', 2744000.00, 2744000.00, 0.00, CURDATE(), 'paid');"""
            }
        },
        {
            "step_num": "BƯỚC 14",
            "title": "BÁO CÁO PHÂN TÍCH QUẢN TRỊ & XUẤT BÁO CÁO EXCEL (KPI)",
            "purpose": "Tổng hợp tự động toàn bộ dữ liệu đơn hàng, sản xuất, phế phẩm, giá vốn và tài chính từ các bảng MySQL lên Dashboard thời gian thực, phục vụ Ban giám đốc ra quyết định và xuất file Excel lưu trữ nghiệm thu.",
            "ui_actions": [
                ("Người thực hiện", "Ban giám đốc, Kế toán trưởng, Quản trị viên (admin)."),
                ("Màn hình", "Vào phân hệ 'Báo cáo'."),
                ("Xem số liệu KPI tự động", "- Tổng doanh thu đơn hàng SO: 41.6 triệu VNĐ (1 đơn)\n- Số chi tiết đã giao: 98 / 100 chiếc (tỷ lệ giao hàng: 98%)\n- Tỷ lệ phế phẩm lỗi NG: 2.0% (2 chiếc lỗi phay rãnh then)\n- Chi phí gia công ngoài Anode: 2.744 triệu VNĐ\n- Công nợ phải thu / phải trả: Đều đã thu hồi và thanh toán 100% (Dư nợ = 0 VNĐ)\n- Lợi nhuận gộp ước tính: 15,556,000 VNĐ (Biên lợi nhuận: 37.4%)."),
                ("Thao tác xuất file", "Bấm nút lớn [📥 Xuất Báo Cáo Excel Quản Trị (XLSX)]. Trình duyệt lập tức tải về file Bao_Cao_Tong_Quan_CNC_ERP_2026-10-16.xlsx với đầy đủ các chỉ số thống kê.")
            ],
            "db_impact": {
                "table": "TỔNG HỢP TRỰC TIẾP TỪ TẤT CẢ CÁC BẢNG (READ-ONLY)",
                "action": "API GET /api/reports/dashboard",
                "details": "Backend truy vấn song song các bảng sales_orders, production_orders, wip_movements, subcontracting_orders, materials, debts để tính toán các chỉ số thống kê thời gian thực mà không làm chậm hệ thống.",
                "sql": """-- Truy vấn tổng hợp doanh thu và số lượng giao
SELECT SUM(total_price) as total_order_value, SUM(delivered_qty) as total_delivered, SUM(order_qty) as total_target FROM sales_orders;

-- Truy vấn tỷ lệ lỗi NG toàn xưởng
SELECT SUM(ng_qty) as total_ng, SUM(target_qty) as total_target, (SUM(ng_qty)*100.0/SUM(target_qty)) as ng_rate FROM production_orders;"""
            }
        }
    ]

    for step in workflow_steps:
        # Step header box
        t_box = doc.add_table(rows=1, cols=1)
        t_box.alignment = WD_TABLE_ALIGNMENT.CENTER
        bcell = t_box.rows[0].cells[0]
        set_cell_background(bcell, "1E3A8A") # Navy
        set_cell_margins(bcell, 100, 100, 140, 140)
        bp = bcell.paragraphs[0]
        bp_run1 = bp.add_run(f"[{step['step_num']}] ")
        bp_run1.font.bold = True
        bp_run1.font.size = Pt(11)
        bp_run1.font.color.rgb = RGBColor(250, 204, 21) # Amber
        bp_run2 = bp.add_run(step['title'])
        bp_run2.font.bold = True
        bp_run2.font.size = Pt(11)
        bp_run2.font.color.rgb = RGBColor(255, 255, 255)

        # 1. Chức năng đó là làm gì
        p_pur = doc.add_paragraph()
        p_pur.paragraph_format.space_before = Pt(8)
        p_pur.paragraph_format.space_after = Pt(4)
        r_ph = p_pur.add_run("1. Ý Nghĩa & Chức Năng Nghiệp Vụ Tại Xưởng CNC:\n")
        r_ph.font.bold = True
        r_ph.font.size = Pt(9.5)
        r_ph.font.color.rgb = c_teal
        r_pb = p_pur.add_run(step['purpose'])
        r_pb.font.size = Pt(9)
        r_pb.font.color.rgb = c_slate

        # 2. Thao tác trên giao diện
        p_ui = doc.add_paragraph()
        p_ui.paragraph_format.space_before = Pt(4)
        p_ui.paragraph_format.space_after = Pt(2)
        r_uh = p_ui.add_run("2. Thao Tác Chi Tiết Trên Màn Hình Giao Diện (UI Action):")
        r_uh.font.bold = True
        r_uh.font.size = Pt(9.5)
        r_uh.font.color.rgb = c_blue

        for label, desc in step['ui_actions']:
            lp = doc.add_paragraph(style='List Bullet')
            lp.paragraph_format.space_after = Pt(2)
            lr1 = lp.add_run(f"{label}: ")
            lr1.font.bold = True
            lr1.font.size = Pt(8.5)
            lr1.font.color.rgb = c_slate
            lr2 = lp.add_run(desc)
            lr2.font.size = Pt(8.5)
            lr2.font.color.rgb = c_slate

        # 3. Dữ liệu Database sinh ra & câu lệnh SQL
        p_db = doc.add_paragraph()
        p_db.paragraph_format.space_before = Pt(4)
        p_db.paragraph_format.space_after = Pt(2)
        r_dh = p_db.add_run("3. Dữ Liệu Database MySQL Sinh Ra & Biến Đổi:")
        r_dh.font.bold = True
        r_dh.font.size = Pt(9.5)
        r_dh.font.color.rgb = RGBColor(180, 83, 9) # Amber-700

        # Table showing DB changes
        tbl_db_box = doc.add_table(rows=2, cols=2)
        tbl_db_box.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        c00 = tbl_db_box.rows[0].cells[0]
        c01 = tbl_db_box.rows[0].cells[1]
        c10 = tbl_db_box.rows[1].cells[0]
        c11 = tbl_db_box.rows[1].cells[1]

        c00.text = "Bảng Tác Động & Hành Động"
        c01.text = "Chi Tiết Cột & Dữ Liệu Thay Đổi"
        set_cell_background(c00, "F1F5F9")
        set_cell_background(c01, "F1F5F9")
        set_cell_margins(c00, 60, 60, 80, 80)
        set_cell_margins(c01, 60, 60, 80, 80)
        c00.paragraphs[0].runs[0].font.bold = True
        c00.paragraphs[0].runs[0].font.size = Pt(8.5)
        c01.paragraphs[0].runs[0].font.bold = True
        c01.paragraphs[0].runs[0].font.size = Pt(8.5)

        c10.text = f"{step['db_impact']['table']}\n({step['db_impact']['action']})"
        c11.text = step['db_impact']['details']
        set_cell_background(c10, "FFFFFF")
        set_cell_background(c11, "FFFFFF")
        set_cell_margins(c10, 60, 60, 80, 80)
        set_cell_margins(c11, 60, 60, 80, 80)
        c10.paragraphs[0].runs[0].font.size = Pt(8.5)
        c10.paragraphs[0].runs[0].font.bold = True
        c10.paragraphs[0].runs[0].font.color.rgb = c_blue
        c11.paragraphs[0].runs[0].font.size = Pt(8.5)

        # SQL box
        p_sql_hdr = doc.add_paragraph()
        p_sql_hdr.paragraph_format.space_before = Pt(4)
        p_sql_hdr.paragraph_format.space_after = Pt(2)
        r_shdr = p_sql_hdr.add_run("Mã lệnh SQL thực thi trực tiếp:")
        r_shdr.font.italic = True
        r_shdr.font.size = Pt(8.5)
        r_shdr.font.color.rgb = c_gray

        tbl_sql = doc.add_table(rows=1, cols=1)
        tbl_sql.alignment = WD_TABLE_ALIGNMENT.CENTER
        sql_cell = tbl_sql.rows[0].cells[0]
        set_cell_background(sql_cell, "0F172A") # Slate-900
        set_cell_margins(sql_cell, 80, 80, 100, 100)
        sql_p = sql_cell.paragraphs[0]
        sql_run = sql_p.add_run(step['db_impact']['sql'])
        sql_run.font.name = "Consolas"
        sql_run.font.size = Pt(7.5)
        sql_run.font.color.rgb = RGBColor(226, 232, 240)

        doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # =========================================================================
    # SUMMARY CHECKLIST MATRIX
    # =========================================================================
    h_chk = doc.add_heading("BẢNG TỔNG HỢP KIỂM THỬ TỪNG PHÂN HỆ (CRUD MATRIX)", level=1)
    h_chk.paragraph_format.space_before = Pt(16)
    h_chk.paragraph_format.space_after = Pt(8)

    tbl_matrix = doc.add_table(rows=1, cols=5)
    tbl_matrix.alignment = WD_TABLE_ALIGNMENT.CENTER
    mhdr = tbl_matrix.rows[0].cells
    mhdr[0].text = "Phân Hệ (Module)"
    mhdr[1].text = "Thêm (Create)"
    mhdr[2].text = "Xem / Lọc (Read)"
    mhdr[3].text = "Sửa / Chuyển (Update)"
    mhdr[4].text = "Xóa (Delete)"
    for cell in mhdr:
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 80, 80, 100, 100)
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        p.runs[0].font.size = Pt(9)

    matrix_data = [
        ("Tài Khoản & RBAC", "Form tạo tài khoản mới", "Xem danh sách, phân trang 5/trang", "Sửa họ tên, đổi quyền Role", "Xóa tài khoản (chặn tự xóa)"),
        ("Kho Vật Tư (Inventory)", "Modal thêm phôi, dao cụ", "Lọc loại vật tư, lọc mã thiếu min-stock", "Sửa thông tin, điều chỉnh tồn kho In/Out", "Xóa mã vật tư"),
        ("Bán Hàng (Sales)", "Lập báo giá CNC mới", "Báo giá, Đơn hàng SO, Phiếu giao hàng", "Duyệt báo giá -> Chuyển thành Đơn SO", "Xóa Báo giá, xóa SO, xóa Phiếu giao"),
        ("Sản Xuất (Production)", "Tạo LSX, chuyển WIP, gửi gia công ngoài", "Xem tiến độ LSX, tỷ lệ NG, đơn ngoài", "Nghiệm thu gia công ngoài, hoàn thành LSX", "Xóa LSX, xóa phiếu WIP, xóa đơn ngoài"),
        ("Tài Chính (Finance)", "Tạo tạm ứng, lập thanh toán, tạo công nợ", "Xem tạm ứng, đề nghị thanh toán, sổ nợ", "Duyệt tạm ứng, thanh toán cấn trừ, trả nợ", "Xóa tạm ứng, xóa thanh toán, xóa nợ"),
        ("Báo Cáo (Reports)", "N/A (Tự động tổng hợp)", "Xem KPI Doanh số, Sản lượng, Tỷ lệ NG", "Cập nhật dữ liệu thời gian thực MySQL", "N/A | Nút Xuất Excel XLSX")
    ]

    for idx, (mname, mc, mr, mu, md) in enumerate(matrix_data):
        row = tbl_matrix.add_row().cells
        bg_col = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([mname, mc, mr, mu, md]):
            row[i].text = val
            set_cell_background(row[i], bg_col)
            set_cell_margins(row[i], 60, 60, 80, 80)
            p = row[i].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(8.5)
                if i == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = c_blue

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # Save to disk
    out_file = r"e:\Smedia\CNC-ERP\CNC-ERP\CNC_ERP_Cam_Nang_Thao_Tac_Luong_Va_Bien_Doi_Database.docx"
    doc.save(out_file)
    print(f"Workflow & Database Manual successfully generated at: {out_file}")

if __name__ == "__main__":
    create_document()
