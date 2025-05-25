import React from "react";
import videoBg from "../../../assets/images/home/hero_bg.mp4";
import { useNavigate } from "react-router";

const Hero = () => {
  const navigate = useNavigate();

  // ... (keep existing handleNavigation function)

  return (
    <div className="relative w-full h-screen text-white">
      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-opacity-60">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* CONTENT WRAPPER - positioned at bottom */}
      <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col">
        {/* Spacer to push content to bottom */}
        <div className="flex-grow"></div>
        
        {/* BOTTOM ROW */}
        <div className="pb-12 md:pb-13 w-full flex flex-col md:flex-row justify-between items-end gap-25">
          {/* TEXT AREA - bottom left */}
          <div className="max-w-xl animate-slide-in-left md:opacity-100 text-start w-full md:-ml-20 pl-2 md:pl-8">
            <h1 className="text-7xl md:text-5xl font-bold font-montserrat mb-6 ">
              Temukan <span className="text-yellow-400 italic">Kemudahan</span> dalam Menyewa Fasilitas
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-open-sans">
              Kami menyediakan layanan penyewaan <strong>gedung pertemuan</strong>, <strong>penginapan</strong>,
              <strong> meeting room</strong>, dan <strong>lapangan</strong> untuk berbagai kebutuhan Anda.
              <em> Praktis, nyaman, dan terpercaya.</em>
            </p>
          </div>

          {/* BUTTON AREA - bottom right */}
        </div>
      </div>
    </div>
  );
};

export default Hero;