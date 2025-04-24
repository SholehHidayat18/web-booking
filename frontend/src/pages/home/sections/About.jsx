import React from "react";
import { FaHotel, FaUsers, FaTags } from "react-icons/fa";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="w-full flex flex-col items-center gap-20 px-4 py-10">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-2xl flex flex-col items-center text-center gap-6 font-sans">
          <span className="font-my-custom-font text-5xl">Layanan Unggulan Balai Diklat Kota Semarang</span>
          <span className="text-[17px]">
            Balai Diklat Kota Semarang menyediakan berbagai fasilitas yang dapat disewa untuk keperluan pribadi maupun institusi, seperti gedung pertemuan, penginapan, ruang meeting, dan lapangan. Kami siap mendukung kelancaran acara Anda.
          </span>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 justify-center items-center">
        {/* Box 1 */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-sm flex flex-col items-center text-center gap-6 shadow-md p-6 min-h-[350px] justify-center rounded-2xl">
            <div className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] rounded-full text-white text-5xl h-[100px] w-[100px] flex items-center justify-center">
              <FaHotel />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-[#00adfd] to-[#00e3fe] text-transparent bg-clip-text">
              Fasilitas Lengkap
            </span>
            <span className="text-base leading-6">
              Tersedia gedung pertemuan, penginapan yang nyaman, ruang meeting yang representatif, serta lapangan untuk berbagai aktivitas dan acara.
            </span>
          </div>
        </motion.div>

        {/* Box 2 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-sm flex flex-col items-center text-center gap-6 shadow-md p-6 min-h-[350px] justify-center rounded-2xl">
            <div className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] rounded-full text-white text-5xl h-[100px] w-[100px] flex items-center justify-center">
              <FaUsers />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-[#00adfd] to-[#00e3fe] text-transparent bg-clip-text">
              Pelayanan Profesional
            </span>
            <span className="text-base leading-6">
              Dikelola oleh tim yang berpengalaman dari Balai Diklat Kota Semarang, kami memastikan setiap layanan berjalan dengan profesional dan sesuai kebutuhan Anda.
            </span>
          </div>
        </motion.div>

        {/* Box 3 */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="max-w-sm flex flex-col items-center text-center gap-6 shadow-md p-6 min-h-[350px] justify-center rounded-2xl">
            <div className="bg-gradient-to-r from-[#00adfd] via-[#00c6fe] to-[#00e3fe] rounded-full text-white text-5xl h-[100px] w-[100px] flex items-center justify-center">
              <FaTags />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-[#00adfd] to-[#00e3fe] text-transparent bg-clip-text">
              Harga Terjangkau
            </span>
            <span className="text-base leading-6">
              Nikmati fasilitas terbaik dengan harga yang kompetitif, cocok untuk berbagai keperluan acara dan kegiatan Anda.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
