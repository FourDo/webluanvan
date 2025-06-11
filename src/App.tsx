import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { GioHangProvider } from "./context/GioHangContext";
import {
  Navbar,
  Footer,
  TrangChu,
  TrangSanPham,
  ChiTietSanPham,
  GioHang,
  AdminDashboard,
  QLSanPham,
  QLDonHang,
  QLTaiKhoan,
  QLDoanhMuc,
  QLMauSac,
  QLSize,
  QLThongKe,
  QLKhachHang,
  QLKhuyenMai,
  TrangDichVu,
  TrangBaiBao,
  TrangDangKy,
  TrangDangNhap,
  AdminDangNhap,
  TrangThanhToan,
} from "../src/pages/index";
import AdminPrivateRoute from "./components/AdminPrivateRoute";

// Layout component cho các tuyến đường công khai
const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout component cho các tuyến đường admin
const AdminLayout = () => (
  <div className="min-h-screen">
    <Outlet />
  </div>
);

// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dangnhap",
        element: <AdminDangNhap />,
      },
      {
        element: <AdminPrivateRoute />,
        children: [
          {
            path: "", // Đường dẫn /admin sẽ hiển thị AdminDashboard
            element: <AdminDashboard />,
            children: [
              { index: true, element: <div>Welcome to Admin Dashboard</div> },
              { path: "sanpham", element: <QLSanPham /> },
              { path: "donhang", element: <QLDonHang /> },
              { path: "taikhoan", element: <QLTaiKhoan /> },
              { path: "mausac", element: <QLMauSac /> },
              { path: "kichthuoc", element: <QLSize /> },
              { path: "khachhang", element: <QLKhachHang /> },
              { path: "khuyenmai", element: <QLKhuyenMai /> },
              { path: "thongke", element: <QLThongKe /> },
              { path: "doanhmuc", element: <QLDoanhMuc /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <TrangChu />,
      },
      {
        path: "/sanpham",
        element: <TrangSanPham />,
      },
      {
        path: "/san-pham/:id",
        element: <ChiTietSanPham />,
      },
      {
        path: "/dichvu",
        element: <TrangDichVu />,
      },
      {
        path: "/baibao",
        element: <TrangBaiBao />,
      },
      {
        path: "/dangky",
        element: <TrangDangKy />,
      },
      {
        path: "/dangnhap",
        element: <TrangDangNhap />,
      },
      {
        path: "/gio-hang",
        element: <GioHang />,
      },
      {
        path: "/thanh-toan",
        element: <TrangThanhToan />,
      },
    ],
  },
]);

function App() {
  return (
    <GioHangProvider>
      <RouterProvider router={router} />
    </GioHangProvider>
  );
}

export default App;
