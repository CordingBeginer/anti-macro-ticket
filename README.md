<div align="center">
  
  # 🛡️ Anti-Macro Ticketing System
  **매크로 및 암표 문제 해결을 위한 공정 티켓팅 플랫폼**
  
  <br />
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](#)
  [![Tesseract.js](https://img.shields.io/badge/Tesseract.js-FF1493?style=flat-square&logo=cplusplus&logoColor=white)](#)
  
  <br />
  <p>한림대학교 정보과학대학 캡스톤 디자인 프로젝트 🎓<br/>팀 <b>충햄과 딸래미들</b></p>
  
</div>

## 📝 프로젝트 소개

**Anti-Macro Ticket**은 최근 공연 예술계에서 심각한 문제로 대두되고 있는 매크로(자동화 봇) 예매와 암표 거래를 원천적으로 차단하기 위해 설계된 웹 티켓팅 시스템입니다. 

기존의 텍스트/이미지 찾기 CAPTCHA가 가진 한계(사용자 피로도 증가, OCR 봇에 의한 우회)를 극복하고자, **AI 드로잉 인증과 3단계(클라이언트-브라우저-서버) 철통 보안 아키텍처**를 구축하여 공정하고 안전한 예매 환경을 제공합니다.

<br/>

## ✨ 핵심 방어 기술 (3-Tier Security)

### 1. 🤖 AI 드로잉 캡차 (WebAssembly 기반)
- 사용자가 직접 화면에 숫자를 그리는 방식의 직관적인 인증 시스템.
- 브라우저에 내장된 `Tesseract.js` (WASM 기반) 엔진을 활용하여 서버 부하 없이 1초 이내에 즉각 판독합니다.
- 캔버스 배경의 랜덤 노이즈가 기존 OCR 매크로 봇의 이미지 분석을 교란합니다.

### 2. 🖱️ 브라우저 커널 레벨 이벤트 무결성 검증
- 매크로가 `Selenium` 등을 이용해 마우스 궤적을 흉내 내거나 강제로 좌표를 주입(MouseEvent Inject)하는 공격을 차단합니다.
- 브라우저 커널에서 부여하는 물리적 신뢰 속성인 `isTrusted` 값과 입력 시간을 실시간으로 분석하여 100% 매크로를 식별하고 강제 퇴장시킵니다.

### 3. 🔐 서버 사이드 HMAC-SHA256 암호화 검증
- 캡차를 통과한 정상 사용자에게만 1회성/10분 만료의 암호화 토큰을 발급합니다.
- 악성 매크로가 UI를 건너뛰고 결제 API로 직접 패킷을 쏘거나 토큰을 재사용하려는 시도를 서버 단에서 실시간으로 대조하여 즉각 차단(403 Forbidden)합니다.

<br/>

## 🚀 주요 기능 및 시스템 아키텍처

- **실시간 좌석 동기화 및 충돌 방지:** `Supabase Realtime` 채널을 활용하여 0.001초 차이로 발생하는 동시 접속자 간의 좌석 중복 결제를 완벽하게 제어합니다.
- **KOPIS 공공데이터 연동:** 공연예술통합전산망 API를 활용하여 실제 상용 서비스 수준의 실시간 공연 정보를 제공합니다.
- **실시간 보안 관제:** 서버 콘솔을 통해 매크로 접근 시도 및 차단 내역을 컬러 로그로 실시간 모니터링할 수 있습니다.

<br/>

## 📺 시연 화면 (Demo)

> 💡 **Tip:** 이곳에 시연 영상을 GIF로 변환하여 첨부하면 좋습니다!

| 정상 사용자 예매 흐름 | 매크로 공격 원천 차단 (API 우회 방어) |
| :---: | :---: |
| <img src="정상사용자_GIF_링크를_여기에_넣으세요" width="300" /> | <img src="매크로차단_GIF_링크를_여기에_넣으세요" width="300" /> |
| AI 드로잉 판독 후 지연 없는 결제 진행 | HMAC-SHA256 토큰 검증 실패 시 적색 팝업 및 차단 |

<br/>

## 🛠 사용 기술 (Tech Stack)

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand
- **Backend / DB:** Supabase (PostgreSQL, Realtime, Auth), Node.js
- **Security & AI:** Tesseract.js (WASM), Crypto (HMAC-SHA256)
- **Deployment:** Vercel (Frontend), Cloudflare Tunnel (Local Testing)

<br/>

## 👨‍💻 팀원 소개

| 한충서 (ChoongSeoHan) | 신서현 | 길혜균 |
| :---: | :---: | :---: |
| [@CordingBeginer](https://github.com/CordingBeginer) | [@GitHubID](https://github.com/) | [@GitHubID](https://github.com/) |
| 프로젝트 팀장 / 풀스택 개발 | 역할 작성 | 역할 작성 |
