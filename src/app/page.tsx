"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, Ticket, ChevronRight, Loader2, X, Home as HomeIcon, Info } from "lucide-react";

const CATEGORIES = ["전체", "콘서트", "뮤지컬", "연극", "클래식", "국악"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/kopis');
        const result = await res.json();
        if (result.data) {
          const sorted = result.data.sort((a: any, b: any) => b.id.localeCompare(a.id));
          setConcerts(sorted);
        }
      } catch (err) {
        console.error("데이터 로딩 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredConcerts = concerts.filter(c => {
    const matchesCategory = activeCategory === "전체" || 
      (activeCategory === "콘서트" && c.category.includes("대중음악")) ||
      (activeCategory === "클래식" && (c.category.includes("클래식") || c.category.includes("서양음악"))) ||
      (activeCategory === "국악" && (c.category.includes("국악") || c.category.includes("한국음악"))) ||
      c.category.includes(activeCategory);
    
    const matchesSearch = c.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                         c.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 overflow-x-hidden w-full">
      
      {/* 📱 모바일 헤더 & 사이드바 */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMenuOpen(false)} />
        <aside className={`absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-melon-green/5">
            <div className="flex-shrink-0">
              <h2 className="font-black text-xl text-melon-green">Anti-Macro</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">USER MENU</p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white rounded-full transition shadow-sm"><X size={20}/></button>
          </div>
          <nav className="p-4 flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl font-bold text-gray-700 transition"><HomeIcon size={20}/> 홈으로</Link>
            <Link href="/ticket" className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl font-bold text-gray-700 transition"><Ticket size={20}/> 마이티켓</Link>
            <button onClick={() => alert("🎓 2026 한림대학교 캡스톤 디자인\n\n✨ 팀명: 충햄과 딸래미들\n\n매크로 없는 청정 티켓팅 문화를 만들어갑니다!")} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl font-bold text-gray-700 transition text-left"><Info size={20}/> 프로젝트 정보</button>
          </nav>
        </aside>
      </div>

      <header className="md:hidden flex justify-between items-center px-5 py-4 bg-white sticky top-0 z-20 border-b border-gray-50 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800 p-1 hover:bg-gray-100 rounded-lg transition"><Menu size={24} /></button>
          {!isSearchOpen && <h1 className="font-black text-2xl text-melon-green tracking-tighter italic leading-none">Anti-Macro Ticket</h1>}
        </div>
        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? "flex-1 ml-4" : "w-auto"}`}>
          {isSearchOpen ? (
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full animate-in zoom-in-95 duration-200">
              <Search size={18} className="text-gray-400 mr-2" />
              <input autoFocus type="text" placeholder="검색" className="bg-transparent border-none outline-none text-sm w-full font-medium" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              <button onClick={() => { setIsSearchOpen(false); setSearchKeyword(""); }} className="ml-2 text-gray-400"><X size={18}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSearchOpen(true)} className="p-1 hover:bg-gray-100 rounded-lg transition"><Search size={22} className="text-gray-800" /></button>
              <Link href="/ticket" className="p-1 hover:bg-gray-100 rounded-lg transition"><Ticket size={22} className="text-gray-800" /></Link>
            </div>
          )}
        </div>
      </header>

      {/* 💻 PC 헤더: 폰트 밀림 방지 + 관리자 상태 고정 */}
      <header className="hidden md:block bg-white border-b border-gray-200 w-full sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-8 py-6 flex items-center justify-between w-full gap-4">
          
          {/* 로고 영역 (shrink-0) */}
          <Link href="/" className="flex-shrink-0 flex items-end gap-2 hover:opacity-80 transition cursor-pointer">
            <h1 className="font-black text-[34px] lg:text-[40px] text-melon-green tracking-tighter italic leading-none whitespace-nowrap">Anti-Macro</h1>
            <span className="text-gray-400 font-bold mb-1 text-base lg:text-lg hidden lg:inline">Ticket</span>
          </Link>
          
          {/* 검색창 영역 (가변 너비) */}
          <div className="flex-1 max-w-[600px] min-w-[300px] flex items-center border-[3px] border-melon-green rounded-full px-6 py-3 shadow-sm focus-within:ring-4 ring-green-100 transition bg-white">
            <input 
              type="text" 
              placeholder="공연명 또는 장소 검색..." 
              className="bg-transparent border-none outline-none text-[15px] lg:text-[16px] w-full font-bold placeholder-gray-400"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Search size={24} className="text-melon-green flex-shrink-0" />
          </div>

          {/* 관리자 정보 영역 (shrink-0) */}
          <div className="flex-shrink-0 flex items-center gap-4 lg:gap-6 font-bold text-[14px] lg:text-[16px]">
            <div className="flex items-center gap-2.5 bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm whitespace-nowrap">
              <div className="flex-shrink-0 w-7 h-7 bg-melon-green text-white rounded-full flex items-center justify-center font-black text-xs">충</div>
              <span className="text-gray-700">관리자 <strong className="text-melon-green font-extrabold">충햄과 딸래미들</strong>님</span>
            </div>
            
            <button className="text-gray-400 hover:text-gray-600 transition whitespace-nowrap">로그아웃</button>
            
            <Link href="/ticket" className="flex items-center gap-2 text-melon-green hover:text-green-600 transition bg-green-50 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md whitespace-nowrap">
              <Ticket size={22} /> 마이티켓
            </Link>
          </div>
        </div>

        {/* 카테고리 네비게이션 */}
        <nav className="border-t border-gray-100 w-full bg-white">
          <div className="max-w-[1440px] mx-auto px-8 flex gap-8 lg:gap-12 py-4 text-[16px] lg:text-[18px] font-extrabold text-gray-700 w-full overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(category => (
              <button 
                key={category} onClick={() => setActiveCategory(category)}
                className={`transition-colors tracking-wide whitespace-nowrap ${activeCategory === category ? "text-melon-green border-b-[3px] border-melon-green pb-1" : "hover:text-melon-green"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* 📱 모바일 가로 스크롤 탭 */}
      <nav className="md:hidden flex gap-6 overflow-x-auto hide-scrollbar px-5 py-2.5 border-b border-gray-100 text-[15px] font-bold text-gray-400 whitespace-nowrap sticky top-[73px] bg-white z-10 w-full">
        {CATEGORIES.map(category => (
          <button 
            key={category} onClick={() => setActiveCategory(category)}
            className={`pb-2 transition-colors ${activeCategory === category ? "text-melon-green border-b-2 border-melon-green" : ""}`}
          >
            {category}
          </button>
        ))}
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 md:px-8 mt-7 md:mt-12 mb-24">
        <section>
          <div className="flex justify-between items-end mb-8 border-b-[3px] border-gray-900 pb-4">
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-gray-900 tracking-tight">
              {searchKeyword ? `"${searchKeyword}" 검색 결과` : "실시간 공연 소식"}
            </h2>
            {!searchKeyword && <Link href="/all" className="text-[15px] md:text-[17px] font-bold text-gray-500 hover:text-melon-green flex items-center transition">전체보기 <ChevronRight size={20} className="ml-1" /></Link>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-5">
              <Loader2 className="animate-spin text-melon-green" size={60} />
              <p className="font-bold text-gray-400 text-xl">실시간 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className={`
              flex overflow-x-auto hide-scrollbar gap-5 pb-4 snap-x md:snap-none
              md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-x-6 md:gap-y-12 w-full animate-in fade-in duration-500
            `}>
              {filteredConcerts.length > 0 ? filteredConcerts.map((concert) => (
                <Link key={concert.id} href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`} className="shrink-0 w-[220px] md:w-auto snap-center group flex flex-col cursor-pointer">
                  {/* 사진 짤림 해결: object-contain */}
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
              )) : (
                <div className="col-span-full w-full text-center py-40 text-gray-400 font-bold border-[3px] border-dashed border-gray-200 rounded-3xl text-2xl bg-white">
                  해당 조건의 공연이 없습니다.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
