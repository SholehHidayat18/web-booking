import React from "react";

function SearchBox() {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Cari kota, landmark, atau nama properti"
          className="border p-2 flex-1 rounded"
        />
        <input type="date" className="border p-2 rounded" />
        <input type="date" className="border p-2 rounded" />
        <input
          type="number"
          placeholder="Dewasa"
          className="border p-2 w-20 rounded"
        />
        <button className="bg-blue-600 text-white px-4 rounded">Cari</button>
      </div>
    </div>
  );
}

export default SearchBox;
