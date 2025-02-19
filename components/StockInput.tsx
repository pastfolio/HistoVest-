import StockLookup from "./StockLookup";
import { Plus } from "lucide-react";

interface Stock {
  symbol: string;
  percentage: string;
}

interface Props {
  stocks: Stock[];
  handleStockChange: (index: number, field: "symbol" | "percentage", value: string) => void;
  addStock: () => void;
}

export default function StockInput({ stocks = [], handleStockChange, addStock }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-[#facc15]">Configure Portfolio</h2>
      {stocks.length > 0 ? (
        stocks.map((stock, index) => (
          <div key={index} className="flex space-x-3 items-center mt-3">
            {/* ✅ Pass the selected symbol to ensure it persists */}
            <StockLookup 
              onSelectStock={(symbol) => handleStockChange(index, "symbol", symbol)}
              selectedSymbol={stock.symbol} // ✅ Make sure StockLookup receives and displays it
            />
            <input
              type="number"
              placeholder="%"
              value={stock.percentage}
              onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
              className="p-3 bg-gray-800 text-white border border-gray-600 w-1/3 rounded-lg text-center"
            />
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-sm mt-2">No stocks added yet.</p>
      )}
      {stocks.length < 10 && (
        <button 
          onClick={addStock}
          className="mt-4 w-full bg-yellow-500 text-black font-bold rounded-lg p-3 flex items-center justify-center gap-2"
        >
          <Plus /> Add Stock
        </button>
      )}
    </div>
  );
}
