import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'CNC-ERP Management System - HTSOFTTECH',
  description: 'Hệ thống Quản lý Sản xuất & Doanh nghiệp Cơ khí Chế tạo CNC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
