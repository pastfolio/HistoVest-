import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa"; // Hamburger icon from react-icons
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
  };

  const menuItems = [
    { href: "/stock-data", text: "Historical Stock Lookup" },
    { href: "/historical-stock-simulator", text: "Historical Stock Simulator" },
    { href: "/sector-analyzer", text: "Sector Analyzer" }, // ✅ ADDED SECTOR ANALYZER
    { href: "/about", text: "About" },
    { href: "/features", text: "Features" },
    { href: "/contact", text: "Contact Us" },
  ];

  return (
    <div className="bg-black text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold">
          <Link href="/">HistoVest</Link>
        </div>

        {/* Hamburger Menu Toggle */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleMenu}
            className="focus:outline-none flex items-center gap-2 px-3 py-2 bg-yellow-500 text-black font-semibold rounded-md shadow-sm hover:bg-yellow-600 transition duration-300"
          >
            <FaBars className="text-lg" />
            <span>Menu</span>
          </button>

          {/* Mobile/Desktop Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block px-4 py-2 text-gray-200 hover:bg-gray-800 hover:text-white transition duration-200"
                  onClick={toggleMenu}
                >
                  {item.text}
                </Link>
              ))}

              {/* Auth Links */}
              <div className="border-t border-gray-700 my-2"></div>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-gray-200 hover:bg-gray-800 hover:text-white transition duration-200"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-4 py-2 text-blue-400 hover:bg-gray-800 hover:text-blue-300 transition duration-200"
                    onClick={toggleMenu}
                  >
                    🔐 Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-2 text-green-400 hover:bg-gray-800 hover:text-green-300 transition duration-200"
                    onClick={toggleMenu}
                  >
                    ✨ Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
