import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '공연 ID가 없습니다.' }, { status: 400 });
  }

  try {
    const SERVICE_KEY = "ade2e6f2d55b4bd389d7b284c946934c";
    const url = `http://kopis.or.kr/openApi/restful/pblprfr/${id}?service=${SERVICE_KEY}`;
    
    const res = await fetch(url);
    const xmlData = await res.text();

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    
    const item = jsonObj.dbs?.db;

    if (!item) {
      return NextResponse.json({ error: '상세 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    let la = "";
    let lo = "";
    let adres = "";
    let telno = "";
    let parkinglot = "정보 없음";

    if (item.mt10id) {
      try {
        const facilityRes = await fetch(`http://kopis.or.kr/openApi/restful/prfplc/${item.mt10id}?service=${SERVICE_KEY}`);
        const facilityXml = await facilityRes.text();
        const facilityObj = parser.parse(facilityXml);
        const facility = facilityObj.dbs?.db;
        
        if (facility) {
          la = facility.la || "";
          lo = facility.lo || "";
          adres = facility.adres || "";
          telno = facility.telno || "";
          parkinglot = facility.parkinglot === "Y" ? "주차 가능" : (facility.parkinglot === "N" ? "주차 불가" : "정보 없음");
        }
      } catch (err) {
        console.error("시설 정보 가져오기 실패:", err);
      }
    }

    let detailImages: string[] = [];
    const styurlsObj = item.styurls?.styurl;
    if (Array.isArray(styurlsObj)) {
      detailImages = styurlsObj;
    } else if (typeof styurlsObj === 'string') {
      detailImages = [styurlsObj];
    }

    const data = {
      id,
      title: item.prfnm || "정보 없음",
      date: `${item.prfpdfrom || ''} ~ ${item.prfpdto || ''}`,
      venue: item.fcltynm || "정보 없음",
      cast: item.prfcast || "출연진 정보 없음",
      price: item.pcseguidance || "가격 정보 없음",
      poster: item.poster || "",
      detailImages,
      la,
      lo,
      adres,
      telno,
      parkinglot,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("KOPIS 상세 API 에러:", error);
    return NextResponse.json({ error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}