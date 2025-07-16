import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import AdminNavbar from "../components/AdminNavbar";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
