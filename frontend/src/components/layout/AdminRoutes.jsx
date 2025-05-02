import React from "react";
import { Outlet } from "react-router-dom";
//import AdminDashboard from "../../pages/admin/AdminDashboard";

function AdminRoutes() {
  return (
    <div>
      {/* Bisa tambahkan Navbar khusus admin di sini */}
      <Outlet />
    </div>
  );
}

export default AdminRoutes;
