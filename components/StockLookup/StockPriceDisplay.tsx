export default function StockPriceDisplay({ closingPrice, closingDate, selectedDate }: any) {
    return (
      <div className="bg-gray-900 p-5 mt-6 rounded-lg border border-gray-700 w-full max-w-lg text-center shadow-lg">
        <h2 className="text-xl font-bold text-[#facc15] mb-2">📉 Closing Price</h2>
        <p className="text-gray-400">
          {closingDate && closingDate !== selectedDate
            ? `No data for ${selectedDate}, showing closest available (${closingDate})`
            : `Closing price on ${selectedDate}`}
        </p>
        <p className="text-3xl font-semibold text-white">
          {closingPrice !== "No data available" ? `$${closingPrice}` : closingPrice}
        </p>
      </div>
    );
  }
  