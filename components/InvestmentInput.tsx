import { DollarSign } from "lucide-react";

interface Props {
  investmentAmount: string;
  setInvestmentAmount: (value: string) => void;
}

export default function InvestmentInput({ investmentAmount, setInvestmentAmount }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-[#facc15] flex items-center gap-2">
        <DollarSign /> Investment Amount ($)
      </h2>
      <input
        type="number"
        value={investmentAmount}
        onChange={(e) => setInvestmentAmount(e.target.value)}
        className="p-3 bg-gray-800 text-white border border-gray-600 w-full rounded-lg focus:ring-2 focus:ring-[#facc15] text-center"
      />
    </div>
  );
}
