import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 서버에만 보관되는 대칭 보안 비밀키 (환경 변수 우선 적용)
const SECRET_KEY = process.env.CAPTCHA_SECRET || "amt_secure_drawing_captcha_secret_key_2026_seoul";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { duration, strokes, answer, expectedAnswer, title, isTrusted } = body;

    // 1. 유효성 검사 필수 필드 유무 진단
    if (duration === undefined || strokes === undefined || !answer || !expectedAnswer) {
      return NextResponse.json({ 
        success: false, 
        error: "인증을 위한 행동 데이터가 불완전합니다." 
      }, { status: 400 });
    }

    const cleanAnswer = answer.trim();
    const cleanExpected = expectedAnswer.trim();

    // 🛡️ [HW-TRUST LAYER] 브라우저 인공 이벤트(MouseEvent 생성자 주입) 원천 차단
    if (isTrusted === false) {
      console.log(
        `\x1b[1m\x1b[31m[ANTI-MACRO BLOCK]\x1b[0m 🤖 SYNTHETIC EVENT DETECTED (MouseEvent Bypass) | Performance: ${title || "N/A"}`
      );
      return NextResponse.json({
        success: false,
        error: "웹 브라우저의 인공 마우스 신호 조작(MouseEvent Injector)이 발견되었습니다.\n\n매크로 우회 방지를 위해 실제 마우스나 트랙패드로 그려주세요."
      }, { status: 403 });
    }

    // 2. 서버 사이드 매크로 정밀 정적 검증
    // 조건 A: 그리기 소요 시간이 650ms 미만 (프로그램 궤적 즉시 시뮬레이션)
    // 조건 B: 입력 획수(마우스 이동 빈도)가 8회 미만 (직선 기계적 한 번긋기 등)
    if (duration < 650 || strokes < 8) {
      console.log(
        `\x1b[1m\x1b[31m[ANTI-MACRO BLOCK]\x1b[0m 🤖 CAPTCHA VERIFY REJECTED (Server-Side Bot Detected) | Duration: ${duration}ms, Strokes: ${strokes} | Performance: ${title || "N/A"}`
      );
      return NextResponse.json({ 
        success: false, 
        error: `비정상적인 매크로 입력 속도가 감지되었습니다. (소요시간: ${duration}ms, 움직임: ${strokes}회)` 
      }, { status: 403 });
    }

    // 조건 C: OCR 판독 답안 대조
    if (cleanAnswer !== cleanExpected) {
      return NextResponse.json({ 
        success: false, 
        error: `AI 판독 정답이 일치하지 않습니다. (입력값: ${cleanAnswer}, 정답: ${cleanExpected})` 
      }, { status: 400 });
    }

    // 3. 검증 통과 시 암호 서명 토큰 발행 (HMAC-SHA256)
    const timestamp = Date.now();
    // 데이터 위조 방지를 위해 발급 시각을 결합하여 고유 세션 메시지 생성
    const rawMessage = `amt-secure-session-${timestamp}`;
    const hash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawMessage)
      .digest('hex');

    // 캡차 전용 서명 토큰 조합
    const secureToken = `AMT-SECURE-PASS-${timestamp}-${hash}`;

    console.log(
      `\x1b[1m\x1b[32m[ANTI-MACRO SECURITY]\x1b[0m 🛡️ Cryptographic Token Issued Successfully! | Timestamp: ${timestamp} | Token Length: ${secureToken.length}`
    );

    return NextResponse.json({ 
      success: true, 
      token: secureToken 
    });

  } catch (error: any) {
    console.error("🔥 캡차 서버 검증 에러:", error);
    return NextResponse.json({ 
      success: false, 
      error: "서버 내부 검증 시스템 오류" 
    }, { status: 500 });
  }
}
