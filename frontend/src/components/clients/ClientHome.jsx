import React, { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "./places/PlaceCard";
import { FaHotel } from "react-icons/fa";
import FloatingTotal from "./FloatingTotal";
import NavbarClient from "./NavbarClient";

const API_URL = "http://localhost:5000";

function ClientHome() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/v1/places`)
      .then((res) => {
        setPlaces(res.data.data);
        setFilteredPlaces(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch places", err));
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "Semua") {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place => place.place_name.toLowerCase() === tabName.toLowerCase());
      setFilteredPlaces(filtered);
    }
  };

  const handleBooking = (price, quantity) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if (isNaN(diffDays) || diffDays < 1) {
      alert("Silakan pilih rentang tanggal minimal 1 hari.");
      return;
    }

    const subtotal = price * quantity * diffDays;
    setTotalPrice(prev => prev + subtotal);
    setShowFloating(true);
  };

  const handleCheckout = () => {
    alert("Checkout berhasil!");
    setTotalPrice(0);
    setShowFloating(false);
  };

  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 pb-28">
        <h1 className="text-3xl font-bold text-center mb-6">LIHAT DUNIA LEBIH MURAH</h1>

        {/* Booking Tabs */}
        <div className="border-b mb-6">
          <ul role="tablist" className="flex overflow-x-auto gap-2 justify-center">
            <li
              onClick={() => handleTabClick("Semua")}
              className={`cursor-pointer px-4 py-2 flex items-center gap-2 border-b-2 transition ${
                activeTab === "Semua" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent"
              }`}
            >
              <FaHotel className="text-xl" />
              <h6 className="text-sm">Semua</h6>
            </li>

            {places.map((place) => (
              <li
                key={place.id}
                onClick={() => handleTabClick(place.place_name)}
                className={`cursor-pointer px-4 py-2 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === place.place_name ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent"
                }`}
              >
                <FaHotel className="text-xl" />
                <h6 className="text-sm">{place.place_name}</h6>
              </li>
            ))}
          </ul>
        </div>

        {/* Tanggal */}
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          <div className="flex gap-4">
            <div>
              <label className="font-semibold">Dari Tanggal:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border px-2 py-1 rounded ml-2" />
            </div>
            <div>
              <label className="font-semibold">Sampai Tanggal:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border px-2 py-1 rounded ml-2" />
            </div>
          </div>
        </div>

        {/* List Place */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onBook={handleBooking} />
          ))}
        </div>

        {showFloating && (
          <FloatingTotal total={totalPrice} onCheckout={handleCheckout} />
        )}
      </div>
    </>
  );
}

export default ClientHome;
