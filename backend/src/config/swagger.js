const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'CNC-ERP API Documentation',
    version: '1.0.0',
    description: 'Hệ thống Quản lý Doanh nghiệp Cơ khí Chế tạo CNC (ERP) - HTSOFTTECH',
    contact: {
      name: 'HTSOFTTECH Support',
      email: 'minhtienmediaqc@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5002',
      description: 'Development Server (Port 5002)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập token Bearer để xác thực request',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    { name: 'Health', description: 'Kiểm tra trạng thái hệ thống & DB' },
    { name: 'Inventory', description: 'Phân hệ 2: Quản lý Kho & Vật tư, Phôi, Dao cụ, Cảnh báo tồn' },
    { name: 'Sales', description: 'Phân hệ 1: Quản lý Bán hàng, Báo giá CNC, SO, Giao hàng' },
    { name: 'Production', description: 'Phân hệ 3: Sản xuất CNC, Routing, Luân chuyển WIP, Subcontracting' },
    { name: 'Finance', description: 'Phân hệ 4: Tài chính, Đề nghị Tạm ứng, Thanh toán, Công nợ' },
    { name: 'Reports', description: 'Phân hệ 5: Báo cáo Quản trị & Dashboard' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Kiểm tra kết nối dịch vụ & MySQL Database',
        responses: {
          200: {
            description: 'Trạng thái hoạt động bình thường',
          },
        },
      },
    },
    '/api/inventory/materials': {
      get: {
        tags: ['Inventory'],
        summary: 'Danh sách vật tư, phôi kim loại, dao cụ cơ khí',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Thêm vật tư / phôi mới vào kho',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category', 'unit'],
                properties: {
                  code: { type: 'string', example: 'PHOI-AL7075-D60' },
                  name: { type: 'string', example: 'Phôi Nhôm 7075 cây tròn' },
                  category: { type: 'string', example: 'Phôi kim loại' },
                  spec: { type: 'string', example: 'Phi 60mm x L3000mm' },
                  unit: { type: 'string', example: 'Cây' },
                  quantity: { type: 'number', example: 20 },
                  min_stock: { type: 'number', example: 5 },
                  unit_price: { type: 'number', example: 1200000 },
                  location: { type: 'string', example: 'Kệ A-02' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Tạo thành công' } },
      },
    },
    '/api/inventory/materials/alerts/low-stock': {
      get: {
        tags: ['Inventory'],
        summary: 'Cảnh báo vật tư dưới mức tồn kho tối thiểu',
        responses: { 200: { description: 'Thành công' } },
      },
    },
    '/api/inventory/materials/{id}/adjust-stock': {
      post: {
        tags: ['Inventory'],
        summary: 'Nhập / Xuất điều chỉnh số lượng tồn kho',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['changeAmount'],
                properties: {
                  changeAmount: { type: 'number', example: -2, description: 'Số lượng thay đổi (+ nhập, - xuất)' },
                  reason: { type: 'string', example: 'Xuất phôi cho Lệnh sản xuất LSX-01' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Thành công' } },
      },
    },
    '/api/sales/quotations': {
      get: {
        tags: ['Sales'],
        summary: 'Danh sách báo giá cơ khí CNC',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Sales'],
        summary: 'Tạo báo giá theo mã hàng gia công CNC (tự tính tổng chi phí)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_name', 'part_name', 'quantity'],
                properties: {
                  code: { type: 'string', example: 'BG-2026-004' },
                  customer_name: { type: 'string', example: 'Công ty TNHH Cơ khí Tân Á' },
                  customer_phone: { type: 'string', example: '0909123456' },
                  part_name: { type: 'string', example: 'Mặt bích CNC Inox 304' },
                  drawing_code: { type: 'string', example: 'DWG-MB-304' },
                  quantity: { type: 'integer', example: 50 },
                  raw_material_cost: { type: 'number', example: 5000000 },
                  machine_hours: { type: 'number', example: 12 },
                  machine_hourly_rate: { type: 'number', example: 350000 },
                  subcontract_cost: { type: 'number', example: 1500000 },
                  transport_cost: { type: 'number', example: 300000 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Tạo thành công' } },
      },
    },
    '/api/sales/quotations/{id}/convert-to-so': {
      post: {
        tags: ['Sales'],
        summary: 'Chuyển Báo giá thành Đơn đặt hàng (SO) tự động',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 201: { description: 'Tạo SO thành công' } },
      },
    },
    '/api/sales/orders': {
      get: {
        tags: ['Sales'],
        summary: 'Danh sách Đơn đặt hàng (Sales Order - SO)',
        responses: { 200: { description: 'Thành công' } },
      },
    },
    '/api/sales/delivery-notes': {
      get: {
        tags: ['Sales'],
        summary: 'Danh sách Phiếu xuất kho bán hàng / Giao hàng',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Sales'],
        summary: 'Tạo phiếu xuất kho giao hàng (cập nhật tiến độ SO)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_name', 'delivery_qty'],
                properties: {
                  so_id: { type: 'integer', example: 1 },
                  customer_name: { type: 'string', example: 'Tập đoàn Chế tạo Máy Alpha Tech' },
                  drawing_code: { type: 'string', example: 'DWG-ALP-042' },
                  delivery_qty: { type: 'integer', example: 20 },
                  receiver_name: { type: 'string', example: 'Nguyễn Văn Minh' },
                  note: { type: 'string', example: 'Giao đợt 2 kèm chứng chỉ CMM' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/production/orders': {
      get: {
        tags: ['Production'],
        summary: 'Danh sách Lệnh sản xuất (LSX) & Routing công đoạn',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Production'],
        summary: 'Tạo Lệnh sản xuất mới (LSX)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['part_name', 'target_qty'],
                properties: {
                  code: { type: 'string', example: 'LSX-2026-003' },
                  so_id: { type: 'integer', example: 1 },
                  part_name: { type: 'string', example: 'Bạc chặn trục CNC' },
                  drawing_code: { type: 'string', example: 'DWG-BC-01' },
                  target_qty: { type: 'integer', example: 80 },
                  current_step: { type: 'string', example: 'Cắt phôi' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/production/wip-movements': {
      get: {
        tags: ['Production'],
        summary: 'Danh sách phiếu luân chuyển BTP & kiểm tra NG',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Production'],
        summary: 'Tạo phiếu luân chuyển công đoạn & ghi nhận đạt/lỗi (NG)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from_step', 'to_step', 'qty_passed'],
                properties: {
                  production_order_id: { type: 'integer', example: 1 },
                  from_step: { type: 'string', example: 'Phay CNC mặt chuẩn' },
                  to_step: { type: 'string', example: 'Tiện CNC lỗ bạc' },
                  operator: { type: 'string', example: 'Lê Hữu Hoàng' },
                  machine_name: { type: 'string', example: 'Mazak VCN-530C' },
                  qty_passed: { type: 'integer', example: 30 },
                  qty_failed: { type: 'integer', example: 1 },
                  fail_reason: { type: 'string', example: 'Trầy xước bề mặt' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/production/subcontracting': {
      get: {
        tags: ['Production'],
        summary: 'Danh sách phiếu gia công ngoài (Xi mạ, Nhiệt luyện, Anode)',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Production'],
        summary: 'Lập phiếu gửi gia công ngoài (Subcontracting)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vendor_name', 'process_type', 'part_name', 'send_qty'],
                properties: {
                  production_order_id: { type: 'integer', example: 1 },
                  vendor_name: { type: 'string', example: 'Xưởng Mạ Niken Quang Minh' },
                  process_type: { type: 'string', example: 'Mạ Niken hóa học' },
                  part_name: { type: 'string', example: 'Trục truyền động' },
                  send_qty: { type: 'integer', example: 50 },
                  unit_cost: { type: 'number', example: 35000 },
                  promise_date: { type: 'string', format: 'date', example: '2026-11-01' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/finance/advances': {
      get: {
        tags: ['Finance'],
        summary: 'Danh sách phiếu Đề nghị tạm ứng',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Finance'],
        summary: 'Tạo phiếu Đề nghị tạm ứng (mua phôi, gia công ngoài...)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requester', 'purpose', 'amount'],
                properties: {
                  requester: { type: 'string', example: 'Nguyễn Văn Tuấn (Trưởng xưởng)' },
                  purpose: { type: 'string', example: 'Tạm ứng mua dao cụ khẩn cấp' },
                  amount: { type: 'number', example: 3500000 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/finance/payments': {
      get: {
        tags: ['Finance'],
        summary: 'Danh sách Đề nghị thanh toán (có trừ lùi tạm ứng)',
        responses: { 200: { description: 'Thành công' } },
      },
      post: {
        tags: ['Finance'],
        summary: 'Tạo Đề nghị thanh toán cho NCC/Xưởng ngoài',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipient', 'category', 'gross_amount'],
                properties: {
                  recipient: { type: 'string', example: 'Công ty Xử lý Nhiệt Đức Minh' },
                  category: { type: 'string', example: 'Xưởng gia công ngoài' },
                  gross_amount: { type: 'number', example: 3000000 },
                  deduct_advance_amount: { type: 'number', example: 1000000 },
                  note: { type: 'string', example: 'Thanh toán nhiệt luyện đợt 2' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Thành công' } },
      },
    },
    '/api/finance/debts': {
      get: {
        tags: ['Finance'],
        summary: 'Danh sách công nợ phải thu (KH) & phải trả (NCC, Xưởng ngoài)',
        responses: { 200: { description: 'Thành công' } },
      },
    },
    '/api/reports/dashboard': {
      get: {
        tags: ['Reports'],
        summary: 'Dữ liệu tổng hợp Dashboard quản trị (KPIs, tồn kho, tiến độ, tỷ lệ lỗi)',
        responses: { 200: { description: 'Thành công' } },
      },
    },
  },
};

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
}

module.exports = {
  setupSwagger,
};
