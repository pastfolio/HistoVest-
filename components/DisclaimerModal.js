"use client";

import { useEffect, useState } from "react";

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAgree = () => {
    setIsOpen(false);
    localStorage.setItem("disclaimerAgreed", "true"); // Store agreement
  };

  useEffect(() => {
    const hasAgreed = localStorage.getItem("disclaimerAgreed");
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-darkGray p-6 rounded-lg shadow-lg w-4/5 sm:w-1/2 text-white border border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-gold">Disclaimer</h1>
        <p className="text-lightGray mb-4">
          The data and tools provided by HistoVest are for educational purposes only and do not constitute financial advice.
          By using this platform, you acknowledge that HistoVest is not responsible for any decisions made based on the information provided.
        </p>
        <button
          onClick={handleAgree}
          className="px-4 py-2 bg-gold text-black font-semibold rounded-md hover:bg-opacity-80 w-full"
        >
          I Agree
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
