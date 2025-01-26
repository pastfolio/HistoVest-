import '../styles/globals.css'; // Import TailwindCSS global styles
import TopBar from '../components/TopBar'; // Import your TopBar component

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <TopBar /> {/* TopBar is now globally included */}
                {children} {/* Renders the content of each page */}
                <footer className="bg-gray-100 text-center py-4 mt-8">
                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} HistoVest. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-600">
                        <a href="/privacy-policy" className="text-blue-500 hover:underline mr-4">
                            Privacy Policy
                        </a>
                        <a href="/terms-of-service" className="text-blue-500 hover:underline">
                            Terms of Service
                        </a>
                    </p>
                </footer>
            </body>
        </html>
    );
}
