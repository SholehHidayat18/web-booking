import React from "react";

function PlaceCard({ place }) {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
      <img
        src={place.image_url}
        alt={place.place_name}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{place.place_name}</h3>
        <p className="text-gray-600 text-sm mb-2">{place.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{place.trip_duration}</span>
          <span>👥 {place.capacity} People</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-lg">
          <span>${place.price}</span>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;
