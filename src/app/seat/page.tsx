/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Tesseract from "tesseract.js";
import { ArrowLeft, RefreshCw, CalendarDays, ShieldCheck, Armchair, Loader2 } from "lucide-react";
import Script from "next/script";

// ---------------------------------------------------------
// 🗺️ 네이버 맵 컴포넌트 (방어 코드 탑재 완료 버전)
// ---------------------------------------------------------
// ---------------------------------------------------------
// 🗺️ 네이버 맵 컴포넌트 (공식 문서 기본 예제 100% 반영 테스트용)
// ---------------------------------------------------------
function NaverMap({ lat, lng, facilityName }: { lat: number; lng: number; facilityName?: string }) {
  
  // 공식 문서의 지도 생성 함수
  const initMap = () => {
    // window.naver 객체가 로드되었는지 확인
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      const position = new window.naver.maps.LatLng(lat, lng);
      
      // 1. 지도 옵션 설정 (공식 문서 방식)
      const mapOptions = {
          center: position,
          zoom: 15
      };
      
      // 2. id="map" 요소에 지도 생성 (공식 문서 방식)
      const map = new window.naver.maps.Map('map', mapOptions);
      
      // 3. 공연장 위치 마커(핑) 추가
      const marker = new window.naver.maps.Marker({
          position: position,
          map: map,
          cursor: 'pointer'
      });

      // 4. 마커 클릭 시 네이버 지도 기본 검색(홈)으로 연결
      if (facilityName) {
          const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(facilityName)}`;
          
          window.naver.maps.Event.addListener(marker, 'click', function() {
              window.open(searchUrl, '_blank');
          });

          // 5. 공연장 이름 및 지도 홈 유도 정보창 추가
          const infoWindow = new window.naver.maps.InfoWindow({
              content: `
                <div onclick="window.open('${searchUrl}', '_blank')" 
                     style="padding:12px 15px; font-weight:900; color:#000; text-align:center; border:2px solid #00CD3C; border-radius:10px; background:white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 5px; cursor:pointer; transition: transform 0.2s;">
                  ${facilityName}
                  <div style="font-size:11px; color:#00CD3C; margin-top:5px; display:flex; align-items:center; justify-content:center; gap:4px; padding-top:5px; border-top:1px solid #eee;">
                    <span>🧭 네이버 지도 홈으로 보기</span>
                  </div>
                </div>`,
              borderWidth: 0,
              disableAnchor: true,
              backgroundColor: "transparent",
              pixelOffset: new window.naver.maps.Point(0, -10)
          });
          infoWindow.open(map, marker);
      }
      
      console.log("지도 로드 및 마커 표시 완료!");
    } else {
      console.log("네이버 객체를 찾을 수 없습니다.");
    }
  };

  return (
    // 공식 문서의 DOM 요소 지정 방식 <div id="map" style="width:100%;height:400px;"></div> 반영
    <div style={{ width: "100%", height: "400px", marginTop: "16px", borderRadius: "1.5rem", overflow: "hidden" }}>
      
      {/* 공식 문서의 <script> 태그를 Next.js 방식으로 호출 */}
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'snlcvi9s8n'}`}
        onReady={initMap}
      />
      
      {/* 지도가 그려질 필수 DOM 요소 */}
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}

// ---------------------------------------------------------
// 💺 좌석 선택 및 메인 로직
// ---------------------------------------------------------
const ROWS = Array.of('A', 'B', 'C', 'D', 'E', 'F');
const SOLD_OUT_SEATS = Array.of('A3', 'C7', 'D10', 'D11', 'F1', 'F2');
const MOCK_DATES = Array.of("05.22 (금)", "05.23 (토)", "05.24 (일)");

const getPerformanceDates = (dateStr: string) => {
  if (!dateStr || dateStr.includes('정보 없음')) return MOCK_DATES;
  try {
    const [start, end] = dateStr.split(' ~ ');
    const startDate = new Date(start.replace(/\./g, '-'));
    const endDate = end ? new Date(end.replace(/\./g, '-')) : startDate;
    
    if (isNaN(startDate.getTime())) return MOCK_DATES;

    const dates = [];
    const current = new Date(startDate);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 최대 6개의 날짜만 표시하여 UI가 너무 길어지지 않도록 방지
    while (current <= endDate && dates.length < 6) {
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const date = String(current.getDate()).padStart(2, '0');
      const day = days[current.getDay()];
      dates.push(`${month}.${date} (${day})`);
      current.setDate(current.getDate() + 1);
    }
    return dates.length > 0 ? dates : MOCK_DATES;
  } catch {
    return MOCK_DATES;
  }
};

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

  interface ShowInfo {
    poster: string;
    title: string;
    date: string;
    venue: string;
    cast: string;
    price: string;
    la: string;
    lo: string;
    adres: string;
    telno: string;
    parkinglot: string;
    detailImages: string[];
  }

  const [showInfo, setShowInfo] = useState<ShowInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'date' | 'venue'>('info');
  const [isDetailLoading, setIsDetailLoading] = useState(true);

  const [step, setStep] = useState<"DATE" | "CAPTCHA" | "SEAT">("DATE");
  const [selectedDate, setSelectedDate] = useState(MOCK_DATES[0]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 5)); // 기본 2026년 6월 (KOPIS 데이터 로드 시 업데이트)
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentQuiz, setCurrentQuiz] = useState({ q: '', a: '' });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 

  useEffect(() => {
    if (!id) return;
    const fetchDetailData = async () => {
      setIsDetailLoading(true);
      try {
        const res = await fetch(`/api/kopis-detail?id=${id}`);
        const result = await res.json();
        if (result.data) {
          setShowInfo(result.data);
          
          // 공연 시작일을 달력 기본 달로 설정
          if (result.data.date) {
            try {
              const startStr = result.data.date.split(' ~ ')[0].replace(/\./g, '-');
              const d = new Date(startStr);
              if (!isNaN(d.getTime())) {
                setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (error) {
        console.error("상세 정보 로딩 실패:", error);
      } finally {
        setIsDetailLoading(false);
      }
    };
    fetchDetailData();
  }, [id]);

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

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

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

  // 유효한 예약 가능 날짜 범위 계산
  let validStart: Date | null = null;
  let validEnd: Date | null = null;
  if (showInfo && showInfo.date && !showInfo.date.includes('정보 없음')) {
    try {
      const [startStr, endStr] = showInfo.date.split(' ~ ');
      validStart = new Date(startStr.replace(/\./g, '-'));
      validStart.setHours(0, 0, 0, 0);
      validEnd = endStr ? new Date(endStr.replace(/\./g, '-')) : new Date(validStart);
      validEnd.setHours(23, 59, 59, 999);
    } catch(e) {}
  }

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
                  
                  {/* 탭 메뉴 */}
                  <div className="flex border-b border-gray-200 mt-8 mb-6">
                    <button 
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 py-4 text-center font-bold text-[15px] md:text-lg border-b-4 transition-colors ${activeTab === 'info' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >소개</button>
                    <button 
                      onClick={() => setActiveTab('date')}
                      className={`flex-1 py-4 text-center font-bold text-[15px] md:text-lg border-b-4 transition-colors ${activeTab === 'date' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >관람일/예매</button>
                    <button 
                      onClick={() => setActiveTab('venue')}
                      className={`flex-1 py-4 text-center font-bold text-[15px] md:text-lg border-b-4 transition-colors ${activeTab === 'venue' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >공연장 안내</button>
                  </div>

                  {/* 탭 내용 - 소개 */}
                  {activeTab === 'info' && (
                    <div className="animate-in fade-in duration-300">
                      {showInfo.detailImages && showInfo.detailImages.length > 0 ? (
                        <div className="flex flex-col gap-0 items-center bg-white border border-gray-100 rounded-2xl overflow-hidden">
                          {showInfo.detailImages.map((imgUrl, idx) => (
                            <img key={idx} src={imgUrl} alt={`상세 이미지 ${idx + 1}`} className="w-full object-contain" />
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                          <p>등록된 상세 소개 이미지가 없습니다.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 탭 내용 - 관람일/예매 */}
                  {activeTab === 'date' && (
                    <div className="animate-in fade-in duration-300">
                      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                        {/* 관람일 (Calendar) */}
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="font-extrabold text-lg mb-6 text-gray-800">관람일</h3>
                          
                          <div className="flex items-center justify-center gap-6 mb-6">
                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="text-gray-300 hover:text-gray-500 font-bold text-xl px-2">&lt;</button>
                            <span className="font-extrabold text-xl w-32 text-center">{calendarMonth.getFullYear()}. {String(calendarMonth.getMonth() + 1).padStart(2, '0')}</span>
                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="text-gray-300 hover:text-gray-500 font-bold text-xl px-2">&gt;</button>
                          </div>
                          
                          <div className="grid grid-cols-7 text-center mb-2 bg-gray-50 py-2 rounded-lg">
                            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                              <div key={d} className={`text-sm font-bold ${i === 0 ? 'text-red-400' : 'text-gray-500'}`}>{d}</div>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-7 gap-y-2 text-center mt-4">
                            {Array.from({ length: 42 }, (_, i) => {
                              const dayNum = i - new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 1;
                              const isValid = dayNum > 0 && dayNum <= new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                              if (!isValid) return <div key={i} className="h-10"></div>;
                              
                              const dateStr = `${String(calendarMonth.getMonth() + 1).padStart(2, '0')}.${String(dayNum).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][i % 7]})`;
                              const isSelected = selectedDate === dateStr;
                              
                              // 선택 가능 여부 확인
                              const currentDateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
                              const isSelectable = validStart && validEnd ? (currentDateObj >= validStart && currentDateObj <= validEnd) : true;
                              
                              return (
                                <div key={i} className="flex justify-center items-center h-10">
                                  <button 
                                    onClick={() => isSelectable && setSelectedDate(dateStr)}
                                    disabled={!isSelectable}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-[15px] transition-all ${
                                      isSelected ? 'bg-green-500 text-white shadow-md' : (isSelectable ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed')
                                    }`}
                                  >
                                    {dayNum}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 회차 */}
                        <div className="p-6 bg-white">
                          <h3 className="font-extrabold text-lg mb-4 text-gray-800">회차</h3>
                          <button className="border border-green-500 text-green-600 font-bold px-6 py-3 rounded-xl bg-green-50 shadow-sm">
                            1회 18:00
                          </button>
                          <p className="text-sm text-gray-500 mt-4 font-medium">잔여석 안내 서비스를 제공하지 않습니다.</p>
                        </div>
                      </section>

                      <button onClick={() => setStep("CAPTCHA")} className="w-full py-5 bg-green-500 text-white font-black text-lg rounded-xl shadow-lg hover:bg-green-600 transition flex justify-center items-center">
                        <span>예매하기</span>
                      </button>
                    </div>
                  )}

                  {/* 탭 내용 - 공연장 안내 */}
                  {activeTab === 'venue' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-xl font-extrabold mb-2 text-gray-900">공연장 위치 안내</h2>
                      <p className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">📍 {showInfo.venue}</p>
                      
                      <NaverMap 
                        lat={Number(showInfo.la) || 37.479} 
                        lng={Number(showInfo.lo) || 127.014} 
                        facilityName={showInfo.venue} 
                      />

                      <div className="mt-5 bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-extrabold text-gray-800 mb-4 text-lg">오시는 길 및 시설 안내</h3>
                        <ul className="text-[14px] text-gray-700 flex flex-col gap-3 font-medium">
                          <li className="flex"><span className="w-20 font-extrabold text-gray-400 shrink-0">주소</span> <span>{showInfo.adres || '정보 없음'}</span></li>
                          <li className="flex"><span className="w-20 font-extrabold text-gray-400 shrink-0">전화번호</span> <span>{showInfo.telno || '정보 없음'}</span></li>
                          <li className="flex"><span className="w-20 font-extrabold text-gray-400 shrink-0">주차안내</span> <span>{showInfo.parkinglot || '정보 없음'}</span></li>
                          <li className="flex"><span className="w-20 font-extrabold text-gray-400 shrink-0">대중교통</span> 
                            <span className="text-[#00CD3C] font-bold cursor-pointer flex items-center gap-1 hover:underline" onClick={() => window.open(`https://map.naver.com/p/directions/-/${showInfo.lo || 127.014},${showInfo.la || 37.479},${encodeURIComponent(showInfo.venue)}/-/transit?c=15,0,0,0,dh`, '_blank')}>
                              네이버 지도로 교통편/길찾기 검색하기 🧭
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
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

export default function SeatSelectionPage() {
  return (
    <>
      {/* 🔥 핵심 수정 사항:
        1. strategy를 "beforeInteractive"로 변경하여 인증 실패(지도가 떴다 사라짐) 방지
        2. <></> (Fragment) 안에 Script와 Suspense를 함께 넣어 문법 오류 해결
      */}
      <Script
        src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=wm2szfaw99&submodules=geocoder"
        strategy="beforeInteractive"
      />
      
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-green-500 mb-4" size={50} />
          <p className="font-bold text-gray-500 animate-pulse">안전하게 공연 데이터를 불러오는 중입니다...</p>
        </div>
      }>
        <SeatSelectionContent />
      </Suspense>
    </>
  );
}