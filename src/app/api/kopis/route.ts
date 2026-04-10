import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET() {
  const SERVICE_KEY = "ade2e6f2d55b4bd389d7b284c946934c"; 
  const url = `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${SERVICE_KEY}&stdate=20260101&eddate=20261231&cpage=1&rows=30`;

  try {
    const res = await fetch(url);
    const xmlData = await res.text();

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    const concerts = jsonObj.dbs?.db || [];

    const formattedData = Array.isArray(concerts) ? concerts.map((item: any) => ({
      id: item.mt20id,
      title: item.prfnm,
      date: `${item.prfpdfrom} ~ ${item.prfpdto}`,
      location: item.fcltynm,
      imageUrl: item.poster,
      category: item.genrenm
    })) : [];

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("KOPIS 연동 에러:", error);
    return NextResponse.json({ error: "데이터 호출 실패" }, { status: 500 });
  }
}