import Link from 'next/link';

const TopBar = () => {
    return (
        <div className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <div className="text-2xl font-bold">
                    <Link href="/">HistoFin</Link>
                </div>
                <div className="flex space-x-4">
                    <Link href="/about" className="hover:text-gray-400">About</Link>
                    <Link href="/features" className="hover:text-gray-400">Features</Link>
                    <Link href="/contact" className="hover:text-gray-400">Contact</Link>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
