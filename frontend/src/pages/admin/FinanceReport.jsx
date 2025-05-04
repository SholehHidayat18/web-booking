const FinanceReport = () => {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>
        <table className="w-full table-auto bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Keterangan</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">2025-05-01</td>
              <td className="p-2">Masuk</td>
              <td className="p-2">Pembayaran Andi</td>
              <td className="p-2 text-green-600 font-bold">Rp 10.000.000</td>
            </tr>
            <tr className="text-center">
              <td className="p-2">2025-05-02</td>
              <td className="p-2">Keluar</td>
              <td className="p-2">Biaya Perawatan Gedung</td>
              <td className="p-2 text-red-600 font-bold">Rp 2.000.000</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  
  export default FinanceReport;
  