import Head from "next/head";

const Features = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 text-gray-300">
            {/* 🔹 Meta Tags for SEO */}
            <Head>
                <title>HistoVest Features - AI-Driven Historical Stock Analysis</title>
                <meta name="description" content="Explore HistoVest's powerful features, including AI-powered stock insights, historical data analysis, and interactive financial simulations." />
                <meta name="keywords" content="HistoVest features, AI stock analysis, historical stock data, investment tools, stock market trends" />
                <meta property="og:title" content="HistoVest Features - AI-Driven Historical Stock Analysis" />
                <meta property="og:description" content="Discover how HistoVest helps investors analyze historical stock market trends with AI-powered insights and data visualization tools." />
                <meta property="og:image" content="/histovest-features.png" />
                <meta property="og:url" content="https://histovest.com/features" />
            </Head>

            <h1 className="text-4xl font-extrabold mb-6 text-[#facc15]">🚀 Features</h1>

            <section>
                <p className="text-lg leading-relaxed">
                    HistoVest is an educational platform that helps users analyze historical investments and market trends using AI-powered insights and interactive simulations.
                </p>

                <ul className="mt-6 space-y-3 text-lg list-disc list-inside">
                    <li>📊 <span className="text-white font-semibold">Historical Stock Data</span> – View and analyze past stock prices and trends.</li>
                    <li>🤖 <span className="text-white font-semibold">AI-Powered Insights</span> – Get AI-driven analysis on investment strategies.</li>
                    <li>📅 <span className="text-white font-semibold">Timeframe Selection</span> – Choose different historical time ranges.</li>
                    <li>🛠 <span className="text-white font-semibold">Simulation Tools</span> – Test different market conditions.</li>
                </ul>
            </section>
        </div>
    );
};

export default Features;
