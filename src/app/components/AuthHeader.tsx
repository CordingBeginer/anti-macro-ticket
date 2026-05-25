"use client";

import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "./AuthProvider";
import LoginModal from "./LoginModal";

export default function AuthHeader() {
  const { user, openLoginModal, logout } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            user?.isAdmin ? (
              /* --- 최고 관리자 UI --- */
              <>
                <div className="w-11 h-11 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white ring-2 ring-amber-300">
                  👑
                </div>
                <div className="bg-[#FFFDF5] px-5 py-2.5 rounded-full border border-[#FDE047] shadow-sm flex items-center gap-1.5">
                  <span className="text-amber-800 font-extrabold text-lg">최고 관리자</span>
                  <span className="text-amber-600 font-black text-lg">{user?.name}님</span>
                </div>
              </>
            ) : (
              /* --- 일반 회원 UI --- */
              <>
                <div className="w-11 h-11 bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border border-blue-200">
                  {user?.name ? user.name[0] : "👤"}
                </div>
                <div className="bg-[#F5F8FF] px-5 py-2.5 rounded-full border border-[#DBEAFE] shadow-sm flex items-center gap-1.5">
                  <span className="text-blue-700 font-bold text-lg">🎫 일반회원</span>
                  <span className="text-[#3B82F6] font-black text-lg">{user?.name}님</span>
                </div>
              </>
            )
          ) : (
            /* --- 비로그인 상태 UI --- */
            <>
              <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-lg shadow-sm">
                ?
              </div>
              <span className="text-gray-400 font-bold ml-2">로그인이 필요합니다</span>
            </>
          )}
        </div>

        <button
          onClick={() => {
            if (isLoggedIn) {
              logout();
            } else {
              openLoginModal();
            }
          }}
          className="flex items-center gap-2 text-[#7B7B8B] hover:text-gray-900 transition font-bold text-xl cursor-pointer"
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

      {/* 실시간 팝업 로그인 모달 연동 */}
      <LoginModal />
    </>
  );
}