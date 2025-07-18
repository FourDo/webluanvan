import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
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
  QLBanner,
  QLBaiBaoEnhanced,
  TrangDichVu,
  TrangVeChungToi,
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
import EditProductEnhanced from "./components/EditProductEnhanced";
import BaiBaoForm from "./components/BaiBaoForm";
import PrivateRoute from "./context/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { CategoryProductProvider } from "./context/CategoryProductContext";
import DashboardContent from "./components/DashboardContent";

// Component để xử lý redirect từ cổng thanh toán
const RedirectHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const apptransid = queryParams.get("apptransid");
  const status = queryParams.get("status");

  useEffect(() => {
    if (apptransid && status === "1") {
      console.log("Redirecting to /hoa-don"); // Debug
      navigate(`/hoa-don${location.search}`, { replace: true });
    }
  }, [apptransid, status, navigate]);

  // Đợi điều hướng, không render TrangChu ngay
  if (apptransid && status === "1") {
    return null; // hoặc spinner, hoặc loading
  }

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
          { index: true, element: <DashboardContent /> },
          { path: "sanpham", element: <QLSanPham /> },
          { path: "sanpham/:productId", element: <ProductDetail /> },
          { path: "sanpham/them", element: <AddProduct /> },
          {
            path: "sanpham/sua/:productId",
            element: <EditProductEnhanced />,
          },
          { path: "donhang", element: <QLDonHang /> },
          { path: "taikhoan", element: <QLTaiKhoan /> },
          { path: "mausac", element: <QLMauSac /> },
          { path: "kichthuoc", element: <QLSize /> },
          { path: "khachhang", element: <QLKhachHang /> },
          { path: "khuyenmai", element: <QLKhuyenMai /> },
          { path: "banner", element: <QLBanner /> },
          { path: "baibao", element: <QLBaiBaoEnhanced /> },
          { path: "baibao/them", element: <BaiBaoForm /> },
          { path: "baibao/sua/:id", element: <BaiBaoForm /> },
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
        element: <RedirectHandler />,
      },
      { path: "/hoa-don", element: <TrangHoaDon /> },
      {
        path: "/sanpham",
        element: <TrangSanPham />,
      },
      {
        path: "/sanpham/:id",
        element: <ChiTietSanPham />,
      },
      {
        path: "/dichvu",
        element: <TrangDichVu />,
      },
      {
        path: "/about-us",
        element: <TrangVeChungToi />,
      },
      {
        path: "/baibao",
        element: <TrangBaiBao />,
      },
      {
        path: "/baibao/:id", // Thêm dòng này
        element: <TrangBaiBao />, // Component chi tiết bài báo
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
    <CategoryProductProvider>
      <AuthProvider>
        <GioHangProvider>
          <RouterProvider router={router} />
        </GioHangProvider>
      </AuthProvider>
    </CategoryProductProvider>
  );
};

export default App;
