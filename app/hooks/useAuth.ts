// app/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', uid).single();
      if (data) setIsPremium(data.is_premium);
    } catch (e) { console.error("Profile fetch error:", e); }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) await fetchProfile(currentUser.id);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) await fetchProfile(currentUser.id);
      else setIsPremium(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  // [Fix] 로그아웃 로직 강화 (에러 무시하고 강제 로그아웃)
  const signOut = async () => {
    try {
      // Supabase 서버에 로그아웃 요청
      await supabase.auth.signOut();
    } catch (error) {
      // 락(Lock) 관련 에러는 무시해도 안전합니다.
      console.warn("Sign out signal aborted (handled):", error);
    } finally {
      // 에러 여부와 상관없이 로컬 상태를 클리어하여 UI를 로그아웃 상태로 만듦
      setUser(null);
      setIsPremium(false);
      // 확실한 정리를 위해 로컬 스토리지 키 삭제 (선택사항)
      // localStorage.removeItem('sb-...'); 
    }
  };

  return { user, isPremium, loading, signInWithGoogle, signOut };
}