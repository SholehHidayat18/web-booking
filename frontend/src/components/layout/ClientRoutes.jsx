import React from "react";
import { Outlet } from "react-router-dom";


function ClientRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default ClientRoutes;
