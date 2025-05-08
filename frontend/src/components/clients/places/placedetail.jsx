import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaHeart,
  FaFacebook,
  FaTwitter,
  FaPinterest,
  FaInstagram,
} from "react-icons/fa";
import NavbarClient from "../NavbarClient";
import FloatingTotal from "../FloatingTotal";

const API_URL = "http://localhost:5000/api/v1";

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await axios.get(`${API_URL}/places/${id}`);
        setPlace(response.data.data);
        setCurrentImage(`http://localhost:5000${response.data.data.image_url}`);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlace();
  }, [id]);

  const handleBooking = (price, quantity) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if (isNaN(diffDays) || diffDays < 1) {
      alert("Silakan pilih rentang tanggal minimal 1 hari.");
      return;
    }

    const subtotal = price * quantity * diffDays;
    setTotalPrice(subtotal);
  };

  if (!place) return <div className="text-center mt-20">Memuat data...</div>;

  return (
    <>
      <NavbarClient />
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
        <div>
          <img
            src={currentImage}
            alt={place.place_name}
            className="rounded-2xl w-full h-[480px] object-cover"
          />

          <div className="flex gap-3 mt-5">
            {/* Gambar utama */}
            <img
              onClick={() =>
                setCurrentImage(`http://localhost:5000${place.image_url}`)
              }
              src={`http://localhost:5000${place.image_url}`}
              alt=""
              className={`w-24 h-24 object-cover rounded-lg cursor-pointer ${
                currentImage === `http://localhost:5000${place.image_url}`
                  ? "border-2 border-green-600"
                  : "border"
              }`}
            />

            {/* Thumbnail tambahan */}
            {place.images.map((img, i) => (
              <img
                key={i}
                onClick={() =>
                  setCurrentImage(`http://localhost:5000${img.image_url}`)
                }
                src={`http://localhost:5000${img.image_url}`}
                alt=""
                className={`w-24 h-24 object-cover rounded-lg cursor-pointer ${
                  currentImage === `http://localhost:5000${img.image_url}`
                    ? "border-2 border-green-600"
                    : "border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-lg text-blue-600 mb-4 hover:underline"
          >
            &larr; Kembali
          </button>

          <h1 className="text-3xl font-my-custom-font mb-2">
            {place.place_name.toUpperCase()}
          </h1>

          <p className="text-2xl text-green-700 font-semibold mb-3">
            Rp {parseInt(place.price).toLocaleString("id-ID")}/Hari
          </p>

          {/* Rating & Wishlist */}
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
              <span className="text-gray-600 text-sm">(0 ulasan)</span>
              <button className="flex items-center gap-2 text-green-600 hover:underline">
                <FaHeart /> Wishlist
              </button>
            </div>
          </div>

          <p className="text-gray-700 text-balance leading-relaxed mb-6">
            {place.description}
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <label className="block font-semibold">Tanggal Mulai:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-3 py-2 rounded w-auto"
              />
              <label className="block mb-1 font-semibold">Tanggal Selesai:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-3 py-2 rounded w-auto"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6 justify-center">
            <button
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              className="px-3 py-1 text-lg border rounded"
            >
              -
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-3 py-1 text-lg border rounded"
            >
              +
            </button>

            <button
              onClick={() => handleBooking(place.price, quantity)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-green-700 transition mb-4"
            >
              Pesan Sekarang
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-2">
            Free WiFi • AC • Meja & Sofa • Minimal 1 Hari Booking
          </p>

          <div className="flex gap-3 items-center justify-center text-gray-600 text-xl mt-6">
            <FaFacebook className="hover:text-blue-500 cursor-pointer" />
            <FaTwitter className="hover:text-blue-400 cursor-pointer" />
            <FaPinterest className="hover:text-red-500 cursor-pointer" />
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {totalPrice > 0 && (
        <FloatingTotal
          total={totalPrice}
          onCheckout={() =>
            navigate("/checkout", {
              state: {
                place,
                quantity,
                startDate,
                endDate,
                totalPrice,
              },
            })
          }
        />
      )}
    </>
  );
}

export default PlaceDetail;
