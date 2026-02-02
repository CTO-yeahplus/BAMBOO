// app/hooks/useParallax.ts
import { useEffect, useCallback } from 'react';
import { useMotionValue } from 'framer-motion';

export function useParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 1. Desktop Mouse Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // 화면 중앙을 0,0으로 하고 -1 ~ 1 범위로 정규화
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      x.set(nx);
      y.set(ny);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  // 2. Mobile Gyroscope Logic
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    // gamma: 좌우 기울기 (-90 ~ 90)
    // beta: 앞뒤 기울기 (-180 ~ 180)
    const gamma = e.gamma || 0;
    const beta = e.beta || 0;

    // 모바일은 기울임 각도를 -1 ~ 1 범위로 매핑 (감도 조절: 45도로 제한)
    const nx = Math.max(-1, Math.min(1, gamma / 45));
    const ny = Math.max(-1, Math.min(1, (beta - 45) / 45)); // 45도 들고 있는 상태를 기준으로

    x.set(nx);
    y.set(ny);
  }, [x, y]);

  // 3. Permission Request (iOS 13+ 필수)
  const requestAccess = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (e) {
        console.error('Gyro permission denied:', e);
      }
    } else {
      // 안드로이드나 구형 iOS는 권한 없이 바로 붙음
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }, [handleOrientation]);

  // Cleanup
  useEffect(() => {
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [handleOrientation]);

  return { x, y, requestAccess };
}