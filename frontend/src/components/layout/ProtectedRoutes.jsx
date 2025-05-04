import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export const AdminProtected = () => {
  const { user } = useContext(UserContext);
  if (!user) return <Navigate to="/login" />;
  if (user.is_admin !== 1) return <Navigate to="/client" />;
  return <Outlet />;
};

export const ClientProtected = () => {
  const { user } = useContext(UserContext);
  if (!user) return <Navigate to="/login" />;
  if (user.is_admin !== 0) return <Navigate to="/admin" />;
  return <Outlet />;
};

