const Bookings = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">List Pemesanan</h1>
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Nama Client</th>
              <th className="p-2">Jenis Pemesanan</th>
              <th className="p-2">Status Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">2025-05-03</td>
              <td className="p-2">Andi</td>
              <td className="p-2">Gedung Pernikahan</td>
              <td className="p-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Lunas</span>
              </td>
            </tr>
            <tr className="text-center">
              <td className="p-2">2025-05-05</td>
              <td className="p-2">Siti</td>
              <td className="p-2">Gedung Seminar</td>
              <td className="p-2">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Belum Lunas</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  
  export default Bookings;
  