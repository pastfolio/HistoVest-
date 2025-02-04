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
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a stock (e.g., AAPL)"
        className="p-3 w-full bg-[#222] text-white border border-gray-600 focus:ring-2 focus:ring-[#facc15]"
      />
      {loading && <p className="text-gray-400 text-sm mt-2">Loading...</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {results.length > 0 && (
        <ul className="absolute w-full bg-[#333] border border-gray-600 mt-1 text-white max-h-60 overflow-auto">
          {results.map((stock) => (
            <li 
              key={stock.symbol} 
              className="p-2 hover:bg-[#444] cursor-pointer"
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
