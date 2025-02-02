"use client";

import "../styles/globals.css";
import TopBar from "../components/TopBar";
import DisclaimerModal from "../components/DisclaimerModal";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-darkGray text-white">
        <DisclaimerModal /> {/* Disclaimer is always included */}
        <TopBar />
        <main>{children}</main>
        <footer className="text-center py-4 mt-8 bg-black text-lightGray">
          <p className="text-sm">© {new Date().getFullYear()} HistoVest. All rights reserved.</p>
          <p className="text-sm">
            <a href="/privacy-policy" className="text-gold hover:underline mr-4">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-gold hover:underline">
              Terms of Service
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
