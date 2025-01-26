import Link from "next/link";

export default function HomePage() {
    return (
        <main className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="text-center py-12 bg-white shadow-sm">
                <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to HistoVest</h1>
                <p className="text-gray-600 text-lg mb-6">
                    Explore historical stock data with ease!
                </p>
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Go to Stock Lookup
                </button>
            </section>

            {/* Features Section */}
            <section className="features-section bg-gray-100 py-12">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Why Choose HistoFin?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="feature-card p-6 bg-white shadow-md rounded-lg">
                            <h3 className="font-bold text-xl mb-2 text-blue-600">Historical Stock Lookup</h3>
                            <p className="text-gray-600">
                                Analyze stock performance from any period with ease.
                            </p>
                        </div>
                        <div className="feature-card p-6 bg-white shadow-md rounded-lg">
                            <h3 className="font-bold text-xl mb-2 text-blue-600">Investment Simulator</h3>
                            <p className="text-gray-600">
                                Test your strategies without the risk.
                            </p>
                        </div>
                        <div className="feature-card p-6 bg-white shadow-md rounded-lg">
                            <h3 className="font-bold text-xl mb-2 text-blue-600">Personalized Insights</h3>
                            <p className="text-gray-600">
                                Get detailed analysis and insights tailored to your needs.
                            </p>
                        </div>
                        <div className="feature-card p-6 bg-white shadow-md rounded-lg">
                            <h3 className="font-bold text-xl mb-2 text-blue-600">Easy-to-Use Interface</h3>
                            <p className="text-gray-600">
                                Navigate our platform effortlessly, even as a beginner.
                            </p>
                        </div>
                        <div className="feature-card p-6 bg-white shadow-md rounded-lg">
                            <h3 className="font-bold text-xl mb-2 text-blue-600">Secure and Reliable Platform</h3>
                            <p className="text-gray-600">
                                Your data is protected with our top-notch security protocols.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Links Section */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
                    <div className="flex justify-center space-x-6">
                        <a
                            href="https://www.tiktok.com/@histovest"
                            target="_blank"
                            className="text-blue-500 hover:underline"
                            rel="noopener noreferrer"
                        >
                            TikTok: @histovest
                        </a>
                        <a
                            href="https://www.instagram.com/histovest1"
                            target="_blank"
                            className="text-pink-500 hover:underline"
                            rel="noopener noreferrer"
                        >
                            Instagram: histovest1
                        </a>
                        <a
                            href="https://www.youtube.com/@histovest"
                            target="_blank"
                            className="text-red-500 hover:underline"
                            rel="noopener noreferrer"
                        >
                            YouTube: @histovest
                        </a>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                        © {new Date().getFullYear()} HistoVest. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    );
}
