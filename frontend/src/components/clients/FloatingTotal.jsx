import React from "react";

const FloatingTotal = ({ totalPrice, onCheckout }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t shadow-lg p-4 flex justify-evenly items-center">
      <div className="text-2xl font-bold text-gray-800">
        Total: Rp {totalPrice.toLocaleString()}
      </div>
      <button
        onClick={onCheckout}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
      >
        Lanjutkan
      </button>
    </div>
  );
};

export default FloatingTotal;
