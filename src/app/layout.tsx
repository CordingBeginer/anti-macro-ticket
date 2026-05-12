import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Anti-Macro Ticket",
  description: "충햄과 딸래미들의 청정 티켓팅",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=snlcvi9s8n"></script>
      </head>
      {/* ★ 족쇄 해제! w-full을 주어 모니터 화면 전체를 쓰도록 만듭니다. */}
      <body className="bg-gray-50 text-gray-900 w-full min-h-screen m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}