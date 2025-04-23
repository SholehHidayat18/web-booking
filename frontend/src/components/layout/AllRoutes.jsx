import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom"; 
import Home from '../../pages/home/Home'
import { UserContext } from "./../context/UserContext";
import { BookingContext } from "./../context/BookingContext";

function AllRoutes() {
    const { user } = useContext(UserContext);
    const { booking } = useContext(BookingContext);
  return (
    <Routes>
      <Route path="/" element={<Home />} />

     
    </Routes>
  )
}

export default AllRoutes