import React from "react";
import "./App.css";
import Wa from "./components/event/wa";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import AllRoutes from "./components/layout/AllRoutes";
import AdminRoutes from "./components/layout/AdminRoutes";

function App() {
  return (
    <div className="app">
      <Navbar />
      <AdminRoutes />
      <AllRoutes />
      <Wa />
      <Footer />
    </div>
  );
}

export default App;
