const About = () => {
    return (
        <div className="container mx-auto py-8 px-6">
            {/* About Section */}
            <section className="mb-12">
                <h1 className="text-3xl font-bold mb-4">About Us</h1>
                <p className="text-lg text-gray-700 mb-4">
                    Welcome to HistoVest, the ultimate platform for exploring and understanding historical investments and their outcomes. 
                    HistoVest is designed to empower users by providing tools to simulate past stock data, enabling them to analyze market 
                    trends, strategies, and patterns from key moments in history.
                </p>
                <p className="text-lg text-gray-700">
                    Our platform goes beyond just data. HistoVest leverages advanced AI-powered feedback to guide users through their 
                    learning journey. With AI-driven insights, users can receive detailed descriptions of historical investment decisions, 
                    their outcomes, and the factors that influenced those results. Whether you’re a student, investor, or researcher, HistoVest 
                    offers an engaging way to educate yourself and deepen your understanding of the financial world.
                </p>
            </section>

            {/* Contact Us Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-lg text-gray-700">
                    Have questions or need assistance? Feel free to reach out to us via email:
                </p>
                <ul className="list-none mt-4 text-lg text-gray-700">
                    <li>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:historicalfinanceinformation@gmail.com" className="text-blue-500">
                            historicalfinanceinformation@gmail.com
                        </a>
                    </li>
                </ul>
            </section>

            {/* Socials Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Follow Us</h2>
                <p className="text-lg text-gray-700">
                    Stay connected and follow us on our social media platforms:
                </p>
                <ul className="list-none mt-4 text-lg text-gray-700">
                    <li>
                        <strong>TikTok:</strong>{" "}
                        <a href="https://www.tiktok.com/@histovest" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            @histovest
                        </a>
                    </li>
                    <li>
                        <strong>Instagram:</strong>{" "}
                        <a href="https://www.instagram.com/histovest1" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            histovest1
                        </a>
                    </li>
                    <li>
                        <strong>YouTube:</strong>{" "}
                        <a href="https://www.youtube.com/@histovest" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            @histovest
                        </a>
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default About;
