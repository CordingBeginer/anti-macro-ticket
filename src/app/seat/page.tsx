"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Tesseract from "tesseract.js";
import { ArrowLeft, RefreshCw, CalendarDays, ShieldCheck, Armchair, Loader2 } from "lucide-react";
import NaverMap from "../components/NaverMap";
import Script from "next/script"; // 🔥 스크립트 미리 불러오기 도구

const ROWS = Array.of('A', 'B', 'C', 'D', 'E', 'F');
const SOLD_OUT_SEATS = Array.of('A3', 'C7', 'D10', 'D11', 'F1', 'F2');
const MOCK_DATES = Array.of("05.22 (금)", "05.23 (토)", "05.24 (일)");

const NORMAL_QUIZ = Array.of(
  { q: "숫자 '6' 다음 숫자는?", a: "7" },
  { q: "1 더하기 2의 정답은?", a: "3" },
  { q: "숫자 '4' 다음 숫자는?", a: "5" },
  { q: "숫자 '8' 다음 숫자는?", a: "9" },
  { q: "영(0) 다음 숫자는?", a: "1" }
);

const TICKET_ZONES = [
  { name: "VIP석", price: "165,000원" },
  { name: "R석", price: "143,000원" },
  { name: "S석", price: "121,000원" },
  { name: "A석", price: "99,000원" }
];

function SeatSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const performanceTitle = searchParams.get('title') || "공연 정보 없음";

  // KOPIS 상세 정보 상태
  const [showInfo, setShowInfo] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(true);

  // 예매 스텝 및 상태
  const [step, setStep] = useState<"DATE" | "CAPTCHA" | "SEAT">("DATE");
  const [selectedDate, setSelectedDate] = useState(MOCK_DATES);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // 캔버스 및 AI 인증 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentQuiz, setCurrentQuiz] = useState({ q: '', a: '' });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 

  // KOPIS 상세 정보 불러오기
  useEffect(() => {
    if (!id) return;
    const fetchDetailData = async () => {
      setIsDetailLoading(true);
      try {
        const res = await fetch(`/api/kopis-detail?id=${id}`);
        const result = await res.json();
        if (result.data) {
          setShowInfo(result.data);
        }
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      } finally {
        setIsDetailLoading(false);
      }
    };
    fetchDetailData();
  }, [id]);

  // 캔버스 초기화
  const resetCanvas = () => {
    const randomQuiz = NORMAL_QUIZ[Math.floor(Math.random() * NORMAL_QUIZ.length)];
    setCurrentQuiz(randomQuiz);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.fillStyle = "white"; 
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (step === "CAPTCHA") resetCanvas();
  }, [step]);

  // 캔버스 드로잉 로직
  const getCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches.clientX : e.clientX;
    const clientY = e.touches ? e.touches.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineCap = "round"; 
      ctx.lineJoin = "round"; 
      ctx.lineWidth = 26; 
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault(); 
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y); 
      ctx.stroke();
      ctx.beginPath();  
      ctx.moveTo(x, y); 
    }
  };

  // Tesseract AI 판독 로직
  const verifyDrawing = async () => {
    if (!canvasRef.current) return;
    setIsAnalyzing(true); 

    try {
      const paddedCanvas = document.createElement("canvas");
      paddedCanvas.width = 500;
      paddedCanvas.height = 500;
      const pCtx = paddedCanvas.getContext("2d");
      
      if (pCtx) {
        pCtx.fillStyle = "white"; 
        pCtx.fillRect(0, 0, 500, 500);
        pCtx.drawImage(canvasRef.current, 100, 100);
      }

      const imageURL = paddedCanvas.toDataURL("image/png");
      const result = await Tesseract.recognize(imageURL, 'eng', {
        tessedit_char_whitelist: '0123456789', 
        tessedit_pageseg_mode: '10' 
      });

      const aiResult = result.data.text.replace(/[^0-9]/g, ''); 
      setIsAnalyzing(false); 

      if (aiResult === currentQuiz.a) {
        alert(`AI 보안 인증 성공! (AI가 [${aiResult}]로 완벽히 판독했습니다)`);
        setStep("SEAT");
      } else {
        alert(`앗! AI 판독결과: [ ${aiResult || "인식불가"} ]\n정답(${currentQuiz.a})이 아닙니다. 다시 한번 그려주세요!`);
        resetCanvas(); 
      }
    } catch (err) {
      console.error("AI 인식 에러:", err);
      setIsAnalyzing(false);
      alert("AI 인식 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const toggleSeat = (id: string) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== id));
    } else {
      if (selectedSeats.length >= 8) {
        alert("좌석은 최대 8개까지만 예매 가능합니다.");
        return;
      }
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const goToPayment = () => {
    if (!selectedZone || selectedSeats.length === 0) return;
    const params = new URLSearchParams({
      zone: selectedZone,
      seats: selectedSeats.join(','),
      title: performanceTitle,
      date: selectedDate
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full text-gray-900">
      <header className="flex justify-center p-5 bg-white sticky top-0 z-10 border-b border-gray-200 w-full shadow-sm">
        <div className="w-full max-w-[1000px] flex items-center">
          <button onClick={() => step === "DATE" ? router.back() : setStep("DATE")} className="mr-4 hover:scale-110 transition"><ArrowLeft size={24} /></button>
          <div className="flex-1 text-left">
            <h1 className="font-extrabold text-lg line-clamp-1">{performanceTitle}</h1>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Tesseract OCR AI</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1000px] mx-auto p-5 md:p-8 mt-2 mb-32">
        {step === "DATE" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300 text-left">
            
            {/* 1. KOPIS 상세 정보 및 지도 영역 */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              {isDetailLoading || !showInfo ? (
                <div className="animate-pulse">
                  <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="w-full md:w-1/3 aspect-[3/4.2] bg-gray-200 rounded-lg"></div>
                    <div className="w-full md:w-2/3 space-y-4 py-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                  <div className="h-80 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-8 mb-10">
                    <div className="w-full md:w-1/3 shrink-0">
                      <img 
                        src={showInfo.poster} 
                        alt={showInfo.title} 
                        className="w-full rounded-2xl shadow-md object-contain bg-gray-50 border border-gray-100" 
                        onError={(e) => e.currentTarget.src = "https://cdn.pixabay.com/photo/2017/01/10/03/54/icon-1968254_1280.png"}
                      />
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col justify-center gap-3 text-[15px] md:text-base">
                      <p className="flex border-b border-gray-100 pb-2"><span className="font-extrabold text-gray-400 w-20 shrink-0">기간</span> <span className="font-semibold text-gray-800">{showInfo.date}</span></p>
                      <p className="flex border-b border-gray-100 pb-2"><span className="font-extrabold text-gray-400 w-20 shrink-0">장소</span> <span className="font-semibold text-gray-800">{showInfo.venue}</span></p>
                      <p className="flex border-b border-gray-100 pb-2"><span className="font-extrabold text-gray-400 w-20 shrink-0">출연진</span> <span className="font-semibold text-gray-800">{showInfo.cast}</span></p>
                      <p className="flex pb-2"><span className="font-extrabold text-gray-400 w-20 shrink-0">가격</span> <span className="font-semibold text-gray-800">{showInfo.price}</span></p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold mb-4 border-b-2 border-gray-900 pb-2 inline-block">공연장 위치 안내</h2>
                    <NaverMap address={showInfo.venue} />
                  </div>
                </>
              )}
            </section>

            {/* 2. 관람일 선택 영역 */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold mb-5 flex items-center gap-2 text-lg">
                <CalendarDays size={20} className="text-green-500" /> 관람일 선택
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOCK_DATES.map(date => (
                  <button key={date} onClick={() => setSelectedDate(date)}
                    className={`py-4 rounded-xl border-2 font-bold transition-all ${
                      selectedDate === date ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300'
                    }`}>{date}</button>
                ))}
              </div>
            </section>

            <button onClick={() => setStep("CAPTCHA")} className="w-full py-5 bg-green-500 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-600 transition flex justify-center items-center">
              <span>좌석 선택하기</span>
            </button>
          </div>
        )}

        {step === "CAPTCHA" && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-5 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-7 text-left animate-in zoom-in-95 duration-200">
              <div className="mb-6">
                <ShieldCheck className="text-green-500 mb-2" size={32} />
                <h2 className="text-xl font-black text-gray-800">매크로 방지 인증</h2>
                <p className="text-sm text-gray-500">아래 숫자를 화면에 큼직하게 그려주세요.</p>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex justify-between items-center mb-4 text-left">
                <div>
                  <p className="text-[10px] text-blue-500 font-black uppercase mb-1">Question</p>
                  <p className="text-lg font-bold text-gray-800">{currentQuiz.q}</p>
                </div>
                <button onClick={resetCanvas} disabled={isAnalyzing} className="p-3 bg-white rounded-full text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50 shadow-sm"><RefreshCw size={20} /></button>
              </div>

              <div className="relative border-2 border-gray-200 bg-white rounded-2xl overflow-hidden aspect-square touch-none shadow-inner mb-6">
                <canvas ref={canvasRef} width={300} height={300} className="w-full h-full cursor-crosshair" 
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-gray-800 z-10">
                    <RefreshCw className="animate-spin text-green-500 mb-3" size={40} />
                    <p className="font-bold text-sm">AI가 숫자를 분석하고 있습니다...</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setStep("DATE")} disabled={isAnalyzing} className="flex-1 py-4 text-gray-400 font-bold disabled:opacity-50 hover:bg-gray-50 rounded-xl transition border">취소</button>
                <button onClick={verifyDrawing} disabled={isAnalyzing} className="flex-1 py-4 bg-green-500 text-white font-black rounded-xl shadow-lg disabled:bg-gray-300 hover:bg-green-600 transition">인증 완료</button>
              </div>
            </div>
          </div>
        )}

        {step === "SEAT" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-5 duration-300 text-left">
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-extrabold text-xl mb-6">등급 및 좌석 선택</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {TICKET_ZONES.map((zone) => (
                  <button key={zone.name} onClick={() => setSelectedZone(zone.name)}
                    className={`py-4 px-5 rounded-xl font-bold border-2 text-left flex justify-between items-center transition-all ${
                      selectedZone === zone.name ? "border-green-500 bg-green-50 text-green-600" : "border-gray-50 bg-gray-50 text-gray-700 hover:border-gray-200"
                    }`}>
                    <span className="flex items-center gap-2"><Armchair size={18}/> {zone.name}</span>
                    <span className="text-[10px] opacity-50">{zone.price}</span>
                  </button>
                ))}
              </div>
              <div className={`w-full bg-gray-50 p-6 rounded-xl overflow-x-auto flex flex-col items-center border transition-opacity duration-300 ${selectedZone ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                 <div className="min-w-[550px] flex flex-col items-center">
                    <div className="w-full h-8 bg-gray-300 rounded-b-2xl text-gray-500 font-black text-[10px] flex items-center justify-center mb-16 tracking-[1em]">STAGE</div>
                    <div className="flex flex-col gap-2.5">
                        {ROWS.map(row => (
                          <div key={row} className="flex gap-2.5 items-center">
                            <span className="w-6 text-xs font-black text-gray-300 text-center">{row}</span>
                            {Array.from({length: 12}).map((_, i) => {
                              const id = `${row}${i+1}`;
                              const isSoldOut = SOLD_OUT_SEATS.includes(id);
                              const isSelected = selectedSeats.includes(id); 
                              
                              return (
                                <button key={id} onClick={() => toggleSeat(id)} disabled={isSoldOut}
                                  className={`w-9 h-9 rounded-md text-[10px] font-bold transition-all ${
                                    isSelected ? 'bg-black text-white scale-110 shadow-lg' : isSoldOut ? 'bg-gray-200 cursor-not-allowed' : 'bg-green-400 hover:bg-green-500 text-green-900'
                                  }`}>
                                  {i+1}
                                </button>
                              )
                            })}
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
            </section>

            <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t p-6 flex justify-center shadow-lg animate-in slide-in-from-bottom-2">
               <div className="w-full max-w-[1000px] flex justify-between items-center gap-4">
                  <div className="text-left flex-1">
                     <span className="text-gray-400 font-bold text-[10px] uppercase">Selected Seats</span>
                     <p className="text-gray-900 font-black text-xl line-clamp-1">
                       {selectedSeats.length > 0 ? `${selectedSeats.join(', ')} (${selectedSeats.length}매)` : "없음"}
                     </p>
                  </div>
                  <button onClick={goToPayment} disabled={!selectedZone || selectedSeats.length === 0} className={`px-12 py-4 rounded-xl font-black text-lg transition-all whitespace-nowrap ${selectedSeats.length > 0 ? 'bg-green-500 text-white shadow-md hover:bg-green-600' : 'bg-gray-100 text-gray-300'}`}>
                    선택 완료
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// url 파라미터를 사용하므로 Suspense로 감싸주어야 합니다.
export default function SeatSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-500 mb-4" size={50} />
        <p className="font-bold text-gray-500 animate-pulse">안전하게 공연 데이터를 불러오는 중입니다...</p>
      </div>
    }>
      {/* 🔥 핵심: KOPIS 로딩하는 동안 백그라운드에서 지도를 미리 다운로드! (속도 대폭 향상) */}
      <Script
        src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=wm2szfaw99&submodules=geocoder"
        strategy="afterInteractive"
      />
      <SeatSelectionContent />
    </Suspense>
  );
}