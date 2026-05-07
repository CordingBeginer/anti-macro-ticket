/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Concert {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  category: string;
  [key: string]: unknown;
}

export default function AllConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/kopis');
        const result = await res.json();
        if (result.data) {
          const sorted = result.data.sort((a: Concert, b: Concert) => b.id.localeCompare(a.id));
          setConcerts(sorted);
        }
      } catch {
        console.error("데이터 로딩 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      {/* ★ 헤더도 와이드하게 1440px로 정렬 */}
      <header className="bg-white sticky top-0 z-20 border-b border-gray-200 shadow-sm w-full flex justify-center">
        <div className="w-full max-w-[1440px] px-5 md:px-8 py-5 flex items-center">
          <Link href="/" className="mr-4 text-gray-800 hover:text-melon-green transition">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">전체 공연 리스트</h1>
        </div>
      </header>

      {/* ★ 메인 리스트 영역: 최대 1440px, 4~5열 그리드로 메인 화면과 통일! */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 md:px-8 py-10 mb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <Loader2 className="animate-spin text-melon-green" size={60} />
            <p className="font-bold text-gray-400 text-xl">모든 데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 w-full animate-in fade-in duration-500">
            {concerts.map((concert) => (
              <Link key={concert.id} href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`} className="w-full group flex flex-col cursor-pointer">
                {/* ★ 이미지 짤림 및 늘어남 방지 (object-contain) */}
                <div className="w-full aspect-[3/4.2] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-md relative transform transition duration-500 group-hover:-translate-y-2 group-hover:shadow-xl border border-gray-200 flex items-center justify-center">
                  <img src={concert.imageUrl} alt={concert.title} className="w-full h-full object-contain transition duration-700 group-hover:scale-105" 
                       onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"} />
                  <div className="absolute top-3 left-3 bg-melon-green/90 backdrop-blur-sm text-white text-[12px] font-black px-3 py-1.5 rounded-full shadow-sm">
                    {concert.category.includes("대중음악") ? "콘서트" : concert.category.replace("(서양음악)", "").replace("(한국음악)", "")}
                  </div>
                </div>
                <h3 className="font-extrabold text-[18px] leading-snug line-clamp-2 text-gray-900 group-hover:text-melon-green transition-colors h-[48px]">
                  {concert.title}
                </h3>
                <p className="text-[14px] text-gray-500 mt-2 font-bold truncate">{concert.location}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}