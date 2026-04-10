// app/components/NaverMap.tsx
"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { naver: any; }
}

export default function NaverMap({ address }: { address: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapDrawn, setIsMapDrawn] = useState(false);

  useEffect(() => {
    // 밖에서 이미 지도를 다운받아 놨으니, 0.05초 단위로 확인해서 번개처럼 그립니다!
    const drawMap = setInterval(() => {
      if (window.naver && window.naver.maps && window.naver.maps.Service && mapRef.current) {
        clearInterval(drawMap);
        
        mapRef.current.innerHTML = "";
        window.naver.maps.Service.geocode(
          { query: address },
          function (status: any, response: any) {
            let lat = 37.478523;
            let lng = 127.014316;

            if (status === window.naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
              lat = parseFloat(response.v2.addresses.y);
              lng = parseFloat(response.v2.addresses.x);
            }

            const mapOptions = { center: new window.naver.maps.LatLng(lat, lng), zoom: 15 };
            const map = new window.naver.maps.Map(mapRef.current, mapOptions);
            new window.naver.maps.Marker({ position: new window.naver.maps.LatLng(lat, lng), map });

            setIsMapDrawn(true);
          }
        );
      }
    }, 50);

    return () => clearInterval(drawMap);
  }, [address]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative flex items-center justify-center">
      {!isMapDrawn && <div className="z-10 font-bold text-green-600 animate-pulse">지도 그리는 중... 🚀</div>}
      <div ref={mapRef} className={`absolute inset-0 z-20 transition-opacity duration-500 ${isMapDrawn ? "opacity-100" : "opacity-0"}`} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}