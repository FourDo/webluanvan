import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  QLKhachHang,
  QLKhuyenMai,
  TrangDichVu,
  TrangBaiBao,
  TrangDangKy,
  TrangDangNhap,
  AdminDangNhap,
  TrangThanhToan,
  TrangProfile,
  TrangQuenMatKhau,
  TrangHoaDon,
  MomoSuccess,
} from "./pages/index";
import AdminPrivateRoute from "./context/AdminPrivateRoute";
import ProductDetail from "./components/ProductDetail";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import PrivateRoute from "./context/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

// Component để xử lý redirect từ cổng thanh toán
const RedirectHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const apptransid = queryParams.get("apptransid");
    const status = queryParams.get("status");

    if (apptransid && status === "1") {
      // Điều hướng đến TrangHoaDon hoặc MomoSuccess với query parameters
      navigate(`/momo-success${location.search}`, { replace: true });
    }
  }, [location.search, navigate]);

  return <TrangChu />;
};

const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen">
    <Outlet />
  </div>
);

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
        element: (
          <AdminPrivateRoute>
            <AdminDashboard />
          </AdminPrivateRoute>
        ),
        children: [
          { index: true, element: <div>Welcome to Admin Dashboard</div> },
          { path: "sanpham", element: <QLSanPham /> },
          { path: "sanpham/:productId", element: <ProductDetail /> },
          { path: "sanpham/them", element: <AddProduct /> },
          { path: "sanpham/sua/:productId", element: <EditProduct /> },
          { path: "donhang", element: <QLDonHang /> },
          { path: "taikhoan", element: <QLTaiKhoan /> },
          { path: "mausac", element: <QLMauSac /> },
          { path: "kichthuoc", element: <QLSize /> },
          { path: "khachhang", element: <QLKhachHang /> },
          { path: "khuyenmai", element: <QLKhuyenMai /> },
          { path: "doanhmuc", element: <QLDoanhMuc /> },
        ],
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <RedirectHandler key={typeof window !== "undefined" ? window.location.search : ""} />,
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
        path: "/quenmatkhau",
        element: <TrangQuenMatKhau />,
      },
      {
        path: "/hoa-don",
        element: <TrangHoaDon />,
      },
      {
        path: "/momo-success",
        element: <MomoSuccess />,
      },
      {
        path: "/thanh-toan",
        element: <TrangThanhToan />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/profile",
            element: <TrangProfile />,
          },
        ],
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GioHangProvider>
        <RouterProvider router={router} />
      </GioHangProvider>
    </AuthProvider>
  );
};

export default App;
