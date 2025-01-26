export default function Home() {
  return (
      <main className="flex flex-col items-center bg-gray-50 min-h-screen text-gray-800">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center py-20 bg-blue-100 w-full">
              <h1 className="text-5xl font-bold text-blue-700 mb-4">Welcome to HistoFin</h1>
              <p className="text-xl text-gray-700">
                  Explore historical stock data, simulations, and investment insights with ease!
              </p>
              <div className="flex space-x-4 mt-6">
                  <a
                      href="/stock-data"
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition"
                  >
                      Go to Stock Lookup
                  </a>
                  <a
                      href="/simulator"
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-800 transition"
                  >
                      Try the Simulator
                  </a>
              </div>
          </section>

          {/* Features Section */}
          <section className="py-16 w-full">
              <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto">
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">Historical Stock Lookup</h3>
                      <p className="text-gray-600 mt-2">
                          Analyze historical stock performance with detailed data.
                      </p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">Investment Simulator</h3>
                      <p className="text-gray-600 mt-2">
                          Simulate investments and evaluate potential outcomes.
                      </p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">Personalized Insights</h3>
                      <p className="text-gray-600 mt-2">
                          Get personalized insights to enhance your investment strategy.
                      </p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">Secure and Reliable</h3>
                      <p className="text-gray-600 mt-2">
                          Your data is safe with our secure and reliable platform.
                      </p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">User-Friendly Interface</h3>
                      <p className="text-gray-600 mt-2">
                          Navigate our platform with ease and simplicity.
                      </p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-lg text-center">
                      <h3 className="text-xl font-bold text-blue-700">Detailed Analysis</h3>
                      <p className="text-gray-600 mt-2">
                          Dive deep into historical data for informed decisions.
                      </p>
                  </div>
              </div>
          </section>

          {/* Social Media Section */}
          <section className="py-10 bg-gray-100 w-full">
              <h2 className="text-3xl font-bold text-center mb-6">Follow Us</h2>
              <div className="flex justify-center space-x-8">
                  <a
                      href="https://www.tiktok.com/@histovest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                  >
                      TikTok: @histovest
                  </a>
                  <a
                      href="https://www.instagram.com/histovest1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                  >
                      Instagram: histovest1
                  </a>
                  <a
                      href="https://www.youtube.com/@histovest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                  >
                      YouTube: @histovest
                  </a>
              </div>
          </section>
      </main>
  );
}
