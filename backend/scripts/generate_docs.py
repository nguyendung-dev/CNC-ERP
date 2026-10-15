# -*- coding: utf-8 -*-
"""
Script tạo tài liệu Word (.docx) chuẩn nghiệp vụ CNC:
Quy trình Vận hành Workflow End-to-End, Thao tác Thêm/Sửa/Xóa/Duyệt và Bộ dữ liệu Test Luồng.
Hệ thống CNC-ERP (HTSOFTTECH)
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Đặt màu nền cho ô trong bảng"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Đặt padding cho ô trong bảng"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Thiết lập lề trang tiêu chuẩn (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    # Màu chủ đạo
    COLOR_PRIMARY = RGBColor(29, 78, 216)    # Blue 700 (#1d4ed8)
    COLOR_SECONDARY = RGBColor(37, 99, 235)  # Blue 600 (#2563eb)
    COLOR_DARK = RGBColor(15, 23, 42)        # Slate 900
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500

    # -------------------------------------------------------------
    # 1. TRANG TIÊU ĐỀ (COVER / HEADER)
    # -------------------------------------------------------------
    p_org = doc.add_paragraph()
    p_org.paragraph_format.space_after = Pt(4)
    run_org = p_org.add_run("HTSOFTTECH PRECISION MECHANICAL MANUFACTURING")
    run_org.font.size = Pt(10)
    run_org.font.bold = True
    run_org.font.color.rgb = COLOR_PRIMARY

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.add_run("TÀI LIỆU QUY TRÌNH VẬN HÀNH (WORKFLOW END-TO-END)\nTHAO TÁC THÊM - SỬA - XÓA - DUYỆT & BỘ DỮ LIỆU KIỂM THỬ THỰC TẾ")
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_DARK

    p_subtitle = doc.add_paragraph()
    p_subtitle.paragraph_format.space_after = Pt(18)
    run_sub = p_subtitle.add_run("Hệ thống Quản trị Doanh nghiệp Cơ khí Chế tạo CNC (CNC-ERP System)\nPhân tích Chi tiết Kịch bản Thực thi & Kết quả Kỳ vọng Cuối cùng")
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_MUTED

    # Khung tóm tắt thông tin tài liệu
    tbl_info = doc.add_table(rows=4, cols=2)
    tbl_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_data = [
        ("Dự án áp dụng:", "CNC-ERP (Bán hàng, Kho phôi, Sản xuất CNC, Gia công ngoài, Tài chính)"),
        ("Đối tượng sử dụng:", "Quản trị viên (Admin), Nhân viên Bán hàng (Sales), Quản đốc Xưởng (Production), Thủ kho (Warehouse), Kế toán (Accountant)"),
        ("Môi trường thực thi:", "Frontend Next.js (Port 3001) • Backend Express Node.js (Port 5002) • Database MySQL (Port 3306)"),
        ("Mục tiêu kịch bản:", "Kiểm thử luồng khép kín từ Báo giá -> Lệnh sản xuất -> Gia công máy -> Xi mạ -> Quyết toán công nợ và lợi nhuận đơn hàng"),
    ]
    for row_idx, (label, val) in enumerate(info_data):
        cell_lbl, cell_val = tbl_info.rows[row_idx].cells
        cell_lbl.text = label
        cell_val.text = val
        cell_lbl.paragraphs[0].runs[0].font.bold = True
        cell_lbl.paragraphs[0].runs[0].font.size = Pt(9.5)
        cell_val.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "F8FAFC")
        set_cell_margins(cell_lbl, 80, 80, 100, 100)
        set_cell_margins(cell_val, 80, 80, 100, 100)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------
    # CHƯƠNG 1: TỔNG QUAN KIẾN TRÚC LUỒNG DỮ LIỆU LIÊN THÔNG
    # -------------------------------------------------------------
    h1 = doc.add_heading("CHƯƠNG 1: TỔNG QUAN KIẾN TRÚC LUỒNG DỮ LIỆU LIÊN THÔNG", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Hệ thống CNC-ERP được thiết kế chuyên biệt cho đặc thù cơ khí chính xác, "
        "kết nối chặt chẽ giữa 5 phòng ban theo mô hình luân chuyển chứng từ tự động:"
    )

    p_flow = doc.add_paragraph()
    p_flow.paragraph_format.left_indent = Inches(0.2)
    p_flow.add_run(
        "1. Bán hàng (Sales): Bóc tách bản vẽ kỹ thuật, định mức giờ máy và tạo Báo giá gia công CNC.\n"
        "2. Duyệt Đơn hàng (SO): Khách chốt giá -> Hệ thống chuyển đổi Báo giá thành Đơn đặt hàng (SO).\n"
        "3. Điều độ Sản xuất (Production): Kế hoạch lập Lệnh sản xuất (LSX) phân bổ vào ca máy Phay/Tiện.\n"
        "4. Kho vật tư & MRP (Warehouse): Kiểm tra phôi nhôm/thép, dao cụ, xuất kho phôi theo định mức LSX.\n"
        "5. Gia công & Luân chuyển BTP (WIP): Thợ máy gia công, ghi nhận sản lượng đạt và tỷ lệ phế phẩm NG.\n"
        "6. Gia công ngoài (Subcontracting): Gửi chi tiết đi xử lý nhiệt luyện / xi mạ anode kèm biên bản giao nhận.\n"
        "7. Tài chính & Dòng tiền (Finance): Duyệt tạm ứng tiền phôi, lập đề nghị thanh toán NCC có cấn trừ tạm ứng.\n"
        "8. Giao hàng & Nghiệm thu: Xuất kho thành phẩm kèm chứng chỉ đo 3D CMM, ghi nhận công nợ và phân tích lãi lỗ (P&L)."
    )
    for run in p_flow.runs:
        run.font.size = Pt(9.5)

    # -------------------------------------------------------------
    # CHƯƠNG 2: BỘ DỮ LIỆU KIỂM THỬ THỰC TẾ (TEST DATASET SCENARIO)
    # -------------------------------------------------------------
    h2 = doc.add_heading("CHƯƠNG 2: BỘ DỮ LIỆU KIỂM THỬ THỰC TẾ (TEST CASE DATASET)", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Để thực hiện kiểm tra luồng xuyên suốt, toàn bộ các bước sẽ sử dụng kịch bản gia công thực tế như sau:"
    )

    tbl_dataset = doc.add_table(rows=10, cols=3)
    tbl_dataset.alignment = WD_TABLE_ALIGNMENT.CENTER
    dataset_rows = [
        ("Thông số", "Giá trị kiểm thử", "Mục đích nghiệp vụ cơ khí"),
        ("Khách hàng", "Công ty CP Chế tạo Robot VinaTech", "Đối tác đặt hàng gia công chi tiết linh kiện robot"),
        ("Chi tiết gia công", "Thân gối đỡ trục Robot CNC-RB01", "Gia công cơ khí chính xác phay 3D + tiện lỗ"),
        ("Bản vẽ kỹ thuật", "DWG-ROBOT-RB01-REV2", "Mã bản vẽ kiểm soát phiên bản"),
        ("Số lượng đặt hàng", "100 chi tiết", "Quy mô lô sản xuất trung bình"),
        ("Vật liệu phôi yêu cầu", "Phôi Nhôm A6061-T6 (Phi 120 x L80mm)", "Định mức phôi nguyên cây: 1.85 kg/chi tiết"),
        ("Quy trình công nghệ", "Phay CNC Mazak (0.5h) -> Tiện Doosan (0.25h) -> Anode đen", "Routing chuẩn gồm 2 bước xưởng + 1 bước gia công ngoài"),
        ("Gia công ngoài", "Xưởng Mạ Anode Kim Phát", "Gia công ngoài nhuộm đen mờ độ dày 15-20 micron"),
        ("Đơn giá nhận gia công", "485,000 đ/chi tiết (Tổng 48,500,000 đ)", "Giá bán ký hợp đồng với khách hàng"),
        ("Tiến độ cam kết", "Giao hàng trong 15 ngày làm việc", "Thời gian giao hàng theo hợp đồng SO"),
    ]
    for row_idx, (c0, c1, c2) in enumerate(dataset_rows):
        cells = tbl_dataset.rows[row_idx].cells
        cells[0].text = c0
        cells[1].text = c1
        cells[2].text = c2
        if row_idx == 0:
            for c in cells:
                set_cell_background(c, "1D4ED8")
                c.paragraphs[0].runs[0].font.bold = True
                c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        else:
            set_cell_background(cells[0], "F1F5F9")
            set_cell_background(cells[1], "FFFFFF")
            set_cell_background(cells[2], "F8FAFC")
            cells[0].paragraphs[0].runs[0].font.bold = True
        for c in cells:
            c.paragraphs[0].runs[0].font.size = Pt(9)
            set_cell_margins(c, 70, 70, 90, 90)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # -------------------------------------------------------------
    # CHƯƠNG 3: BẢNG HƯỚNG DẪN THAO TÁC WORKFLOW (THÊM - SỬA - XÓA - DUYỆT)
    # -------------------------------------------------------------
    h3 = doc.add_heading("CHƯƠNG 3: QUY TRÌNH THAO TÁC CHI TIẾT TỪ ĐẦU ĐẾN CUỐI (CRUD WORKFLOW)", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Dưới đây là kịch bản chuẩn hướng dẫn người dùng từng bước thao tác thêm mới, chỉnh sửa, xóa "
        "và phê duyệt trạng thái trên giao diện web:"
    )

    steps = [
        {
            "step": "BƯỚC 1: CẤU HÌNH VẬT TƯ & TỒN KHO AN TOÀN TRONG KHO",
            "module": "Kho vật tư (InventoryModule)",
            "role": "Thủ kho (Warehouse) / Quản trị viên (Admin)",
            "actions": [
                ("THÊM MỚI (Create)", "Bấm nút 'Thêm vật tư mới'. Nhập Mã vật tư: PHOI-AL6061-D120, Tên: Phôi Nhôm A6061 Phi 120, Loại: Phôi kim loại, Quy cách: Phi 120 x L3000mm, Đơn vị: Cây, Số lượng tồn: 35, Min-stock: 10, Đơn giá nhập: 1,850,000 đ. Bấm 'Lưu vào kho'."),
                ("CHỈNH SỬA (Update)", "Khi phát hiện nhập sai đơn giá hoặc số lượng tồn kho tối thiểu: Bấm nút 'Sửa' tại dòng vật tư, cập nhật lại số lượng và bấm 'Cập nhật'."),
                ("XÓA (Delete)", "Nếu vật tư bị tạo trùng hoặc chưa từng phát sinh xuất/nhập: Bấm nút 'Xóa', hệ thống sẽ kiểm tra ràng buộc khóa ngoại trước khi xóa."),
                ("KẾT QUẢ KHO", "Vật tư được lưu vào bảng materials, hiển thị nhãn xanh an toàn (Tồn 35 > Min 10)."),
            ]
        },
        {
            "step": "BƯỚC 2: BÓC TÁCH BẢN VẼ & LẬP BÁO GIÁ GIA CÔNG CNC",
            "module": "Bán hàng (SalesModule) -> Báo giá CNC",
            "role": "Nhân viên Bán hàng (Sales) / Kỹ thuật báo giá",
            "actions": [
                ("THÊM BÁO GIÁ", "Bấm '+ Tạo Báo Giá Mới'. Điền: Khách hàng 'Công ty CP Chế tạo Robot VinaTech', Chi tiết 'Thân gối đỡ trục Robot CNC-RB01', Bản vẽ 'DWG-ROBOT-RB01-REV2', Số lượng: 100. Nhập chi phí bóc tách: Tiền phôi 16,500,000 đ; Giờ máy CNC 65 giờ x 320,000 đ = 20,800,000 đ; Gia công ngoài xi mạ 3,500,000 đ; Vận chuyển 800,000 đ. Hệ thống tự động tính Tổng cộng: 41,600,000 đ. Bấm 'Lưu Báo Giá'."),
                ("CHỈNH SỬA BÁO GIÁ", "Khi khách hàng đàm phán giảm chi phí: Bấm 'Chỉnh sửa', điều chỉnh đơn giá giờ máy hoặc chi phí vận chuyển, hệ thống tự động tái tính toán tổng tiền."),
                ("XÓA BÁO GIÁ", "Các báo giá đang ở trạng thái 'draft' (nháp) hoặc bị khách hủy có thể xóa trực tiếp bằng nút 'Xóa'."),
                ("PHÊ DUYỆT & TẠO ĐƠN", "Sau khi khách gửi PO: Bấm nút 'Duyệt & Tạo Đơn (SO)'. Báo giá chuyển sang 'approved'/'converted_to_so' và tự động sinh bản ghi trong Đơn đặt hàng (Sales Order)."),
            ]
        },
        {
            "step": "BƯỚC 3: PHÁT HÀNH LỆNH SẢN XUẤT (LSX) & ĐIỀU ĐỘ MÁY",
            "module": "Sản xuất (ProductionModule) -> Lệnh sản xuất",
            "role": "Quản đốc xưởng (Production Manager)",
            "actions": [
                ("THÊM LSX MỚI", "Bấm 'Lập LSX mới' liên kết từ Đơn hàng SO vừa duyệt. Nhập Mã LSX: LSX-2026-003, Số lượng yêu cầu: 100 chiếc. Thiết lập chuỗi Routing công nghệ gồm 5 bước: [1. Cắt cưa phôi] -> [2. Phay CNC Mazak mặt A/B] -> [3. Tiện CNC Doosan lỗ bạc] -> [4. Gửi Anode ngoài] -> [5. Kiểm tra CMM & Đóng gói]."),
                ("SỬA TIẾN ĐỘ / ROUTING", "Khi máy Mazak gặp sự cố bảo trì: Quản đốc có thể đổi máy sang Tổ máy Phay Doosan VC-430 và cập nhật công đoạn hiện tại."),
                ("XUẤT PHÔI CHO LSX", "Thủ kho mở phân hệ Kho -> Tạo phiếu xuất kho phôi AL6061-D120 (3 cây) phục vụ Lệnh sản xuất LSX-2026-003."),
            ]
        },
        {
            "step": "BƯỚC 4: GHI NHẬN SẢN LƯỢNG CA MÁY & PHẾ PHẨM LỖI (NG RATE)",
            "module": "Sản xuất (ProductionModule) -> Luân chuyển BTP & QC",
            "role": "Thợ máy CNC (Operator) / KCS Kiểm tra",
            "actions": [
                ("THÊM BẢN GHI LUÂN CHUYỂN", "Sau khi hoàn thành công đoạn Phay: Bấm 'Ghi nhận sản lượng luân chuyển'. Nhập: Từ công đoạn 'Phay CNC' đến 'Tiện CNC', Thợ máy 'Lê Văn Sản Xuất', Máy 'Mazak VCN-530C', Số lượng Đạt: 98 chiếc, Số lượng Hỏng (NG): 2 chiếc."),
                ("GHI NGUYÊN NHÂN LỖI NG", "Tại ô lý do lỗi: Ghi rõ 'Lệch tâm phay rãnh then 0.04mm do mòn dao Endmill D10'. Hệ thống tự động tính tỷ lệ lỗi NG = 2% (Đạt tiêu chuẩn < 3%)."),
                ("CẬP NHẬT TRẠNG THÁI LSX", "Số lượng hoàn thành tăng lên 98 chiếc, sản phẩm dở dang (WIP) chuyển sang công đoạn kế tiếp."),
            ]
        },
        {
            "step": "BƯỚC 5: GIA CÔNG NGOÀI & TẠM ỨNG NGÂN SÁCH XƯỞNG",
            "module": "Sản xuất -> Gia công ngoài & Tài chính -> Tạm ứng",
            "role": "Quản đốc xưởng & Kế toán thanh toán",
            "actions": [
                ("LẬP ĐƠN GIA CÔNG NGOÀI", "Bấm 'Tạo đơn gia công ngoài'. Chọn LSX-2026-003, Đối tác 'Xưởng Mạ Anode Kim Phát', Quy trình 'Xi mạ Anode đen mờ', Số lượng gửi: 98 chiếc, Đơn giá mạ: 28,000 đ/chiếc, Thành tiền: 2,744,000 đ. Ngày hẹn trả: 3 ngày sau."),
                ("LẬP ĐỀ NGHỊ TẠM ỨNG", "Trưởng xưởng vào Tài chính -> Bấm 'Tạo đề nghị tạm ứng': Số tiền 2,744,000 đ, Nội dung 'Tạm ứng thanh toán chi phí Anode chi tiết Robot VinaTech'."),
                ("DUYỆT TẠM ỨNG", "Giám đốc / Kế toán trưởng vào Dashboard -> Bấm 'Phê duyệt tạm ứng'. Trạng thái chuyển sang 'approved', quỹ tiền mặt giải ngân."),
                ("NGHIỆM THU HÀNG VỀ (QC)", "Khi xưởng mạ giao hàng: Bấm 'Nghiệm thu gia công ngoài'. Xác nhận nhận đủ 98 chiếc đạt tiêu chuẩn bề mặt, chuyển về kho chờ xuất hàng."),
            ]
        },
        {
            "step": "BƯỚC 6: XUẤT KHO BÁN HÀNG & PHIẾU GIAO HÀNG (XK)",
            "module": "Bán hàng (SalesModule) -> Phiếu xuất kho bán hàng",
            "role": "Nhân viên Bán hàng & Thủ kho thành phẩm",
            "actions": [
                ("TẠO PHIẾU XUẤT KHO", "Bấm 'Lập phiếu xuất kho bán hàng'. Chọn Đơn hàng SO VinaTech, Số lượng giao đợt 1: 98 chiếc. Người nhận: 'Nguyễn Văn Tuấn (KCS VinaTech)'."),
                ("ĐÍNH KÈM CHỨNG CHỈ", "Ghi chú phiếu xuất: 'Giao kèm CO/CQ phôi Nhôm A6061 và Bản kiểm tra dung sai 3D máy đo CMM đạt 100%'."),
                ("CẬP NHẬT TRẠNG THÁI SO", "Đơn hàng SO chuyển trạng thái thành 'completed' (Đã giao hàng đầy đủ)."),
            ]
        },
        {
            "step": "BƯỚC 7: QUYẾT TOÁN CÔNG NỢ & CẤN TRỪ TẠM ỨNG (FINANCE SETTLEMENT)",
            "module": "Tài chính (FinanceModule) -> Đề nghị thanh toán & Công nợ",
            "role": "Kế toán công nợ (Accountant)",
            "actions": [
                ("LẬP THANH TOÁN CẤN TRỪ", "Kế toán mở 'Đề nghị thanh toán NCC'. Chọn nhà cung cấp 'Xưởng Mạ Anode Kim Phát': Tổng giá trị hóa đơn (Gross): 2,744,000 đ. Nhập số tiền trừ lùi tạm ứng: 2,744,000 đ. Số tiền thực chi bổ sung (Net): 0 đ. Bấm 'Xác nhận thanh toán'."),
                ("GHI NHẬN CÔNG NỢ PHẢI THU", "Hệ thống tự động ghi sổ công nợ phải thu: Khách hàng VinaTech phải trả 41,600,000 đ, hạn thanh toán 30 ngày kể từ ngày giao hàng."),
                ("THU TIỀN BÁN HÀNG", "Khi khách hàng chuyển khoản: Kế toán bấm 'Cập nhật đã thu tiền' -> Công nợ phải thu giảm về 0 đ."),
            ]
        },
    ]

    for s_info in steps:
        h_step = doc.add_heading(s_info["step"], level=2)
        h_step.paragraph_format.space_before = Pt(12)
        h_step.paragraph_format.space_after = Pt(4)

        p_meta = doc.add_paragraph()
        p_meta.add_run(f"Phân hệ: {s_info['module']} | Vai trò: {s_info['role']}").font.bold = True
        p_meta.runs[0].font.size = Pt(9.5)
        p_meta.runs[0].font.color.rgb = COLOR_PRIMARY

        tbl_actions = doc.add_table(rows=len(s_info["actions"]) + 1, cols=2)
        tbl_actions.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Header
        h_c0, h_c1 = tbl_actions.rows[0].cells
        h_c0.text = "Thao tác nghiệp vụ"
        h_c1.text = "Chi tiết các bước thực hiện & Kết quả hệ thống"
        set_cell_background(h_c0, "1D4ED8")
        set_cell_background(h_c1, "1D4ED8")
        h_c0.paragraphs[0].runs[0].font.bold = True
        h_c1.paragraphs[0].runs[0].font.bold = True
        h_c0.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        h_c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        h_c0.paragraphs[0].runs[0].font.size = Pt(9)
        h_c1.paragraphs[0].runs[0].font.size = Pt(9)
        set_cell_margins(h_c0, 60, 60, 80, 80)
        set_cell_margins(h_c1, 60, 60, 80, 80)

        for a_idx, (act_name, act_desc) in enumerate(s_info["actions"]):
            c0, c1 = tbl_actions.rows[a_idx + 1].cells
            c0.text = act_name
            c1.text = act_desc
            set_cell_background(c0, "F1F5F9")
            set_cell_background(c1, "FFFFFF")
            c0.paragraphs[0].runs[0].font.bold = True
            c0.paragraphs[0].runs[0].font.size = Pt(8.5)
            c1.paragraphs[0].runs[0].font.size = Pt(8.5)
            set_cell_margins(c0, 60, 60, 80, 80)
            set_cell_margins(c1, 60, 60, 80, 80)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # CHƯƠNG 4: KẾT QUẢ MONG MUỐN CUỐI CÙNG (TARGET EXPECTED OUTCOMES)
    # -------------------------------------------------------------
    h4 = doc.add_heading("CHƯƠNG 4: KẾT QUẢ MONG MUỐN CUỐI CÙNG KHI CHẠY HẾT LUỒNG", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Sau khi hoàn thành đầy đủ các bước của kịch bản kiểm thử trên, người quản lý mở phân hệ "
        "Báo cáo Quản trị (ReportsModule) và Trang chủ Dashboard để kiểm tra các chỉ số tài chính, "
        "kỹ thuật và tồn kho mong muốn đạt được như sau:"
    )

    tbl_results = doc.add_table(rows=7, cols=3)
    tbl_results.alignment = WD_TABLE_ALIGNMENT.CENTER
    results_data = [
        ("Chỉ số mục tiêu (Target KPI)", "Kết quả thực tế sau luồng kiểm thử", "Ý nghĩa đánh giá quản trị doanh nghiệp"),
        ("Tổng Doanh thu Bán hàng", "41,600,000 VNĐ", "Doanh thu ghi nhận từ đơn hàng SO hoàn thành"),
        ("Tổng Chi phí Giá vốn (COGS)", "26,044,000 VNĐ", "Gồm phôi (16.5M) + giờ máy xưởng (6.8M) + Anode ngoài (2.744M)"),
        ("Lợi nhuận gộp đơn hàng", "15,556,000 VNĐ (Tỷ suất LN 37.4%)", "Đạt mục tiêu biên lợi nhuận gia công cơ khí chính xác (> 35%)"),
        ("Tỷ lệ Lỗi Phế phẩm (NG Rate)", "2.0% (2 chi tiết hỏng / 100 phôi)", "Nằm trong ngưỡng kiểm soát cho phép (< 3.0%), có ghi nhận nguyên nhân"),
        ("Cân đối Tạm ứng & Công nợ", "Đã cấn trừ 100% tạm ứng (0 đ nợ đọng)", "Khoản tạm ứng 2.744M đã được trừ dứt điểm vào phiếu chi nhà cung cấp"),
        ("Trạng thái Tồn kho & Cảnh báo", "Tồn phôi giảm 3 cây, tự động kích hoạt MRP", "Kho cập nhật tức thì, nếu dưới mức min_stock sẽ hiện cảnh báo đỏ"),
    ]
    for row_idx, (r0, r1, r2) in enumerate(results_data):
        cells = tbl_results.rows[row_idx].cells
        cells[0].text = r0
        cells[1].text = r1
        cells[2].text = r2
        if row_idx == 0:
            for c in cells:
                set_cell_background(c, "1D4ED8")
                c.paragraphs[0].runs[0].font.bold = True
                c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        else:
            set_cell_background(cells[0], "F1F5F9")
            set_cell_background(cells[1], "ECFDF5") # light emerald
            set_cell_background(cells[2], "FFFFFF")
            cells[0].paragraphs[0].runs[0].font.bold = True
            cells[1].paragraphs[0].runs[0].font.bold = True
            cells[1].paragraphs[0].runs[0].font.color.rgb = RGBColor(4, 120, 87) # emerald 700
        for c in cells:
            c.paragraphs[0].runs[0].font.size = Pt(9)
            set_cell_margins(c, 70, 70, 90, 90)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------
    # CHƯƠNG 5: HƯỚNG DẪN IMPORT FILE TEST DATABASE SQL
    # -------------------------------------------------------------
    h5 = doc.add_heading("CHƯƠNG 5: BỘ DỮ LIỆU DATABASE SQL TEST ĐÍNH KÈM & CÁCH SỬ DỤNG", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Hệ thống cung cấp sẵn file script SQL hoàn chỉnh mang tên 'test_dataset_end_to_end.sql' "
        "chứa toàn bộ câu lệnh INSERT dữ liệu mẫu chuẩn của kịch bản trên vào 10 bảng của database MySQL 'cnc_erp'."
    )

    p_code = doc.add_paragraph()
    p_code.paragraph_format.left_indent = Inches(0.2)
    p_code.add_run(
        "-- Lệnh nạp trực tiếp file test dataset vào MySQL thông qua Terminal PowerShell:\n"
        "Get-Content ./test_dataset_end_to_end.sql | mysql -u root -p cnc_erp\n\n"
        "-- Hoặc mở phần mềm DBeaver / MySQL Workbench / Navicat và chạy trực tiếp file script này."
    )
    for run in p_code.runs:
        run.font.size = Pt(9)
        run.font.name = "Consolas"
        run.font.color.rgb = COLOR_PRIMARY

    p_footer = doc.add_paragraph()
    p_footer.paragraph_format.space_before = Pt(18)
    p_footer.add_run(
        "Tài liệu biên soạn bởi Đội ngũ Kỹ thuật HTSOFTTECH CNC-ERP • Bản quyền © 2026. Mọi quyền được bảo lưu."
    ).font.italic = True
    p_footer.runs[0].font.size = Pt(8.5)
    p_footer.runs[0].font.color.rgb = COLOR_MUTED

    file_path = "HTSOFTTECH_CNC_ERP_Workflow_Va_Kich_Ban_Kiem_Thu_End_To_End.docx"
    doc.save(file_path)
    print(f"Document successfully created at: {file_path}")

if __name__ == "__main__":
    create_document()
