import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

function PlaceCard({ place }) {
  const navigate = useNavigate();

  const handleDetail = () => {
    navigate(`/client/places/${place.id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02] w-full max-w-sm border border-gray-100"
      onClick={handleDetail}
    >
      {/* Image with gradient overlay */}
      <div className=" relative h-64 overflow-hidden group">
        <img
          src={`http://localhost:5000${place.image_url}`}
          alt={place.place_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* Badges container */}
        <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-between items-end">
          <div className="flex items-center gap-2">
            {/* Rating badge */}
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{place.rating || "4.5"}</span>
            </div>
            
            {/* Location badge */}
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{place.location || "Indonesia"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title with hover effect */}
        <h2 
          className="text-xl font-bold text-gray-900 transition-colors duration-200 hover:text-purple-600 cursor-pointer"
          onClick={handleDetail}
        >
          {place.place_name}
        </h2>
        
        {/* Description with fade effect */}
        <p className="text-gray-600 text-sm line-clamp-2 transition-all duration-200 hover:line-clamp-none">
          {place.description || "Deskripsi belum tersedia..."}
        </p>
        
        {/* Price and button container */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Mulai dari</span>
            <p className="text-lg font-bold text-green-600">
              Rp {Number(place.price).toLocaleString("id-ID")}
              <span className="text-sm font-normal text-gray-500">/malam</span>
            </p>
          </div>
          
          {/* Animated button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDetail();
            }}
            className="px-5 py-2 bg-gradient-to-r bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1"
          >
            Pesan
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;