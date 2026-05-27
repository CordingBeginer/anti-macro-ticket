import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 서버에만 보관되는 대칭 보안 비밀키 (verify-captcha와 동일하게 동기화)
const SECRET_KEY = process.env.CAPTCHA_SECRET || "amt_secure_drawing_captcha_secret_key_2026_seoul";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // 1. 토큰이 주어지지 않은 경우 차단
    if (!token) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: Token is missing!`);
      return NextResponse.json({ valid: false, error: "보안 토큰이 누락되었습니다." }, { status: 400 });
    }

    // 2. 기본 규격 검사 (AMT-SECURE-PASS로 시작해야 함)
    if (!token.startsWith("AMT-SECURE-PASS-")) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: Invalid token format! Token: ${token}`);
      return NextResponse.json({ valid: false, error: "올바르지 않은 위조 보안 토큰 규격입니다." }, { status: 400 });
    }

    // 3. 토큰 구성 요소 분리 (AMT-SECURE-PASS-[timestamp]-[hash])
    const parts = token.split("-");
    if (parts.length < 5) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: Malformed token parts! Token: ${token}`);
      return NextResponse.json({ valid: false, error: "손상된 보안 토큰입니다." }, { status: 400 });
    }

    const timestampStr = parts[3];
    const clientHash = parts[4];
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO BLOCK]\x1b[0m 🔴 TOKEN VERIFICATION FAILED: Invalid timestamp in token!`);
      return NextResponse.json({ valid: false, error: "토큰 타임스탬프가 비정상입니다." }, { status: 400 });
    }

    // 4. 유효 유통 시각 체크 (10분 만료)
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    const timeDiff = now - timestamp;

    if (timeDiff > tenMinutes) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: Token expired! Age: ${Math.round(timeDiff / 1000)}s`);
      return NextResponse.json({ valid: false, error: "보안 토큰 세션이 만료되었습니다. (유효 시간 10분 초과)\n\n다시 캡차 보안 인증을 완료해 주세요." }, { status: 401 });
    }

    // 5초 이상의 미래 시간 조작 차단 (미래 시각 조작 방지)
    if (timeDiff < -5000) {
      console.log(`\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: Clock tampering detected!`);
      return NextResponse.json({ valid: false, error: "비정상적인 컴퓨터 시스템 시각 조작이 감지되었습니다." }, { status: 400 });
    }

    // 5. 서버 사이드 HMAC Signature 대조 검증
    const rawMessage = `amt-secure-session-${timestampStr}`;
    const serverExpectedHash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawMessage)
      .digest('hex');

    if (clientHash !== serverExpectedHash) {
      console.log(
        `\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | Reason: HMAC Signature mismatch! Expected: ${serverExpectedHash.substring(0, 8)}..., Client: ${clientHash.substring(0, 8)}...`
      );
      return NextResponse.json({ valid: false, error: "보안 서명 검증에 실패했습니다. (위조된 토큰 감지됨)" }, { status: 403 });
    }

    console.log(
      `\x1b[1m\x1b[32m[ANTI-MACRO SECURITY]\x1b[0m 🟢 Token Signature Verified! Active Age: ${Math.round(timeDiff / 1000)}s`
    );

    return NextResponse.json({ valid: true });

  } catch (error: any) {
    console.error("🔥 토큰 서버 검증 에러:", error);
    return NextResponse.json({ valid: false, error: "서버 토큰 검증 시스템 내부 오류" }, { status: 500 });
  }
}
