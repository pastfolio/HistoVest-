"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  onSelectStock: (symbol: string) => void;
  selectedSymbol?: string;
}

export default function StockLookup({ onSelectStock, selectedSymbol = "" }: Props) {
  const [query, setQuery] = useState(selectedSymbol); // ✅ Keeps the selected stock symbol
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setQuery(selectedSymbol); // ✅ Ensure stock symbol is shown in the input
  }, [selectedSymbol]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setQuery(input);

    if (input.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/stock-lookup?query=${input}`);
      setResults(response.data);
    } catch (err) {
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (symbol: string) => {
    setQuery(symbol);
    setResults([]); // Hide dropdown when a stock is selected
    onSelectStock(symbol);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a stock (e.g., AAPL)"
        className="p-3 w-full bg-[#222] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#facc15] relative z-10"
      />

      {/* Loading & Error Messages */}
      {loading && <p className="text-gray-400 text-sm mt-2">Loading...</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Dropdown Results */}
      {results.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-[#333] border border-gray-600 mt-1 text-white max-h-60 overflow-auto shadow-lg rounded-lg z-50">
          {results.map((stock) => (
            <li 
              key={stock.symbol} 
              className="p-3 hover:bg-[#444] cursor-pointer transition-all duration-200"
              onClick={() => handleSelect(stock.symbol)}
            >
              {stock.symbol} - {stock.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
