import { DollarSign } from "lucide-react";

interface Props {
  investmentAmount: string;
  setInvestmentAmount: (value: string) => void;
}

export default function InvestmentInput({ investmentAmount, setInvestmentAmount }: Props) {
  // Function to format number with commas
  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, ""); // Remove existing commas
    if (isNaN(Number(num))) return investmentAmount; // Prevent non-numeric input
    return Number(num).toLocaleString(); // Convert number to formatted string
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-[#facc15] flex items-center gap-2">
        <DollarSign /> Investment Amount ($)
      </h2>
      <input
        type="text"
        value={investmentAmount}
        onChange={(e) => setInvestmentAmount(formatNumber(e.target.value))}
        placeholder="Enter amount"
        className="p-3 bg-gray-800 text-white border border-gray-600 w-full rounded-lg focus:ring-2 focus:ring-[#facc15] text-center"
      />
    </div>
  );
}
