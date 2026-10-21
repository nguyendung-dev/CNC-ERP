const { pool } = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Automatically creates all tables and populates sample CNC-ERP data if tables are empty.
 */
async function initializeDatabase() {
  try {
    console.log('[Database] Checking & initializing tables...');

    // 0. Users Table (Phân quyền người dùng: admin, sales, production, warehouse, accountant)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'sales',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    
    // Ensure phone and status columns exist in users table
    try {
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT '' AFTER email;");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active' AFTER role;");
    } catch (e) {}
    // Customers Table (Khách hàng & Đối tác doanh nghiệp)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(150) DEFAULT '',
        address VARCHAR(255) DEFAULT '',
        tax_code VARCHAR(50) DEFAULT '',
        contact_person VARCHAR(150) DEFAULT '',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      const [existingCust] = await pool.query('SELECT COUNT(*) as count FROM customers');
      if (existingCust[0].count === 0) {
        await pool.query(`
          INSERT INTO customers (code, name, phone, email, address, tax_code, contact_person, note) VALUES
          ('KH-001', 'Công ty Cơ khí Chính xác Sakura', '0912345678', 'sakura.cnc@gmail.com', 'KCN Nội Bài, Sóc Sơn, Hà Nội', '0108899123', 'Mr. Kenji Tanaka', 'Khách hàng FDI Nhật Bản, gia công trục truyền động chính xác'),
          ('KH-002', 'Tập đoàn Chế tạo Máy Alpha Tech', '0988776655', 'alphatech.vn@gmail.com', 'KCN VSIP, Bắc Ninh', '0109988456', 'Nguyễn Văn Tuấn', 'Đơn hàng định kỳ đồ gá Jig nhôm & gối đỡ vòng bi'),
          ('KH-003', 'Công ty TNHH Khuôn mẫu Tân Phát', '0903112233', 'tanphat.mold@gmail.com', 'KCN Biên Hòa 2, Đồng Nai', '3601239871', 'Phạm Quốc Tân', 'Chuyên khuôn ép nhựa và lòng khuôn S50C'),
          ('KH-004', 'Xưởng Robot & Tự Động Hóa Delta', '0905123456', 'delta.robotics@gmail.com', 'Khu CNC Hòa Lạc, Hà Nội', '0107766221', 'Trần Đức Nam', 'Gia công chi tiết robot công nghiệp, cánh tay máy'),
          ('KH-005', 'Công ty Thiết Bị Cơ Khí Tân Bình', '0938112233', 'tanbinh.mech@gmail.com', 'KCN Tân Bình, TP.HCM', '0304455667', 'Lê Thu Hằng', 'Phụ tùng máy đóng gói bao bì, bánh răng');
        `);
      }
    } catch (e) {
      console.warn('[Database] Seed customers error:', e.message);
    }

    // 1. Materials Table (Kho vật tư, phôi, dao cụ cơ khí)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        spec VARCHAR(255) DEFAULT '',
        unit VARCHAR(20) NOT NULL,
        quantity DECIMAL(12,2) DEFAULT 0,
        min_stock DECIMAL(12,2) DEFAULT 0,
        unit_price DECIMAL(15,2) DEFAULT 0,
        location VARCHAR(100) DEFAULT '',
        batch_no VARCHAR(50) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Quotations Table (Báo giá chi tiết gia công CNC)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) DEFAULT '',
        part_name VARCHAR(255) NOT NULL,
        drawing_code VARCHAR(100) DEFAULT '',
        quantity INT NOT NULL,
        raw_material_cost DECIMAL(15,2) DEFAULT 0,
        machine_hours DECIMAL(8,2) DEFAULT 0,
        machine_hourly_rate DECIMAL(15,2) DEFAULT 0,
        subcontract_cost DECIMAL(15,2) DEFAULT 0,
        transport_cost DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Sales Orders Table (Đơn đặt hàng SO)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        quotation_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        part_name VARCHAR(255) NOT NULL,
        drawing_code VARCHAR(100) DEFAULT '',
        order_qty INT NOT NULL,
        machined_qty INT DEFAULT 0,
        delivered_qty INT DEFAULT 0,
        wip_qty INT DEFAULT 0,
        total_price DECIMAL(15,2) DEFAULT 0,
        delivery_deadline DATE,
        status VARCHAR(50) DEFAULT 'in_production',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Delivery Notes Table (Phiếu xuất kho bán hàng / giao hàng)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        so_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        drawing_code VARCHAR(100) DEFAULT '',
        delivery_qty INT NOT NULL,
        receiver_name VARCHAR(100) DEFAULT '',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Production Orders Table (Lệnh sản xuất LSX & Routing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS production_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        so_id INT NULL,
        part_name VARCHAR(255) NOT NULL,
        drawing_code VARCHAR(100) DEFAULT '',
        target_qty INT NOT NULL,
        completed_qty INT DEFAULT 0,
        ng_qty INT DEFAULT 0,
        routing TEXT,
        current_step VARCHAR(100) DEFAULT 'Cắt phôi',
        workshop_name VARCHAR(150) NULL DEFAULT 'Xưởng A (Phay Mazak, Tiện Doosan)',
        status VARCHAR(50) DEFAULT 'running',
        start_date DATE,
        end_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. WIP Movements Table (Luân chuyển BTP & kiểm tra NG)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wip_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        production_order_id INT NULL,
        from_step VARCHAR(100) NOT NULL,
        to_step VARCHAR(100) NOT NULL,
        operator VARCHAR(100) DEFAULT '',
        machine_name VARCHAR(100) DEFAULT '',
        qty_passed INT NOT NULL,
        qty_failed INT DEFAULT 0,
        fail_reason VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Subcontracting Orders Table (Gia công ngoài: xi mạ, nhiệt luyện, anode)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subcontracting_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        production_order_id INT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        process_type VARCHAR(100) NOT NULL,
        part_name VARCHAR(255) NOT NULL,
        send_qty INT NOT NULL,
        received_qty INT DEFAULT 0,
        qc_passed_qty INT DEFAULT 0,
        unit_cost DECIMAL(15,2) DEFAULT 0,
        total_cost DECIMAL(15,2) DEFAULT 0,
        promise_date DATE,
        status VARCHAR(50) DEFAULT 'sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Advances Table (Đề nghị tạm ứng)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS advances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        requester VARCHAR(100) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'approved',
        approved_by VARCHAR(100) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Payment Requests Table (Đề nghị thanh toán)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        gross_amount DECIMAL(15,2) NOT NULL,
        deduct_advance_amount DECIMAL(15,2) DEFAULT 0,
        net_amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'paid',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Debts Table (Quản lý công nợ)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        partner_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        paid_amount DECIMAL(15,2) DEFAULT 0,
        remaining_amount DECIMAL(15,2) NOT NULL,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'unpaid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. Workshops Table (Quản lý phân xưởng CNC thực tế)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workshops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        manager_name VARCHAR(100),
        phone VARCHAR(50),
        machine_count INT DEFAULT 1,
        operator_count INT DEFAULT 1,
        main_machines TEXT,
        location VARCHAR(200),
        status VARCHAR(50) DEFAULT 'active',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure default workshops exist in database if empty
    const [existingWorkshops] = await pool.query('SELECT COUNT(*) as count FROM workshops');
    if (existingWorkshops[0].count === 0) {
      await pool.query(`
        INSERT INTO workshops (code, name, manager_name, phone, machine_count, operator_count, main_machines, location, status, description) VALUES
        ('X-01', 'Xưởng A (Phay Mazak, Tiện Doosan)', 'Lê Văn Sản Xuất', '0918112233', 5, 8, '3 Máy Phay CNC Mazak VCN-530C, 2 Máy Tiện Doosan Lynx 220', 'Khu xưởng 1 - Nhà A', 'active', 'Chuyên gia công chi tiết phay 4 trục và tiện phôi tròn chính xác cao'),
        ('X-02', 'Xưởng B (Cắt dây EDM & Mài phẳng)', 'Nguyễn Kỹ Thuật', '0988223344', 4, 6, '2 Máy Cắt Dây Sodick AQ327L, 2 Máy Mài Phẳng Okamoto', 'Khu xưởng 2 - Nhà B', 'active', 'Gia công chi tiết khuôn mẫu, rãnh hẹp, dung sai ±0.005mm'),
        ('X-03', 'Xưởng C (Gia công thô, Cưa phôi & Lắp ráp Jig)', 'Trần Đình Cường', '0905334455', 3, 5, '2 Máy Cưa Vòng Amada HFA, 1 Máy Phay Cơ Vạn Năng', 'Khu nhà xưởng thô', 'active', 'Cắt phôi ban đầu, phay thô phá lượng dư và lắp ráp dưỡng kiểm Jig');
      `);
    }

    // 12. Production Steps Table (Quy trình & công đoạn CNC - Thêm, xóa, sửa, cắt bỏ)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS production_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        step_order INT NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        assigned_role VARCHAR(255) DEFAULT '',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [existingSteps] = await pool.query('SELECT COUNT(*) as count FROM production_steps');
    if (existingSteps[0].count === 0) {
      await pool.query(`
        INSERT INTO production_steps (step_order, name, assigned_role, description) VALUES
        (1, 'Cắt phôi', 'Thợ xưởng / Kỹ thuật phôi', 'Cắt phôi thô từ cây/tấm theo kích thước phôi chuẩn'),
        (2, 'Phay CNC mặt chuẩn', 'Thợ máy Phay CNC', 'Phay CNC lấy chuẩn kích thước, phay thô & tinh mặt chuẩn'),
        (3, 'Tiện CNC chi tiết', 'Thợ máy Tiện CNC', 'Tiện CNC biên dạng, tiện ren, rãnh then và dung sai trục'),
        (4, 'Gia công ngoài (Nhiệt luyện/Xi mạ/Anode)', 'Quản đốc xưởng', 'Gửi đối tác xi mạ kẽm, nhiệt luyện tôi cao tần hoặc anode đen cứng'),
        (5, 'Mài phẳng / Khử ba via', 'Thợ nguội', 'Mài phẳng đạt độ bóng bề mặt và khử bavia mép sắc chi tiết'),
        (6, 'Kiểm tra KCS / QC', 'Kỹ sư QC / KCS', 'Đo kiểm dung sai bằng CMM, panme, thước kẹp đạt 100% bản vẽ'),
        (7, 'Hoàn thành & Bàn giao kho', 'Thủ kho / Quản đốc', 'Đóng gói bọc xốp khí, nghiệm thu và nhập kho thành phẩm');
      `);
    }
    // 13. Parts Table (Danh mục chi tiết gia công CNC - Part Catalog)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        drawing_code VARCHAR(100) DEFAULT '',
        material_category VARCHAR(100) DEFAULT 'Thép hợp kim S50C',
        unit VARCHAR(50) DEFAULT 'Cái',
        unit_price_estimate DECIMAL(15,2) DEFAULT 0,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [existingParts] = await pool.query('SELECT COUNT(*) as count FROM parts');
    if (existingParts[0].count === 0) {
      await pool.query(`
        INSERT INTO parts (code, name, drawing_code, material_category, unit, unit_price_estimate, note) VALUES
        ('CT-TRUC-01', 'Trục then hoa truyền động CNC', 'DWG-TH-01', 'Thép S50C tôi cao tần', 'Cái', 450000, 'Gia công tiện + phay then hoa dung sai h6'),
        ('CT-GOIDO-02', 'Gối đỡ vòng bi Nhôm 6061', 'DWG-GB-02', 'Nhôm 6061-T6', 'Cái', 320000, 'Phay CNC 4 mặt chuẩn, anode đen cứng'),
        ('CT-BANHRANG-03', 'Bánh răng nghiêng hợp kim', 'DWG-BR-03', 'Thép SCM440 thấm cacbon', 'Cái', 680000, 'Tiện phôi, phay răng định hình, mài răng'),
        ('CT-BACDAN-04', 'Bạc lót dẫn hướng đồng thau', 'DWG-BL-04', 'Đồng thanh C3604', 'Cái', 185000, 'Tiện chính xác dung sai lỗ H7'),
        ('CT-KHUON-05', 'Tấm khuôn ép nhựa lõi Core', 'DWG-KN-05', 'Thép P20 mài phẳng', 'Bộ', 1850000, 'Phay 3D, cắt dây EDM, nhiệt luyện chân không');
      `);
    }


    // Check if seed data should be inserted (only if SEED_DEMO=true)
    if (process.env.SEED_DEMO === 'true') {
      const [existingMaterials] = await pool.query('SELECT COUNT(*) as count FROM materials');
      if (existingMaterials[0].count === 0) {
        console.log('[Database] Seeding initial CNC materials & realistic demo data...');

      // Seed Materials
      await pool.query(`
        INSERT INTO materials (code, name, category, spec, unit, quantity, min_stock, unit_price, location, batch_no) VALUES
        ('PHOI-AL6061-D50', 'Phôi Nhôm 6061 tròn', 'Phôi kim loại', 'Phi 50mm x L3000mm', 'Cây', 45, 10, 850000, 'Kệ A-01', 'LO-AL-2026-01'),
        ('PHOI-SUS304-D25', 'Phôi Inox 304 láp tròn', 'Phôi kim loại', 'Phi 25mm x L6000mm', 'Cây', 12, 15, 1420000, 'Kệ A-03', 'LO-SUS-2026-03'),
        ('PHOI-S50C-TAM', 'Thép tấm S50C mài 6 mặt', 'Phôi kim loại', 'T25 x W200 x L300mm', 'Khối', 8, 5, 620000, 'Kệ B-02', 'LO-S50C-2026'),
        ('DAO-EM-D6-4F', 'Dao phay ngón hợp kim Endmill D6', 'Dao cụ & Phụ tùng', 'D6 x 50L x 4F TiAlN', 'Cái', 4, 10, 240000, 'Tủ dao C1', 'DAO-D6-01'),
        ('DAO-EM-D10-4F', 'Dao phay ngón hợp kim Endmill D10', 'Dao cụ & Phụ tùng', 'D10 x 75L x 4F TiAlN', 'Cái', 18, 5, 450000, 'Tủ dao C1', 'DAO-D10-02'),
        ('DAO-CHIP-CNMG', 'Mảnh tiện hợp kim CNMG120408', 'Dao cụ & Phụ tùng', 'CNMG120408-MA', 'Hộp', 2, 5, 680000, 'Tủ dao C2', 'CHIP-CNMG-09'),
        ('DAU-COOLANT-200L', 'Dầu tưới nguội pha nước Castrol', 'Vật tư phụ', 'Phuy 200L', 'Lít', 80, 50, 65000, 'Kho hóa chất', 'CAST-2026-X');
      `);

      // Seed Quotations
      await pool.query(`
        INSERT INTO quotations (code, customer_name, customer_phone, part_name, drawing_code, quantity, raw_material_cost, machine_hours, machine_hourly_rate, subcontract_cost, transport_cost, total_amount, status) VALUES
        ('BG-2026-001', 'Công ty Cơ khí Chính xác Sakura', '0912345678', 'Trục truyền động CNC Jig-01', 'DWG-SKR-001', 50, 12500000, 25.5, 350000, 3000000, 500000, 24925000, 'approved'),
        ('BG-2026-002', 'Tập đoàn Chế tạo Máy Alpha Tech', '0988776655', 'Gối đỡ vòng bi Nhôm 6061', 'DWG-ALP-042', 100, 18000000, 40.0, 320000, 4500000, 800000, 36100000, 'converted_to_so'),
        ('BG-2026-003', 'Công ty TNHH Khuôn mẫu Tân Phát', '0903112233', 'Khuôn ép nhựa Core Plate S50C', 'DWG-TP-88', 2, 8500000, 18.0, 400000, 1500000, 300000, 17500000, 'draft');
      `);

      // Seed Sales Orders
      await pool.query(`
        INSERT INTO sales_orders (code, quotation_id, customer_name, part_name, drawing_code, order_qty, machined_qty, delivered_qty, wip_qty, total_price, delivery_deadline, status) VALUES
        ('SO-2026-001', 2, 'Tập đoàn Chế tạo Máy Alpha Tech', 'Gối đỡ vòng bi Nhôm 6061', 'DWG-ALP-042', 100, 70, 40, 30, 36100000, '2026-11-05', 'in_production'),
        ('SO-2026-002', 1, 'Công ty Cơ khí Chính xác Sakura', 'Trục truyền động CNC Jig-01', 'DWG-SKR-001', 50, 50, 50, 0, 24925000, '2026-10-30', 'completed');
      `);

      // Seed Delivery Notes
      await pool.query(`
        INSERT INTO delivery_notes (code, so_id, customer_name, drawing_code, delivery_qty, receiver_name, note) VALUES
        ('XK-2026-001', 1, 'Tập đoàn Chế tạo Máy Alpha Tech', 'DWG-ALP-042', 40, 'Nguyễn Văn Minh (KCS Alpha)', 'Giao đợt 1 kèm CO/CQ phôi và chứng chỉ kiểm tra kích thước 3D CMM'),
        ('XK-2026-002', 2, 'Công ty Cơ khí Chính xác Sakura', 'DWG-SKR-001', 50, 'Trần Hữu Thắng', 'Giao đủ đợt kèm biên bản nghiệm thu đạt 100%');
      `);

      // Seed Production Orders (LSX)
      await pool.query(`
        INSERT INTO production_orders (code, so_id, part_name, drawing_code, target_qty, completed_qty, ng_qty, routing, current_step, status, start_date, end_date) VALUES
        ('LSX-2026-001', 1, 'Gối đỡ vòng bi Nhôm 6061', 'DWG-ALP-042', 100, 70, 2, '["Cắt phôi", "Phay CNC mặt chuẩn", "Tiện CNC lỗ bạc", "Anode nhôm đen ngoài", "Mài/Sửa nguội", "KCS/QC", "Đóng gói"]', 'Anode nhôm đen ngoài', 'running', '2026-10-16', '2026-11-02'),
        ('LSX-2026-002', 2, 'Trục truyền động CNC Jig-01', 'DWG-SKR-001', 50, 50, 1, '["Cắt phôi", "Tiện CNC thô/tinh", "Phay rãnh then", "Nhiệt luyện tôi cao tần", "Mài tròn ngoài", "QC"]', 'QC', 'finished', '2026-10-10', '2026-10-25');
      `);

      // Seed WIP Movements
      await pool.query(`
        INSERT INTO wip_movements (code, production_order_id, from_step, to_step, operator, machine_name, qty_passed, qty_failed, fail_reason) VALUES
        ('WIP-2026-001', 1, 'Cắt phôi', 'Phay CNC mặt chuẩn', 'Nguyễn Văn Tuấn', 'Máy cưa vòng Amada', 100, 0, ''),
        ('WIP-2026-002', 1, 'Phay CNC mặt chuẩn', 'Tiện CNC lỗ bạc', 'Lê Hữu Hoàng', 'Phay Mazak VCN-530C', 98, 2, 'Sai dung sai tâm lỗ trục Z (+0.03mm)'),
        ('WIP-2026-003', 1, 'Tiện CNC lỗ bạc', 'Anode nhôm đen ngoài', 'Trần Đình Cường', 'Tiện Doosan Lynx 220', 70, 0, '');
      `);

      // Seed Subcontracting Orders (Gia công ngoài)
      await pool.query(`
        INSERT INTO subcontracting_orders (code, production_order_id, vendor_name, process_type, part_name, send_qty, received_qty, qc_passed_qty, unit_cost, total_cost, promise_date, status) VALUES
        ('GCN-2026-001', 1, 'Xưởng Anode Kim Phát', 'Anode nhôm cứng hóa đen bề mặt', 'Gối đỡ vòng bi Nhôm 6061', 70, 40, 40, 45000, 3150000, '2026-10-28', 'received'),
        ('GCN-2026-002', 2, 'Công ty Xử lý Nhiệt Đức Minh', 'Nhiệt luyện tôi thể tích HRC 52-55', 'Trục truyền động CNC Jig-01', 50, 50, 50, 60000, 3000000, '2026-10-20', 'settled');
      `);

      // Seed Advances (Đề nghị tạm ứng)
      await pool.query(`
        INSERT INTO advances (code, requester, purpose, amount, status, approved_by) VALUES
        ('TU-2026-001', 'Nguyễn Văn Tuấn (Trưởng xưởng)', 'Mua bổ sung 5 cây phôi Nhôm 6061 gấp cho đơn hàng Alpha Tech', 4250000, 'approved', 'Giám Đốc Kỹ Thuật'),
        ('TU-2026-002', 'Lê Hữu Hoàng (Quản đốc)', 'Tạm ứng phí gửi xử lý bề mặt Anode nhôm tại Xưởng Kim Phát', 2000000, 'approved', 'Kế Toán Trưởng');
      `);

      // Seed Payments (Đề nghị thanh toán)
      await pool.query(`
        INSERT INTO payment_requests (code, recipient, category, gross_amount, deduct_advance_amount, net_amount, status, note) VALUES
        ('TT-2026-001', 'Xưởng Anode Kim Phát', 'Xưởng gia công ngoài', 3150000, 2000000, 1150000, 'paid', 'Thanh toán đợt 1 gia công Anode, đã khấu trừ 2,000,000đ tạm ứng trước đó'),
        ('TT-2026-002', 'Công ty Kim khí Phương Nam', 'NCC Phôi/Vật tư', 14200000, 0, 14200000, 'paid', 'Thanh toán hóa đơn đợt nhập phôi Inox 304');
      `);

      // Seed Debts (Công nợ)
      await pool.query(`
        INSERT INTO debts (partner_name, type, total_amount, paid_amount, remaining_amount, due_date, status) VALUES
        ('Tập đoàn Chế tạo Máy Alpha Tech', 'receivable', 36100000, 15000000, 21100000, '2026-11-20', 'partially_paid'),
        ('Công ty Cơ khí Chính xác Sakura', 'receivable', 24925000, 24925000, 0, '2026-10-31', 'paid'),
        ('Xưởng Anode Kim Phát', 'payable', 3150000, 3150000, 0, '2026-11-05', 'paid'),
        ('Công ty Kim khí Phương Nam', 'payable', 28500000, 14200000, 14300000, '2026-11-15', 'partially_paid');
      `);

      console.log('[Database] Seed data inserted successfully!');
      }
    }

    // Seed default users if empty
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      const defaultPasswordHash = bcrypt.hashSync('123456', 10);
      await pool.query(`
        INSERT INTO users (username, email, password, full_name, role) VALUES
        ('admin', 'admin@cnc.com', ?, 'Nguyễn Văn Quản Trị', 'admin'),
        ('sales', 'sales@cnc.com', ?, 'Trần Thị Kinh Doanh', 'sales'),
        ('production', 'prod@cnc.com', ?, 'Lê Văn Sản Xuất', 'production'),
        ('warehouse', 'kho@cnc.com', ?, 'Hoàng Văn Thủ Kho', 'warehouse'),
        ('accountant', 'ketoan@cnc.com', ?, 'Phạm Thị Kế Toán', 'accountant');
      `, [defaultPasswordHash, defaultPasswordHash, defaultPasswordHash, defaultPasswordHash, defaultPasswordHash]);
      console.log('[Database] Seeded 5 standard CNC-ERP user roles with password: "123456"');
    }

    
    // 14. Operators Table (Thợ máy CNC / Kỹ thuật viên phân xưởng)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        workshop_id INT,
        skill_level VARCHAR(150) DEFAULT 'Thợ đứng máy CNC',
        shift VARCHAR(50) DEFAULT 'Ca 1 (Hành chính)',
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [existingOperators] = await pool.query('SELECT COUNT(*) as count FROM operators');
    if (existingOperators[0].count === 0) {
      await pool.query(`
        INSERT INTO operators (code, name, phone, workshop_id, skill_level, shift, status, notes) VALUES
        ('THO-001', 'Nguyễn Văn Hùng', '0912111222', 1, 'Thợ bậc 5/7 - Đứng máy Phay CNC 4 trục Mazak', 'Ca 1 (Hành chính)', 'active', 'Kinh nghiệm 6 năm, lập trình Mastercam & vận hành phay 4 trục'),
        ('THO-002', 'Trần Quốc Tuấn', '0912333444', 1, 'Thợ bậc 4/7 - Vận hành Tiện CNC Doosan Lynx', 'Ca 1 (Hành chính)', 'active', 'Chuyên tiện thô/tinh dung sai h6, tiện ren các bước phi chuẩn'),
        ('THO-003', 'Lê Văn Đạt', '0912555666', 1, 'Thợ bậc 3/7 - Vận hành Phay Mazak VCN', 'Ca 2 (Chiều/Đêm)', 'active', 'Gá phôi, rà tâm phôi và chạy tinh chi tiết nhôm hàng loạt'),
        ('THO-004', 'Phạm Minh Đức', '0912777888', 1, 'Thợ bậc 6/7 - Trưởng kíp xưởng máy A', 'Ca 1 (Hành chính)', 'active', 'Hiệu chỉnh dao bù mòn, kiểm định đầu ra trước khi bàn giao KCS'),
        ('THO-005', 'Vũ Anh Quân', '0988111222', 2, 'Thợ bậc 5/7 - Kỹ thuật Cắt Dây EDM Sodick', 'Ca 1 (Hành chính)', 'active', 'Chuyên cắt dây rãnh then, biên dạng khuôn mẫu chính xác ±0.005mm'),
        ('THO-006', 'Hoàng Quốc Bảo', '0988333444', 2, 'Thợ bậc 4/7 - Mài phẳng & Mài tròn Okamoto', 'Ca 1 (Hành chính)', 'active', 'Mài đạt độ bóng mặt gương Ra 0.2 và phẳng tuyệt đối'),
        ('THO-007', 'Đỗ Tuấn Kiệt', '0988555666', 2, 'Thợ bậc 3/7 - Thợ phụ Cắt Dây & Xỏ dây', 'Ca 2 (Chiều/Đêm)', 'active', 'Hỗ trợ thay dây đồng 0.25mm, rà phôi và thay nước khử khoáng EDM'),
        ('THO-008', 'Bùi Đình Trọng', '0905111222', 3, 'Thợ bậc 4/7 - Vận hành Máy cưa Amada tự động', 'Ca 1 (Hành chính)', 'active', 'Cắt phôi thanh đặc thép S45C, phôi ống theo đúng kích thước LSX'),
        ('THO-009', 'Ngô Quang Huy', '0905333444', 3, 'Thợ bậc 5/7 - Phay cơ vạn năng & Lắp ráp Jig', 'Ca 1 (Hành chính)', 'active', 'Gia công đồ gá kẹp nhanh, dưỡng kiểm tra và hỗ trợ xưởng thô'),
        ('THO-010', 'Mai Xuân Trường', '0905555666', 3, 'Thợ bậc 3/7 - Vát mép, Khử bavia & Đánh bóng', 'Ca 1 (Hành chính)', 'active', 'Nguội tinh chỉnh, làm sạch bavia sắc sau phay và đóng gói');
      `);
    }

    console.log('[Database] All tables and indexes are ready.');
  } catch (error) {
    console.error('[Database Init Error]:', error.message);
  }
}

module.exports = {
  initializeDatabase,
};
