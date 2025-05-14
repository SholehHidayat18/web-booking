import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
//import { BookingContext } from "../context/BookingContext";
import { AdminProtected, ClientProtected } from "./ProtectedRoutes";

// Pages & Components
import Home from "../../pages/home/Home";
import Login from "../../pages/home/Login";
import Register from "../../pages/home/Register";
import PlaceList from "../../components/clients/places/PlaceList";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";


// Halaman Admin
import AdminNavbar from "../admin/AdminNavbar";
import AdminDashboard from "../../pages/admin/Dashboard";
import AdminClients from "../../pages/admin/Clients"
import AdminBooking from "../../pages/admin/Bookings"
import AdminFinance from "../../pages/admin/FinanceReport"
import AdminBuilding from "../../pages/admin/BuildingManagement"
import AdminRoom from "../../pages/admin/RoomManagement"
import AdminSquare from "../../pages/admin/SquareManagement"

//Halaman Client
import ClientHome from "../clients/ClientHome";
import PlaceDetail from "../clients/places/placedetail";
import Checkout from "../clients/Checkout";
import Payment from "../clients/Payment";
//import BookingForm from "../../components/booking/BookingForm";


function AllRoutes() {
  const { user } = useContext(UserContext);

  return (
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Admin Protected */}
  <Route path="/admin" element={<AdminProtected />}>
    <Route element={<AdminRoutes />}>
    <Route path="admin-navbar" element={<AdminNavbar />} />
    <Route index element={<AdminDashboard />} />
    
  </Route>
  </Route>

  {/* Client Protected */}
  <Route path="/client" element={<ClientProtected />}>
    <Route element={<ClientRoutes />}>
    <Route index element={<ClientHome />} />
    <Route path="places" element={<PlaceList />} />
    <Route path="places/:id" element={<PlaceDetail />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="payment" element={<Payment />} />
   {/*<Route path="booking/:id" element={<BookingForm />} />
    <Route path="checkout" element={<Checkout />} />
   */ } 
  </Route>
  </Route>

  {/* Fallback */}
  <Route path="*" element={<Navigate to={user ? (user.is_admin === 1 ? "/admin" : "/client") : "/login"} />} />
</Routes>
  );
}

export default AllRoutes;
