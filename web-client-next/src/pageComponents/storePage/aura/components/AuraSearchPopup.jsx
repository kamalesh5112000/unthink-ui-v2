import React from "react";

const AuraSearchPopup = ({ isOpen = false, onClose, children }) => {
  return (
    <div
      className={isOpen ? "fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-md animate-[fadeIn_0.3s_ease] md:items-center" : ""}
      onClick={() => isOpen && onClose?.()}
    >
      <div
        className={isOpen ? "relative my-auto   w-[95%] max-w-[1200px] overflow-y-auto rounded-3xl bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-[slideInUp_0.3s_ease]" : ""}
        onClick={(event) => isOpen && event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default AuraSearchPopup;



