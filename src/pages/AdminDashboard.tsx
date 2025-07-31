import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import AdminNavbar from "../components/AdminNavbar";
import DashboardContent from "../components/DashboardContent";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <main className="flex-1">
          <div className="p-4">
            <Outlet />
            {/* Hiển thị DashboardContent khi ở route dashboard cũ */}
            {location.pathname === "/admin/dashboard" && <DashboardContent />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
