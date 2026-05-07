"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { naver: any; }
}

export default function NaverMap({ address }: { address: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapDrawn, setIsMapDrawn] = useState(false);

  useEffect(() => {
    // 주소가 없으면 실행 안 함
    if (!address) return;
    
    // 주소가 바뀌면 다시 그려야 하므로 초기화
    setIsMapDrawn(false);

    const initMap = () => {
      const { naver } = window;
      if (naver && naver.maps && naver.maps.Service && mapRef.current) {
        
        naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
          // 기본 좌표 (남동소래아트홀 근처 예시)
          let lat = 37.4011;
          let lng = 126.7193;

          // 🔥 수정 포인트: response.v2.addresses는 배열입니다. 필수!
          if (status === naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
            const item = response.v2.addresses[0]; // 첫 번째 결과물 선택
            lat = parseFloat(item.y);
            lng = parseFloat(item.x);
          } else {
            console.warn("Geocoding 실패 또는 권한 없음. 기본 위치를 표시합니다.");
          }

          if (mapRef.current) {
            mapRef.current.innerHTML = ""; 
            const mapOptions = { 
              center: new naver.maps.LatLng(lat, lng), 
              zoom: 16,
              // 인증 실패로 지도가 파괴되는 것을 방지하기 위해 맵 옵션 유지
              mapDataControl: false 
            };
            
            const map = new naver.maps.Map(mapRef.current, mapOptions);
            new naver.maps.Marker({ 
              position: new naver.maps.LatLng(lat, lng), 
              map 
            });

            // 지도 생성 후 약간의 지연을 주어 브라우저 렌더링 확정
            setTimeout(() => setIsMapDrawn(true), 100);
          }
        });
      }
    };

    const timer = setInterval(() => {
      if (window.naver && window.naver.maps && window.naver.maps.Service) {
        clearInterval(timer);
        initMap();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [address]); // address가 변경될 때만 다시 실행

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative">
      <div 
        ref={mapRef} 
        className="w-full h-full z-10" 
        style={{ minHeight: "384px" }} 
      />
      {!isMapDrawn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
          <div className="font-bold text-green-600 animate-pulse">지도를 불러오고 있습니다...</div>
        </div>
      )}
    </div>
  );
}