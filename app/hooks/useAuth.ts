// app/hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// 클라이언트 생성 (싱글톤 유지)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false // [Fix] URL 감지 비활성화 (충돌 방지)
    }
  }
);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  // 프로필 가져오기 (에러 무시)
  const fetchProfile = async (uid: string) => {
    try {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', uid).single();
      if (isMounted.current && data) setIsPremium(data.is_premium);
    } catch (e) { /* Ignore */ }
  };

  useEffect(() => {
    isMounted.current = true;

    // [Fix] 초기 세션 확인과 구독을 하나의 흐름으로 통합
    const initAuth = async () => {
      try {
        // 1. 초기 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // AbortError가 아닌 진짜 에러만 로깅
        if (error && error.name !== 'AbortError' && !error.message.includes('aborted')) {
            console.warn("Auth Check Warning:", error.message);
        }

        if (isMounted.current) {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) await fetchProfile(currentUser.id);
            setLoading(false); // 로딩 완료
        }
      } catch (e) {
          // 모든 초기화 에러 무시하고 로딩 해제 (앱 멈춤 방지)
          if (isMounted.current) setLoading(false);
      }
    };

    initAuth();

    // 2. 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;

      // [Safety] 불필요한 업데이트 방지
      const currentUser = session?.user || null;
      
      setUser((prev: any) => {
          // ID가 같으면 상태 변경 안 함 (렌더링 최적화)
          if (prev?.id === currentUser?.id) return prev;
          return currentUser;
      });

      if (currentUser) {
          await fetchProfile(currentUser.id);
      } else {
          setIsPremium(false);
      }
      
      setLoading(false);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: redirectUrl,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    if (isMounted.current) {
        setUser(null);
        setIsPremium(false);
    }
  };

  return { user, isPremium, loading, signInWithGoogle, signOut };
}