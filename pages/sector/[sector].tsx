import { useRouter } from "next/router";
import { useEffect } from "react";
import SectorAnalysis from "../../components/SectorAnalysis";


export default function SectorPage() {
  const router = useRouter();
  const { sector } = router.query;

  useEffect(() => {
    console.log("📍 SectorPage Loaded");
    console.log("🔍 Sector from URL:", sector);
  }, [sector]);

  // Ensure sector is defined before rendering
  if (!sector) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <h1 className="text-xl font-semibold text-yellow-400">Loading sector page...</h1>
      </div>
    );
  }

  return <SectorAnalysis sector={sector as string} />;
}
