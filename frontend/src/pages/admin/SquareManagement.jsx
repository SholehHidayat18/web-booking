import { useState } from 'react';

const SquareManagement = () => {
  const [squares, setSquares] = useState([
    { id: 1, name: "Lapangan Utama", available: true },
    { id: 2, name: "Halaman Tengah", available: false },
  ]);

  const toggleSquare = (id) => {
    setSquares(prev =>
      prev.map(square =>
        square.id === id ? { ...square, available: !square.available } : square
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Area Terbuka</h1>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nama Area</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {squares.map(square => (
            <tr key={square.id} className="text-center">
              <td className="p-2">{square.name}</td>
              <td className="p-2">
                {square.available ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Tersedia</span>
                ) : (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Tidak Tersedia</span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => toggleSquare(square.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Toggle Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SquareManagement;
