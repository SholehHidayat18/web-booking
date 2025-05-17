import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export const AuthProtected = () => {
  const { user, loading } = useContext(UserContext);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading authentication...</p>
    </div>;
  }

  if (user) {
    return <Navigate to={user.is_admin === 1 ? "/admin" : "/client"} replace />;
  }

  return <Outlet />;
};

export const AdminProtected = () => {
  const { user, loading, isAdmin } = useContext(UserContext);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading admin access...</p>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/client" replace />;
  }

  return <Outlet />;
};

export const ClientProtected = () => {
  const { user, loading, isAdmin } = useContext(UserContext);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading client access...</p>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};