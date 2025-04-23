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
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* VIDEO BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full z-[-2]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoBg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[-1]" />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* TEXT AREA */}
        <div className="max-w-xl animate-slide-in-left opacity-0 md:opacity-100 md:animate-none">
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-6 leading-tight">
            Temukan <span className="text-yellow-400 italic">Kemudahan</span> dalam Menyewa Fasilitas
          </h1>
          <p className="text-lg md:text-xl leading-relaxed font-open-sans text-justify">
            Kami menyediakan layanan penyewaan <strong>gedung pertemuan</strong>, <strong>penginapan</strong>,
            <strong> meeting room</strong>, dan <strong>lapangan</strong> untuk berbagai kebutuhan Anda.
            <em> Praktis, nyaman, dan terpercaya.</em>
          </p>
        </div>

        {/* BUTTON AREA */}
        <div className="animate-slide-in-right opacity-0 md:opacity-100 md:animate-none">
          <button
            className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] hover:from-[#00c6fe] hover:to-[#00adfd] transition-all duration-300 ease-in-out rounded-full text-white py-3 px-8 font-bold font-open-sans shadow-lg"
            onClick={(e) => handleNavigation(e, "aboutus")}
          >
            Pelajari Lebih Lanjut
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
