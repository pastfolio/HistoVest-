"use client";

import { useState } from "react";
import axios from "axios";

export default function StockLookup({ onSelectStock }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    const input = e.target.value;
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

  const handleSelect = (symbol) => {
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
