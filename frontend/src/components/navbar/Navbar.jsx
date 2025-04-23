import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle Menu Mobile
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Scroll Behavior
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Scroll ke section tertentu
  const handleNavigation = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false); // tutup menu mobile setelah klik
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
      } bg-gradient-to-r from-[#800000] via-[#b22222] to-[#ffd700] text-white px-5 py-4 flex justify-between items-center`}
    >
      <div
        className="text-xl font-light cursor-pointer hover:text-gray-300"
        onClick={(e) => handleNavigation(e, "hero")}
      >
        Balai Diklat BKPP Kota Semarang
      </div>

      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } flex-col md:flex md:flex-row gap-4 absolute md:static top-16 right-5 md:top-0 md:right-0 bg-gray-800 md:bg-transparent p-4 md:p-0 rounded md:rounded-none`}
      >
        <a href="#hero" onClick={(e) => handleNavigation(e, "hero")} className="hover:text-gray-300">
          Home
        </a>
        <a href="#aboutus" onClick={(e) => handleNavigation(e, "aboutus")} className="hover:text-gray-300">
          Tentang Kami
        </a>
        <a href="#holidays" onClick={(e) => handleNavigation(e, "holidays")} className="hover:text-gray-300">
          Persewaan
        </a>
        <a href="#contactus" onClick={(e) => handleNavigation(e, "contactus")} className="hover:text-gray-300">
          Hubungi Kami
        </a>
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
            setMenuOpen(false);
          }}
          className="hover:text-gray-300"
        >
          Login
        </a>
      </div>

      <div className="md:hidden flex flex-col gap-1 cursor-pointer" onClick={toggleMenu}>
        <span className="w-6 h-0.5 bg-white"></span>
        <span className="w-6 h-0.5 bg-white"></span>
        <span className="w-6 h-0.5 bg-white"></span>
      </div>
    </nav>
  );
};

export default Navbar;
