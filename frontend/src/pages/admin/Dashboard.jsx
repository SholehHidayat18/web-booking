const Dashboard = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-gray-600">Total Client</h2>
            <p className="text-3xl font-semibold">120</p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-gray-600">Total Pemesanan</h2>
            <p className="text-3xl font-semibold">80</p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-gray-600">Pendapatan</h2>
            <p className="text-3xl font-semibold">Rp 50.000.000</p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-gray-600">Gedung Aktif</h2>
            <p className="text-3xl font-semibold">5</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  