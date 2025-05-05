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
import AdminDashboard from "../../pages/admin/Dashboard";
import AdminClients from "../../pages/admin/Clients"
import AdminBooking from "../../pages/admin/Bookings"
import AdminFinance from "../../pages/admin/FinanceReport"
import AdminBuilding from "../../pages/admin/BuildingManagement"
import AdminRoom from "../../pages/admin/RoomManagement"
import AdminSquare from "../../pages/admin/SquareManagement"

//Halaman Client
import ClientHome from "../clients/clienthome";
import PlaceDetail from "../clients/places/placedetail";
//import BookingForm from "../../components/booking/BookingForm";
//import Checkout from "../../components/booking/Checkout";
//import Payment from "../../components/booking/Payment";

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
    <Route index element={<AdminDashboard />} />
    <Route path="clients" element={<AdminClients />} />
    <Route path="booking" element={<AdminBooking />} />
    <Route path="finance" element={<AdminFinance />} />
    <Route path="building" element={<AdminBuilding />} />
    <Route path="room" element={<AdminRoom />} />
    <Route path="square" element={<AdminSquare />} />
  </Route>
  </Route>

  {/* Client Protected */}
  <Route path="/client" element={<ClientProtected />}>
    <Route element={<ClientRoutes />}>
    <Route index element={<ClientHome />} />
    <Route path="places" element={<PlaceList />} />
    <Route path="places/:id" element={<PlaceDetail />} />
   {/*<Route path="booking/:id" element={<BookingForm />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="payment" element={<Payment />} />*/ } 
  </Route>
  </Route>

  {/* Fallback */}
  <Route path="*" element={<Navigate to={user ? (user.is_admin === 1 ? "/admin" : "/client") : "/login"} />} />
</Routes>
  );
}

export default AllRoutes;
