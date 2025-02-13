export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-[#121212] text-white flex justify-center items-center px-6 py-12">
        <div className="max-w-4xl w-full p-12 bg-[#0F0F0F] backdrop-blur-lg border border-gray-700 shadow-2xl rounded-2xl">
          {children}
        </div>
      </div>
    );
  }
  