"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Crown, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function LoginModal() {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginWithEmail, 
    signUpWithEmail, 
    loginAsAdmin 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"melon" | "admin">("melon");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // 이메일 로그인/가입 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI 진행/에러 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSignUpMode(false);
  };

  const handleClose = () => {
    resetForm();
    closeLoginModal();
  };

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. 유효성 검사
    if (!email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    if (isSignUpMode) {
      // 회원가입 모드
      if (password !== confirmPassword) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        setIsSubmitting(false);
        return;
      }

      const res = await signUpWithEmail(email, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage("회원가입이 완료되었습니다! 메일함에서 인증을 완료하시거나, 로그인해보세요.");
        setIsSignUpMode(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(res.error || "회원가입 도중 문제가 발생했습니다.");
      }
    } else {
      // 로그인 모드
      const res = await loginWithEmail(email, password);
      setIsSubmitting(false);
      if (res.success) {
        handleClose();
      } else {
        setErrorMessage(res.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* 블러 & 다크 어두운 배경 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-[5px]"
        />

        {/* 로그인 카드 컨테이너 */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="bg-white w-full max-w-[460px] rounded-[28px] overflow-hidden shadow-2xl relative z-10 border border-gray-100 flex flex-col"
        >
          {/* 상단 장식 헤더 및 닫기 버튼 */}
          <div className="flex justify-between items-center px-6 pt-6 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00CD3C] animate-pulse" />
              <span className="text-[11px] text-[#00CD3C] font-black tracking-widest uppercase">Safe Ticketing</span>
            </div>
            <button 
              onClick={handleClose} 
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* 브랜딩 영역 */}
          <div className="text-center px-8 pt-2 pb-6">
            <h2 className="text-[34px] font-black text-[#00CD3C] tracking-tighter italic leading-none">
              Anti-Macro <span className="text-[#00CD3C]">Ticket</span>
            </h2>
            <p className="text-xs text-gray-400 font-extrabold mt-2 tracking-tight">
              매크로 없는 깨끗한 티켓팅, 안티 매크로 티켓
            </p>
          </div>

          {/* 멜론티켓 감성의 탭 컨트롤 */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => { setActiveTab("melon"); setErrorMessage(null); }}
              className={`flex-1 py-4 text-sm font-extrabold transition-all border-b-2 ${
                activeTab === "melon" 
                  ? "bg-white text-gray-900 border-[#00CD3C]" 
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              안티 매크로 티켓 로그인
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setErrorMessage(null); }}
              className={`flex-1 py-4 text-sm font-extrabold transition-all border-b-2 ${
                activeTab === "admin" 
                  ? "bg-white text-gray-900 border-[#00CD3C]" 
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              간편 관리자 로그인
            </button>
          </div>

          {/* 스크롤 가능한 본문 영역 */}
          <div className="p-8 max-h-[75vh] overflow-y-auto">
            
            {/* 에러 및 성공 피드백 배너 */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-bold leading-relaxed"
                >
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5 text-green-700 text-xs font-bold leading-relaxed"
                >
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === "melon" ? (
              /* ================== 멜론 ID 로그인 폼 ================== */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* 이메일 인풋 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-black text-gray-600">이메일 주소</label>
                  <div className="relative flex items-center group">
                    <Mail size={18} className="absolute left-4 text-gray-400 group-focus-within:text-[#00CD3C] transition-colors" />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-[#00CD3C] focus:ring-4 focus:ring-[#00CD3C]/10 transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* 비밀번호 인풋 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-black text-gray-600">비밀번호</label>
                  <div className="relative flex items-center group">
                    <Lock size={18} className="absolute left-4 text-gray-400 group-focus-within:text-[#00CD3C] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="6자리 이상 비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-[#00CD3C] focus:ring-4 focus:ring-[#00CD3C]/10 transition-all text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 비밀번호 확인 인풋 (회원가입 모드일 때만 노출) */}
                {isSignUpMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col gap-1.5"
                  >
                    <label className="text-[12px] font-black text-gray-600">비밀번호 확인</label>
                    <div className="relative flex items-center group">
                      <Lock size={18} className="absolute left-4 text-gray-400 group-focus-within:text-[#00CD3C] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호 재입력"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-[#00CD3C] focus:ring-4 focus:ring-[#00CD3C]/10 transition-all text-gray-900"
                      />
                    </div>
                  </motion.div>
                )}

                {/* 자동 로그인 및 일반 안내 링크 (로그인 모드일 때만 노출) */}
                {!isSignUpMode && (
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" className="w-4.5 h-4.5 rounded border-gray-300 text-[#00CD3C] focus:ring-[#00CD3C]" />
                      <span>로그인 상태 유지</span>
                    </label>
                    <div className="flex gap-2">
                      <button type="button" className="hover:text-gray-800">아이디 찾기</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" className="hover:text-gray-800">비밀번호 재설정</button>
                    </div>
                  </div>
                )}

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-2 bg-[#00CD3C] text-white font-black rounded-2xl hover:bg-[#00b534] active:scale-[0.98] transition shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isSignUpMode ? (
                    <>
                      <UserPlus size={18} />
                      <span>이메일 회원가입 완료</span>
                    </>
                  ) : (
                    <span>로그인</span>
                  )}
                </button>

                {/* 회원가입 여부 토글 */}
                <div className="text-center text-xs text-gray-500 font-bold mt-4">
                  {isSignUpMode ? (
                    <p>
                      이미 Anti-Macro 계정이 있으신가요?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setIsSignUpMode(false); setErrorMessage(null); }} 
                        className="text-[#00CD3C] underline hover:text-[#00b534] ml-1"
                      >
                        로그인으로 돌아가기
                      </button>
                    </p>
                  ) : (
                    <p>
                      아직 계정이 없으신가요?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setIsSignUpMode(true); setErrorMessage(null); }} 
                        className="text-[#00CD3C] underline hover:text-[#00b534] ml-1"
                      >
                        무료 회원가입 하기
                      </button>
                    </p>
                  )}
                </div>
              </form>
            ) : (
              /* ================== 간편 관리자 우회 로그인 폼 ================== */
              <div className="flex flex-col text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-100 shadow-sm">
                  <Crown size={32} className="animate-bounce" />
                </div>
                
                <h3 className="text-lg font-black text-gray-900 mb-2">
                  관리자 1초 간편 로그인 Bypass
                </h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed px-2 mb-6">
                  기존에 도커 데이터베이스에 저장되어 있던 디폴트 관리자 아이디(<strong className="text-amber-600 font-black">test-user-01</strong>) 계정으로 원클릭 로그인합니다.
                  <br />
                  <span className="text-[#00CD3C]">별도의 회원 가입이나 환경 설정 없이 즉시 모든 데이터 조회가 가능합니다!</span>
                </p>

                <button
                  onClick={loginAsAdmin}
                  className="w-full py-4.5 bg-gray-900 text-white font-black text-base rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition shadow-xl shadow-gray-200 hover:shadow-gray-300 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Crown size={20} className="text-amber-400" />
                  <span>관리자 계정으로 로그인</span>
                </button>
              </div>
            )}

          </div>

          {/* 하단 안심 보안 문구 */}
          <div className="bg-gray-50/70 py-4 px-6 border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-black tracking-wide">
              본 시스템은 AI 행동 분석을 탑재하여 쾌적한 예매 환경을 보장합니다.
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
