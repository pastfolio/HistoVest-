interface Props {
    calculatePortfolio: () => void;
    loadingCalc: boolean;
  }
  
  export default function CalculatorButton({ calculatePortfolio, loadingCalc }: Props) {
    return (
      <button 
        onClick={calculatePortfolio}
        className="mt-6 px-6 py-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold uppercase rounded-lg hover:opacity-90"
      >
        {loadingCalc ? "Calculating..." : "Calculate Portfolio"}
      </button>
    );
  }
  