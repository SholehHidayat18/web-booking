import React, { useState, useEffect } from 'react';
import NavbarClient from './NavbarClient';
import { useLocation, useNavigate } from 'react-router-dom';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Cek data dari location.state
    if (location.state) {
      setCartItems(location.state.items || []);
      setTotalPrice(location.state.totalPrice || 0);
    } else {
      // Fallback: Ambil dari localStorage jika state kosong
      const savedCart = localStorage.getItem('cartItems');
      const savedTotal = localStorage.getItem('totalPrice');
      
      if (savedCart && savedTotal) {
        setCartItems(JSON.parse(savedCart));
        setTotalPrice(parseFloat(savedTotal));
      } else {
        // Jika tidak ada data, redirect kembali
        navigate('/client');
      }
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Harap lengkapi semua informasi pelanggan');
      return;
    }

    try {
      // Simpan data booking ke backend
      const response = await axios.post('http://localhost:5000/api/v1/bookings', {
        customer: customerInfo,
        items: cartItems,
        totalPrice,
        bookingDate: new Date().toISOString()
      });

      // Reset cart dan redirect ke halaman sukses
      localStorage.removeItem('cartItems');
      localStorage.removeItem('totalPrice');
      navigate('/client/booking-success', { state: { bookingId: response.data.id } });
    } catch (error) {
      console.error('Gagal melakukan booking:', error);
      alert('Terjadi kesalahan saat memproses booking. Silakan coba lagi.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <NavbarClient />
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
          <p className="mb-4">Anda belum memilih tempat untuk dibooking.</p>
          <button
            onClick={() => navigate('/client')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarClient />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout Booking</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Detail Pesanan</h2>
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <li key={index} className="py-4">
                  <div className="flex gap-4">
                    {item.placeImage && (
                      <img 
                        src={item.placeImage} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between">
                        <span>Rp {item.price.toLocaleString()} x {item.quantity}</span>
                        <span className="font-semibold">Rp {item.subtotal.toLocaleString()}</span>
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

          {/* Customer Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Data Pelanggan</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
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
      </div>
    </>
  );
}

export default Checkout;