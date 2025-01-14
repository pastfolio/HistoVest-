export default function Home() {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-4xl font-bold text-blue-600">Welcome to HistoFin</h1>
        <p className="text-lg text-gray-700 mt-4">
          Explore historical stock data with ease!
        </p>
        <a
          href="/stock-data"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition"
        >
          Go to Stock Lookup
        </a>
      </main>
    );
  }
  