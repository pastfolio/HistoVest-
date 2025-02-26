import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa"; // Hamburger icon from react-icons

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/stock-data", text: "Historical Stock Lookup" },
    { href: "/historical-stock-simulator", text: "Historical Stock Simulator" },
    { href: "/about", text: "About" },
    { href: "/features", text: "Features" },
    { href: "/contact", text: "Contact Us" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-black text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="text-2xl font-bold">
          <Link href="/">HistoVest</Link>
        </div>

        {/* Hamburger Menu Toggle (Always Visible) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleMenu}
            className="focus:outline-none flex items-center gap-2 px-3 py-2 bg-gray-900 text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 transition duration-300"
          >
            <FaBars className="text-lg" />
            <span>Menu</span>
          </button>

          {/* Mobile/Desktop Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;