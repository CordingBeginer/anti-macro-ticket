"use client";

import { useState } from "react";
import { LogOut, LogIn } from "lucide-react";

export default function AuthHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 max-w-[1440px] mx-auto w-full">
      <div className="flex items-center gap-3">
        
        <div className="w-11 h-11 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {isLoggedIn ? "충" : "?"}
        </div>

        {isLoggedIn ? (
          <div className="bg-[#F0FFF4] px-5 py-2.5 rounded-full border border-[#D1FAE5] shadow-sm">
            <span className="text-gray-700 font-bold text-lg">관리자 </span>
            <span className="text-[#00CD3C] font-black text-lg">충햄과 딸래미들님</span>
          </div>
        ) : (
          <span className="text-gray-400 font-bold ml-2">로그인이 필요합니다</span>
        )}
      </div>

      <button
        onClick={() => setIsLoggedIn(!isLoggedIn)}
        className="flex items-center gap-2 text-[#7B7B8B] hover:text-gray-900 transition font-bold text-xl"
      >
        {isLoggedIn ? (
          <>
            <span>로그아웃</span>
            <LogOut size={22} className="text-[#7B7B8B]" />
          </>
        ) : (
          <>
            <span className="text-[#00CD3C]">로그인</span>
            <LogIn size={22} className="text-[#00CD3C]" />
          </>
        )}
      </button>
    </header>
  );
}