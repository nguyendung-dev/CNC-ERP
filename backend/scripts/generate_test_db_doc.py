# -*- coding: utf-8 -*-
"""
Script to generate a comprehensive Word (.docx) document containing:
- Complete CNC-ERP Test Database
- Full End-to-End Workflow & Business Test Cases
- Detailed Data Dictionary (Schemas & Columns)
- Production & Finance Cost Breakdown
- Full SQL Scripts for direct execution in MySQL
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding."""
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
        hrun = hp.add_run("HTSOFTTECH CNC-ERP • BỘ DỮ LIỆU KIỂM THỬ END-TO-END (TEST DATASET)")
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(140, 150, 160)
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài liệu kỹ thuật nội bộ • Kiểm thử luồng nghiệp vụ xưởng gia công cơ khí chính xác")
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(140, 150, 160)

def create_document():
    doc = Document()
    add_header_footer(doc)

    # Palette
    c_primary = RGBColor(30, 64, 175)    # Blue-800
    c_secondary = RGBColor(15, 118, 110) # Teal-700
    c_dark = RGBColor(15, 23, 42)        # Slate-900
    c_muted = RGBColor(100, 116, 139)    # Slate-500

    # ==========================================
    # 1. TITLE / COVER SECTION
    # ==========================================
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(10)
    p_badge.paragraph_format.space_after = Pt(4)
    run_badge = p_badge.add_run("TÀI LIỆU KỸ THUẬT & CƠ SỞ DỮ LIỆU MẪU KIỂM THỬ (TEST DATASET)")
    run_badge.font.size = Pt(9.5)
    run_badge.font.bold = True
    run_badge.font.color.rgb = RGBColor(37, 99, 235)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.add_run("HỆ THỐNG ERP QUẢN TRỊ DOANH NGHIỆP CƠ KHÍ CHẾ TẠO CNC\nBỘ CƠ SỞ DỮ LIỆU KIỂM THỬ FULL LUỒNG & CHỨC NĂNG")
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = c_primary

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(20)
    run_meta = p_meta.add_run("Phiên bản: 2.5 • Chuẩn cơ sở dữ liệu: MySQL 8.0+ • Trạng thái: Sẵn sàng thực thi\nPhạm vi: Bán hàng (Sales) -> Kho phôi (Inventory) -> Sản xuất (Production) -> Tài chính - Kế toán (Finance) -> Báo cáo điều hành")
    run_meta.font.size = Pt(10)
    run_meta.font.italic = True
    run_meta.font.color.rgb = c_muted

    # Callout Box (Summary)
    table_callout = doc.add_table(rows=1, cols=1)
    table_callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = table_callout.rows[0].cells[0]
    set_cell_background(c, "F0FDF4") # Emerald-50
    set_cell_margins(c, top=140, bottom=140, left=180, right=180)
    cp = c.paragraphs[0]
    cp.paragraph_format.space_after = Pt(4)
    crun_bold = cp.add_run("MỤC ĐÍCH & Ý NGHĨA BỘ DỮ LIỆU KIỂM THỬ (TEST DATASET):\n")
    crun_bold.font.bold = True
    crun_bold.font.size = Pt(10)
    crun_bold.font.color.rgb = RGBColor(21, 128, 61)
    crun_text = cp.add_run(
        "Bộ dữ liệu này được thiết kế dựa trên kịch bản thực tế 100% của một xưởng gia công cơ khí chính xác CNC: "
        "Nhận đơn hàng gia công 100 chi tiết Thân gối đỡ trục Robot CNC-RB01 cho khách hàng VinaTech. "
        "Bộ dữ liệu liên kết mạch lạc giữa 10 bảng dữ liệu cốt lõi, phản ánh đầy đủ: kiểm tra min-stock kho phôi, "
        "lập báo giá bóc tách giờ máy, phát lệnh sản xuất (LSX), luân chuyển công đoạn qua máy Phay Mazak & Tiện Doosan, "
        "ghi nhận 2 sản phẩm lỗi NG (2%), gửi 98 chi tiết đi xi mạ Anode ngoài, lập phiếu tạm ứng tiền mặt, "
        "thanh toán cấn trừ 100% tạm ứng, xuất kho giao hàng KCS/CMM và tất toán sổ công nợ."
    )
    crun_text.font.size = Pt(9.5)
    crun_text.font.color.rgb = RGBColor(22, 101, 52)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ==========================================
    # 2. CẤU TRÚC 10 BẢNG DỮ LIỆU CỐT LÕI (SCHEMA)
    # ==========================================
    h1 = doc.add_heading("1. Cấu Trúc Cơ Sở Dữ Liệu & Từ Điển Dữ Liệu (10 Bảng)", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(8)

    tables_info = [
        ("1. users", "Tài khoản nhân sự & Phân quyền vai trò RBAC (admin, sales, production, warehouse, accountant). Mật khẩu mã hóa bcrypt."),
        ("2. materials", "Quản lý tồn kho phôi nhôm/thép, dao cụ Endmill/Chip tiện, vật tư phụ, vị trí giá kệ, mã lô và định mức an toàn (min_stock)."),
        ("3. quotations", "Báo giá chi tiết cơ khí: bóc tách chi phí phôi, số giờ chạy máy CNC, đơn giá giờ máy, chi phí gia công ngoài, cước vận chuyển."),
        ("4. sales_orders", "Đơn đặt hàng bán hàng (SO): theo dõi tiến độ gia công (machined_qty), số lượng đã giao (delivered_qty), hàng dở dang (wip_qty)."),
        ("5. production_orders", "Lệnh sản xuất xưởng (LSX): quy trình công nghệ (routing JSON), máy điều độ, số lượng đạt (completed_qty), phế phẩm (ng_qty)."),
        ("6. wip_movements", "Theo dõi luân chuyển bán thành phẩm giữa các máy, tên thợ máy vận hành, số lượng đạt/hỏng và nguyên nhân lỗi sai số chi tiết."),
        ("7. subcontracting_orders", "Đơn hàng gia công ngoài: xi mạ Anode, nhiệt luyện tôi cao tần, xưởng đối tác, đơn giá, ngày hẹn trả và kết quả KCS nhận về."),
        ("8. advances", "Đề nghị tạm ứng tiền mặt: quản đốc/thợ xưởng tạm ứng tiền mua phôi gấp hoặc trả trước xưởng mạ ngoài, người duyệt và trạng thái."),
        ("9. payment_requests", "Đề nghị thanh toán nhà cung cấp: tổng tiền hóa đơn, số tiền cấn trừ tạm ứng đã giải ngân trước đó, số tiền thực chi (net_amount)."),
        ("10. debts", "Sổ theo dõi công nợ: phân loại Phải thu khách hàng (receivable) và Phải trả nhà cung cấp/xưởng gia công ngoài (payable)."),
        ("11. delivery_notes", "Phiếu xuất kho bán hàng giao cho khách: liên kết SO, mã bản vẽ, số lượng bàn giao, người đại diện nhận hàng và ghi chú KCS.")
    ]

    table_schema = doc.add_table(rows=1, cols=3)
    table_schema.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table_schema.rows[0].cells
    hdr[0].text = "Tên Bảng"
    hdr[1].text = "Chức Năng Nghiệp Vụ"
    hdr[2].text = "Khóa Chính / Quan Hệ"
    for cell in hdr:
        set_cell_background(cell, "1E3A8A") # Navy
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        p.runs[0].font.size = Pt(9.5)

    schema_data = [
        ("users", "Quản lý nhân viên & Phân quyền RBAC 5 chức danh", "PK: id | Unique: username, email"),
        ("materials", "Quản lý kho phôi, dao cụ, cảnh báo min-stock", "PK: id | Unique: code"),
        ("quotations", "Báo giá chi tiết gia công, bóc tách giá thành", "PK: id | Unique: code"),
        ("sales_orders", "Đơn hàng SO, theo dõi giao hàng & tồn dở dang", "PK: id | FK: quotation_id"),
        ("production_orders", "Lệnh sản xuất xưởng LSX, routing công đoạn", "PK: id | FK: so_id"),
        ("wip_movements", "Luân chuyển BTP giữa các máy, ghi nhận lỗi NG", "PK: id | FK: production_order_id"),
        ("subcontracting_orders", "Gia công ngoài (Xi mạ Anode, nhiệt luyện)", "PK: id | FK: production_order_id"),
        ("advances", "Đề nghị tạm ứng phôi gấp & cọc gia công", "PK: id | Unique: code"),
        ("payment_requests", "Đề nghị thanh toán có cấn trừ tạm ứng", "PK: id | Unique: code"),
        ("debts", "Sổ công nợ tổng hợp (Phải thu & Phải trả)", "PK: id | Index: partner_name"),
        ("delivery_notes", "Phiếu xuất kho giao hàng kèm biên bản CMM", "PK: id | FK: so_id")
    ]

    for idx, (tname, tdesc, tkeys) in enumerate(schema_data):
        row = table_schema.add_row().cells
        bg_col = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([tname, tdesc, tkeys]):
            row[i].text = val
            set_cell_background(row[i], bg_col)
            set_cell_margins(row[i], 80, 80, 100, 100)
            p = row[i].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(9)
                if i == 0:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = c_primary

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==========================================
    # 3. KỊCH BẢN KIỂM THỬ END-TO-END MẪU
    # ==========================================
    h2 = doc.add_heading("2. Kịch Bản Kiểm Thử Luồng Thực Tế (Master Scenario)", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(8)

    scenario_p = doc.add_paragraph()
    scenario_p.add_run(
        "Kịch bản kiểm thử: Khách hàng Công ty Cổ phần Chế tạo Robot VinaTech đặt hàng gia công 100 chi tiết "
        "\"Thân gối đỡ trục Robot CNC-RB01\" (Bản vẽ DWG-ROBOT-RB01-REV2). "
        "Vật liệu yêu cầu: Nhôm A6061-T6 tròn đặc Phi 120mm. Bề mặt hoàn thiện: Mạ Anode đen mờ. "
        "Tiến độ giao hàng yêu cầu trong vòng 15 ngày."
    ).font.size = Pt(9.5)

    steps = [
        ("Giai đoạn 1: Bán Hàng & Báo Giá (Sales)", [
            "Bóc tách kỹ thuật: Chi phí phôi nhôm: 16,500,000đ; Giờ gia công máy phay/tiện: 65 giờ x 320,000đ/h = 20,800,000đ; Chi phí gia công ngoài (Anode): 3,500,000đ; Cước vận chuyển: 800,000đ.",
            "Tổng giá trị báo giá (Mã BG-2026-TEST01): 41,600,000 VNĐ.",
            "Khách hàng VinaTech duyệt báo giá -> Nhấn 'Chuyển thành Đơn hàng SO' -> Tự động sinh Đơn hàng SO-2026-TEST01."
        ]),
        ("Giai đoạn 2: Kiểm Tra Kho & Tồn Vật Tư (Inventory)", [
            "Kiểm tra kho mã phôi 'PHOI-AL6061-D120': Tồn kho hiện có 35 cây, vượt mức min-stock (10 cây) -> Đủ phôi sản xuất.",
            "Kiểm tra dao phay 'DAO-EM-D10-ROBOT': Hiện còn 12 cái (an toàn).",
            "Xuất kho 10 cây phôi tròn A6061 Phi 120mm cho xưởng gia công."
        ]),
        ("Giai đoạn 3: Điều Độ & Sản Xuất Xưởng CNC (Production)", [
            "Lập Lệnh sản xuất LSX-2026-TEST01 cho 100 chi tiết với quy trình 5 bước: Cắt phôi -> Phay mặt A/B -> Tiện lỗ bạc đạn -> Xi mạ Anode -> KCS đóng gói.",
            "Bước 1 (Máy cưa Amada): Cắt hoàn thành 100 phôi đạt tiêu chuẩn -> Luân chuyển qua máy Phay.",
            "Bước 2 (Phay CNC Mazak VCN-530C): Gia công hoàn tất 98 chi tiết; Ghi nhận 2 chi tiết bị lỗi hỏng NG do mòn dao phay Endmill D10 làm lệch then 0.04mm. Tỷ lệ NG = 2/100 = 2.0% (đạt tiêu chuẩn xưởng < 3%).",
            "Bước 3 (Tiện CNC Doosan Lynx 2100): Tiện tinh lỗ bạc đạn dung sai H7 cho 98 chi tiết đạt 100%."
        ]),
        ("Giai đoạn 4: Gia Công Ngoài & Tạm Ứng (Subcontracting & Advance)", [
            "Phát lệnh Gia công ngoài GC-2026-TEST01 gửi 98 chi tiết sang 'Xưởng Mạ Anode Kim Phát'. Đơn giá: 28,000đ/cái. Tổng chi phí: 2,744,000đ.",
            "Quản đốc xưởng lập Đề nghị tạm ứng TU-2026-TEST01 số tiền 2,744,000đ để đặt cọc và trả chi phí lấy hàng gấp.",
            "Admin đăng nhập phê duyệt đề nghị tạm ứng.",
            "Xưởng Kim Phát hoàn thành giao trả 98 chi tiết mạ Anode đen mờ đạt KCS 100%."
        ]),
        ("Giai đoạn 5: Kế Toán Thanh Toán Cấn Trừ & Giao Hàng (Finance & Delivery)", [
            "Kế toán lập Đề nghị thanh toán TT-2026-TEST01 cho Xưởng Kim Phát: Tổng tiền 2,744,000đ, Cấn trừ tạm ứng 2,744,000đ -> Thực chi chuyển khoản = 0đ (Quyết toán dứt điểm).",
            "Kho xuất phiếu giao hàng XK-2026-TEST01 giao 98 sản phẩm cho VinaTech kèm chứng chỉ CO/CQ và biên bản đo 3D máy CMM.",
            "Sổ công nợ ghi nhận: Phải thu khách hàng VinaTech 41,600,000đ; Khách hàng thanh toán hoàn tất chuyển khoản 41,600,000đ -> Dư nợ = 0đ."
        ])
    ]

    for stitle, slist in steps:
        p_stitle = doc.add_paragraph()
        p_stitle.paragraph_format.space_before = Pt(8)
        p_stitle.paragraph_format.space_after = Pt(2)
        r_st = p_stitle.add_run(stitle)
        r_st.font.bold = True
        r_st.font.size = Pt(10.5)
        r_st.font.color.rgb = c_secondary

        for item in slist:
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_after = Pt(2)
            br = bp.add_run(item)
            br.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==========================================
    # 4. KẾT QUẢ KỲ VỌNG (EXPECTED METRICS)
    # ==========================================
    h3 = doc.add_heading("3. Bảng Tổng Hợp Chỉ Số KPI & Tài Chính Sau Kiểm Thử", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(8)

    table_kpi = doc.add_table(rows=1, cols=3)
    table_kpi.alignment = WD_TABLE_ALIGNMENT.CENTER
    khdr = table_kpi.rows[0].cells
    khdr[0].text = "Chỉ Số Quản Trị / KPI"
    khdr[1].text = "Giá Trị Kỳ Vọng"
    khdr[2].text = "Công Thức & Ý Nghĩa Doanh Nghiệp"
    for cell in khdr:
        set_cell_background(cell, "0F766E") # Teal
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        p.runs[0].font.size = Pt(9.5)

    kpi_rows = [
        ("Tổng doanh thu bán hàng (SO Revenue)", "41,600,000 VNĐ", "100 chi tiết x đơn giá báo giá đã ký hợp đồng"),
        ("Sản lượng bàn giao thực tế (Delivered Qty)", "98 chi tiết", "Giao đủ 98 chi tiết đạt KCS kích thước dung sai CMM"),
        ("Tỷ lệ phế phẩm xưởng gia công (NG Rate)", "2.0% (2 chi tiết)", "2 / 100 cái (Đạt mục tiêu xưởng cơ khí chính xác < 3%)"),
        ("Chi phí phôi nguyên vật liệu (Raw Material)", "16,500,000 VNĐ", "Chi phí 10 cây phôi tròn A6061-T6 Phi 120mm"),
        ("Chi phí gia công ngoài (Subcontracting)", "2,744,000 VNĐ", "98 cái x 28,000đ/cái (Xi mạ Anode nhôm đen mờ)"),
        ("Giá vốn hàng bán ước tính (Total COGS)", "26,044,000 VNĐ", "Phôi 16.5M + Giờ máy CNC 6.8M + Anode 2.744M"),
        ("Lợi nhuận gộp thực tế (Gross Profit)", "15,556,000 VNĐ", "Doanh thu trừ Giá vốn (Biên lợi nhuận gộp đạt 37.4%)"),
        ("Số dư tạm ứng còn lại (Advance Balance)", "0 VNĐ", "Đã cấn trừ 100% vào phiếu thanh toán NCC (sạch công nợ)"),
        ("Công nợ phải thu khách hàng (Receivable)", "0 VNĐ", "Khách hàng VinaTech đã thanh toán đủ 100% hợp đồng")
    ]

    for idx, (kname, kval, kdesc) in enumerate(kpi_rows):
        row = table_kpi.add_row().cells
        bg_col = "F0FDFA" if idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([kname, kval, kdesc]):
            row[i].text = val
            set_cell_background(row[i], bg_col)
            set_cell_margins(row[i], 80, 80, 100, 100)
            p = row[i].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(9)
                if i == 0:
                    p.runs[0].font.bold = True
                elif i == 1:
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = RGBColor(14, 116, 144)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ==========================================
    # 5. MÃ NGUỒN SQL HOÀN CHỈNH CHO TOÀN BỘ DB TEST
    # ==========================================
    h4 = doc.add_heading("4. Toàn Bộ Mã Nguồn SQL Khởi Tạo Dữ Liệu Kiểm Thử (Full Script)", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(8)

    p_sql_desc = doc.add_paragraph()
    p_sql_desc.add_run(
        "Bạn có thể sao chép đoạn script SQL dưới đây và chạy trực tiếp trong công cụ quản trị MySQL "
        "(phpMyAdmin, Navicat, DBeaver, hoặc MySQL CLI trên máy chủ Coolify) để nạp trọn bộ dữ liệu kiểm thử này:"
    ).font.size = Pt(9.5)

    sql_code = """-- =========================================================================
-- HTSOFTTECH CNC-ERP - FULL TEST DATASET SCRIPT
-- Database: cnc_erp (hoặc default trên Coolify)
-- =========================================================================

-- 1. NẠP DỮ LIỆU TÀI KHOẢN & PHÂN QUYỀN (RBAC USERS)
-- Mật khẩu mặc định của tất cả tài khoản: 123456
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@cnc.com', '$2a$10$w09/X2gH7Y2r3N2Z4tCSuu8L.GvVv4c7S7f7f7f7f7f7f7f7f7f7f', 'Nguyễn Văn Quản Trị', 'admin'),
('sales', 'sales@cnc.com', '$2a$10$w09/X2gH7Y2r3N2Z4tCSuu8L.GvVv4c7S7f7f7f7f7f7f7f7f7f7f', 'Trần Thị Kinh Doanh', 'sales'),
('production', 'prod@cnc.com', '$2a$10$w09/X2gH7Y2r3N2Z4tCSuu8L.GvVv4c7S7f7f7f7f7f7f7f7f7f7f', 'Lê Văn Sản Xuất', 'production'),
('warehouse', 'kho@cnc.com', '$2a$10$w09/X2gH7Y2r3N2Z4tCSuu8L.GvVv4c7S7f7f7f7f7f7f7f7f7f7f', 'Hoàng Văn Thủ Kho', 'warehouse'),
('accountant', 'ketoan@cnc.com', '$2a$10$w09/X2gH7Y2r3N2Z4tCSuu8L.GvVv4c7S7f7f7f7f7f7f7f7f7f7f', 'Phạm Thị Kế Toán', 'accountant')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. NẠP DỮ LIỆU KHO PHÔI & DAO CỤ (MATERIALS)
INSERT INTO materials (code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no) VALUES 
('PHOI-AL6061-D120', 'Phôi Nhôm A6061-T6 tròn đặc', 'Phôi kim loại', 'Phi 120mm x L3000mm', 'Cây', 35.00, 10.00, 1850000.00, 'Kệ A-05', 'LO-AL-VINA-01'),
('PHOI-SS304-D50', 'Phôi Inox SUS304 tròn đặc', 'Phôi kim loại', 'Phi 50mm x L3000mm', 'Cây', 8.00, 15.00, 1420000.00, 'Kệ A-02', 'LO-SS-2026-02'),
('DAO-EM-D10-ROBOT', 'Dao phay ngón hợp kim 4F D10 TiAlN', 'Dao cụ & Phụ tùng', 'D10 x 75L x 4F Kyocera', 'Cái', 12.00, 5.00, 420000.00, 'Tủ dao C1-03', 'DAO-ROBOT-01'),
('CHIP-WNMG080408', 'Mảnh chip tiện ren ngoài WNMG Kyocera', 'Dao cụ & Phụ tùng', 'WNMG 080408-MS PR1125', 'Hộp', 4.00, 10.00, 850000.00, 'Tủ dao C2-01', 'CHIP-K-09')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- 3. NẠP DỮ LIỆU BÁO GIÁ CHI TIẾT (QUOTATIONS)
INSERT INTO quotations (code, customer_name, customer_phone, part_name, drawing_code, quantity, raw_material_cost, machine_hours, machine_hourly_rate, subcontract_cost, transport_cost, total_amount, status) VALUES
('BG-2026-TEST01', 'Công ty CP Chế tạo Robot VinaTech', '0938.889.999', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 16500000.00, 65.00, 320000.00, 3500000.00, 800000.00, 41600000.00, 'converted_to_so')
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), status = VALUES(status);

-- 4. NẠP DỮ LIỆU ĐƠN ĐẶT HÀNG BÁN HÀNG (SALES ORDERS)
INSERT INTO sales_orders (code, quotation_id, customer_name, part_name, drawing_code, order_qty, machined_qty, delivered_qty, wip_qty, total_price, delivery_deadline, status) VALUES
('SO-2026-TEST01', 1, 'Công ty CP Chế tạo Robot VinaTech', 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 98, 98, 0, 41600000.00, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'completed')
ON DUPLICATE KEY UPDATE delivered_qty = VALUES(delivered_qty), status = VALUES(status);

-- 5. NẠP DỮ LIỆU LỆNH SẢN XUẤT XƯỞNG (PRODUCTION ORDERS)
INSERT INTO production_orders (code, so_id, part_name, drawing_code, target_qty, completed_qty, ng_qty, routing, current_step, status, start_date, end_date) VALUES
('LSX-2026-TEST01', 1, 'Thân gối đỡ trục Robot CNC-RB01', 'DWG-ROBOT-RB01-REV2', 100, 98, 2, '["1. Cắt phôi Amada", "2. Phay CNC Mazak mặt A/B", "3. Tiện CNC Doosan lỗ bạc", "4. Xi mạ Anode đen ngoài", "5. KCS Kiểm tra CMM & Đóng gói"]', 'KCS Kiểm tra CMM & Đóng gói', 'finished', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 DAY))
ON DUPLICATE KEY UPDATE completed_qty = VALUES(completed_qty), status = VALUES(status);

-- 6. NẠP DỮ LIỆU LUÂN CHUYỂN BTP & KIỂM TRA LỖI NG (WIP MOVEMENTS)
INSERT INTO wip_movements (code, production_order_id, from_step, to_step, operator, machine_name, qty_passed, qty_failed, fail_reason) VALUES
('WIP-2026-TEST01', 1, '1. Cắt phôi Amada', '2. Phay CNC Mazak mặt A/B', 'Nguyễn Văn Tuấn', 'Máy cưa vòng Amada', 100, 0, ''),
('WIP-2026-TEST02', 1, '2. Phay CNC Mazak mặt A/B', '3. Tiện CNC Doosan lỗ bạc', 'Lê Văn Sản Xuất', 'Phay CNC Mazak VCN-530C', 98, 2, 'Lệch tâm phay rãnh then 0.04mm do mòn dao Endmill D10'),
('WIP-2026-TEST03', 1, '3. Tiện CNC Doosan lỗ bạc', '4. Xi mạ Anode đen ngoài', 'Trần Văn Thợ Tiện CNC', 'Tiện CNC Doosan Lynx 2100', 98, 0, '')
ON DUPLICATE KEY UPDATE qty_passed = VALUES(qty_passed);

-- 7. NẠP DỮ LIỆU ĐƠN GIA CÔNG NGOÀI (SUBCONTRACTING ORDERS)
INSERT INTO subcontracting_orders (code, production_order_id, vendor_name, process_type, part_name, send_qty, received_qty, qc_passed_qty, unit_cost, total_cost, promise_date, status) VALUES
('GC-2026-TEST01', 1, 'Xưởng Mạ Anode Kim Phát', 'Xi mạ Anode nhôm đen mờ', 'Thân gối đỡ trục Robot CNC-RB01', 98, 98, 98, 28000.00, 2744000.00, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'completed')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 8. NẠP DỮ LIỆU ĐỀ NGHỊ TẠM ỨNG (ADVANCES)
INSERT INTO advances (code, requester, purpose, amount, status, approved_by) VALUES
('TU-2026-TEST01', 'Lê Văn Sản Xuất (Quản đốc)', 'Tạm ứng thanh toán chi phí Anode xưởng Kim Phát cho đơn Robot VinaTech', 2744000.00, 'approved', 'Nguyễn Văn Quản Trị (Admin)')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 9. NẠP DỮ LIỆU ĐỀ NGHỊ THANH TOÁN NCC CẤN TRỪ (PAYMENT REQUESTS)
INSERT INTO payment_requests (code, recipient, category, gross_amount, deduct_advance_amount, net_amount, status, note) VALUES
('TT-2026-TEST01', 'Xưởng Mạ Anode Kim Phát', 'Gia công ngoài (Subcontracting)', 2744000.00, 2744000.00, 0.00, 'paid', 'Quyết toán chi phí mạ Anode đơn LSX-2026-TEST01 - Cấn trừ 100% vào phiếu tạm ứng TU-2026-TEST01')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 10. NẠP DỮ LIỆU PHIẾU XUẤT KHO BÁN HÀNG (DELIVERY NOTES)
INSERT INTO delivery_notes (code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note) VALUES
('XK-2026-TEST01', 1, 'Công ty CP Chế tạo Robot VinaTech', 'DWG-ROBOT-RB01-REV2', 98, 'Nguyễn Văn Tuấn (KCS VinaTech)', 'Giao đủ đợt kèm CO/CQ phôi Nhôm A6061 và Bản kiểm tra dung sai 3D máy đo CMM đạt 100%')
ON DUPLICATE KEY UPDATE delivery_qty = VALUES(delivery_qty);

-- 11. NẠP DỮ LIỆU SỔ QUẢN LÝ CÔNG NỢ (DEBTS)
INSERT INTO debts (partner_name, type, total_amount, paid_amount, remaining_amount, due_date, status) VALUES
('Công ty CP Chế tạo Robot VinaTech', 'receivable', 41600000.00, 41600000.00, 0.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'paid'),
('Xưởng Mạ Anode Kim Phát', 'payable', 2744000.00, 2744000.00, 0.00, CURDATE(), 'paid')
ON DUPLICATE KEY UPDATE remaining_amount = VALUES(remaining_amount), status = VALUES(status);
"""

    table_sql = doc.add_table(rows=1, cols=1)
    table_sql.alignment = WD_TABLE_ALIGNMENT.CENTER
    scell = table_sql.rows[0].cells[0]
    set_cell_background(scell, "1E293B") # Dark slate
    set_cell_margins(scell, 120, 120, 140, 140)
    sp = scell.paragraphs[0]
    srun = sp.add_run(sql_code)
    srun.font.name = "Consolas"
    srun.font.size = Pt(8)
    srun.font.color.rgb = RGBColor(241, 245, 249)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Save document
    output_path = r"e:\Smedia\CNC-ERP\CNC-ERP\CNC_ERP_Bo_Database_Test_Full_Luong_Va_Chuc_Nang.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_document()
