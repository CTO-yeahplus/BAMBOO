// app/hooks/useWakeLock.ts
import { useRef, useCallback } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('💡 Screen Wake Lock active');
      } catch (err) {
        console.error('🚫 Wake Lock failed:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('🌑 Screen Wake Lock released');
      } catch (err) {
        console.error('🚫 Release Wake Lock failed:', err);
      }
    }
  }, []);

  return { requestWakeLock, releaseWakeLock };
}