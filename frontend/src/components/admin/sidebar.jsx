import { Link } from "react-router-dom";

const Sidebar = () => (
  <div className="w-64 bg-white shadow h-screen p-4 flex flex-col justify-between">
    <div>
      <h2 className="text-xl font-bold mb-6">Admin Booking</h2>
      <nav className="flex flex-col space-y-3">
        <Link to="/admin" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/admin/clients" className="hover:text-blue-600">Kelola Client</Link>
        <Link to="/admin/booking" className="hover:text-blue-600">List Pemesanan</Link>
        <Link to="/admin/finance" className="hover:text-blue-600">Laporan Keuangan</Link>
        <Link to="/admin/building" className="hover:text-blue-600">Manajemen Gedung</Link>
        <Link to="/admin/room" className="hover:text-blue-600">Manajemen Kamar</Link>
        <Link to="/admin/square" className="hover:text-blue-600">Manajemen Lapangan</Link>
      </nav>
    </div>
    <div>
      <Link to="/login" className="text-red-600 hover:text-red-800">Logout</Link>
    </div>
  </div>
);

export default Sidebar;
