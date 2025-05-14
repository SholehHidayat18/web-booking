import React, { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "./places/PlaceCard";
import FloatingTotal from "./FloatingTotal";
import NavbarClient from "./NavbarClient";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ClientHome() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [showFloating, setShowFloating] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/places`);
        setPlaces(response.data.data);
        setFilteredPlaces(response.data.data);
      } catch (error) {
        console.error("Failed to fetch places:", error);
        alert("Gagal memuat data tempat. Silakan coba lagi.");
      }
    };

    fetchPlaces();
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === "Semua") {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place => 
        place.place_name.toLowerCase() === tabName.toLowerCase()
      );
      setFilteredPlaces(filtered);
    }
  };

  const handleBooking = (place, price, quantity) => {
    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal terlebih dahulu!");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      alert("Durasi minimal pemesanan adalah 1 hari");
      return;
    }

    const subtotal = price * quantity * diffDays;
    
    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === place.id);
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity,
          subtotal,
          startDate,
          endDate
        };
        return updatedItems;
      }
      
      return [
        ...prevItems,
        {
          id: place.id,
          name: place.place_name,
          price,
          quantity,
          subtotal,
          startDate,
          endDate,
          placeImage: place.image_url
        }
      ];
    });

    setTotalPrice(prev => {
      const newTotal = cartItems.reduce((sum, item) => {
        return item.id === place.id ? sum + subtotal : sum + item.subtotal;
      }, 0);
      return newTotal === 0 ? subtotal : newTotal;
    });

    setShowFloating(true);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Keranjang Anda kosong. Silakan pilih tempat terlebih dahulu.");
      return;
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('totalPrice', totalPrice.toString());

    navigate("/client/checkout", {
      state: {
        items: cartItems,
        totalPrice,
      },
    });
  };

  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 pb-28">
        <h1 className="text-3xl font-bold text-center mb-6">TEMUKAN TEMPAT TERBAIK</h1>

        {/* Filter Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 w-full md:w-auto">
              <button
                onClick={() => handleTabClick("Semua")}
                className={`px-4 py-2 rounded-full ${activeTab === "Semua" ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200'}`}
              >
                Semua
              </button>
              {places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleTabClick(place.place_name)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    activeTab === place.place_name ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200'
                  }`}
                >
                  {place.place_name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Date Picker */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              
              
            </div>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place} 
              onBook={(price, quantity) => handleBooking(place, price, quantity)}
              selectedDates={{ startDate, endDate }}
            />
          ))}
        </div>

        {/* Floating Cart */}
        {showFloating && (
          <FloatingTotal 
            total={totalPrice} 
            itemCount={cartItems.length}
            onCheckout={handleCheckout} 
          />
        )}
      </div>
    </>
  );
}

export default ClientHome;