"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface NaverMapProps {
  lat: number;
  lng: number;
  facilityName?: string;
}

export default function NaverMap({ lat, lng, facilityName = "공연장" }: NaverMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // 1. 지도 초기화 함수 (공식 문서의 정석 방식 반영)
  const initMap = () => {
    // 🚨 [방어 코드] window.naver.maps가 완전히 로드되었는지 확인하여 'null' 에러 방지
    if (typeof window !== "undefined" && window.naver && window.naver.maps && window.naver.maps.LatLng && mapElement.current) {
      const location = new window.naver.maps.LatLng(lat, lng);

      if (mapInstance.current) {
        mapInstance.current.setCenter(location);
        setIsLoading(false);
        return;
      }

      const mapOptions = {
        center: location,
        zoom: 15,
      };

      // mapElement.current 요소를 직접 지정하여 생성
      const map = new window.naver.maps.Map(mapElement.current, mapOptions);
      mapInstance.current = map;

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
      console.error("네이버 지도 객체 또는 요소를 찾을 수 없습니다. API 인증 상태를 확인하세요.");
      setIsLoading(false);
    }
  };

  // 좌표 변경 시 지도 업데이트를 위한 감시
  useEffect(() => {
    if (typeof window !== "undefined" && window.naver && window.naver.maps) {
      initMap();
    } else {
      const timer = setTimeout(() => initMap(), 300);
      return () => clearTimeout(timer);
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


      {/* 지도가 그려지는 실제 영역 */}
      <div ref={mapElement} className="w-full h-full absolute inset-0" />

      {!isLoading && !window.naver?.maps && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-400 font-bold text-sm">지도를 표시할 수 없습니다 (인증 오류)</p>
        </div>
      )}
    </div>
  );
}