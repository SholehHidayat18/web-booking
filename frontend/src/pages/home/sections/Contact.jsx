import React, { useState } from "react";
import axios from "axios";
import { useLoading } from "../../../components/context/LoadingContext";
import { useToast } from "../../../components/context/ToastContext";
import Video from "../../../assets/images/home/video.mp4";

const Contact = () => {
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, mobile, message } = formData;
    if (!email || !mobile || !message) return "Semua kolom harus diisi!";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Email tidak valid!";
    if (!/^\d{10}$/.test(mobile))
      return "Nomor HP harus 10 digit!";
    if (message.trim().length < 10 || message.trim().length > 500)
      return "Pesan harus antara 10–500 karakter!";
    return null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    startLoading();
    const error = validateForm();
    if (error) {
      showToast({ type: "error", message: error });
      stopLoading();
      return;
    }

    try {
      const response = await axios.post("/api/contact", formData);
      if (response.status === 200 || response.data.status === "success") {
        showToast({ type: "success", message: "Pesan berhasil dikirim!" });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          message: "",
        });
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Gagal mengirim pesan",
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        message: err.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen font-sans">
      <div className="relative w-full md:w-1/2 h-96 md:h-auto">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0 bg-opacity-70"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={Video} type="video/mp4" />
          Browser Anda tidak mendukung video.
        </video>
        <div className="relative z-10 bg-black bg-opacity-50 text-white h-full p-10 flex flex-col text-start justify-end space-y-4">
          <h2 className="text-2xl font-bold">BALAI DIKLAT</h2>
          <p className="text-sm leading-relaxed">
            Tanpa harus pusing cari-cari tempat terpisah,
            Tanpa harus khawatir soal kenyamanan dan fasilitas.
            Sebab kami tahu, kamu ingin fokus pada yang terpenting:
            Kesuksesan acaramu.
          </p>
          <div className="flex space-x-4 text-lg">
            <i className="fa-brands fa-twitter cursor-pointer" />
            <i className="fa-brands fa-facebook cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="w-full md:w-3/5 bg-white px-10 py-16 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-2">Hubungi Kami</h2>
        <p className="text-sm text-gray-600 mb-6">
          24/7 Kami akan menjawab pertanyaan dan masalah Anda
        </p>
        <form className="space-y-4" onSubmit={handleSend}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="Nama Depan"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nama Belakang"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
          <input
            type="number"
            name="mobile"
            placeholder="No.HP"
            value={formData.mobile}
            onChange={handleInputChange}
            onInput={(e) => {
              if (e.target.value.length > 10)
                e.target.value = e.target.value.slice(0, 10);
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
          <textarea
            name="message"
            placeholder="Isi Keluhanmu"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm min-h-[120px] resize-none"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-md text-sm transition"
          >
            Kirim Pesan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
