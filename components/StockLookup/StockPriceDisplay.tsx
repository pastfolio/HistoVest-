import React from "react";

export default function StockPriceDisplay({ closingPrice, closingDate, searched }: any) {
  if (!searched) return null; // Hides the section until a search is made

  // Function to format date into "24th Feb 2005"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const ordinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
  };

  return (
    <div className="bg-gray-900 p-5 mt-6 rounded-lg border border-gray-700 w-full max-w-lg text-center shadow-lg">
      <h2 className="text-xl font-bold text-[#facc15] mb-2">📉 Closing Price</h2>
      <p className="text-gray-400">
        {closingDate
          ? `Closing price on ${formatDate(closingDate)}`
          : "No data available"}
      </p>
      <p className="text-3xl font-semibold text-white">
        {closingPrice !== "No data available" ? `$${closingPrice}` : closingPrice}
      </p>
    </div>
  );
}
