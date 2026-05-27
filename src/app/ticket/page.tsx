/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ticket, Trash2, Loader2, Calendar, MapPin, AlertCircle, ShieldCheck, Smartphone, X, RefreshCw, Lock, Crown } from "lucide-react";
import { supabase } from "@/src/lib/superbase";
import { useAuth } from "../components/AuthProvider";
import LoginModal from "../components/LoginModal";

interface TicketItem {
  id: string;
  title: string;
  date: string;
  seat: string;
  price: number;
  seatList: string[];
  zoneName: string;
  totalPrice: number;
  ids: string[];
  count: number;
  code?: string;
  user_id?: string;
  [key: string]: unknown;
}

export default function MyTicketPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    ids: string[];
    title: string;
    mainId: string;
  }>({ isOpen: false, ids: [], title: "", mainId: "" });

  const [activeQr, setActiveQr] = useState<TicketItem | null>(null);
  const [qrTimer, setQrTimer] = useState(15);

  // 전역 인증 상태 가져오기
  const { user, loading: authLoading, openLoginModal, refundBalance, logEvent } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeQr) {
      setQrTimer(15);
      interval = setInterval(() => {
        setQrTimer((prev) => (prev <= 1 ? 15 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQr]);

  useEffect(() => {
    if (authLoading) return;
    
    // 로그아웃 상태이면 로딩 종료하고 조회 건너뜀
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyTickets = async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setLoading(true);
      try {
        let query = supabase.from("bookings").select("*");

        // 관리자가 아니라면 본인 예약건만 필터링
        if (!user.isAdmin) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const groupedData = data.reduce((acc: TicketItem[], current: any) => {
            // 관리자 뷰에서는 사용자별로 분리해서 그룹화해야 함
            const existing = acc.find(
              item => item.title === current.title && item.date === current.date && item.user_id === current.user_id
            );

            if (existing) {
              const seatNumber = current.seat.split(" ").pop(); 
              existing.seatList.push(seatNumber);
              existing.totalPrice += current.price;
              existing.ids.push(current.id);
              existing.count += 1;
            } else {
              acc.push({
                ...current,
                seatList: [current.seat.split(" ").pop()],
                zoneName: current.seat.split(" "),
                totalPrice: current.price,
                ids: [current.id],
                count: 1
              });
            }
            return acc;
          }, []);

          setTickets(groupedData);
        }
      } catch (error: any) {
        console.error("🔥 티켓 불러오기 에러:", error.message || error);
        alert(`티켓을 불러오는데 실패했습니다: ${error.message || '알 수 없는 에러'}\n(Supabase 설정이나 네트워크 상태를 확인해주세요)`);
      } finally {
        if (showLoadingSpinner) setLoading(false);
      }
    };
    
    fetchMyTickets(true);

    // 실시간 DB 변동 구독 (Supabase Realtime)
    // bookings 테이블에 데이터가 추가(INSERT)되거나 삭제(DELETE)되면 실시간으로 화면 갱신!
    const channel = supabase
      .channel("realtime-bookings-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          console.log("🔔 [ANTI-MACRO REALTIME] 실시간 예약 변동 감지! 데이터를 동기화합니다.");
          fetchMyTickets(false); // 실시간 반영 시에는 스피너 없이 자연스럽게 데이터만 새로고침
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const handleCancelClick = (ids: string[], title: string, mainId: string) => {
    setCancelModal({ isOpen: true, ids, title, mainId });
  };

  // 로그인되지 않은 경우 예쁜 가드 화면 출력
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20 w-full animate-in fade-in duration-500 relative">
        <header className="bg-white border-b border-gray-200 w-full sticky top-0 z-20 shadow-sm">
          <div className="max-w-[1440px] w-full mx-auto px-6 py-5 flex items-center">
            <button onClick={() => router.push('/')} className="mr-5 text-gray-800 hover:text-[#00CD3C] transition cursor-pointer"><ArrowLeft size={28} /></button>
            <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2"><Ticket size={24} className="text-[#00CD3C]" /> 스마트 티켓</h1>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-20">
          <div className="w-24 h-24 bg-green-50 text-[#00CD3C] rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
            <Lock size={44} className="text-[#00CD3C]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">로그인이 필요한 서비스입니다</h2>
          <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
            마이 스마트 티켓 및 실시간 예매 내역은 로그인을 완료하신 회원만 안전하게 조회가 가능합니다.
          </p>
          <button 
            onClick={openLoginModal}
            className="px-10 py-4 bg-[#00CD3C] hover:bg-[#00b534] text-white font-black text-lg rounded-2xl shadow-lg shadow-green-100 transition active:scale-95 cursor-pointer w-full"
          >
            로그인 하러가기
          </button>
        </main>
        
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 w-full animate-in fade-in duration-500 relative">

      {activeQr && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center p-5 animate-in fade-in zoom-in-95 duration-200">
          <button onClick={() => setActiveQr(null)} className="absolute top-6 right-6 text-white/70 hover:text-white transition">
            <X size={32} />
          </button>

          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8 relative">
            <div className="absolute top-0 left-0 right-0 bg-[#00CD3C] py-2 flex items-center justify-center gap-2 shadow-md">
              <ShieldCheck size={16} className="text-white" />
              <span className="text-white text-xs font-bold tracking-wider">USIM 본인 인증 기기</span>
            </div>

            <div className="mt-8 mb-6 text-center">
              <h2 className="text-xl font-extrabold text-gray-900 mb-1 leading-tight line-clamp-1">{activeQr.title}</h2>
              <p className="text-gray-500 font-bold">{activeQr.zoneName} {activeQr.seatList.join(", ")}</p>
            </div>

            <div className="w-56 h-56 bg-white rounded-2xl border-4 border-gray-100 p-2 relative overflow-hidden flex items-center justify-center shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`[TICKET] CODE: ${activeQr.code} / COUNT: ${activeQr.count}`)}`} 
                alt="Ticket QR" 
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <div className="absolute left-0 top-0 w-full h-1 bg-[#00CD3C] shadow-[0_0_15px_rgba(0,205,60,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>

            <div className="flex items-center gap-2 mt-5 text-gray-600 font-black text-xl">
              <RefreshCw size={20} className={qrTimer === 15 ? "animate-spin text-[#00CD3C]" : ""} />
              <span className={qrTimer <= 3 ? "text-red-500" : "text-gray-800"}>00:{qrTimer < 10 ? `0${qrTimer}` : qrTimer}</span>
            </div>
            
            <p className="text-sm font-black text-gray-800 bg-gray-100 px-4 py-1.5 rounded-lg font-mono mt-4">
              입장 인원: {activeQr.count}명
            </p>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 w-full sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1440px] w-full mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.push('/')} className="mr-5 text-gray-800 hover:text-[#00CD3C] transition cursor-pointer"><ArrowLeft size={28} /></button>
            <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
              {user?.isAdmin ? (
                <>
                  <Crown size={24} className="text-amber-500 animate-bounce" />
                  <span>실시간 예약 통합 대시보드 <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 ml-2">최고 관리자 모드</span></span>
                </>
              ) : (
                <>
                  <Ticket size={24} className="text-[#00CD3C]" />
                  <span>마이 스마트 티켓</span>
                </>
              )}
            </h1>
          </div>
          {user?.isAdmin && (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>실시간 동기화 활성화됨</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#00CD3C]" size={50} />
            <p className="font-bold text-gray-400 text-lg">
              {user?.isAdmin ? "실시간 통합 예매 현황 로드 중..." : "나의 예매 내역을 정리하는 중..."}
            </p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden relative flex flex-col h-full hover:shadow-xl transition duration-300">
                <div className="p-7 pb-6 border-b-2 border-dashed border-gray-200 relative flex-1">
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-50 rounded-full border-r border-t border-gray-200 transform rotate-45" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full border-l border-t border-gray-200 transform -rotate-45" />
                  
                  <div className="flex justify-between items-start mb-5">
                    <span className={`text-sm font-black px-3 py-1.5 rounded-md ${user?.isAdmin ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-[#00CD3C]/10 text-[#00CD3C]"}`}>
                      {user?.isAdmin ? "👑 전체 예약건" : "결제완료"}
                    </span>
                    <span className="text-[12px] text-gray-400 font-bold tracking-widest">{ticket.count}매 묶음</span>
                  </div>
                  
                  <h2 className="text-2xl font-extrabold text-gray-900 leading-snug line-clamp-2 mb-4">{ticket.title}</h2>
                  
                  {user?.isAdmin && (
                    <div className="mb-4 text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2 flex items-center gap-1.5">
                      <span className="text-sm">👤</span>
                      <span>예매자 ID: <strong className="text-gray-900 font-mono text-[13px]">{ticket.user_id}</strong></span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 text-[15px] text-gray-500 font-bold">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {ticket.date}</div>
                    <div className="flex items-center gap-2 text-[#00CD3C]">
                      <MapPin size={16} /> {ticket.zoneName} {ticket.seatList.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 flex flex-col gap-4">
                  <button onClick={() => setActiveQr(ticket)} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition shadow-md cursor-pointer">
                    <Smartphone size={20} /> 
                    스마트 입장 QR 열기 ({ticket.count}매)
                  </button>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 font-bold mb-1">총 결제 금액</span>
                      <span className="text-xl font-black text-gray-900">{ticket.totalPrice.toLocaleString()}원</span>
                    </div>
                    
                    <button onClick={() => handleCancelClick(ticket.ids, ticket.title, ticket.id)} disabled={isDeleting === ticket.id} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50 transition shadow-sm disabled:opacity-50 cursor-pointer">
                      {isDeleting === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 전체 취소
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2"><AlertCircle size={40} className="text-gray-300" /></div>
            <p className="text-gray-400 font-bold text-xl">예매한 내역이 없습니다.</p>
            <Link href="/" className="mt-5 px-8 py-4 text-lg bg-[#00CD3C] text-white font-bold rounded-full shadow-lg hover:bg-green-500 transition">공연 보러 가기</Link>
          </div>
        )}
      </main>
 
      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}} />
      
      {/* 커스텀 예매 전체 취소 모달 (iOS 사파리 window.confirm PWA 버그 완벽 차단) */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-7 text-center animate-in zoom-in-95 duration-200 text-gray-900">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 mx-auto border border-red-100 shadow-inner">
              <Trash2 size={30} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">예매 전체 취소</h3>
            <p className="text-[14px] text-gray-500 font-bold leading-relaxed mb-6">
              [{cancelModal.title}]<br/>
              선택하신 <span className="text-red-500">{cancelModal.ids.length}매</span>의 예매를 모두 취소하시겠습니까?<br/>
              취소 완료 후에는 예매 복구가 불가능합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 transition cursor-pointer"
              >
                돌아가기
              </button>
              <button
                onClick={async () => {
                  const { ids, mainId } = cancelModal;
                  setCancelModal(prev => ({ ...prev, isOpen: false }));
                  setIsDeleting(mainId);
                  try {
                    // 환불해 줄 금액 계산 (취소할 예매 내역의 totalPrice)
                    const cancelledTicket = tickets.find(t => t.id === mainId);

                    const { error } = await supabase
                      .from("bookings")
                      .delete()
                      .in("id", ids);

                    if (error) throw error;

                    // 환불 성공 시 전역 가상 잔액 복구 및 실시간 취소 로그 전송
                    if (cancelledTicket) {
                      refundBalance(cancelledTicket.totalPrice);
                      await logEvent("🔴 TICKET CANCELLED & REFUNDED", {
                        title: cancelledTicket.title,
                        seats: cancelledTicket.seatList.join(", "),
                        refundAmount: cancelledTicket.totalPrice,
                        ticketCount: cancelledTicket.count
                      });
                    }

                    setTickets(prev => prev.filter(t => !ids.includes(t.id)));
                    alert("성공적으로 취소되었습니다.");
                  } catch (error: any) {
                    console.error("🔥 취소 에러:", error.message || error);
                    alert(`취소 처리 중 문제가 발생했습니다: ${error.message || '알 수 없는 에러'}`);
                  } finally {
                    setIsDeleting(null);
                  }
                }}
                className="flex-1 py-3.5 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-100 cursor-pointer"
              >
                예매 취소
              </button>
            </div>
          </div>
        </div>
      )}
      <LoginModal />
    </div>
  );
}