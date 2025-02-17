const Contact = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 text-gray-300">
            <h1 className="text-4xl font-extrabold mb-6 text-[#facc15]">📞 Contact Us</h1>

            {/* Contact Information */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#facc15]">📩 Get in Touch</h2>
                <p className="text-lg">
                    Have questions, feedback, or need assistance? We’d love to hear from you!
                </p>
                <p className="text-lg mt-4 font-semibold">
                    📧 Email:{" "}
                    <a href="mailto:historicalfinanceinformation@gmail.com" className="text-[#facc15] underline">
                        historicalfinanceinformation@gmail.com
                    </a>
                </p>
            </section>

            {/* Social Media */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-[#facc15]">🌎 Follow Us</h2>
                <p className="text-lg">Stay connected with HistoVest on social media:</p>
                <ul className="list-none mt-4 text-lg">
                    <li><strong>🎵 TikTok:</strong> <a href="https://www.tiktok.com/@histovest" className="text-[#facc15] underline">@histovest</a></li>
                    <li><strong>📸 Instagram:</strong> <a href="https://www.instagram.com/histovest1" className="text-[#facc15] underline">histovest1</a></li>
                    <li><strong>🎥 YouTube:</strong> <a href="https://www.youtube.com/@histovest" className="text-[#facc15] underline">@histovest</a></li>
                </ul>
            </section>

            {/* Contact Form */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-[#facc15]">📬 Send Us a Message</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium">Name</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white rounded-md focus:ring-yellow-500" placeholder="Enter your name" />
                    </div>
                    <div>
                        <label className="block text-lg font-medium">Email</label>
                        <input type="email" className="w-full p-3 bg-gray-800 text-white rounded-md focus:ring-yellow-500" placeholder="Enter your email" />
                    </div>
                    <div>
                        <label className="block text-lg font-medium">Message</label>
                        <textarea rows="4" className="w-full p-3 bg-gray-800 text-white rounded-md focus:ring-yellow-500" placeholder="Type your message"></textarea>
                    </div>
                    <button type="submit" className="px-6 py-3 bg-[#facc15] text-black font-bold rounded-md hover:bg-yellow-600 transition">
                        Submit
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Contact;
