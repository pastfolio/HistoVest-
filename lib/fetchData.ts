import fetch from "node-fetch";
import yahooFinance from "yahoo-finance2";
import dotenv from "dotenv";

dotenv.config();

const FRED_API_KEY = process.env.FRED_API_KEY;

const sectorTickers: Record<string, string[]> = {
  automotive: ["TSLA", "F", "GM", "TM"],
  technology: ["XLK", "AAPL", "MSFT", "NVDA"],
  finance: ["XLF", "JPM", "GS", "BAC"],
  energy: ["XLE", "XOM", "CVX", "COP"],
  crypto: ["BTC-USD", "ETH-USD", "COIN", "MSTR"],
  biotech: ["IBB", "BIIB", "VRTX", "REGN"],
  defense: ["ITA", "LMT", "RTX", "NOC"],
  "renewable energy": ["ICLN", "FSLR", "ENPH", "SEDG"],
  semiconductors: ["SOXX", "NVDA", "TSM", "AMD"],
};

export async function getStockData(sector: string) {
  if (!sectorTickers[sector]) {
    console.warn(`⚠ No tickers found for ${sector}. Skipping stock data.`);
    return { [sector]: "Unavailable (No Ticker)" };
  }

  const tickers = sectorTickers[sector];
  let stockData: any = {};

  for (const ticker of tickers) {
    try {
      console.log(`📈 Fetching stock data for ${ticker}`);
      const result = await yahooFinance.quoteSummary(ticker, { modules: ["price", "summaryDetail"] });

      if (!result || !result.price) {
        console.error(`❌ No stock data found for ${ticker}`);
        stockData[ticker] = "Unavailable (No Data)";
        continue;
      }

      stockData[ticker] = {
        price: result.price.regularMarketPrice || "N/A",
        change: result.price.regularMarketChangePercent || "N/A",
        marketCap: result.price.marketCap || "N/A",
        peRatio: result.summaryDetail?.trailingPE || "N/A",
        dividendYield: result.summaryDetail?.dividendYield || "N/A",
      };
    } catch (error) {
      console.error(`❌ Error fetching stock data for ${ticker}:`, error);
      stockData[ticker] = "Unavailable (Fetch Error)";
    }
  }

  return stockData;
}

export async function getMacroData() {
  const macroeconomicIndicators: Record<string, string> = {
    "Oil Prices": "DCOILWTICO",
    "GDP Growth": "A191RL1Q225SBEA",
    "Inflation Rate": "CPIAUCSL",
    "Interest Rates": "FEDFUNDS",
  };

  let macroData: any = {};

  for (const [key, series_id] of Object.entries(macroeconomicIndicators)) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_API_KEY}&file_type=json`;

    try {
      console.log(`📊 Fetching macro data: ${key}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!data || !data.observations || data.observations.length === 0) {
        console.error(`❌ No data for ${key}`);
        macroData[key] = "Unavailable";
        continue;
      }

      macroData[key] = parseFloat(data.observations[data.observations.length - 1].value);
    } catch (error) {
      console.error(`❌ Error fetching macro data: ${key}`, error);
      macroData[key] = "Unavailable";
    }
  }

  return macroData;
}
