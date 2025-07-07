import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

const AdminPrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  console.log("AdminPrivateRoute - isAdmin:", isAdmin); // Debug
  return isAdmin ? <>{children}</> : <Navigate to="/admin/dangnhap" replace />;
};

export default AdminPrivateRoute;
