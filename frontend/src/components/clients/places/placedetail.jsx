import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/v1/places/${id}`)
      .then((res) => setPlace(res.data.data)) // ambil dari res.data.data
      .catch((err) => console.error("Error fetching place detail:", err));
  }, [id]);

  if (!place) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-4">{place.place_name}</h2>
      <img
        src={`http://localhost:5000${place.image_url}`}
        alt={place.place_name}
        className="w-full h-80 object-cover rounded-lg mb-6"
      />
      <p className="mb-4 text-gray-700">{place.description}</p>
      <p className="font-semibold text-lg">Price: Rp {parseInt(place.price).toLocaleString()}</p>
      <p className="text-gray-600">Capacity: {place.capacity ? `${place.capacity} People` : 'N/A'}</p>
      <p className="text-gray-600">Trip Duration: {place.trip_duration}</p>

      <button className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
        Book Now
      </button>
    </div>
  );
}

export default PlaceDetail;
