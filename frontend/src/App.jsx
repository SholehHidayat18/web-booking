import React from "react";
import "./App.css";
import Wa from "./components/event/wa";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import AllRoutes from "./components/layout/AllRoutes";
import AdminRoutes from "./components/layout/AdminRoutes";

function App() {
  return (
      <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
      <AdminRoutes />
      <AllRoutes />
      <Wa />
      </main>
      <Footer />
      </div>
  );
}

export default App;
