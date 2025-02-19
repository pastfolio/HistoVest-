"use client";

import { useEffect, useState } from "react";

export default function Disclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer");
    if (!hasSeenDisclaimer) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null; // Don't render if already dismissed

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-10 md:right-10 bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-600 flex justify-between items-center">
      <p className="text-sm">
        ⚠️ <strong>Disclaimer:</strong> The information provided on HistoVest is for educational and informational 
        purposes only. It does not constitute financial, investment, tax, or legal advice. No guarantees are made 
        regarding the accuracy or completeness of the data. You should consult with a qualified financial professional 
        before making any investment decisions. **HistoVest and its creators are not responsible for any financial 
        losses incurred based on the use of this tool.**
      </p>
      <button 
        onClick={handleClose} 
        className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm"
      >
        Got it
      </button>
    </div>
  );
}
