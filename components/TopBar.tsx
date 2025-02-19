import Link from 'next/link';
import { useState } from 'react';

const TopBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    return (
        <div className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <div className="text-2xl font-bold">
                    <Link href="/">HistoVest</Link>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-4">
                    {menuItems.map((item, index) => (
                        <Link key={index} href={item.href} className="hover:text-gray-400">
                            {item.text}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Navigation Toggle */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 shadow-lg z-10">
                    <div className="container mx-auto flex flex-col items-start px-6 py-4 space-y-4">
                        {menuItems.map((item, index) => (
                            <Link key={index} href={item.href} className="block w-full py-2 hover:text-gray-400" onClick={toggleMenu}>
                                {item.text}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopBar;