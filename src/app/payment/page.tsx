/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, RefreshCw } from "lucide-react";

// 🔥 Supabase 설정 (lib 폴더의 인스턴스 사용)
import { supabase } from "@/src/lib/superbase";

// 가격표
const PRICE_MAP: Record<string, number> = {
  "VIP석": 165000,
  "R석": 143000,
  "S석": 121000,
  "A석": 99000,
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const performanceId = searchParams.get('id') || "PF123456";
  const performanceTitle = searchParams.get('title') || "공연 정보 없음";
  const selectedDate = searchParams.get('date') || "2026.05.22 (금) 18:00";
  const selectedZone = searchParams.get('zone') || "VIP석";
  
  // 다중 좌석 데이터 받기 
  const seatsParam = searchParams.get('seats') || searchParams.get('seat') || "";
  const seatsArr = seatsParam ? seatsParam.split(",") : [];
  const seatCount = seatsArr.length > 0 ? seatsArr.length : 1;
  const seatInfo = seatsArr.length > 0 ? `${selectedZone} ${seatsArr.join(", ")}` : "좌석 정보 없음";
  
  // 결제 금액 및 포인트 세팅
  const unitPrice = PRICE_MAP[selectedZone] || 165000;
  const totalPrice = unitPrice * seatCount; 
  const [balance, setBalance] = useState(5000000); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");

  const handlePayment = async () => {
    if (balance < totalPrice) {
      alert("잔액이 부족합니다.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const ticketCode = `AMT-${Math.floor(Math.random() * 1000000)}`;

      // Supabase에 데이터 저장하기 (좌석 개수만큼 쪼개서 개별 저장)
      const insertData = seatsArr.map(seatId => ({
        performance_id: performanceId, 
        user_id: "test-user-01",       
        title: performanceTitle,       
        seat_id: seatId.trim(),        
        seat: `${selectedZone} ${seatId.trim()}`, 
        date: selectedDate,            
        price: unitPrice,              
        code: `AMT-${Math.floor(Math.random() * 1000000)}`, 
        status: "결제완료"
      }));

      // Supabase bookings 테이블에 배열 통째로 INSERT!
      const { error } = await supabase
        .from("bookings")
        .insert(insertData);

      if (error) {
        throw error; // 에러를 강제로 catch 블록으로 던집니다!
      }

      console.log("🔥 Supabase DB 완벽 저장 성공!");

      // QR 코드 데이터 생성 
      const qrText = `[TICKET] CODE: ${ticketCode} / SEATS: ${seatCount}`;
      const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
      setQrImageUrl(generatedQrUrl);

      // 결제 완료 상태 업데이트
      setBalance(prev => prev - totalPrice);
      setIsProcessing(false);
      setIsPaid(true);

    } catch (error: any) {
      // 🔥 빈 껍데기({}) 대신 진짜 에러 메시지를 화면과 콘솔에 띄워줍니다!
      console.error("🔥 진짜 에러 원인:", error.message || error);
      console.error("🔥 에러 디테일:", error.details || "디테일 없음");
      
      alert(`DB 저장 실패: ${error.message || "알 수 없는 에러가 발생했습니다."}\n(개발자 도구 콘솔창을 확인해주세요)`);
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
            <span className="text-gray-500 text-sm font-bold">보유 포인트</span>
            <span className="text-3xl font-black text-gray-900">{balance.toLocaleString()} <span className="text-xl text-gray-400 font-bold">P</span></span>
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