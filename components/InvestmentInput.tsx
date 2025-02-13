export default function InvestmentInput({ investmentAmount, setInvestmentAmount }: { investmentAmount: string; setInvestmentAmount: (value: string) => void }) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
          💰 Investment Amount ($)
        </h2>
        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          className="p-4 bg-gray-800 text-white border border-gray-600 w-full rounded-lg text-lg focus:ring-2 focus:ring-yellow-400 text-center shadow-sm"
          placeholder="Enter amount"
        />
      </div>
    );
  }
  