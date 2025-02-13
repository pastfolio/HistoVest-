export default function CalculatorButton({ calculatePortfolio, loadingCalc }: { calculatePortfolio: () => void; loadingCalc: boolean }) {
    return (
      <button 
        onClick={calculatePortfolio}
        className="mt-6 w-full py-5 text-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold uppercase rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
      >
        {loadingCalc ? "Calculating..." : "🚀 Calculate Portfolio"}
      </button>
    );
  }
  