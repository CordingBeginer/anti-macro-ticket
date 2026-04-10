// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-green-500 mb-4" size={50} />
      <h2 className="text-2xl font-black text-gray-800 tracking-tight italic">Anti-Macro Ticket</h2>
      <p className="text-sm font-bold text-gray-500 mt-2">안전하게 공연 정보를 불러오는 중입니다...</p>
    </div>
  );
}