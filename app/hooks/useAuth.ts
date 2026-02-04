// app/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

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
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) await fetchProfile(currentUser.id);
            setLoading(false);
        }
      } catch (error: any) {
        // [Fix] Ignore Abort Errors
        if (error.message?.includes('aborted') || error.message?.includes('signal') || error.name === 'AbortError') {
            return;
        }
        // node_modules 내부 에러 스택 무시
        if (error.stack?.includes('locks.ts')) return;

        console.error("Session check error:", error);
        if (mounted) setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) await fetchProfile(currentUser.id);
      else setIsPremium(false);
      setLoading(false);
    });

    return () => {
        mounted = false;
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
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out signal aborted (handled)");
    } finally {
      setUser(null);
      setIsPremium(false);
    }
  };

  return { user, isPremium, loading, signInWithGoogle, signOut };
}