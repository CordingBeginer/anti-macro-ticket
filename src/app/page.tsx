/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Ticket, ChevronRight, Loader2, LogOut, LogIn, Menu, X, Home as HomeIcon, Settings, Trophy, Gift, Clock, HelpCircle, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./components/AuthProvider";
import LoginModal from "./components/LoginModal";

const CATEGORIES = ["전체", "콘서트", "뮤지컬", "연극", "클래식", "국악"];

interface Concert {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  [key: string]: unknown;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 전역 인증 훅 사용
  const { user, openLoginModal, logout, balance, resetBalance } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasShownSplash = sessionStorage.getItem("hasShownSplash");
      if (hasShownSplash === "true") {
        setShowSplash(false);
      } else {
        const timer = setTimeout(() => {
          setShowSplash(false);
          sessionStorage.setItem("hasShownSplash", "true");
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-[#00CD3C] flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-white text-5xl md:text-7xl font-black italic tracking-tighter leading-none flex flex-col md:block">
              <span>Anti-Macro</span>
              <span className="md:ml-4 text-white/80">Ticket</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-20 flex flex-col items-center"
          >
            <p className="text-white/80 font-bold text-lg tracking-widest mb-4">
              충햄과 딸래미들의 클린 예매
            </p>
            <div className="flex gap-2">
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col min-h-screen bg-gray-50 overflow-x-hidden w-full"
        >
          {/* 데스크톱 전용 헤더 */}
          <header className="hidden md:block bg-white border-b border-gray-200 w-full sticky top-0 z-30 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between w-full gap-4">
              
              {/* 왼쪽 그룹: 로고 + 멜론 티켓 스타일의 콤팩트 검색창 (로고 옆 밀착 배치로 위치 흔들림 영구 차단) */}
              <div className="flex items-center gap-6 lg:gap-8 flex-1">
                <Link href="/" className="flex-shrink-0 flex items-end gap-1.5 hover:opacity-80 transition cursor-pointer">
                  <h1 className="font-black text-[30px] lg:text-[34px] text-[#00CD3C] tracking-tighter italic leading-none whitespace-nowrap">Anti-Macro</h1>
                  <span className="text-[#00CD3C] font-bold mb-0.5 text-sm lg:text-base hidden lg:inline">Ticket</span>
                </Link>
                
                {/* 멜론 티켓 스타일: border-2의 얇고 날렵한 콤팩트 검색창 */}
                <div className="w-[200px] md:w-[260px] lg:w-[340px] xl:w-[380px] flex items-center border-2 border-[#00CD3C] rounded-full px-5 py-1.5 bg-white transition-all focus-within:shadow-[0_0_12px_rgba(0,205,60,0.08)]">
                  <input type="text" placeholder="공연명 또는 장소 검색..." className="bg-transparent border-none outline-none text-[13px] lg:text-[14px] w-full font-bold placeholder-gray-400" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  <Search size={18} className="text-[#00CD3C] flex-shrink-0" />
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-4 lg:gap-5 font-bold text-[13px] lg:text-[15px]">
                {mounted && user ? (
                  <div className="flex items-center gap-3">
                    {/* --- 통합 유저 및 포인트 지갑 UI (검색창 두께에 맞춘 border-2 및 rounded-full) --- */}
                    <div className="flex flex-col justify-center items-center border-2 border-[#00CD3C] rounded-full px-6 py-1 bg-white shadow-sm min-h-[46px] min-w-[200px] whitespace-nowrap select-none transition duration-300">
                      {/* 1줄: 최고 관리자 / 일반 회원 */}
                      {user.isAdmin ? (
                        <div className="flex items-center gap-1 leading-none mb-0.5">
                          <span className="text-[10px]">👑</span>
                          <span className="text-amber-800 text-[10px] lg:text-[11px] font-black">
                            최고 관리자 <strong className="text-amber-600 font-extrabold">{user.name}</strong>님
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 leading-none mb-0.5">
                          <span className="text-[10px]">👤</span>
                          <span className="text-blue-700 font-bold text-[10px] lg:text-[11px]">
                            일반회원 <strong className="text-[#3B82F6] font-extrabold">{user.name}</strong>님
                          </span>
                        </div>
                      )}

                      {/* 미세한 수평 구분선 */}
                      <div className="w-[120px] h-[1px] bg-gray-100 my-0.5" />

                      {/* 2줄: 보유 포인트 */}
                      <div className="flex items-center gap-2 leading-none mt-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">💳</span>
                          <span className="text-[#00CD3C] text-[10px] lg:text-[11px] font-black tracking-tight">
                            포인트 <strong className="text-gray-900 font-black ml-0.5">{(balance || 0).toLocaleString()} P</strong>
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm("포인트를 500만 P로 다시 충전/초기화하시겠습니까?")) {
                              resetBalance();
                            }
                          }}
                          className="text-[9px] bg-green-50 text-[#00CD3C] hover:bg-[#00CD3C] hover:text-white border border-[#00CD3C]/30 px-1.5 py-0.5 rounded transition font-bold cursor-pointer"
                          title="포인트 500만 P로 초기화"
                        >
                          초기화
                        </button>
                      </div>
                    </div>
                    
                    {/* 세로 구분선 */}
                    <div className="h-8 w-[1px] bg-gray-200" />
                  </div>
                ) : (
                  mounted && !user && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm whitespace-nowrap text-gray-400 text-xs">
                      로그인 필요
                    </div>
                  )
                )}
                
                {/* 우측 로그아웃/로그인 및 마이티켓 액션 버튼 */}
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <button onClick={() => user ? logout() : openLoginModal()} className="transition-colors font-black text-gray-400 hover:text-gray-600 cursor-pointer text-xs lg:text-sm py-1.5 px-2.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                    {user ? <><LogOut size={15} /> <span>로그아웃</span></> : <><LogIn size={15} /> <span>로그인</span></>}
                  </button>
                  
                  <Link href="/ticket" className="flex items-center gap-1.5 text-[#00CD3C] bg-green-50 hover:bg-green-100 hover:shadow transition-all duration-300 px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap text-xs lg:text-sm font-black border border-green-200">
                    <Ticket size={15} /> <span>마이티켓</span>
                  </Link>
                </div>
              </div>
            </div>

            <nav className="border-t border-gray-100 w-full bg-white">
              <div className="max-w-[1440px] mx-auto px-8 flex gap-8 lg:gap-12 py-4 text-[16px] lg:text-[18px] font-extrabold text-gray-700 w-full overflow-x-auto hide-scrollbar">
                {CATEGORIES.map(category => (
                  <button key={category} onClick={() => setActiveCategory(category)} className={`transition-colors whitespace-nowrap ${activeCategory === category ? "text-[#00CD3C] border-b-[3px] border-[#00CD3C] pb-1" : "hover:text-[#00CD3C]"}`}>
                    {category}
                  </button>
                ))}
              </div>
            </nav>
          </header>

          {/* 모바일 전용 헤더 (멜론티켓 특유의 다크포레스트 그린/네이비 톤) */}
          <header className="block md:hidden bg-gradient-to-r from-[#0d1e1a] to-[#121c1a] w-full sticky top-0 z-30 shadow-md px-4 py-3.5 text-white">
            <div className="flex items-center justify-between w-full">
              {/* 좌측: 햄버거 메뉴 */}
              <button onClick={() => setDrawerOpen(true)} className="p-1.5 hover:bg-white/10 rounded-full transition active:scale-95 flex-shrink-0">
                <Menu size={24} className="text-white" />
              </button>

              {/* 중앙: Melon티켓 스타일 로고 */}
              <Link href="/" className="hover:opacity-90 transition cursor-pointer flex items-center justify-center flex-1">
                <span className="font-extrabold text-[18px] tracking-tight whitespace-nowrap">
                  Anti-Macro <strong className="text-[#00CD3C] font-black">Ticket</strong>
                </span>
              </Link>

              {/* 우측: 돋보기 */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-1.5 hover:bg-white/10 rounded-full transition active:scale-95 flex-shrink-0">
                <Search size={22} className="text-white" />
              </button>
            </div>

            {/* 모바일 검색창 오버레이 (멜론 돋보기 클릭 시 스무스하게 노출) */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full mt-2"
                >
                  <div className="flex items-center border border-[#00CD3C] rounded-full px-4 py-2 bg-white/10 backdrop-blur-md w-full shadow-inner">
                    <input
                      type="text"
                      placeholder="공연명 또는 장소 검색..."
                      className="bg-transparent border-none outline-none text-[13px] w-full font-bold placeholder-gray-400 text-white"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <Search size={16} className="text-[#00CD3C] flex-shrink-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* 데스크톱 전용 메인 */}
          <main className="hidden md:block flex-1 w-full max-w-[1440px] mx-auto px-8 mt-12 mb-24">
            <section>
              <div className="flex justify-between items-end mb-8 border-b-[3px] border-gray-900 pb-4">
                <h2 className="text-[32px] font-extrabold text-gray-900 tracking-tight">실시간 공연 소식</h2>
                {!searchKeyword && <Link href="/all" className="text-[17px] font-bold text-gray-500 hover:text-[#00CD3C] flex items-center transition">전체보기 <ChevronRight size={20} /></Link>}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-5">
                  <Loader2 className="animate-spin text-[#00CD3C]" size={60} />
                  <p className="font-bold text-gray-400 text-xl tracking-widest uppercase italic">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10 animate-in fade-in duration-500">
                  {filteredConcerts.map((concert) => (
                    <Link key={concert.id} href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`} className="group flex flex-col cursor-pointer">
                      <div className="w-full aspect-[3/4.2] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-md relative transform transition duration-500 group-hover:-translate-y-2 border border-gray-200 flex items-center justify-center">
                        <img src={concert.imageUrl} alt={concert.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"} />
                      </div>
                      <span className="text-[12px] text-[#00CD3C] font-extrabold tracking-tight mb-1">
                        {concert.category ? concert.category.split("(")[0] : "공연"}
                      </span>
                      <h3 className="font-extrabold text-[18px] leading-snug line-clamp-2 text-gray-900 group-hover:text-[#00CD3C] h-[48px] transition-colors">{concert.title}</h3>
                      <p className="text-[14px] text-gray-500 mt-2 font-bold truncate">{concert.location}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* 모바일 전용 메인 (멜론티켓 룩앤필 적용) */}
          <main className="flex-1 w-full bg-gray-50 overflow-y-auto block md:hidden pb-24">
            
            {/* 1. 상단 추천 대형 카드 캐러셀 (검색 중이 아닐 때만 노출) */}
            {!searchKeyword && concerts.length > 0 && (
              <div className="bg-gradient-to-b from-[#121c1a] to-[#f9fafb] pb-6 pt-2">
                <div className="overflow-x-auto flex gap-4 px-5 pb-4 snap-x snap-mandatory hide-scrollbar scroll-smooth w-full">
                  {concerts.slice(0, 5).map((concert, idx) => (
                    <Link
                      key={`featured-${concert.id}`}
                      href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`}
                      className="flex-shrink-0 w-[82vw] aspect-[3/3.8] bg-gray-900 rounded-3xl overflow-hidden relative snap-center shadow-lg border border-white/5 group"
                    >
                      <img
                        src={concert.imageUrl}
                        alt={concert.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1715]/95 via-transparent to-transparent flex flex-col justify-end p-5">
                        <h3 className="text-white font-extrabold text-[19px] leading-tight line-clamp-2 drop-shadow">
                          {concert.title}
                        </h3>
                        <p className="text-white/60 text-[12px] font-bold mt-1.5 truncate">
                          {concert.location}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/10">
                        {idx + 1} / 5
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 파스텔톤 둥근 알약형 퀵 카테고리 버튼 그리드 */}
            <div className="px-5 my-6">
              <div className="flex flex-wrap gap-2.5 justify-center">
                {[
                  { name: "전체", bg: "bg-[#00D2C4]", shadow: "shadow-[0_4px_12px_rgba(0,210,196,0.2)]", icon: "🎨" },
                  { name: "콘서트", bg: "bg-[#FF758F]", shadow: "shadow-[0_4px_12px_rgba(255,117,143,0.2)]", icon: "🎤" },
                  { name: "뮤지컬", bg: "bg-[#BF55EC]", shadow: "shadow-[0_4px_12px_rgba(191,85,236,0.2)]", icon: "🎭" },
                  { name: "연극", bg: "bg-[#FF9F43]", shadow: "shadow-[0_4px_12px_rgba(255,159,67,0.2)]", icon: "🎪" },
                  { name: "클래식", bg: "bg-[#3A86F0]", shadow: "shadow-[0_4px_12px_rgba(58,134,240,0.2)]", icon: "🎹" },
                  { name: "국악", bg: "bg-[#7F00FF]", shadow: "shadow-[0_4px_12px_rgba(127,0,255,0.2)]", icon: "🌾" }
                ].map((cat) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={`cat-btn-${cat.name}`}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-black tracking-tight transition duration-300 active:scale-95 select-none ${
                        isActive
                          ? `${cat.bg} text-white ${cat.shadow} scale-105 border border-white/20`
                          : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-100"
                      }`}
                    >
                      <span className="text-[14px] leading-none">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. 이 주의 추천 공연 (가로 스크롤 슬라이더) */}
            <div className="my-6">
              <div className="flex justify-between items-center px-5 mb-4">
                <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                  🔥 이 주의 추천 공연
                </h2>
                {!searchKeyword && (
                  <Link href="/all" className="text-[13px] font-extrabold text-gray-400 hover:text-[#00CD3C] flex items-center transition">
                    전체보기 <ChevronRight size={16} />
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#00CD3C]" size={36} />
                </div>
              ) : filteredConcerts.length === 0 ? (
                <div className="text-center py-10 font-bold text-gray-400 text-sm">
                  검색 조건에 맞는 공연이 존재하지 않습니다.
                </div>
              ) : (
                <div className="overflow-x-auto flex gap-4 px-5 pb-3 snap-x snap-mandatory hide-scrollbar w-full">
                  {filteredConcerts.map((concert) => (
                    <Link
                      key={`recommend-${concert.id}`}
                      href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`}
                      className="flex-shrink-0 w-[44vw] flex flex-col snap-start group"
                    >
                      <div className="w-full aspect-[3/4.2] bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-md relative border border-gray-200 flex items-center justify-center">
                        <img
                          src={concert.imageUrl}
                          alt={concert.title}
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                          onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"}
                        />
                      </div>
                      <span className="text-[11px] text-[#00CD3C] font-extrabold tracking-tight mb-0.5">
                        {concert.category ? concert.category.split("(")[0] : "공연"}
                      </span>
                      <h4 className="font-extrabold text-[14px] leading-snug line-clamp-2 text-gray-900 group-hover:text-[#00CD3C] transition-colors h-[38px]">
                        {concert.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-1 font-semibold truncate">
                        {concert.location}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </main>

          {/* 로그인 모달 팝업 */}
          <LoginModal />

          {/* 모바일 멜론티켓 스타일 사이드 드로어 메뉴 */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                {/* 어두운 Backdrop 오버레이 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                />

                {/* 드로어 패널 */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed left-0 top-0 bottom-0 w-[290px] bg-white z-50 flex flex-col shadow-2xl md:hidden overflow-hidden"
                >
                  {/* 드로어 상단 바 */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-gray-50">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full transition active:scale-95 text-gray-700"
                    >
                      <HomeIcon size={22} />
                    </button>
                    <div className="flex items-center gap-3 text-gray-700">
                      <button onClick={() => { setDrawerOpen(false); setSearchOpen(true); }} className="p-1 hover:bg-gray-200 rounded-full transition">
                        <Search size={22} />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded-full transition">
                        <Settings size={22} />
                      </button>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="p-1 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600"
                      >
                        <X size={22} />
                      </button>
                    </div>
                  </div>

                  {/* 드로어 프로필 섹션 */}
                  <div className="p-5 border-b border-gray-100 bg-[#FCFDFD]">
                    {mounted && user ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                            <span className="text-[24px] text-gray-500 font-bold select-none">👤</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-[17px] text-gray-900 tracking-tight flex items-center gap-1 cursor-pointer hover:text-[#00CD3C] transition">
                              <span className="truncate">{user.name}님</span>
                              <ChevronRight size={16} className="text-gray-400 mt-0.5" />
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#00CD3C] font-bold">
                              <span>{user.isAdmin ? "👑 최고 관리자" : "👤 일반 회원"}</span>
                            </div>
                          </div>
                        </div>

                        {/* 포인트 정보 카드 */}
                        <div className="bg-green-50/60 rounded-xl p-3 border border-green-100 flex items-center justify-between select-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">💳</span>
                            <span className="text-xs text-gray-500 font-bold">보유 포인트</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00CD3C] font-black text-sm tracking-tight">
                              {(balance || 0).toLocaleString()} P
                            </span>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                if (confirm("포인트를 500만 P로 다시 충전/초기화하시겠습니까?")) {
                                  resetBalance();
                                }
                              }}
                              className="text-[10px] bg-white text-[#00CD3C] border border-[#00CD3C]/30 px-1.5 py-0.5 rounded transition font-bold cursor-pointer"
                            >
                              초기화
                            </button>
                          </div>
                        </div>

                        {/* 예매 확인 / For U 액션 링크 */}
                        <div className="flex gap-2 text-xs font-extrabold mt-1">
                          <Link
                            href="/ticket"
                            onClick={() => setDrawerOpen(false)}
                            className="flex-1 text-center py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition active:scale-[0.98]"
                          >
                            🎟️ 예매확인
                          </Link>
                          <button
                            onClick={() => {
                              setDrawerOpen(false);
                              logout();
                            }}
                            className="flex-1 text-center py-2 bg-red-50/50 border border-red-100 rounded-lg text-red-500 hover:bg-red-100/50 transition active:scale-[0.98]"
                          >
                            🚪 로그아웃
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 py-2 items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <span className="text-gray-400">👤</span>
                        </div>
                        <p className="text-[13px] text-gray-500 font-bold">
                          로그인 후 더 많은 서비스를 이용하세요
                        </p>
                        <button
                          onClick={() => {
                            setDrawerOpen(false);
                            openLoginModal();
                          }}
                          className="w-full bg-[#00CD3C] text-white py-2 rounded-lg font-black text-sm hover:bg-green-600 transition active:scale-[0.98] shadow-sm shadow-green-500/20"
                        >
                          로그인하기
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 드로어 세로 메뉴 카테고리 리스트 */}
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <p className="text-[11px] text-gray-400 font-extrabold px-3 mb-2 tracking-wider uppercase">
                      카테고리 장르
                    </p>
                    <div className="flex flex-col gap-1 font-bold text-[14px]">
                      {[
                        { name: "전체", icon: "🎟️" },
                        { name: "콘서트", icon: "🎤" },
                        { name: "뮤지컬", icon: "🎭" },
                        { name: "연극", icon: "🎪" },
                        { name: "클래식", icon: "🎹" },
                        { name: "국악", icon: "🌾" }
                      ].map((item) => (
                        <button
                          key={`drawer-cat-${item.name}`}
                          onClick={() => {
                            setActiveCategory(item.name);
                            setDrawerOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition duration-200 text-left active:scale-[0.98] ${
                            activeCategory === item.name
                              ? "bg-green-50 text-[#00CD3C] font-black"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-[17px]">{item.icon}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 안심예매 매크로 방지 띠 배너 */}
                  <div className="bg-[#00CD3C] text-white px-4 py-3 flex items-center justify-between text-xs font-black tracking-tight select-none">
                    <div className="flex items-center gap-1.5">
                      <Bell size={13} className="animate-bounce" />
                      <span>매크로 없는 깨끗한 안심예매 ON</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">🛡️ 보안중</span>
                  </div>

                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}