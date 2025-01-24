const Contact = () => {
    return (
        <div className="container mx-auto py-8 px-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            
            {/* Contact Information Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                <p className="text-lg text-gray-700 mb-4">
                    Have questions, feedback, or need assistance? We’d love to hear from you! Reach out using the email below:
                </p>
                <ul className="list-none text-lg text-gray-700">
                    <li>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:historicalfinanceinformation@gmail.com" className="text-blue-500">
                            historicalfinanceinformation@gmail.com
                        </a>
                    </li>
                </ul>
            </section>

            {/* Social Media Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Follow Us on Social Media</h2>
                <p className="text-lg text-gray-700 mb-4">
                    Stay updated with our latest features and announcements by following us:
                </p>
                <ul className="list-none text-lg text-gray-700">
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

            {/* Contact Form Section (Optional) */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-lg font-medium text-gray-700">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Type your message here"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Contact;
