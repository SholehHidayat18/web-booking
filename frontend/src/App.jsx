import React from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import Wa from "./components/event/wa";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import AllRoutes from "./components/layout/AllRoutes";

function App() {
  const location = useLocation();

  // Tampilkan Navbar hanya di path tertentu
  const showNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Tampilkan Footer hanya di halaman publik
  const showFooter = showNavbar;

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-grow">
        <AllRoutes />
        <Wa />
      </main>
      <Footer />
    </div>
  );
}

export default App;