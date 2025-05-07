import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await axios.get(`${API_URL}/places/${id}`);
        setPlace(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPlace();
  }, [id]);

  const handleBooking = () => {
    alert(`Booking ${quantity} tiket untuk ${place.place_name}`);
  };

  if (!place) return <div className="text-center mt-20">Memuat data...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <img 
          src={`http://localhost:5000${place.image_url}`} 
          alt={place.place_name} 
          className="rounded-2xl w-full h-96 object-cover"
        />
        {/* thumbnail grid kalau mau */}
        <div className="flex gap-3 mt-5">
          <img src={`http://localhost:5000${place.image_url}`} className="w-20 h-20 object-cover rounded-lg border-2 border-green-600" />
          <img src={`http://localhost:5000${place.image_url}`} className="w-20 h-20 object-cover rounded-lg" />
        </div>
      </div>

      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-4 hover:underline">&larr; Kembali</button>
        <h1 className="text-3xl font-bold mb-2">{place.place_name}</h1>
        <p className="text-gray-600 text-lg mb-4">Rp {place.price.toLocaleString()}/Hari</p>
        <p className="text-gray-700 leading-relaxed mb-6">{place.description}</p>
      </div>
    </div>
  );
}

export default PlaceDetail;
