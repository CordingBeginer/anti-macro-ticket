/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, RefreshCw, Bot, ShieldCheck, AlertCircle } from "lucide-react";

import { supabase } from "@/src/lib/superbase";
import { useAuth } from "../components/AuthProvider";
import LoginModal from "../components/LoginModal";
import { getPerformancePrices } from "../utils/price";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const secureToken = searchParams.get('token');
  const [isTokenVerified, setIsTokenVerified] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      // 1. 형식 조기 점검
      if (!secureToken || !secureToken.startsWith("AMT-SECURE-PASS-")) {
        alert("❌ 보안 인증 우회 시도가 감지되었습니다. 매크로 차단 검증을 완료한 후 결제할 수 있습니다.");
        router.push("/");
        return;
      }

      // 2. 서버 사이드 원격 토큰 무결성 검증 (HMAC-SHA256 & 만료 진단)
      try {
        const verifyRes = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: secureToken })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.valid) {
          setIsTokenVerified(true);
        } else {
          // 보안 서명 불일치 혹은 만료
          alert(`❌ 보안 토큰 검증 실패: ${verifyData.error || "위조되거나 만료된 세션입니다."}`);
          router.push("/");
        }
      } catch (err) {
        console.error("보안 서버 통신 실패:", err);
        alert("⚠️ 보안 검증 서버와의 통신에 실패했습니다. 안전을 위해 예매 화면으로 되돌아갑니다.");
        router.push("/");
      }
    };

    checkTokenValidity();
  }, [secureToken, router]);

  const performanceId = searchParams.get('id') || "PF123456";
  const performanceTitle = searchParams.get('title') || "공연 정보 없음";
  const selectedDate = searchParams.get('date') || "2026.05.22 (금) 18:00";
  const selectedZone = searchParams.get('zone') || "VIP석";
  const category = searchParams.get('category') || "기타";
  
  const seatsParam = searchParams.get('seats') || searchParams.get('seat') || "";
  const seatsArr = seatsParam ? seatsParam.split(",") : [];
  const seatCount = seatsArr.length > 0 ? seatsArr.length : 1;
  const seatInfo = seatsArr.length > 0 ? `${selectedZone} ${seatsArr.join(", ")}` : "좌석 정보 없음";
  
  // getPerformancePrices 기반 등급별 단가 동적 연산
  const dynamicPrices = getPerformancePrices(performanceId, category);
  let unitPrice = dynamicPrices["A석"];
  const zoneLower = selectedZone.toLowerCase();
  
  if (zoneLower.includes("vip") || zoneLower.includes("플로어") || zoneLower.includes("a구역")) {
    if (zoneLower.includes("스탠딩")) {
      unitPrice = Math.round(dynamicPrices["VIP석"] * 0.8 / 1000) * 1000;
    } else {
      unitPrice = dynamicPrices["VIP석"];
    }
  } else if (zoneLower.includes("r석") || zoneLower.includes("1층") || zoneLower.includes("b구역")) {
    unitPrice = dynamicPrices["R석"];
  } else if (zoneLower.includes("s석") || zoneLower.includes("2층") || zoneLower.includes("c구역")) {
    unitPrice = dynamicPrices["S석"];
  } else if (zoneLower.includes("a석") || zoneLower.includes("3층") || zoneLower.includes("d구역")) {
    unitPrice = dynamicPrices["A석"];
  }

  const totalPrice = unitPrice * seatCount; 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");

  // 전역 인증 정보 및 가상 지갑(포인트) 가져오기
  const { user, openLoginModal, logEvent, balance, deductBalance, resetBalance } = useAuth();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'ai_analyzing' | 'ai_success' | 'error' | 'balance_error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'ai_analyzing', title: '', message: '' });

  const handlePayment = async () => {
    // 0. 보안 토큰 검증 여부 체크
    if (!isTokenVerified) {
      alert("❌ 보안 인증을 완료하지 않았습니다. 매크로 차단 검증을 우회할 수 없습니다.");
      router.push("/");
      return;
    }

    // 0. 로그인 상태 확인 (로그인이 필요할 시 예매 모달창 즉시 팝업)
    if (!user) {
      openLoginModal();
      return;
    }

    if (balance < totalPrice) {
      setModalState({ isOpen: true, type: 'balance_error', title: '잔액 부족', message: '보유하신 포인트가 부족합니다.' });
      return;
    }

    // 🛡️ [Pre-check] AI 시뮬레이션 진입 전 1차 중복 예매 검사
    try {
      const { data: earlyCheck, error: earlyError } = await supabase
        .from("bookings")
        .select("seat_id")
        .eq("performance_id", performanceId)
        .eq("date", selectedDate)
        .in("seat_id", seatsArr.map(s => s.trim()))
        .like("seat", `${selectedZone} %`);

      if (earlyError) throw earlyError;
      if (earlyCheck && earlyCheck.length > 0) {
        const taken = earlyCheck.map((b: any) => b.seat_id).join(", ");
        setModalState({
          isOpen: true,
          type: 'error',
          title: '🎟️ 좌석 선점 실패',
          message: `결제 요청하신 좌석 [ ${taken} ]은(는) 이미 다른 사용자가 먼저 예매 완료했습니다.\n\n죄송하지만 처음으로 돌아가 다른 좌석을 예매해 주세요.`
        });
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error("1차 중복검사 실패:", err);
    }

    setIsProcessing(true);
    
    // AI 판독 시뮬레이션
    setModalState({ isOpen: true, type: 'ai_analyzing', title: 'AI 행동 패턴 분석 중...', message: '비정상적인 매크로 접근인지\n확인하고 있습니다.' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setModalState({ isOpen: true, type: 'ai_success', title: 'AI 판독 완료', message: '정상적인 사용자로 확인되었습니다!\n결제를 진행합니다.' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setModalState(prev => ({ ...prev, isOpen: false }));
    
    try {
      // 🛡️ [Final Check] 결제 승인 직전 2차 최종 실시간 중복 예매 검사 (0.001초 미세 찰나 방어)
      const { data: finalCheck, error: finalError } = await supabase
        .from("bookings")
        .select("seat_id")
        .eq("performance_id", performanceId)
        .eq("date", selectedDate)
        .in("seat_id", seatsArr.map(s => s.trim()))
        .like("seat", `${selectedZone} %`);

      if (finalError) throw finalError;
      if (finalCheck && finalCheck.length > 0) {
        const taken = finalCheck.map((b: any) => b.seat_id).join(", ");
        setModalState({
          isOpen: true,
          type: 'error',
          title: '🎟️ 좌석 선점 실패',
          message: `결제 처리 중 간발의 차이로 다른 사용자가 좌석 [ ${taken} ]의 결제를 완료했습니다.\n\n죄송하지만 처음으로 돌아가 다른 좌석을 예매해 주세요.`
        });
        setIsProcessing(false);
        return;
      }

      const ticketCode = `AMT-${Math.floor(Math.random() * 1000000)}`;

      const insertData = seatsArr.map(seatId => ({
        performance_id: performanceId, 
        user_id: user.id,       
        title: performanceTitle,       
        seat_id: seatId.trim(),        
        seat: `${selectedZone} ${seatId.trim()}`, 
        date: selectedDate,            
        price: unitPrice,              
        code: `AMT-${Math.floor(Math.random() * 1000000)}`, 
        status: "결제완료"
      }));

      const { error } = await supabase
        .from("bookings")
        .insert(insertData);

      if (error) {
        throw error;
      }

      console.log("🔥 Supabase DB 완벽 저장 성공!");

      // 4단계: 실시간 동시 접속 로그 이벤트 출력
      await logEvent("🎟️ TICKET BOOKING CREATED", {
        performance: performanceTitle,
        seats: seatsArr.map(s => `${selectedZone} ${s}`),
        totalPrice: totalPrice,
        bookingCount: seatCount,
      });

      const qrText = `[TICKET] CODE: ${ticketCode} / SEATS: ${seatCount}`;
      const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
      setQrImageUrl(generatedQrUrl);

      // 실제 전역 잔액 차감 수행
      const deductSuccess = deductBalance(totalPrice);
      if (!deductSuccess) {
        throw new Error("결제 승인 중 잔액이 부족해졌습니다.");
      }
      
      setIsProcessing(false);
      setIsPaid(true);

    } catch (error: any) {
      console.error("🔥 진짜 에러 원인:", error.message || error);
      console.error("🔥 에러 디테일:", error.details || "디테일 없음");
      
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'DB 저장 실패', 
        message: `${error.message || "알 수 없는 에러가 발생했습니다."}\n\n(Supabase 연결을 확인해주세요)`
      });
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <div className="flex flex-col min-h-screen bg-melon-green px-5 py-10 items-center justify-center animate-in fade-in duration-500">
        <CheckCircle2 size={60} className="text-white mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">결제 완료!</h1>
        <p className="text-white/80 mb-10 text-sm">성공적으로 티켓이 발급되었습니다.</p>
        
        <div className="bg-white w-full max-w-sm rounded-3xl p-7 shadow-2xl relative">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="border-4 border-gray-100 p-3 rounded-2xl shadow-sm mb-2">
              <img src={qrImageUrl} alt="QR Code" className="w-36 h-36" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">입장용 임시 QR 코드</p>
          </div>

          <div className="border-b-2 border-dashed border-gray-100 pb-6 mb-6">
            <p className="text-xs text-gray-400 font-bold mb-1.5">예매 공연</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight line-clamp-2">{performanceTitle}</h2>
            <p className="text-sm text-gray-500 mt-2.5">{selectedDate}</p>
            <p className="text-lg font-black text-melon-green mt-1">{seatInfo} ({seatCount}매)</p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm font-medium">총 결제 금액</span>
            <span className="text-lg font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mt-5 shadow-inner">
            <span className="text-gray-600 text-sm font-bold">남은 잔액</span>
            <span className="text-gray-900 font-extrabold text-lg">{balance.toLocaleString()} P</span>
          </div>
        </div>

        <Link href="/ticket" className="mt-12 bg-white text-melon-green font-bold py-4 w-full max-w-sm text-center rounded-full hover:bg-gray-100 transition shadow-lg">
          마이티켓 확인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-10">
      <header className="flex items-center p-5 bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <button onClick={() => router.back()} className="mr-4 text-gray-800 hover:text-melon-green transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">결제하기</h1>
      </header>

      <main className="p-5 flex flex-col gap-6 mt-4 flex-1">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2.5">
            <Receipt size={20} className="text-melon-green" /> 예매 정보 확인
          </h2>
          <div className="bg-gray-50 p-5 rounded-xl shadow-inner border border-gray-100">
            <p className="font-extrabold text-lg text-gray-900 leading-snug line-clamp-2">{performanceTitle}</p>
            <p className="text-sm text-melon-green font-black mt-2">좌석: {seatInfo} ({seatCount}매)</p>
            <p className="text-xs text-gray-500 mt-1">{selectedDate}</p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2.5">
            <CreditCard size={20} className="text-melon-green" /> 내 가상 지갑
          </h2>
          <div className="flex justify-between items-end border-b border-gray-100 pb-5 mb-5">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-gray-500 text-sm font-bold">보유 포인트</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm("포인트를 500만 P로 다시 충전/초기화하시겠습니까?")) {
                    resetBalance();
                  }
                }}
                className="text-[10px] w-fit bg-green-50 text-[#00CD3C] border border-[#00CD3C]/30 px-2 py-0.5 rounded transition font-bold cursor-pointer"
              >
                포인트 초기화
              </button>
            </div>
            <span className="text-3xl font-black text-gray-900">{(balance || 0).toLocaleString()} <span className="text-xl text-gray-400 font-bold">P</span></span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-gray-500 text-sm font-bold">결제 예정 금액</span>
            <span className="text-2xl font-bold text-red-500">-{totalPrice.toLocaleString()} P</span>
          </div>
        </section>

        <div className="flex-1" />

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all shadow-lg text-lg
            ${isProcessing ? "bg-gray-200 text-gray-500" : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"}`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              강력하게 서버 연결 중...
            </>
          ) : (
            `${totalPrice.toLocaleString()}원 결제하기`
          )}
        </button>
      </main>

      {/* 커스텀 AI & 에러 모달 */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            
            {modalState.type === 'ai_analyzing' && (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5 relative">
                <Bot size={40} className="text-blue-500 animate-pulse" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {modalState.type === 'ai_success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <ShieldCheck size={40} className="text-green-500 animate-in zoom-in duration-300" />
              </div>
            )}
            
            {(modalState.type === 'error' || modalState.type === 'balance_error') && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
                <AlertCircle size={40} className="text-red-500 animate-in duration-300" />
              </div>
            )}

            <h3 className="text-xl font-black text-gray-900 mb-2 whitespace-pre-wrap">{modalState.title}</h3>
            <p className="text-gray-500 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{modalState.message}</p>

            {(modalState.type === 'error' || modalState.type === 'balance_error') && (
              <button 
                onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
              >
                확인
              </button>
            )}
          </div>
        </div>
      )}
      <LoginModal />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-bold text-gray-400">결제 정보 로딩 중...</div>}>
      <PaymentContent />
    </Suspense>
  );
}