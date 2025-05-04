import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function ClientRoutes() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default ClientRoutes;
