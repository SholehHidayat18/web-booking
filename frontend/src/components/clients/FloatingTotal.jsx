import React from "react";
import { FiShoppingCart } from "react-icons/fi";

function FloatingTotal({ total, itemCount, onCheckout }) {
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-xl p-4 z-40 border border-gray-200 w-[90%] max-w-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiShoppingCart className="text-2xl text-blue-600" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          
          <div className="text-left">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold text-lg">Rp {total.toLocaleString("id-ID")}</p>
          </div>
        </div>
        
        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            itemCount > 0 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default FloatingTotal;