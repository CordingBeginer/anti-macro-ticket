/**
 * 공연 고유 ID와 카테고리를 활용하여 결정론적(Deterministic)으로
 * 현실성 있는 등급별 가상 티켓 가격대(VIP, R, S, A석)를 자동 산출하는 유틸리티입니다.
 */
export interface TicketPrices {
  "VIP석": number;
  "R석": number;
  "S석": number;
  "A석": number;
}

export function getPerformancePrices(id: string, category: string): TicketPrices {
  // 1. 공연 ID 문자열을 기반으로 고유한 해시값 생성 (항상 같은 공연은 같은 가격을 보장)
  let hash = 0;
  const cleanId = id || "default";
  for (let i = 0; i < cleanId.length; i++) {
    hash = cleanId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // 2. 카테고리(장르)별 현실감 있는 기본 가격대 설정
  let basePrice = 120000; // 기본 금액
  const cat = category ? category.toLowerCase() : "";

  if (cat.includes("대중음악") || cat.includes("콘서트")) {
    // 대형 콘서트: 14만원 ~ 18만원 대
    basePrice = 140000 + (hash % 5) * 10000;
  } else if (cat.includes("뮤지컬")) {
    // 뮤지컬: 11만원 ~ 15만원 대
    basePrice = 110000 + (hash % 5) * 10000;
  } else if (cat.includes("연극")) {
    // 연극: 소극장 기준 4만원 ~ 5.5만원 대
    basePrice = 40000 + (hash % 4) * 5000;
  } else if (cat.includes("클래식") || cat.includes("무용") || cat.includes("오페라")) {
    // 클래식/클래식 페스티벌: 7만원 ~ 11만원 대
    basePrice = 70000 + (hash % 5) * 10000;
  } else {
    // 기타 공연/국악 등: 5만원 ~ 9만원 대
    basePrice = 50000 + (hash % 5) * 10000;
  }

  // 3. 등급별 가격 산정 (1,000원 단위 절사하여 현실적인 깔끔한 숫자로 포맷팅)
  return {
    "VIP석": basePrice,
    "R석": Math.round((basePrice * 0.85) / 1000) * 1000,
    "S석": Math.round((basePrice * 0.72) / 1000) * 1000,
    "A석": Math.round((basePrice * 0.58) / 1000) * 1000,
  };
}
