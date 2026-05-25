"use client";

import { motion } from "framer-motion";
import { Smartphone, RotateCw } from "lucide-react";

export default function LandscapeBlocker() {
  return (
    <div className="hidden max-md:landscape:flex fixed inset-0 z-[9999] bg-[#090D16] text-white flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-[#00CD3C]/10 to-[#090D16] opacity-90" />
      
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* 애니메이션 스마트폰 아이콘 */}
        <div className="relative mb-8 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, -90, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-28 border-4 border-white/90 rounded-2xl p-2 relative flex items-center justify-center shadow-2xl"
          >
            {/* 홈버튼/스피커 흉내 */}
            <div className="absolute top-2 w-8 h-1 bg-white/40 rounded-full" />
            <Smartphone size={32} className="text-[#00CD3C]" />
            <div className="absolute bottom-2 w-3 h-3 border border-white/40 rounded-full" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-3 -right-3 w-8 h-8 bg-[#00CD3C] text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <RotateCw size={14} className="animate-pulse" />
          </motion.div>
        </div>

        {/* 안내 메시지 */}
        <h2 className="text-[22px] font-black tracking-tight mb-3">
          🚫 <span className="text-[#00CD3C]">세로 모드</span> 전용 서비스
        </h2>
        <p className="text-[14px] text-gray-300 font-bold leading-relaxed mb-6">
          본 서비스는 티켓팅의 공정성과 화면 그리드 왜곡 방지를 위해 <strong className="text-white">세로 화면에 최적화</strong>되어 있습니다.<br/>
          스마트폰을 세로 방향으로 회전해 주세요!
        </p>

        {/* 안내 배지 */}
        <div className="bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[12px] text-gray-400 font-extrabold tracking-wide uppercase">
          Melon Ticket Secure Guard Active
        </div>
      </div>
    </div>
  );
}
