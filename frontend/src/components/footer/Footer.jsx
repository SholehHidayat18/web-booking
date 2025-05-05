import React from "react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Content - Side by Side Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Map Section (Left) */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-mono mb-4">LOCATION</h2> {/* Diperkecil dari text-xl */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21692.630857637378!2d110.46560230060594!3d-7.032141104028018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708c53a1fbd12f%3A0x764f3182cbd088d9!2sBalai%20Diklat%20BKPP%20Kota%20Semarang!5e0!3m2!1sid!2sid!4v1744866425760!5m2!1sid!2sid"
                width="100%" 
                height="400"
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy"
                title="Balai Diklat BKPP Kota Semarang"
              ></iframe>
            </div>
          </div>

          {/* About Section (Right) - Font lebih kecil */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-mono mb-4">ABOUT US</h2> {/* Diperkecil dari text-xl */}
            <div className="space-y-4 font-mono text-center "> {/* Diperkecil dari text-base */}
              <p className="flex items-start min-w-[70px] text-lg text-start">
                <strong>Alamat : </strong> {/* Diperkecil */}
                <span> Jl. Fatmawati No.73a, Kedungmundu,Kec. Tembalang, <br/>
                  Kota Semarang, Jawa Tengah 50273</span>
              </p>
              <p className="flex items-start min-w-[70px] text-lg">
                <strong>Telepon : </strong> 
                <span >  (024) 3586680</span>
              </p>
              <p className="flex items-start min-w-[70px] text-lg">
                <strong >Email : </strong> 
                <span> diklat.semarangkota@gmail.com</span>
              </p>
              <p className="flex items-start min-w-[70px] text-lg">
                <strong >WA/SMS : </strong> 
                <span> +62 822-2300-0404</span>
              </p>
            </div>

            {/* Social Media */}
            <div className="mt-6 flex space-x-4">
            <a 
              href="https://www.instagram.com/bkppkotasemarang?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors text-xl"><FaInstagram /></a>
            <a 
              href="https://x.com/bkppkotasmg"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors text-xl"><FaX/></a>
            <a 
              href="https://www.youtube.com/channel/UCNyinCD3l223jWnHOW9S4CQ"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-400 transition-colors text-xl"><FaYoutube/></a>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Font lebih kecil */}
        <div className="mt-8 pt-4 border-t-2 border-gray-800 text-center px-10 text-sm text-gray-400"> {/* Diperkecil dari text-sm */}
          <p>© {new Date().getFullYear()} Balai Diklat BKPP Kota Semarang, All Rights Reserved</p>
          <p className="mt-1">Made With ❤️ By Internship Informatics Dian Nuswantoro University</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;