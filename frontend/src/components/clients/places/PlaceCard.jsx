import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

function PlaceCard({ place, onBook }) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const handleDetail = () => {
    navigate(`places/${place.id}`)
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col transition hover:shadow-xl w-full max-w-sm">
      
      {/* Gambar */}
      <div className="relative cursor-pointer" onClick={handleDetail}>
        <img
          src={`http://localhost:5000${place.image_url}`}
          alt={place.place_name}
          className="w-full h-60 object-cover"
        />

        {/* Badge Rating */}
        <div className="absolute top-3 left-3 bg-white/80 px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 text-yellow-500" />
          4.5
        </div>

        {/* Badge Lokasi */}
        <div className="absolute top-3 right-3 bg-white/80 px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
          <MapPin className="w-4 h-4 text-blue-500" />
          Indonesia
        </div>
      </div>

      {/* Konten */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-my-custom-font">{place.place_name.toUpperCase()}</h2>
        <p className="text-gray-600 text-sm">
          {place.description?.substring(0, 60) || "Deskripsi belum tersedia..."}{" "}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={handleDetail}>
            Baca Selengkapnya
          </span>
        </p>

        {/* Harga */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-500 text-sm">Harga</span>
          <span className="text-lg font-bold text-gray-900">
          Rp.{place.price.toLocaleString('id-ID')}/Hari
        </span>
        </div>

        {/* Quantity & Pesan */}
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm">Jumlah:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border px-2 w-16 py-1 rounded"
          />
        </div>

        <button
          onClick={() => onBook(place.price, quantity)}
          className="w-full mt-3 bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Pesan 
        </button>
      </div>
    </div>
  );
}

export default PlaceCard;
