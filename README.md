# CNC-ERP SYSTEM - HTSOFTTECH
> Hệ thống Quản lý Sản xuất & Doanh nghiệp Cơ khí Chế tạo CNC Chính xác

---

## 🌟 Kiến trúc Tổng thể & Công nghệ

### 1. Frontend (`frontend/`)
- **Framework**: Next.js 16.4.1 & React 19 (Turbopack chạy tại cổng **`3001`**).
- **Styling & UI**: Tailwind CSS v3.4, PostCSS, Autoprefixer, Lucide React icons.
- **Báo cáo**: Thư viện SheetJS (`xlsx`) xuất/nhập Excel báo cáo kinh doanh, tồn kho và KPI.
- **Components tái sử dụng**:
  - `frontend/src/components/ui/`: `Button`, `Modal`, `Table`, `Badge`, `Card`, `StatCard`, `Input`, `Select`.
  - `frontend/src/components/modules/`:
    - `SalesModule.jsx` (Phân hệ 1: Bán hàng, Báo giá CNC, Đơn hàng SO, Giao hàng).
    - `InventoryModule.jsx` (Phân hệ 2: Kho & Vật tư, Phôi nhôm/thép/inox, Dao cụ, Cảnh báo thiếu).
    - `ProductionModule.jsx` (Phân hệ 3: Sản xuất CNC, Routing, Luân chuyển WIP & Lỗi NG, Subcontracting xi mạ/nhiệt luyện/anode).
    - `FinanceModule.jsx` (Phân hệ 4: Tài chính, Đề nghị Tạm ứng, Thanh toán khấu trừ tạm ứng, Sổ công nợ).
    - `ReportsModule.jsx` (Phân hệ 5: Báo cáo Quản trị & Dashboard KPIs).
- **API Client**: `frontend/src/api.js` bọc `fetch` gốc, tự động đính kèm Bearer token, hỗ trợ GET/POST/PUT/PATCH/DELETE và chuẩn hóa lỗi phản hồi.

### 2. Backend (`backend/`) - Kiến trúc phân lớp chuẩn (Layered Architecture)
Chạy trên cổng **`5002`** với cấu trúc đúng chuẩn tài liệu thiết kế:
1. **Routes (`src/routes/`)**: Định nghĩa các endpoint API và gắn middleware xác thực/kiểm tra.
2. **Middleware (`src/middlewares/`)**: Xác thực JWT/Bearer token (`auth.middleware.js`), kiểm tra dữ liệu đầu vào (`validate.middleware.js`).
3. **Controllers (`src/controllers/`)**: Nhận request, gọi service xử lý và trả response chuẩn JSON.
4. **Services (`src/services/`)**: Xử lý logic nghiệp vụ CNC (tính toán chi phí báo giá, chuyển báo giá thành SO, trừ tồn kho, luân chuyển công đoạn, khấu trừ tạm ứng, tổng hợp KPI).
5. **Repositories (`src/repositories/`)**: Đóng gói các câu truy vấn MySQL thông qua `mysql2/promise`.
6. **Core & Infrastructure (`src/config/`)**: Cấu hình MySQL Pool (`db.js`), Khởi tạo schema và nạp dữ liệu mẫu tự động (`initDb.js`), Swagger UI OpenAPI 3.0 (`swagger.js`).

---

## 📖 Swagger API Documentation (swg)

Tài liệu tương tác OpenAPI / Swagger UI được tích hợp sẵn tại:
👉 **[http://localhost:5002/api-docs](http://localhost:5002/api-docs)**

Hỗ trợ kiểm thử trực tiếp tất cả các phân hệ:
- `/api/health`: Kiểm tra tình trạng server & kết nối MySQL.
- `/api/inventory/*`: Quản lý kho, phôi, dao cụ, cảnh báo tồn kho tối thiểu, điều chỉnh xuất nhập.
- `/api/sales/*`: Lập báo giá CNC, chuyển tự động sang Đơn đặt hàng (SO), tạo phiếu xuất kho giao hàng.
- `/api/production/*`: Quản lý Lệnh sản xuất (LSX), Luân chuyển BTP & ghi nhận lỗi NG, Gia công ngoài (Subcontracting).
- `/api/finance/*`: Đề nghị tạm ứng, Đề nghị thanh toán (khấu trừ tạm ứng), Sổ công nợ đối tác.
- `/api/reports/dashboard`: Dữ liệu tổng hợp KPI sản xuất, tài chính và tồn kho thời gian thực.

---

## 🗄️ Cơ sở dữ liệu MySQL (`cnc_erp`)

Hệ thống đã tự động tạo và khởi tạo dữ liệu mẫu thực tế cho các bảng:
- `materials`: Kho phôi kim loại (Nhôm 6061, Inox 304, Thép S50C), Dao phay ngón Endmill, Chip tiện, Dầu tưới nguội.
- `quotations`: Báo giá gia công chi tiết CNC (chi phí phôi, giờ chạy máy, gia công ngoài, vận chuyển).
- `sales_orders`: Đơn đặt hàng SO (theo dõi số lượng đặt, đã gia công, đã giao, dở dang WIP).
- `delivery_notes`: Phiếu xuất kho bán hàng / biên bản bàn giao kèm mã bản vẽ.
- `production_orders`: Lệnh sản xuất (LSX) kèm routing công đoạn chuẩn CNC.
- `wip_movements`: Phiếu luân chuyển BTP giữa các tổ máy, ghi nhận đạt & lỗi phế phẩm (NG).
- `subcontracting_orders`: Phiếu gửi gia công ngoài (Anode nhôm, Nhiệt luyện tôi thể tích, Xi mạ...).
- `advances`: Đề nghị tạm ứng nội bộ có phê duyệt.
- `payment_requests`: Đề nghị thanh toán cho nhà cung cấp / xưởng ngoài.
- `debts`: Sổ quản lý công nợ phải thu & phải trả.

---

## 🚀 Khởi chạy hệ thống

### Backend (Port 5002)
```bash
cd backend
npm run dev
```

### Frontend (Port 3001 với Turbopack)
```bash
cd frontend
npm run dev
```

Truy cập ứng dụng tại: **[http://localhost:3001](http://localhost:3001)**