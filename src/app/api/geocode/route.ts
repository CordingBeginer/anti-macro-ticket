import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "no address" }, { status: 400 });

  const res = await fetch(
    `https://naveropenapi.apigw.naver.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`,
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_CLIENT_ID!,
        "X-NCP-APIGW-API-KEY": process.env.NAVER_CLIENT_SECRET!,
      },
    }
  );

  const text = await res.text();
  console.log("네이버 응답 status:", res.status);
  console.log("네이버 응답 body:", text);

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "parse failed", raw: text }, { status: 500 });
  }
}