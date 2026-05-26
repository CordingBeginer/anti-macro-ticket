/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Ticket, ChevronRight, Loader2, LogOut, LogIn } from "lucide-react";
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
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 전역 인증 훅 사용
  const { user, openLoginModal, logout, balance } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
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
            <div className="max-w-[1440px] mx-auto px-8 py-6 flex items-center justify-between w-full gap-4">
              <Link href="/" className="flex-shrink-0 flex items-end gap-2 hover:opacity-80 transition cursor-pointer">
                <h1 className="font-black text-[34px] lg:text-[40px] text-[#00CD3C] tracking-tighter italic leading-none whitespace-nowrap">Anti-Macro</h1>
                <span className="text-[#00CD3C] font-bold mb-1 text-base lg:text-lg hidden lg:inline">Ticket</span>
              </Link>
              
              <div className="flex-1 max-w-[600px] min-w-[300px] flex items-center border-[3px] border-[#00CD3C] rounded-full px-6 py-3 bg-white">
                <input type="text" placeholder="공연명 또는 장소 검색..." className="bg-transparent border-none outline-none text-[15px] lg:text-[16px] w-full font-bold placeholder-gray-400" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                <Search size={24} className="text-[#00CD3C] flex-shrink-0" />
              </div>
               <div className="flex-shrink-0 flex items-center gap-6 font-bold text-[14px] lg:text-[16px]">
                {user && (
                  /* --- 가상 지갑 UI (데스크톱) --- */
                  <div className="flex items-center gap-2 bg-[#F4FBF7] hover:bg-[#EBF7F0] px-4 py-2 rounded-full border border-[#D1F2DE] shadow-sm transition duration-300 group whitespace-nowrap">
                    <span className="text-[17px] group-hover:scale-125 transition duration-300">💳</span>
                    <span className="text-[#00CD3C] text-[13px] font-black tracking-tight">
                      보유 포인트 <strong className="text-gray-900 font-black ml-1 text-[15px]">{balance.toLocaleString()} P</strong>
                    </span>
                  </div>
                )}
                {user ? (
                  user.isAdmin ? (
                    /* --- 최고 관리자 UI --- */
                    <div className="flex items-center gap-2.5 bg-[#FFFDF5] px-4 py-2 rounded-full border border-[#FDE047] shadow-sm whitespace-nowrap animate-in fade-in duration-350">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-inner ring-1 ring-amber-300">
                        👑
                      </div>
                      <span className="text-amber-800">
                        최고 관리자 <strong className="text-amber-600 font-extrabold text-lg">{user.name}</strong>님
                      </span>
                    </div>
                  ) : (
                    /* --- 일반 회원 UI --- */
                    <div className="flex items-center gap-2.5 bg-[#F5F8FF] px-4 py-2 rounded-full border border-[#DBEAFE] shadow-sm whitespace-nowrap animate-in fade-in duration-350">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] text-white rounded-full flex items-center justify-center font-black text-sm shadow-inner">
                        {user.name ? user.name[0] : "👤"}
                      </div>
                      <span className="text-blue-700 font-bold">
                        🎫 일반회원 <strong className="text-[#3B82F6] font-extrabold text-lg">{user.name}</strong>님
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2.5 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm whitespace-nowrap text-gray-400">로그인 필요</div>
                )}
                
                <button onClick={() => user ? logout() : openLoginModal()} className="transition-colors font-black text-gray-400 hover:text-gray-600 cursor-pointer">
                  {user ? <><LogOut size={18} className="inline mr-1"/> 로그아웃</> : <><LogIn size={18} className="inline mr-1"/> 로그인</>}
                </button>
                
                <Link href="/ticket" className="flex items-center gap-2 text-[#00CD3C] bg-green-50 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition whitespace-nowrap">
                  <Ticket size={22} /> 마이티켓
                </Link>
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

          {/* 모바일 전용 헤더 */}
          <header className="block md:hidden bg-white border-b border-gray-200 w-full sticky top-0 z-30 shadow-sm px-4 py-3">
            <div className="flex flex-col gap-2.5">
              {/* 상단: 로고 및 로그인/마이티켓 */}
              <div className="flex items-center justify-between w-full">
                <Link href="/" className="hover:opacity-80 transition cursor-pointer flex-shrink-0">
                  <h1 className="font-black text-[20px] text-[#00CD3C] tracking-tighter italic leading-none whitespace-nowrap">
                    Anti-Macro <span className="text-[#00CD3C] font-bold text-[11px] not-italic ml-0.5">Ticket</span>
                  </h1>
                </Link>
                
                <div className="flex items-center gap-2 font-bold text-[12px] flex-shrink-0">
                  {user ? (
                    <>
                      {/* 동그란 슬라이드형 아바타 프로필 배지 적용 (긴 이메일명 겹침 현상 원천 해결) */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[12px] shadow-sm select-none flex-shrink-0 ${
                        user.isAdmin 
                          ? "bg-gradient-to-tr from-amber-400 to-yellow-500 border border-amber-300" 
                          : "bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] border border-blue-200"
                      }`} title={user.name}>
                        {user.isAdmin ? "👑" : (user.name ? user.name[0].toUpperCase() : "👤")}
                      </div>
                      
                      <button onClick={logout} className="font-black text-gray-400 hover:text-gray-600 cursor-pointer text-[10px] border border-gray-200 bg-gray-50 px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0">
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <button onClick={openLoginModal} className="font-black text-[#00CD3C] hover:text-green-600 cursor-pointer text-[11px] bg-green-50 px-2 py-0.5 rounded-full border border-green-200 whitespace-nowrap flex-shrink-0">
                      로그인
                    </button>
                  )}
                  
                  <Link href="/ticket" className="flex items-center gap-1 text-[#00CD3C] bg-green-50 px-2 py-1 rounded-full shadow-sm hover:shadow-md transition whitespace-nowrap text-[10px] border border-green-100 font-black flex-shrink-0">
                    <Ticket size={11} /> <span>마이티켓</span>
                  </Link>
                </div>
              </div>

              {/* 중단 1.5행: 모바일 전용 가상 지갑 정보 단독 한 줄 노출 */}
              {user && (
                <div className="flex items-center justify-between bg-[#F4FBF7] px-4 py-2.5 rounded-xl border border-[#D1F2DE] text-[11px] font-black text-[#00CD3C] w-full shadow-inner animate-in fade-in duration-300">
                  <div className="flex items-center gap-1.5">
                    <span>💳 내 가상 지갑</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-bold text-[10px]">결제 시 자동 실시간 차감</span>
                  </div>
                  <span className="text-gray-900 text-sm font-black tracking-tight">{balance.toLocaleString()} P</span>
                </div>
              )}

              {/* 중단: 모바일 검색창 */}
              <div className="flex items-center border-[2px] border-[#00CD3C] rounded-full px-3.5 py-1.5 bg-white w-full">
                <input type="text" placeholder="공연명 또는 장소 검색..." className="bg-transparent border-none outline-none text-[12px] w-full font-bold placeholder-gray-400" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                <Search size={16} className="text-[#00CD3C] flex-shrink-0" />
              </div>
            </div>

            {/* 하단: 카테고리 (가로 스크롤 가능) */}
            <nav className="border-t border-gray-100 w-full bg-white mt-2 pt-2 overflow-x-auto hide-scrollbar">
              <div className="flex gap-5 text-[14px] font-extrabold text-gray-700 w-full pb-0.5">
                {CATEGORIES.map(category => (
                  <button key={category} onClick={() => setActiveCategory(category)} className={`transition-colors whitespace-nowrap ${activeCategory === category ? "text-[#00CD3C] border-b-[2px] border-[#00CD3C] pb-0.5" : "hover:text-[#00CD3C]"}`}>
                    {category}
                  </button>
                ))}
              </div>
            </nav>
          </header>

          <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 md:px-8 mt-12 mb-24">
            <section>
              <div className="flex justify-between items-end mb-8 border-b-[3px] border-gray-900 pb-4">
                <h2 className="text-[24px] md:text-[32px] font-extrabold text-gray-900 tracking-tight">실시간 공연 소식</h2>
                {!searchKeyword && <Link href="/all" className="text-[15px] md:text-[17px] font-bold text-gray-500 hover:text-[#00CD3C] flex items-center transition">전체보기 <ChevronRight size={20} /></Link>}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-5">
                  <Loader2 className="animate-spin text-[#00CD3C]" size={60} />
                  <p className="font-bold text-gray-400 text-xl tracking-widest uppercase italic">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10 animate-in fade-in duration-500">
                  {filteredConcerts.map((concert) => (
                    <Link key={concert.id} href={`/seat?id=${concert.id}&title=${encodeURIComponent(concert.title)}`} className="group flex flex-col cursor-pointer">
                      <div className="w-full aspect-[3/4.2] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-md relative transform transition duration-500 group-hover:-translate-y-2 border border-gray-200 flex items-center justify-center">
                        <img src={concert.imageUrl} alt={concert.title} className="w-full h-full object-contain transition duration-700 group-hover:scale-105" onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"} />
                        
                        <div className="absolute top-3 left-3 bg-[#00CD3C] text-white text-[12px] font-black px-3 py-1.5 rounded-full shadow-sm">
                          {concert.category ? concert.category.split("(")[0] : "공연"}
                        </div>
                      </div>
                      <h3 className="font-extrabold text-[18px] leading-snug line-clamp-2 text-gray-900 group-hover:text-[#00CD3C] h-[48px] transition-colors">{concert.title}</h3>
                      <p className="text-[14px] text-gray-500 mt-2 font-bold truncate">{concert.location}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* 로그인 모달 팝업 */}
          <LoginModal />
        </motion.div>
      )}
    </AnimatePresence>
  );
}