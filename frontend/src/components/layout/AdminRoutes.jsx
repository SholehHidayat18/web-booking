import React from "react";
import { Outlet } from "react-router-dom";

const AdminRoutes = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;