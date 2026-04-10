"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, RefreshCw, QrCode } from "lucide-react";

// ★ Firebase 모듈
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  
  const performanceTitle = searchParams.get('title') || "공연 정보 없음";
  const selectedZone = searchParams.get('zone') || "VIP석";
  
  // ★ 다중 좌석 데이터 받기 (이전 코드 호환을 위해 seats, seat 둘 다 체크)
  const seatsParam = searchParams.get('seats') || searchParams.get('seat') || "";
  const seatsArr = seatsParam ? seatsParam.split(",") : [];
  const seatCount = seatsArr.length > 0 ? seatsArr.length : 1;
  const seatInfo = seatsArr.length > 0 ? `${selectedZone} ${seatsArr.join(", ")}` : "좌석 정보 없음";
  
  // ★ 결제 금액 및 포인트 세팅
  const unitPrice = PRICE_MAP[selectedZone] || 165000;
  const totalPrice = unitPrice * seatCount; 
  const [balance, setBalance] = useState(5000000); // 500만 포인트 넉넉하게!
  
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

      // 1. Firebase Firestore 저장 (다중 좌석에 맞게 totalPrice, seatCount 추가)
      const docRef = await addDoc(collection(db, "tickets"), {
        title: performanceTitle,
        seat: seatInfo,
        seatCount: seatCount,
        price: totalPrice,
        code: ticketCode,
        status: "결제완료",
        createdAt: serverTimestamp(),
        userId: "test-user-01", 
      });

      console.log("🔥 Firebase DB 저장 성공! 문서 ID: ", docRef.id);

      // 2. QR 코드 데이터 생성 (QR 리더기가 무조건 인식하도록 깔끔한 영문/숫자 포맷팅)
      const qrText = `[TICKET] CODE: ${ticketCode} / SEATS: ${seatCount}`;
      const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
      setQrImageUrl(generatedQrUrl);

      // 3. 결제 완료 상태 업데이트
      setBalance(prev => prev - totalPrice);
      setIsProcessing(false);
      setIsPaid(true);

      // 4. 로컬 스토리지에 내 티켓 정보 저장
      const newTicket = {
        id: docRef.id, 
        title: performanceTitle,
        date: "2026.05.22 (금) 18:00", 
        seat: seatInfo,
        code: ticketCode,
        qrUrl: generatedQrUrl
      };
      const existingTickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
      localStorage.setItem('myTickets', JSON.stringify([newTicket, ...existingTickets]));

    } catch (error) {
      console.error("Firebase 저장 에러:", error);
      alert("서버 연결에 문제가 발생했습니다. 다시 시도해주세요.");
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
          
          {/* ★ 스마트폰 카메라로 인식 가능한 QR 코드 렌더링 */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="border-4 border-gray-100 p-3 rounded-2xl shadow-sm mb-2">
              <img src={qrImageUrl} alt="QR Code" className="w-36 h-36" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">입장용 QR 코드</p>
          </div>

          <div className="border-b-2 border-dashed border-gray-100 pb-6 mb-6">
            <p className="text-xs text-gray-400 font-bold mb-1.5">예매 공연</p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight line-clamp-2">{performanceTitle}</h2>
            <p className="text-sm text-gray-500 mt-2.5">2026.05.22 (금) 18:00</p>
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
            <p className="text-xs text-gray-500 mt-1">2026.05.22 (금) 18:00</p>
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
              서버에 안전하게 저장 중...
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