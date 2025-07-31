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
  AdminProfile,
  QLSanPham,
  QLDonHang,
  QLTaiKhoan,
  QLDoanhMuc,
  QLMauSac,
  QLSize,
  QLKhachHang,
  QLKhuyenMai,
  QLSuKien,
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
import AdvancedReports from "./components/AdvancedReports";
import SmartChatBox from "./components/SmartChatBox";

// Component để xử lý redirect từ cổng thanh toán
const RedirectHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);

  // VNPay parameters
  const vnp_TxnRef = queryParams.get("vnp_TxnRef"); // Mã đơn hàng
  const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
  const vnp_TransactionStatus = queryParams.get("vnp_TransactionStatus");

  // MoMo parameters
  const apptransid = queryParams.get("apptransid");
  const status = queryParams.get("status");

  // ZaloPay parameters
  const app_trans_id = queryParams.get("app_trans_id");
  const zp_status = queryParams.get("status"); // ZaloPay cũng dùng status

  useEffect(() => {
    // Xử lý VNPay callback
    if (
      vnp_TxnRef &&
      vnp_ResponseCode === "00" &&
      vnp_TransactionStatus === "00"
    ) {
      console.log(
        "VNPay payment successful, redirecting to invoice with order ID:",
        vnp_TxnRef
      );
      navigate(`/hoa-don?orderId=${vnp_TxnRef}&paymentMethod=vnpay`, {
        replace: true,
      });
      return;
    }

    // Xử lý VNPay thất bại
    if (
      vnp_TxnRef &&
      (vnp_ResponseCode !== "00" || vnp_TransactionStatus !== "00")
    ) {
      console.log("VNPay payment failed");
      navigate(`/thanh-toan?error=payment_failed&orderId=${vnp_TxnRef}`, {
        replace: true,
      });
      return;
    }

    // Xử lý ZaloPay callback
    if (app_trans_id) {
      console.log("ZaloPay callback detected, order ID:", app_trans_id);
      // Giả sử ZaloPay trả về status = 1 khi thành công
      if (zp_status === "1") {
        navigate(`/hoa-don?orderId=${app_trans_id}&paymentMethod=zalopay`, {
          replace: true,
        });
      } else {
        navigate(`/thanh-toan?error=payment_failed&orderId=${app_trans_id}`, {
          replace: true,
        });
      }
      return;
    }

    // Xử lý MoMo callback
    if (apptransid && status === "1") {
      console.log("MoMo payment successful, redirecting to invoice");
      navigate(`/hoa-don?orderId=${apptransid}&paymentMethod=momo`, {
        replace: true,
      });
      return;
    }
  }, [
    vnp_TxnRef,
    vnp_ResponseCode,
    vnp_TransactionStatus,
    apptransid,
    app_trans_id,
    zp_status,
    status,
    navigate,
    location.search,
  ]);

  // Đợi điều hướng, không render TrangChu ngay
  if (
    (vnp_TxnRef && vnp_ResponseCode) ||
    (apptransid && status) ||
    app_trans_id
  ) {
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
    {/* Hiển thị Footer nếu không phải trang admin */}
    {/* Bạn có thể cần logic xác định isAdminRoute nếu muốn ẩn Footer ở trang admin */}
    <Footer />
    <SmartChatBox />
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
          { index: true, element: <AdvancedReports /> },
          { path: "dashboard", element: <DashboardContent /> },
          { path: "profile", element: <AdminProfile /> },
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
          { path: "banner", element: <QLSuKien /> },
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
