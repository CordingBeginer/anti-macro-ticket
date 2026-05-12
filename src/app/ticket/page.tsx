/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ticket, Trash2, Loader2, Calendar, MapPin, AlertCircle, ShieldCheck, Smartphone, X, RefreshCw } from "lucide-react";

import { supabase } from "@/src/lib/superbase";

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
  [key: string]: unknown;
}

export default function MyTicketPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [activeQr, setActiveQr] = useState<TicketItem | null>(null);
  const [qrTimer, setQrTimer] = useState(15);

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
    const fetchMyTickets = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", "test-user-01") 
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const groupedData = data.reduce((acc: TicketItem[], current: any) => {
            const existing = acc.find(item => item.title === current.title && item.date === current.date);

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
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  const handleCancelTicket = async (ids: string[], title: string, mainId: string) => {
    const confirmCancel = window.confirm(`[${title}]\n선택하신 ${ids.length}매의 예매를 모두 취소하시겠습니까?`);
    if (!confirmCancel) return;
    
    setIsDeleting(mainId);
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .in("id", ids);

      if (error) throw error;

      setTickets(prev => prev.filter(t => !ids.includes(t.id)));
      alert("성공적으로 취소되었습니다.");
    } catch (error: any) {
      console.error("🔥 취소 에러:", error.message || error);
      alert(`취소 처리 중 문제가 발생했습니다: ${error.message || '알 수 없는 에러'}`);
    } finally {
      setIsDeleting(null);
    }
  };

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
              <div className="absolute left-0 top-0 w-full h-1 bg-melon-green shadow-[0_0_15px_rgba(0,205,60,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>

            <div className="flex items-center gap-2 mt-5 text-gray-600 font-black text-xl">
              <RefreshCw size={20} className={qrTimer === 15 ? "animate-spin text-melon-green" : ""} />
              <span className={qrTimer <= 3 ? "text-red-500" : "text-gray-800"}>00:{qrTimer < 10 ? `0${qrTimer}` : qrTimer}</span>
            </div>
            
            <p className="text-sm font-black text-gray-800 bg-gray-100 px-4 py-1.5 rounded-lg font-mono mt-4">
              입장 인원: {activeQr.count}명
            </p>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 w-full sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1440px] w-full mx-auto px-6 py-5 flex items-center">
          <button onClick={() => router.push('/')} className="mr-5 text-gray-800 hover:text-melon-green transition"><ArrowLeft size={28} /></button>
          <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2"><Ticket size={24} className="text-melon-green" /> 스마트 티켓</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-melon-green" size={50} />
            <p className="font-bold text-gray-400 text-lg">나의 예매 내역을 정리하는 중...</p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden relative flex flex-col h-full hover:shadow-xl transition duration-300">
                <div className="p-7 pb-6 border-b-2 border-dashed border-gray-200 relative flex-1">
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-50 rounded-full border-r border-t border-gray-200 transform rotate-45" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full border-l border-t border-gray-200 transform -rotate-45" />
                  
                  <div className="flex justify-between items-start mb-5">
                    <span className="bg-melon-green/10 text-melon-green text-sm font-black px-3 py-1.5 rounded-md">결제완료</span>
                    <span className="text-[12px] text-gray-400 font-bold tracking-widest">{ticket.count}매 묶음</span>
                  </div>
                  
                  <h2 className="text-2xl font-extrabold text-gray-900 leading-snug line-clamp-2 mb-4">{ticket.title}</h2>
                  <div className="flex flex-col gap-2 text-[15px] text-gray-500 font-bold">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> {ticket.date}</div>
                    <div className="flex items-center gap-2 text-melon-green">
                      <MapPin size={16} /> {ticket.zoneName} {ticket.seatList.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 flex flex-col gap-4">
                  <button onClick={() => setActiveQr(ticket)} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition shadow-md">
                    <Smartphone size={20} /> 
                    스마트 입장 QR 열기 ({ticket.count}매)
                  </button>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 font-bold mb-1">총 결제 금액</span>
                      <span className="text-xl font-black text-gray-900">{ticket.totalPrice.toLocaleString()}원</span>
                    </div>
                    
                    <button onClick={() => handleCancelTicket(ticket.ids, ticket.title, ticket.id)} disabled={isDeleting === ticket.id} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50 transition shadow-sm disabled:opacity-50">
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
            <Link href="/" className="mt-5 px-8 py-4 text-lg bg-melon-green text-white font-bold rounded-full shadow-lg hover:bg-green-500 transition">공연 보러 가기</Link>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}} />
    </div>
  );
}