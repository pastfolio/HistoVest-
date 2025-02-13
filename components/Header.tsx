import { BarChart2 } from "lucide-react";

export default function Header() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-center text-[#facc15] tracking-wide flex items-center justify-center gap-2">
        <BarChart2 size={36} /> HistoVest Simulator
      </h1>
      <p className="mt-4 text-center text-gray-300">
        The HistoVest Simulator is a powerful stock investment backtesting tool that allows users to analyze historical market performance.
        Simulate stock portfolios, calculate historical returns, and optimize investment strategies with real stock data.
      </p>
    </div>
  );
}
