import { useRouter } from "next/router";
import SectorAnalysis from "@/components/SectorAnalysis";

export default function SectorPage() {
  const router = useRouter();
  const { sector } = router.query;

  return <SectorAnalysis sector={sector as string} />;
}
