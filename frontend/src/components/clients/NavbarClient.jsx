import React from "react";
import Logo from "../../assets/images/LogoJateng.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // jangan lupa import ini

const NavbarClient = () => {
  const fullName = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user")).full_name
    : "Pengunjung";
    
  const navigate = useNavigate();
  const { logout } = useUser(); // pakai logout dari context

  const handleLogout = () => {
    logout(); // pake context logout
    navigate("/login");
  };

  return (
    <nav className="w-full flex items-center justify-between bg-gradient-to-r from-red-700 to-amber-500 p-4 text-white">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="Logo" className="w-10 h-10" />
        <h1 className="text-xl font-thin">Balai Diklat BKPP Kota Semarang</h1>
      </div>
      <div className="flex items-center gap-4">
        <span>
          Selamat Datang, <strong>{fullName}</strong>
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-green-700 text-white rounded-lg  px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarClient;
