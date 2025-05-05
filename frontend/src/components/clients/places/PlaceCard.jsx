import React from "react";

function PlaceCard({ place, onBook }) {
  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-md h-96 flex flex-col justify-end bg-cover bg-center"
      style={{ backgroundImage: `url(http://localhost:5000${place.image_url})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content */}
      <div className="relative p-6 text-white z-10">
        <h2 className="text-2xl font-bold mb-2">{place.place_name.toUpperCase()}</h2>
        <p className="text-base mb-3">{place.description}</p>
        <p className="text-lg font-semibold mb-4">Rp {place.price.toLocaleString()} /hari</p>
        <button
          onClick={onBook}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Pesan
        </button>
      </div>
    </div>
  );
}

export default PlaceCard;
