import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../../../components/context/DataContext";
import { useNavigate } from "react-router";
import { BookingContext } from "../../../components/context/BookingContext";
import { UserContext } from "../../../components/context/UserContext";
import ToolTip from "../../../components/tooltip/ToolTip";
import axios from "axios";
import { motion } from "framer-motion";


const Booking = () => {
  const { places } = useContext(DataContext);
  const { updateBooking } = useContext(BookingContext);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (places && places.length > 0) {
      setIsLoading(false);
    }
  }, [places]);

  return (
    <section className="w-full flex flex-col items-center gap-4 mt-[-70px]">
      <div className="max-w-[868px] flex flex-col items-center text-center gap-8">
        <span className="font-my-custom-font text-[40px]">Jenis Persewaan Balai Diklat</span>
        <span className="text-[20px] font-serif text-balance text-slate-800">
          "Bangun suasana, ukir kenangan. Dengan ruang yang luas, fasilitas modern, dan pelayanan ramah, 
          gedung kami siap menjadi saksi setiap detik kebahagiaan yang kamu ciptakan bersama keluarga, sahabat, dan kolega."
        </span>
      </div>

      {isLoading ? (
        <ToolTip message="Please wait a moment.">
          <button
            disabled
            className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] text-white text-sm px-6 py-3 rounded font-bold uppercase tracking-wider relative overflow-hidden bg-[length:200%_100%] animate-[gradientShift_3s_linear_infinite]"
          >
            Please wait a moment
          </button>
        </ToolTip>
      ) : (
        <button
          className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] text-white text-sm px-6 py-3 rounded font-bold uppercase tracking-wider relative overflow-hidden bg-[length:200%_100%] animate-[gradientShift_3s_linear_infinite] hover:scale-110 transition-transform duration-200"
          onClick={() => navigate("/login")}
        >
          Explore More
        </button>
      )}

      <div className="flex gap-4 items-center flex-wrap justify-center">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-[#f3f3f3] rounded w-[380px] h-[440px]"
              >
                <div className="w-full h-[250px] bg-[#e0e0e0] rounded relative overflow-hidden">
                  <div className="absolute top-0 left-[-150%] w-1/2 h-full bg-white/50 transform skew-x-[-12deg] animate-[shine_2s_infinite]" />
                </div>
                <div className="mt-10 w-4/5 h-[30px] bg-[#d0d0d0] rounded" />
                <div className="mt-5 w-3/5 h-[20px] bg-[#d0d0d0] rounded" />
                <div className="flex justify-evenly w-full mt-8">
                  <div className="w-1/3 h-[40px] bg-[#d0d0d0] rounded" />
                  <div className="w-1/3 h-[40px] bg-[#d0d0d0] rounded" />
                </div>
              </div>
            ))
          : places.slice(0, 6).map((place) => (
            <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div
            key={place.id}
            className="w-[350px] flex flex-col items-center text-center gap-8 shadow-md justify-center rounded-[20px] overflow-hidden bg-white pb-5"
          >
            <img
              src={`http://localhost:5000${place.image_url}`}
              alt={place.place_name}
              className="w-full h-[260px] object-cover opacity-90"
            />
            <span className="font-sans text-[30px]"> {place.place_name.toUpperCase()}</span>
            <div className="text-[16px] flex w-full justify-around items-center">
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm">Harga Starts from</span>
                <span className="text-[20px]">
                  Rp. {Number(place.price).toLocaleString("id-ID")}/Hari
                </span>
              </div>
              <button
                className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] rounded-full text-white w-[100px] py-3 font-bold hover:border hover:border-blue-500 hover:py-[13px]"
                onClick={() => {
                  updateBooking({ place: place.id });
                  updateUser({
                    location: place.place_name.trim().split(" ").pop(),
                  });
                  navigate("/login");
                }}
              >
                Pesan
              </button>
            </div>
          </div>
          </motion.div>
            ))}
            
      </div>
    </section>
  );
};

export default Booking;
