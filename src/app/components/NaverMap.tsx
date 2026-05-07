"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface NaverMapProps {
  lat: number;
  lng: number;
  facilityName?: string;
}

export default function NaverMap({ lat, lng, facilityName = "공연장" }: NaverMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  // 1. 지도 초기화 함수 (공식 문서의 정석 방식 반영)
  const initMap = () => {
    // 🚨 [방어 코드] window.naver.maps가 완전히 로드되었는지 확인하여 'null' 에러 방지
    if (typeof window !== "undefined" && window.naver && window.naver.maps && window.naver.maps.LatLng) {
      const location = new window.naver.maps.LatLng(lat, lng);
      
      const mapOptions = {
        center: location,
        zoom: 15,
      };
      
      // 공식 예제 방식: id="map" 요소를 직접 지정하여 생성
      const map = new window.naver.maps.Map('map', mapOptions);

      // 마커 설정
      const marker = new window.naver.maps.Marker({
        position: location,
        map: map,
      });

      // 정보창 설정
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px; min-width:150px; text-align:center; font-weight:900; color:#333; border-radius:10px;">${facilityName}</div>`,
        borderWidth: 0,
        disableAnchor: true,
        backgroundColor: "transparent",
      });
      infoWindow.open(map, marker);
      
      setIsLoading(false);
    } else {
      // 인증 실패 등으로 도구를 불러오지 못했을 때
      console.error("네이버 지도 객체를 찾을 수 없습니다. API 인증 상태를 확인하세요.");
      setIsLoading(false);
    }
  };

  // 2. [공식 문서 가이드] 인증 실패 시 실행될 전역 함수 등록
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
  }, []);

  // 좌표 변경 시 지도 업데이트를 위한 감시
  useEffect(() => {
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      initMap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-md border border-gray-200 bg-gray-100 mt-4">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#00CD3C] mb-2" size={30} />
          <p className="text-sm font-bold text-gray-400">네이버 지도를 불러오는 중...</p>
        </div>
      )}

      {/* 🚨 공식 문서 기반 호출 주소와 파라미터 적용 */}
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'snlcvi9s8n'}&submodules=geocoder`}
        onLoad={initMap}
      />
      
      {/* 지도가 그려지는 실제 영역 */}
      <div id="map" className="w-full h-full absolute inset-0" />
      
      {!isLoading && !window.naver?.maps && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-400 font-bold text-sm">지도를 표시할 수 없습니다 (인증 오류)</p>
        </div>
      )}
    </div>
  );
}