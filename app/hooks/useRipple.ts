// app/hooks/useRipple.ts
import { useState, useCallback } from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((e: React.PointerEvent<HTMLElement> | any) => {
    // 좌표 계산 (마우스/터치 통합인 PointerEvent 사용 권장)
    const x = e.clientX;
    const y = e.clientY;
    
    const newRipple = { id: Date.now(), x, y };
    
    setRipples((prev) => [...prev, newRipple]);

    // 1초 뒤 제거 (애니메이션이 끝난 후)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, []);

  return { ripples, addRipple };
}