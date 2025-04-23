import React from "react";
import videoBg from "../../../assets/images/home/Bg.mp4";
import { useNavigate } from "react-router";

const Hero = () => {
  const navigate = useNavigate();

  const handleNavigation = (e, sectionId) => {
    e.preventDefault();

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (window.location.pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");
      setTimeout(scrollToSection, 300);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-2]"
      >
        <source src={videoBg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* BLACK OVERLAY */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[-1]" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-6 md:px-12 max-w-7xl mx-auto gap-12">
        {/* TEXT AREA */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-6 leading-tight">
            Temukan <span className="text-yellow-400 italic">Kemudahan</span> dalam Menyewa Fasilitas
          </h1>
          <p className="text-lg md:text-xl font-open-sans text-justify">
            Kami menyediakan layanan penyewaan <strong>gedung pertemuan</strong>, <strong>penginapan</strong>,
            <strong> meeting room</strong>, dan <strong>lapangan</strong> untuk berbagai kebutuhan Anda.
            <em> Praktis, nyaman, dan terpercaya.</em>
          </p>
        </div>

        {/* BUTTON AREA */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <button
            className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] hover:from-[#00c6fe] hover:to-[#00adfd] transition-all duration-300 ease-in-out rounded-full text-white py-3 px-8 font-bold font-open-sans shadow-lg"
            onClick={(e) => handleNavigation(e, "aboutus")}
          >
            Pelajari Lebih Lanjut
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
