import React, { useState } from "react";
import Logo from "../../assets/images/LogoJateng.png";
import Icon from "../../assets/images/Wa.png";
import CloseIcon from "../../assets/images/x.png";

const Wa = () => {
  const [open, setOpen] = useState(false);
  const phoneNumber = "6282223000404";

  const handleOpenChat = () => {
    setOpen(true);
  };

  const handleCloseChat = () => {
    setOpen(false);
  };

  return (
    <div id="whatsapp-chat-widget" className="fixed bottom-5 right-5 z-50 font-sans">
      <div
        id="wa-widget-send-button"
        onClick={handleOpenChat}
        className="rounded-full cursor-pointer"
      >
        <img src={Icon} alt="WhatsApp Icon" />
      </div>

      {open && (
        <div className="wa-chat-box absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="wa-chat-box-header flex items-center bg-[#075e54] p-3 text-white">
            <img className="wa-chat-box-brand w-10 h-10 object-contain mr-3" src={Logo} alt="Logo BKPP" />
            <div className="wa-chat-box-brand-text flex-1">
              <div className="wa-chat-box-brand-name">Balai Diklat BKPP Kota Semarang</div>
            </div>
            <div className="wa-chat-bubble-close-btn cursor-pointer" onClick={handleCloseChat}>
              <img src={CloseIcon} alt="Close" />
            </div>
          </div>

          <div className="wa-chat-box-content p-3 bg-[#f4f4f4]">
            <div className="wa-chat-box-content-chat">
              <div className="wa-chat-box-content-chat-brand font-bold mb-2">
                Balai Diklat BKPP Kota Semarang
              </div>
              <div className="wa-chat-box-content-chat-welcome text-sm">
                Silakan sampaikan pertanyaan, kritik, atau saran Anda.
              </div>
            </div>
          </div>

          <div className="wa-chat-box-send p-3 bg-white border-t border-gray-300 text-center">
            <a
              role="button"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://api.whatsapp.com/send?phone=${phoneNumber}`}
              title="WhatsApp"
              className="wa-chat-box-content-send-btn inline-flex items-center bg-[#25d366] text-white py-2 px-4 rounded-md hover:bg-[#1ebe5d] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 90 90">
                <path d="M90,43.841c...z"></path>
              </svg>
              <span className="wa-chat-box-content-send-btn-text ml-2">Start Chat</span>
            </a>
            <div className="wa-chat-box-poweredby mt-2 text-xs text-gray-500">
              ⚡ by <a href="https://wati.io" target="_blank" rel="noopener noreferrer">wati.io</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wa;
