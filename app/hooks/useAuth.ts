// app/hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase'; // 경로 확인 필요

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  const fetchProfile = async (uid: string) => {
    try {
      const { data } = await supabase.from('profiles').select('is_premium').eq('id', uid).single();
      if (isMounted.current && data) setIsPremium(data.is_premium);
    } catch (e) { /* Ignore */ }
  };

  useEffect(() => {
    isMounted.current = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (isMounted.current) {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) await fetchProfile(currentUser.id);
        }
      } catch (e: any) {
          // [Fix] AbortError는 자연스러운 현상이므로 무시
          if (e.name !== 'AbortError' && !e.message?.includes('aborted')) {
              console.warn("Auth Check Warning:", e.message);
          }
      } finally {
          // [Critical Fix] 성공하든 실패하든, 중단되든 무조건 로딩 종료!
          if (isMounted.current) {
              setLoading(false);
          }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;

      const currentUser = session?.user || null;
      
      setUser((prev: any) => {
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