"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/src/lib/superbase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  isMock?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: () => void;
  logout: () => Promise<void>;
  logEvent: (event: string, details?: any) => Promise<void>;
  balance: number;
  deductBalance: (amount: number) => boolean;
  refundBalance: (amount: number) => void;
  resetBalance: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // 실시간 서버/클라이언트 로거 함수
  const logEvent = async (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "Server";
    const logData = {
      event,
      timestamp,
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      userAgent,
      details,
    };

    // 1. 브라우저 콘솔 출력 (팀원 개인 디버깅용)
    console.log(
      `%c[ANTI-MACRO LOG]%c [${timestamp}] ${event}`,
      "color: #00CD3C; font-weight: bold; background-color: #f0fff4; padding: 2px 6px; border-radius: 4px;",
      "color: inherit;",
      details || ""
    );

    // 2. 도커 서버 콘솔 출력용 API 호출 (모든 팀원 행동 통합 모니터링용)
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
    } catch (err) {
      // 로거 API 실패 시 무시
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 1. 먼저 로컬스토리지의 모의(Mock) 관리자 로그인 상태 체크
        const cachedMockUser = localStorage.getItem("amt_mock_user");
        if (cachedMockUser) {
          const parsed = JSON.parse(cachedMockUser);
          setUser(parsed);
          setLoading(false);
          // 동시 접속 로깅
          await logEvent("🚀 USER SESSION RESTORED (Mock Admin)", { email: parsed.email });
          return;
        }

        // 2. Supabase 실제 로그인 세션 체크
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const realUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.email?.split("@")[0] || "회원",
            isAdmin: false,
            isMock: false,
          };
          setUser(realUser);
          await logEvent("🚀 USER SESSION RESTORED (Supabase)", { email: realUser.email });
        }
      } catch (err) {
        console.error("인증 세션 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Supabase 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // 이미 Mock 로그인이 활성화되어 있으면 무시
        if (localStorage.getItem("amt_mock_user")) return;

        const realUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.email?.split("@")[0] || "회원",
          isAdmin: false,
          isMock: false,
        };
        setUser(realUser);
        await logEvent("🔓 USER SIGNED IN (Supabase)", { email: realUser.email });
      } else if (event === "SIGNED_OUT") {
        if (!localStorage.getItem("amt_mock_user")) {
          setUser(null);
          await logEvent("🔒 USER SIGNED OUT (Supabase)");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // 이메일 로그인 (Supabase)
  const loginWithEmail = async (email: string, password: string) => {
    try {
      localStorage.removeItem("amt_mock_user"); // 모의 로그인 캐시 비우기
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        await logEvent("❌ USER SIGNIN FAILED (Supabase)", { email, error: error.message });
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const realUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.email?.split("@")[0] || "회원",
          isAdmin: false,
          isMock: false,
        };
        setUser(realUser);
        await logEvent("🔓 USER SIGNIN SUCCESS (Supabase)", { email: realUser.email });
        closeLoginModal();
        return { success: true };
      }
      return { success: false, error: "알 수 없는 에러가 발생했습니다." };
    } catch (err: any) {
      return { success: false, error: err.message || "로그인 중 에러가 발생했습니다." };
    }
  };

  // 이메일 회원가입 (Supabase)
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        await logEvent("❌ USER SIGNUP FAILED (Supabase)", { email, error: error.message });
        return { success: false, error: error.message };
      }

      if (data?.user) {
        await logEvent("✨ NEW USER SIGNED UP (Supabase)", { email });
        return { success: true };
      }
      return { success: false, error: "회원가입 중 에러가 발생했습니다." };
    } catch (err: any) {
      return { success: false, error: err.message || "회원가입 중 에러가 발생했습니다." };
    }
  };

  // 간편 관리자 로그인
  const loginAsAdmin = async () => {
    const adminUser: AuthUser = {
      id: "test-user-01",
      email: "admin@antimacro.com",
      name: "충햄과 딸래미들",
      isAdmin: true,
      isMock: true,
    };
    
    // Supabase 로그아웃 먼저 보장
    await supabase.auth.signOut();
    
    localStorage.setItem("amt_mock_user", JSON.stringify(adminUser));
    setUser(adminUser);
    await logEvent("👑 USER SIGNED IN (Mock Admin Bypass)", { name: adminUser.name, id: adminUser.id });
    closeLoginModal();
  };

  // 유저 변경 시 해당 유저의 잔고 로드 및 기본 지급 (최대 500만 포인트 제한 보장)
  useEffect(() => {
    if (user) {
      const storageKey = `amt_balance_${user.id}`;
      const savedBalance = localStorage.getItem(storageKey);
      if (savedBalance !== null) {
        const val = parseInt(savedBalance, 10);
        // 이미 500만 포인트를 초과했다면 500만으로 즉시 교정 및 저장
        if (val > 5000000) {
          localStorage.setItem(storageKey, "5000000");
          setBalance(5000000);
        } else {
          setBalance(val);
        }
      } else {
        localStorage.setItem(storageKey, "5000000");
        setBalance(5000000);
      }
    } else {
      setBalance(0);
    }
  }, [user]);

  const deductBalance = (amount: number): boolean => {
    if (!user) return false;
    const storageKey = `amt_balance_${user.id}`;
    const currentBalance = parseInt(localStorage.getItem(storageKey) || "5000000", 10);
    
    if (currentBalance < amount) {
      return false;
    }
    
    // 차감 후 혹시 모를 오버플로우 방지 및 안전 보장
    const newBalance = Math.max(0, Math.min(5000000, currentBalance - amount));
    localStorage.setItem(storageKey, newBalance.toString());
    setBalance(newBalance);
    return true;
  };

  const refundBalance = (amount: number): void => {
    if (!user) return;
    const storageKey = `amt_balance_${user.id}`;
    let currentBalance = parseInt(localStorage.getItem(storageKey) || "5000000", 10);
    // 혹시라도 로컬 스토리지에 데이터가 깨졌거나 NaN이 되어 있다면 복구
    if (isNaN(currentBalance)) {
      currentBalance = 5000000;
    }
    // 환불 시 최대 한도인 5,000,000 포인트를 넘지 못하도록 Math.min 적용 및 강제 숫자 덧셈 보장!
    const newBalance = Math.min(5000000, currentBalance + Number(amount));
    localStorage.setItem(storageKey, newBalance.toString());
    setBalance(newBalance);
  };

  const resetBalance = (): void => {
    if (!user) return;
    const storageKey = `amt_balance_${user.id}`;
    localStorage.setItem(storageKey, "5000000");
    setBalance(5000000);
    logEvent("🔄 POINT BALANCE RESET TO 5M P", { email: user.email });
  };

  // 로그아웃
  const logout = async () => {
    const prevUser = user;
    localStorage.removeItem("amt_mock_user");
    setUser(null);
    await supabase.auth.signOut();
    await logEvent("🔒 USER LOGGED OUT", { prevUser: prevUser ? prevUser.email : null });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithEmail,
        signUpWithEmail,
        loginAsAdmin,
        logout,
        logEvent,
        balance,
        deductBalance,
        refundBalance,
        resetBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
