import '../styles/globals.css'; // Ensure TailwindCSS is imported
import TopBar from '../components/TopBar'; // Import the TopBar component

function MyApp({ Component, pageProps }) {
    return (
        <>
            <TopBar /> {/* Render the TopBar */}
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
