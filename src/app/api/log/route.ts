import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, timestamp, user, userAgent, details } = body;

    // ANSI Escape Codes for beautiful, readable Docker console logs
    // Bold green for the Anti-Macro system prefix
    const sysPrefix = "\x1b[1m\x1b[32m[ANTI-MACRO SERVER LOG]\x1b[0m";
    const reset = "\x1b[0m";

    let color = "\x1b[37m"; // White default
    let icon = "⚙️";

    if (event.includes("SIGNED IN") || event.includes("SUCCESS") || event.includes("ADMIN")) {
      color = "\x1b[32m"; // Bold Green
      icon = "🟢";
    } else if (event.includes("RESTORED")) {
      color = "\x1b[34m"; // Bold Blue
      icon = "🔵";
    } else if (event.includes("FAILED") || event.includes("ERROR") || event.includes("FAIL")) {
      color = "\x1b[31m"; // Bold Red
      icon = "🔴";
    } else if (event.includes("LOGGED OUT") || event.includes("SIGNED OUT") || event.includes("OUT")) {
      color = "\x1b[35m"; // Bold Magenta
      icon = "⚪";
    } else if (event.includes("BOOKING") || event.includes("PAID") || event.includes("PAYMENT")) {
      color = "\x1b[33m"; // Bold Yellow
      icon = "🎟️";
    } else if (event.includes("SIGNUP") || event.includes("NEW")) {
      color = "\x1b[36m"; // Bold Cyan
      icon = "✨";
    }

    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    const userStr = user ? `${user.name} (${user.email})` : "비로그인 유저";
    
    // Browser platform simplification for logs
    let platform = "Unknown";
    if (userAgent) {
      if (userAgent.includes("Macintosh")) platform = "macOS";
      else if (userAgent.includes("Windows")) platform = "Windows";
      else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) platform = "iOS";
      else if (userAgent.includes("Android")) platform = "Android";
      else if (userAgent.includes("Linux")) platform = "Linux";
    }

    if (event.includes("Bypass Attempt Blocked") || event.includes("CRYPTOGRAPHIC VERIFICATION FAILED")) {
      console.log(
        `\x1b[1m\x1b[31m[ANTI-MACRO MONITOR] 🚨 CRYPTOGRAPHIC VERIFICATION FAILED (Bypass Attempt Blocked)\x1b[0m | User: \x1b[1m${userStr}\x1b[0m | OS: \x1b[36m${platform}\x1b[0m | Details:`,
        details ? JSON.stringify(details) : "None"
      );
      return NextResponse.json({ success: true });
    }

    console.log(
      `${sysPrefix} ${icon} ${color}[${timeStr}] ${event}${reset} | User: \x1b[1m${userStr}${reset} | OS: \x1b[36m${platform}${reset} | Details:`, 
      details ? JSON.stringify(details) : "None"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 로깅 서버 에러:", error);
    return NextResponse.json({ error: "로깅 실패" }, { status: 500 });
  }
}
