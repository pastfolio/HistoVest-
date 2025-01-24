import { useState } from "react";

const DisclaimerModal = ({ onAgree }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAgree = () => {
    setIsOpen(false);
    onAgree();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-4/5 sm:w-1/2">
        <h1 className="text-2xl font-bold mb-4">Disclaimer</h1>
        <p className="text-gray-700 mb-4">
          The data and tools provided by HistoVest are for educational purposes only and do not constitute financial advice.
          While we strive for accuracy, there may be errors or discrepancies in the data. By using this platform, you
          acknowledge that HistoVest is not responsible for any decisions made based on the information provided.
        </p>
        <p className="text-gray-700 mb-4">
          Please consult a financial professional for personalized investment advice.
        </p>
        <button
          onClick={handleAgree}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          I Agree
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
