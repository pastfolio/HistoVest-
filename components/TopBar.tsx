import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Added FaTimes for close icon
import { supabase } from "../lib/supabase";

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      console.log("🔍 User:", data.user);
    };

    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false); // Close menu on logout
  };

  const menuItems = [
    { href: "/stock-data", text: "Historical Stock Lookup" },
    { href: "/historical-stock-simulator", text: "Historical Stock Simulator" },
    { href: "/sector-analyzer", text: "Sector Analyzer" },
    { href: "/about", text: "About" },
    { href: "/features", text: "Features" },
    { href: "/contact", text: "Contact Us" },
  ];

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold">
          <Link href="/">HistoVest</Link>
        </div>

        {/* Hamburger Menu Toggle */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? (
              <FaTimes className="text-white text-2xl" />
            ) : (
              <FaBars className="text-white text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
          <div className="text-center">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block py-4 text-2xl text-gray-200 hover:text-white transition duration-200"
                onClick={toggleMenu}
              >
                {item.text}
              </Link>
            ))}

            {/* Auth Links */}
            <div className="border-t border-gray-700 my-4 w-32 mx-auto"></div>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-4 text-2xl text-gray-200 hover:text-white transition duration-200"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-4 text-2xl text-red-400 hover:text-red-300 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block py-4 text-2xl text-gray-200 hover:text-white transition duration-200"
                  onClick={toggleMenu}
                >
                  🔐 Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-4 text-2xl text-gray-200 hover:text-white transition duration-200"
                  onClick={toggleMenu}
                >
                  ✨ Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;