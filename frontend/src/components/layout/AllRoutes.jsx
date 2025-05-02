import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../../pages/home/Login";
import Home from "../../pages/home/Home";
import Register from "../../pages/home/Register";
import { UserContext } from "../context/UserContext";
import { BookingContext } from "../context/BookingContext";
import PlaceList from "../../components/places/PlaceList";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";
//import AdminDashboard from "../../pages/admin/AdminDashboard";

function AllRoutes() {
  const { user } = useContext(UserContext);
  const { booking } = useContext(BookingContext);

  return (
    <Routes>
      {/* Routing default */}
      <Route path="/" element={<ClientRoutes />}>
        <Route index element={<Home />} />
        <Route path="places" element={<PlaceList />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Kalau udah login dan user.is_admin */}
      {user && user.is_admin === 1 && (
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<AdminDashboard />} />
          {/* Tambahkan route admin lainnya */}
        </Route>
      )}

      {/* Kalau non-admin redirect ke home */}
      {user && user.is_admin === 0 && (
        <Route path="/dashboard" element={<ClientRoutes />}>
          <Route index element={<Home />} />
        </Route>
      )}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AllRoutes;
