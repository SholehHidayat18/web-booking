import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarClient from "./NavbarClient";

function formatDateTime(date) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Data form manual user
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    if (location.state) {
      setCartItems(location.state.items || []);
      setTotalPrice(location.state.totalPrice || 0);
      localStorage.setItem("cartItems", JSON.stringify(location.state.items));
      localStorage.setItem("totalPrice", location.state.totalPrice);
    } else {
      const savedCart = localStorage.getItem("cartItems");
      const savedTotal = localStorage.getItem("totalPrice");

      if (savedCart && savedTotal) {
        setCartItems(JSON.parse(savedCart));
        setTotalPrice(parseFloat(savedTotal));
      } else {
        navigate("/client");
      }
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.fullName || !formData.phoneNumber) {
      alert("Nama dan nomor telepon wajib diisi!");
      return;
    }
  
    if (cartItems.length === 0) {
      alert("Cart kosong!");
      return;
    }
  
    const startDate = cartItems[0].startDate;
    const endDate = cartItems[0].endDate;
  
    if (!startDate || !endDate) {
      alert("Tanggal booking wajib diisi!");
      return;
    }
    
    console.log("Cart items data:", cartItems);

   if (!cartItems[0]?.id) {
      alert("Data tempat tidak valid, coba ulangi booking.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/v1/bookings", {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber, // biarkan phoneNumber original, backend yang konversi
        email: formData.email || "",
        items: cartItems,
        total_price: totalPrice,
        booking_date: formatDateTime(new Date()),
        start_date: formatDateTime(startDate),
        end_date: formatDateTime(endDate),
        place_id: cartItems[0].place_id || cartItems[0].id 
      });
  
      sessionStorage.setItem("bookingId", response.data.bookingId);
      sessionStorage.setItem("totalPrice", totalPrice);
  
      localStorage.removeItem("cartItems");
      localStorage.removeItem("totalPrice");
  
      navigate("/client/payment", {
        state: { totalPrice, bookingId: response.data.bookingId },
      });
  
    } catch (error) {
      console.error("Gagal booking:", error);
      alert(error.response?.data?.message || "Gagal booking, coba lagi.");
    }
  };
  
  

  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Detail Pesanan</h2>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <li key={index} className="py-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name.toUpperCase()}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(item.startDate).toLocaleDateString()} -{" "}
                        {new Date(item.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between">
                        <span>
                          Rp {item.price.toLocaleString()} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          Rp {item.subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span>Rp {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Data Pelanggan</h2>

            <div className="mb-4">
              <label className="block font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Nomor Telepon</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Email (Opsional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">Catatan (Opsional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Konfirmasi Booking
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Checkout;
