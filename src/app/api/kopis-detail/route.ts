import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '공연 ID가 없습니다.' }, { status: 400 });
  }

  try {
    // 💡 국장님 인증키 적용!
    const SERVICE_KEY = "ade2e6f2d55b4bd389d7b284c946934c";
    const url = `http://kopis.or.kr/openApi/restful/pblprfr/${id}?service=${SERVICE_KEY}`;
    
    const res = await fetch(url);
    const xmlData = await res.text();

    // XML을 JSON으로 변환 (에러 나던 정규식은 싹 지웠습니다!)
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    
    // KOPIS 상세 데이터 구조 파악
    const item = jsonObj.dbs?.db;

    if (!item) {
      return NextResponse.json({ error: '상세 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const data = {
      id,
      title: item.prfnm || "정보 없음",
      date: `${item.prfpdfrom || ''} ~ ${item.prfpdto || ''}`,
      venue: item.fcltynm || "정보 없음",
      cast: item.prfcast || "출연진 정보 없음",
      price: item.pcseguidance || "가격 정보 없음",
      poster: item.poster || "",
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("KOPIS 상세 API 에러:", error);
    return NextResponse.json({ error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}