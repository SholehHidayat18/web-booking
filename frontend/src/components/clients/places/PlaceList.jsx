import React, { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "./PlaceCard";

function PlaceList() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/v1/places")
      .then((res) => {
        setPlaces(res.data.data); // ambil dari res.data.data
      })
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Available Places</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}

export default PlaceList;
