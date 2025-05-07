import React from "react";

function FloatingTotal({ total, onCheckout }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-cyan-600 text-white flex justify-evenly items-center px-6 py-4 z-50">
      <div className="text-lg font-bold">Total Harga: Rp {total.toLocaleString()}</div>
      <button
        onClick={onCheckout}
        className="bg-green-500 px-5 py-2 rounded hover:bg-green-600"
      >
        Lanjutkan
      </button>
    </div>
  );
}

export default FloatingTotal;
