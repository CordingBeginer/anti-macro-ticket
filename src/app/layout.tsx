import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/src/app/components/AuthProvider";
import LandscapeBlocker from "@/src/app/components/LandscapeBlocker";

export const metadata: Metadata = {
  title: "Anti-Macro 티켓",
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
      <body className="bg-gray-50 text-gray-900 w-full min-h-screen m-0 p-0 overflow-x-hidden">
        <AuthProvider>
          {children}
          <LandscapeBlocker />
        </AuthProvider>
      </body>
    </html>
  );
}