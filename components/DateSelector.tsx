import { Calendar } from "lucide-react";

interface Props {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export default function DateSelector({ startDate, setStartDate, endDate, setEndDate }: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-[#facc15] flex items-center gap-2">
        <Calendar /> Select Date Range
      </h2>
      <div className="flex space-x-3">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-3 bg-gray-800 text-white border border-gray-600 w-1/2 rounded-lg text-center"/>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-3 bg-gray-800 text-white border border-gray-600 w-1/2 rounded-lg text-center"/>
      </div>
    </div>
  );
}
