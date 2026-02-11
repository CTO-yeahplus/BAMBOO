// app/hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { UserTier } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<UserTier>('free'); // 👈 [New] 등급 상태
  const [isPremium, setIsPremium] = useState(false); // [Compatibility] 호환성 유지
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const isMounted = useRef(false);

  const fetchProfile = async (uid: string) => {
    try {
      // 1. credits 컬럼도 같이 가져옴
      const { data } = await supabase
        .from('profiles')
        .select('*, subscription_tier, credits') // credits 명시
        .eq('id', uid)
        .single();
      
      if (isMounted.current && data) {
          setTier(data.subscription_tier || 'free');
          // 👇 [New] DB 값으로 크레딧 설정 (없으면 0)
          setCredits(data.credits !== null ? data.credits : 0);
          
          console.log(`[useAuth] Profile Fetched: Tier=${data.subscription_tier}, Credits=${data.credits}`);
      }
    } catch (e) { 
        console.warn("[useAuth] Fetch Error:", e);
    }
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
          if (e.name !== 'AbortError' && !e.message?.includes('aborted')) {
              console.warn("Auth Check Warning:", e.message);
          }
      } finally {
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
          setTier('free');
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
        setTier('free');
        setIsPremium(false);
    }
  };

  // 👈 tier 반환 추가
  return { user, tier, credits, loading, signInWithGoogle, signOut };
}