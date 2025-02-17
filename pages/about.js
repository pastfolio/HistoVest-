import Head from "next/head";

const About = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 text-gray-300">
            {/* 🔹 Meta Tags for SEO */}
            <Head>
                <title>About HistoVest - AI-Powered Historical Stock Insights</title>
                <meta name="description" content="Learn more about HistoVest, the AI-powered platform that helps you analyze historical investments, market trends, and stock data." />
                <meta name="keywords" content="HistoVest, historical stock data, AI stock analysis, investment research, stock market trends" />
                <meta property="og:title" content="About HistoVest - AI-Powered Historical Stock Insights" />
                <meta property="og:description" content="Discover how HistoVest helps investors and researchers explore historical stock market trends using AI-powered insights and data visualization." />
                <meta property="og:image" content="/histovest-banner.png" />
                <meta property="og:url" content="https://histovest.com/about" />
            </Head>

            {/* About Section */}
            <section className="mb-12">
                <h1 className="text-4xl font-extrabold mb-6 text-[#facc15]">📌 About Us</h1>
                <p className="text-lg leading-relaxed">
                    Welcome to <span className="font-semibold text-white">HistoVest</span>, the ultimate platform for exploring and understanding historical investments 
                    and their outcomes. HistoVest empowers users by providing interactive tools to simulate past stock data, enabling them to analyze market 
                    trends, strategies, and key moments in financial history.
                </p>
            </section>

            {/* Contact Section */}
            <section className="mb-12">
                <h2 className="text-3xl font-bold mb-4 text-[#facc15]">📩 Contact Us</h2>
                <p className="text-lg">
                    Have questions? Reach out to us via email:
                </p>
                <p className="text-lg mt-4 font-semibold">
                    📧 Email:{" "}
                    <a href="mailto:historicalfinanceinformation@gmail.com" className="text-[#facc15] underline">
                        historicalfinanceinformation@gmail.com
                    </a>
                </p>
            </section>
        </div>
    );
};

export default About;
