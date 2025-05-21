import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarClient from "./NavbarClient";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

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
  const [loading, setLoading] = useState(false);
  const [relatedPlacesInfo, setRelatedPlacesInfo] = useState(null);

  // Data form manual user
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state) {
      setCartItems(location.state.items || []);
      setTotalPrice(location.state.totalPrice || 0);
      localStorage.setItem("cartItems", JSON.stringify(location.state.items));
      localStorage.setItem("totalPrice", location.state.totalPrice);
      
      // Jika ada info tempat terkait dari halaman sebelumnya
      if (location.state.relatedPlacesInfo) {
        setRelatedPlacesInfo(location.state.relatedPlacesInfo);
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!formData.fullName || !formData.phoneNumber) {
      alert("Nama dan nomor telepon wajib diisi!");
      setLoading(false);
      return;
    }
  
    if (cartItems.length === 0) {
      alert("Cart kosong!");
      setLoading(false);
      return;
    }
  
    const startDate = cartItems[0].startDate;
    const endDate = cartItems[0].endDate;
  
    if (!startDate || !endDate) {
      alert("Tanggal booking wajib diisi!");
      setLoading(false);
      return;
    }
  
    if (!cartItems[0]?.id) {
      alert("Data tempat tidak valid, coba ulangi booking.");
      setLoading(false);
      return;
    }
  
    const bookingData = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email || "",
      items: cartItems,
      total_price: totalPrice,
      booking_date: formatDateTime(new Date()),
      start_date: formatDateTime(startDate),
      end_date: formatDateTime(endDate),
      place_id: cartItems[0].id,
      place_type: cartItems[0].place_type,
      parent_id: cartItems[0].parent_id || null,
    };
  
    axios.post("http://localhost:5000/api/v1/bookings", bookingData)
      .then((response) => {
        sessionStorage.setItem("bookingId", response.data.data.bookingId);
        sessionStorage.setItem("totalPrice", totalPrice);
        localStorage.removeItem("cartItems");
        localStorage.removeItem("totalPrice");
        navigate("/client/payment", {
          state: {
            totalPrice,
            bookingId: response.data.data.bookingId,
            quotaRemaining: response.data.data.quotaRemaining,
            totalCapacity: response.data.data.totalCapacity,
            relatedPlacesInfo: response.data.data.notice,
          },
        });
      })
      .catch((error) => {
        console.error("Gagal booking:", error);
        let errorMessage = error.response?.data?.message || "Gagal booking, coba lagi.";
  
        if (error.response?.data?.isBlocked) {
          errorMessage = `Tanggal diblokir: ${error.response.data.message}`;
        } else if (error.response?.data?.conflict) {
          errorMessage = `Konflik booking: ${error.response.data.message}`;
        }
        alert(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  
  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout Booking</h1>

        {relatedPlacesInfo && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
            <div className="flex items-start">
              <FaInfoCircle className="flex-shrink-0 mr-2 mt-1" />
              <div>
                <p className="font-medium">Informasi Penting</p>
                <p>{relatedPlacesInfo}</p>
              </div>
            </div>
          </div>
        )}

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
                        {" "}({Math.ceil( (new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24))} hari)
                      </p>
                      <div className="flex justify-between">
                        <span>
                          Rp {item.price.toLocaleString()} x {item.quantity} {item.place_type === 'kamar' ? 'kamar' : 'unit'}
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
              <label className="block font-medium mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Nama sesuai KTP"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Contoh: 081234567890"
                pattern="[0-9]{10,13}"
                title="Masukkan nomor telepon yang valid (10-13 digit)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 08xx atau +62xx
              </p>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@contoh.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Untuk menerima konfirmasi booking
              </p>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">Catatan Tambahan (opsional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Contoh: Request tempat di lantai 2, dekat lift"
              />
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-6 rounded">
              <div className="flex items-start">
                <FaExclamationTriangle className="flex-shrink-0 mr-2 " />
                <div>
                  <p className="font-my-custom-font">Perhatian</p>
                  <p>
                    Dengan mengkonfirmasi booking, Anda menyetujui syarat dan ketentuan yang berlaku.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Konfirmasi Booking"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Checkout;