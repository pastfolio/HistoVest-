"use client";

import { useState, useEffect } from "react";

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false); // Default to false until we check storage
  const [loaded, setLoaded] = useState(false); // Ensure hydration works properly

  useEffect(() => {
    const hasAgreed = localStorage.getItem("disclaimerAgreed");
    if (!hasAgreed) {
      setIsOpen(true);
    }
    setLoaded(true); // Mark as fully loaded
  }, []);

  const handleAgree = () => {
    localStorage.setItem("disclaimerAgreed", "true");
    setIsOpen(false);
  };

  // Prevent flickering by waiting for `useEffect` to run
  if (!loaded) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[#111] p-6 rounded-lg shadow-lg w-4/5 sm:w-1/2 text-white border border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-[#facc15]">📢 Disclaimer</h1>
        <p className="text-gray-300 mb-4">
          The information provided by <strong>HistoVest</strong> is for <span className="text-[#facc15] font-medium">educational and informational purposes only</span>.
          It should not be considered financial advice, investment guidance, or a recommendation to buy or sell any assets.
        </p>
        <p className="text-gray-400 mb-4">
          By continuing to use this platform, you acknowledge that <strong>HistoVest is not liable</strong> for any financial decisions made based on the information presented.
          Always conduct your own research before making investment decisions.
        </p>
        <button
          onClick={handleAgree}
          className="px-4 py-2 bg-[#facc15] text-black font-semibold rounded-md hover:bg-opacity-80 w-full transition"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
