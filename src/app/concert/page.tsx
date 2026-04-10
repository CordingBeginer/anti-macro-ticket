"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, Calendar, MapPin } from "lucide-react";

export default function ConcertListPage() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 실시간 KOPIS 데이터 중 '대중음악'만 필터링해서 가져오기
  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/kopis');
        const result = await res.json();
        if (result.data) {
          // KOPIS 카테고리가 '대중음악'인 것만 필터링
          const popConcerts = result.data.filter((item: any) => 
            item.category === "대중음악" || item.category === "콘서트"
          );
          setConcerts(popConcerts);
        }
      } catch (err) {
        console.error("콘서트 리스트 로딩 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchConcerts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20 animate-in fade-in duration-500">
      {/* 1. 상단 헤더 */}
      <header className="flex items-center justify-between px-5 py-4 bg-white sticky top-0 z-20 border-b border-gray-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-800 hover:text-melon-green transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">콘서트</h1>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-full">
          <Search size={22} className="text-gray-800" />
        </button>
      </header>

      {/* 2. 서브 필터 (시연용) */}
      <div className="flex gap-2 px-5 py-3 bg-white overflow-x-auto hide-scrollbar border-b border-gray-50">
        {["전체", "아이돌", "내한공연", "페스티벌", "힙합/EDM"].map((tab) => (
          <button key={tab} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${tab === "전체" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200"}`}>
            {tab}
          </button>
        ))}
      </div>

      <main className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-melon-green" size={44} />
            <p className="text-sm font-bold text-gray-400 italic">Anti-Macro 시스템 실시간 연동 중...</p>
          </div>
        ) : concerts.length > 0 ? (
          /* 3. 콘서트 그리드 리스트 */
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {concerts.map((concert) => (
              <Link 
                key={concert.id} 
                href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`}
                className="flex flex-col group"
              >
                {/* 포스터 */}
                <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-3 transform transition duration-300 group-hover:scale-[1.02] group-active:scale-95">
                  <img src={concert.imageUrl} alt={concert.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* 정보 */}
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2 group-hover:text-melon-green transition-colors">
                    {concert.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                    <MapPin size={10} />
                    <span className="truncate">{concert.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Calendar size={10} />
                    <span>{concert.date.split('~')} 오픈</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <p className="text-gray-300 font-bold">현재 예정된 콘서트 데이터가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}