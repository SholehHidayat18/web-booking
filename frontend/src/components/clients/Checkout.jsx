import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarClient from "./NavbarClient";
import { FaExclamationTriangle, FaInfoCircle, FaSearch } from "react-icons/fa";

function formatDateTime(date) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [relatedPlacesInfo, setRelatedPlacesInfo] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  // Load cart data
  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.state) {
      setCartItems(location.state.items || []);
      setTotalPrice(location.state.totalPrice || 0);
      localStorage.setItem("cartItems", JSON.stringify(location.state.items));
      localStorage.setItem("totalPrice", location.state.totalPrice);
      
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

  // Search user by name
  const searchUserByName = async () => {
    if (!formData.fullName.trim()) {
      setUserResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/search?name=${encodeURIComponent(formData.fullName)}`
      );
      setUserResults(response.data.data || []);
    } catch (error) {
      console.error("Error searching user:", error);
      setUserResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }

    // Clear selected user when name changes
    if (name === "fullName") {
      setSelectedUser(null);
      setUserResults([]);
    }
  };

  // Select user from search results
  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.full_name,
      phoneNumber: user.phone_number,
      email: user.email,
      notes: formData.notes,
    });
    setUserResults([]);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Nama wajib diisi";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]{10,13}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Nomor tidak valid (10-13 digit)";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit booking data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      setLoading(false);
      return;
    }

    const item = cartItems[0];
    if (!item?.id || !item.startDate || !item.endDate) {
      alert("Data booking tidak lengkap.");
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        user_id: selectedUser?.user_id || null, // Gunakan user_id jika ditemukan
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || null,
        items: cartItems.map(i => ({
          ...i,
          name: i.name.trim()
        })),
        total_price: totalPrice,
        booking_date: formatDateTime(new Date()),
        start_date: formatDateTime(item.startDate),
        end_date: formatDateTime(item.endDate),
        place_id: item.id,
        place_type: item.place_type,
        parent_id: item.parent_id || null,
        notes: formData.notes.trim() || null,
      };

      const response = await axios.post(
        "http://localhost:5000/api/v1/bookings",
        bookingData,
        { validateStatus: status => status < 500 }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Gagal memproses booking");
      }

      // Clear cart and store booking info
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
        replace: true,
      });
    } catch (error) {
      console.error("Booking error:", error);
      
      let errorMessage = "Terjadi kesalahan saat memproses booking";
      if (error.response?.data) {
        if (error.response.data?.isBlocked) {
          errorMessage = `Tanggal tidak tersedia: ${error.response.data.message}`;
        } else if (error.response.data?.conflict) {
          errorMessage = `Jadwal bertabrakan: ${error.response.data.message}`;
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
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
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Keranjang kosong</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <li key={index} className="py-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name.toUpperCase()}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(item.startDate).toLocaleDateString()} -{" "}
                            {new Date(item.endDate).toLocaleDateString()}
                            {" "}({Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24))} hari)
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
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Data Pelanggan</h2>

            {/* Nama Lengkap dengan Pencarian */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.fullName ? "border-red-500" : ""
                  }`}
                  required
                  placeholder="Masukkan nama lengkap"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={searchUserByName}
                  disabled={!formData.fullName.trim()}
                  className="absolute right-2 top-2 text-gray-500 hover:text-blue-600"
                >
                  {searchLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </div>
              {formErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
              )}

              {/* Hasil Pencarian User */}
              {userResults.length > 0 && (
                <div className="mt-2 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {userResults.map(user => (
                      <li 
                        key={user.user_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectUser(user)}
                      >
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.phone_number}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Nomor Telepon */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.phoneNumber ? "border-red-500" : ""
                }`}
                required
                placeholder="081234567890"
                pattern="[0-9]{10,13}"
                title="Masukkan nomor telepon yang valid (10-13 digit)"
              />
              {formErrors.phoneNumber ? (
                <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Format: 08xx atau +62xx</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.email ? "border-red-500" : ""
                }`}
                placeholder="email@contoh.com"
              />
              {formErrors.email ? (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Untuk menerima konfirmasi booking</p>
              )}
            </div>

            {/* Catatan Tambahan */}
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

            {/* Perhatian */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-6 rounded">
              <div className="flex items-start">
                <FaExclamationTriangle className="flex-shrink-0 mr-2" />
                <div>
                  <p className="font-medium">Perhatian</p>
                  <p>
                    Dengan mengkonfirmasi booking, Anda menyetujui syarat dan ketentuan yang berlaku.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
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