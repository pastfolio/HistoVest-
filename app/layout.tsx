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
            </body>
        </html>
    );
}
