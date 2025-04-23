import React from "react";
import "./App.css";
import Wa from "./components/event/wa";
import Footer from "./components/footer/Footer";
import Navbar from "./components/navbar/Navbar";
import AllRoutes from "./components/layout/AllRoutes";

function App() {
  return (
      <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
      <AllRoutes />
      <Wa />
      </main>
      <Footer />
      </div>
  );
}

export default App;
