import { Navigate, Outlet } from "react-router-dom";

const AdminPrivateRoute = () => {
  // Kiểm tra xem admin đã đăng nhập chưa
  const adminData = JSON.parse(localStorage.getItem("admin_data") || "{}");
  const isAdminLoggedIn =
    adminData?.vai_tro === "admin" && localStorage.getItem("admin_token");

  return isAdminLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/dangnhap" replace />
  );
};

export default AdminPrivateRoute;
