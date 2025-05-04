import { useState } from 'react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([
    { id: 1, name: "Ruang VIP", building: "Gedung A", available: true },
    { id: 2, name: "Ruang Rapat", building: "Gedung B", available: false },
  ]);

  const toggleRoomStatus = (id) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === id ? { ...room, available: !room.available } : room
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Ruangan</h1>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nama Ruangan</th>
            <th className="p-2">Gedung</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id} className="text-center">
              <td className="p-2">{room.name}</td>
              <td className="p-2">{room.building}</td>
              <td className="p-2">
                {room.available ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Tersedia</span>
                ) : (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Tidak Tersedia</span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => toggleRoomStatus(room.id)}
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

export default RoomManagement;
