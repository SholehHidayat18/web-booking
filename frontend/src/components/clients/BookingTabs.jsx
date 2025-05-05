import React, { useState, useEffect } from "react";
import axios from "axios";
import PlaceCard from "./places/PlaceCard";

function BookingTabs() {
  const [places, setPlaces] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/api/v1/places")
      .then((res) => setPlaces(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  const handleBooking = (price) => {
    setTotalPrice(price); // bisa disesuaikan misal dikali lama sewa
  };

  const filteredPlaces = selectedTab === "all"
    ? places
    : places.filter(place => place.place_name === selectedTab);

  return (
    <div className="container mx-auto p-4">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button onClick={() => handleTabClick("all")} className="px-4 py-2 bg-gray-200 rounded">Semua</button>
        {places.map((place) => (
          <button
            key={place.id}
            onClick={() => handleTabClick(place.place_name)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {place.place_name}
          </button>
        ))}
      </div>

      {/* Booking Options */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="border p-2 rounded"
        />
        <div className="font-semibold p-2">Total Harga: Rp {totalPrice.toLocaleString()}</div>
      </div>

      {/* Data sesuai tab */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} onBook={() => handleBooking(place.price)} />
        ))}
      </div>
    </div>
  );
}

export default BookingTabs;
