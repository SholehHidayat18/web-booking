import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom"; 
import Login from "../../pages/home/Login";
import Home from "../../pages/home/Home";
import Register from "../../pages/home/Register";
import { UserContext } from "./../context/UserContext";
import { BookingContext } from "./../context/BookingContext";
import PlaceList from "../../components/places/PlaceList";
import MainLayout from "../../components/layout/MainLayout";


function AllRoutes() {
    const { user } = useContext(UserContext);
    const { booking } = useContext(BookingContext);
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/places" element={<PlaceList />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default AllRoutes