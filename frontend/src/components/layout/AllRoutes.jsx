import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProtected, AdminProtected, ClientProtected } from "./ProtectedRoutes";

// Public Components
import Home from "../../pages/home/Home";
import Login from "../../pages/home/Login";
import Register from "../../pages/home/Register";

// Admin Components
import AdminRoutes from "../layout/AdminRoutes";
import AdminDashboard from "../../pages/admin/Dashboard";

// Client Components
import ClientRoutes from "../layout/ClientRoutes";
import ClientHome from "../clients/ClientHome";
import PlaceList from "../clients/places/PlaceList";
import PlaceDetail from "../clients/places/PlaceDetail";
import Checkout from "../clients/Checkout";
import Payment from "../clients/Payment";

function AllRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Auth Protected (Only for non-authenticated users) */}
      <Route element={<AuthProtected />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminProtected />}>
      <Route path="" element={<AdminRoutes />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Route>


      {/* Client Protected Routes */}
      <Route path="/client" element={<ClientProtected />}>
        <Route element={<ClientRoutes />}>
          <Route index element={<ClientHome />} />
          <Route path="places" element={<PlaceList />} />
          <Route path="places/:id" element={<PlaceDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          {/* Tambahkan route client lainnya di sini */}
        </Route>
      </Route>
    </Routes>
  );
}

export default AllRoutes;