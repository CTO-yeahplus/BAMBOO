// app/hooks/useHaptic.ts
import { useCallback } from 'react';

export function useHaptic() {
  // 1. Light Tap (UI 버튼, 저널 넘김) - 가볍고 짧게
  const triggerLight = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // 10ms
    }
  }, []);

  // 2. Medium Impact (이슬 터뜨리기) - 경쾌하게
  const triggerMedium = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40); // 40ms
    }
  }, []);

  // 3. Success / Complete (기억 저장 완료) - 두 번 톡톡
  const triggerSuccess = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]); // 진동, 쉼, 진동
    }
  }, []);

  // 4. Breathing (호흡) - 심장박동처럼 둥- 둥- (점진적 느낌)
  const triggerBreathing = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // 기기가 지원하는 한도 내에서 부드러운 박동감 표현
      navigator.vibrate([10, 200, 20, 200, 10]); 
    }
  }, []);

  return { triggerLight, triggerMedium, triggerSuccess, triggerBreathing };
}