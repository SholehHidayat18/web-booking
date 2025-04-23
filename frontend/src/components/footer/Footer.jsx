import React from "react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="flex flex-wrap justify-between gap-8">
        {/* LOCATION */}
        <div className="w-full md:w-1/2">
          <h2 className="mb-4">LOCATION</h2>
          <div className="mb-8 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21692.630857637378!2d110.46560230060594!3d-7.032141104028018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708c53a1fbd12f%3A0x764f3182cbd088d9!2sBalai%20Diklat%20BKPP%20Kota%20Semarang!5e0!3m2!1sid!2sid!4v1744866425760!5m2!1sid!2sid"
              width="100%" 
              height="300" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy"
              title="Balai Diklat BKPP Kota Semarang"
            ></iframe>
          </div>
        </div>

        {/* ABOUT US */}
        <div className="w-full md:w-1/2">
          <h2 className="mb-4">ABOUT US</h2>
          <p className="mb-3 leading-7"><strong>Alamat:</strong> Jl. Fatmawati No.73a, Kedungmundu, Kec. Tembalang, Kota Semarang, Jawa Tengah 50273</p>
          <p className="mb-3 leading-7"><strong>Telepon:</strong> (024) 3586680</p>
          <p className="mb-3 leading-7"><strong>Email:</strong> diklat.semarangkota@gmail.com</p>
          <p className="mb-3 leading-7"><strong>WA / SMS:</strong> +62 822-2300-0404</p>

          <div className="mt-4">
            <a href="https://www.instagram.com/bkppkotasemarang?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="mr-4 text-white text-xl">
              <FaInstagram />
            </a>
            <a href="https://x.com/bkppkotasmg" className="mr-4 text-white text-xl">
              <FaX />
            </a>
            <a href="https://www.youtube.com/channel/UCNyinCD3l223jWnHOW9S4CQ" className="text-white text-xl">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 text-center text-sm border-t border-gray-600 pt-4 opacity-80">
        <p>© {new Date().getFullYear()} Balai Diklat BKPP Kota Semarang, All Rights Reserved</p>
        <p>Made With ❤️ By Us, Internship Informatics Dian Nuswantoro University</p>
      </div>
    </footer>
  );
};

export default Footer;
