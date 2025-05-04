import { useState } from 'react';

const BuildingManagement = () => {
  const [buildings, setBuildings] = useState([
    { id: 1, name: "Gedung A", available: true },
    { id: 2, name: "Gedung B", available: false },
  ]);

  const toggleAvailability = (id) => {
    setBuildings(prev =>
      prev.map(b =>
        b.id === id ? { ...b, available: !b.available } : b
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Gedung</h1>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nama Gedung</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map(building => (
            <tr key={building.id} className="text-center">
              <td className="p-2">{building.name}</td>
              <td className="p-2">
                {building.available ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Tersedia</span>
                ) : (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Tidak Tersedia</span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => toggleAvailability(building.id)}
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

export default BuildingManagement;
