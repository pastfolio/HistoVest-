import { IBM_Plex_Sans } from "next/font/google";
import "../styles/globals.css"; // Import Tailwind styles
import TopBar from "../components/TopBar"; // Import TopBar component

// ✅ Correctly Import IBM Plex Sans with Font Weights
const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], // Ensuring normal to bold weights
});

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={`${ibmPlexSans.className} font-sans`}>
      <TopBar /> {/* Renders the top navigation bar */}
      <Component {...pageProps} />
    </main>
  );
}
