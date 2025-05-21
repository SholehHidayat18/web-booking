import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaHeart,
  FaCalendarAlt,
  FaWifi,
  FaSnowflake,
  FaChair,
} from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import NavbarClient from "../NavbarClient";
import FloatingTotal from "../FloatingTotal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = "http://localhost:5000/api/v1";

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentImage, setCurrentImage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [maxQuota, setMaxQuota] = useState(1);

// Di useEffect setelah setPlace
    useEffect(() => {
      window.scrollTo(0, 0);
      const fetchPlace = async () => {
        try {
          const response = await axios.get(`${API_URL}/places/${id}`);
          const placeData = response.data.data;
          setPlace(placeData);
          setCurrentImage(`http://localhost:5000${placeData.image_url}`);

          // Set max kuota sesuai tipe tempat
          if (placeData.type === "kamar") {
            setMaxQuota(50);
          } else {
            setMaxQuota(1);
          }

        } catch (error) {
          console.error("Error fetching place:", error);
          alert("Gagal memuat detail tempat.");
          navigate("/client");
        }
      };
      fetchPlace();
    }, [id, navigate]);


  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = () => {
    const days = calculateTotalDays();
    if (days < 1) {
      alert("Silakan pilih rentang tanggal minimal 1 hari.");
      return;
    }
    const subtotal = place.price * quantity * days;
    setTotalPrice(subtotal);
  };

  const handleCheckout = () => {
    if (totalPrice <= 0) {
      alert("Total harga belum dihitung.");
      return;
    }
  
    navigate("/client/checkout", {
      state: {
        items: [{
          id: place.id,
          name: place.place_name,
          price: place.price,
          quantity,
          subtotal: totalPrice,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          placeImage: place.image_url, // konsisten sama Checkout.js
        }],
        totalPrice,
      },
    });
  };
  
  

  if (!place) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Memuat data tempat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavbarClient />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          <IoIosArrowBack className="mr-1" />
          Kembali ke Daftar Tempat
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
              <img
                src={currentImage}
                alt={place.place_name}
                className="w-full h-96 object-cover"
              />
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FaHeart className={isWishlisted ? "text-red-500" : "text-gray-400"} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setCurrentImage(`http://localhost:5000${place.image_url}`)}
                className={`rounded-lg overflow-hidden border-2 ${
                  currentImage === `http://localhost:5000${place.image_url}`
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={`http://localhost:5000${place.image_url}`}
                  alt=""
                  className="w-full h-20 object-cover"
                />
              </button>

              {place.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(`http://localhost:5000${img.image_url}`)}
                  className={`rounded-lg overflow-hidden border-2 ${
                    currentImage === `http://localhost:5000${img.image_url}`
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={`http://localhost:5000${img.image_url}`}
                    alt=""
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-my-custom-font text-gray-900 mb-2">
              {place.place_name.toUpperCase()}
            </h1>

            <div className="flex items-center justify-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="text-gray-600">(0 ulasan)</span>
            </div>

            <p className="text-gray-700 mb-6 text-balance leading-relaxed">
              {place.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-sm">
                <FaWifi className="text-blue-500 mr-1" />
                Free WiFi
              </div>
              <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-sm">
                <FaSnowflake className="text-blue-500 mr-1" />
                AC
              </div>
              <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full text-sm">
                <FaChair className="text-blue-500 mr-1" />
                Meja & Sofa
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Pilih Tanggal</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="w-full p-2 border rounded-md"
                    placeholderText="Pilih tanggal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className="w-full p-2 border rounded-md"
                    placeholderText="Pilih tanggal"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    Durasi: {calculateTotalDays()} malam
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Detail Harga</h2>
              
              <div className="flex justify-between mb-2">
                <span>Rp {place.price.toLocaleString("id-ID")} x {quantity} Ruangan</span>
                <span>Rp {(place.price * quantity).toLocaleString("id-ID")}</span>
              </div>
              
              {startDate && endDate && (
                <div className="flex justify-between mb-2">
                  <span>{calculateTotalDays()} malam</span>
                  <span>Rp {(place.price * quantity * calculateTotalDays()).toLocaleString("id-ID")}</span>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg text-green-600">
                    Rp {totalPrice > 0 ? totalPrice.toLocaleString("id-ID") : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => Math.min(maxQuota, prev + 1))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                disabled={quantity >= maxQuota}
              >
                +
              </button>
            </div>


              <button
                onClick={handleBooking}
                disabled={!startDate || !endDate}
                className={`px-6 py-3 rounded-lg font-medium ${
                  startDate && endDate
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } transition-colors`}
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {totalPrice > 0 && (
        <FloatingTotal
          total={totalPrice}
          onCheckout={handleCheckout}
        />
      )}
    </>
  );
}

export default PlaceDetail;