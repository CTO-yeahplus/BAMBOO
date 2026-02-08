// app/hooks/usePresence.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { FireflyUser } from '../types';

const PRESET_COLORS = ['#FCD34D', '#60A5FA', '#F472B6', '#A78BFA', '#34D399'];

export function usePresence(userId: string | null) {
  const [fireflies, setFireflies] = useState<FireflyUser[]>([]);
  const channelRef = useRef<any>(null);
  const myStateRef = useRef<FireflyUser>({
      id: userId || Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 10, // 10~90% 안전 구역
      y: Math.random() * 60 + 20, // 20~80% 안전 구역
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      last_active: Date.now(),
  });

  useEffect(() => {
    // 1. 채널 생성 (모든 유저가 'bamboo-forest'라는 하나의 방에 모임)
    const channel = supabase.channel('bamboo-forest', {
      config: { presence: { key: myStateRef.current.id } },
    });

    channelRef.current = channel;

    // 2. 다른 유저들의 상태 변화 감지 (Sync)
    channel
      .on('presence', { event: 'sync' }, () => {
        // [Fix] 타입 단언(Type Assertion) 추가하여 빨간 줄 제거
        const newState = channel.presenceState() as Record<string, FireflyUser[]>;
        const users: FireflyUser[] = [];
        
        for (const key in newState) {
            // 안전하게 배열 확인 후 첫 번째 요소 가져오기
            if (newState[key] && newState[key].length > 0) {
                const user = newState[key][0];
                
                // 나 자신은 리스트에서 제외 (내 화면엔 내가 안 보임)
                if (user.id !== myStateRef.current.id) {
                    users.push(user);
                }
            }
        }
        setFireflies(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 3. 내 초기 상태 전송
          await channel.track(myStateRef.current);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 4. 내 위치 업데이트 (터치/클릭 시 호출)
  const broadcastTouch = useCallback((x: number, y: number) => {
      if (!channelRef.current) return;
      
      // 화면 좌표를 %로 변환
      const xPercent = (x / window.innerWidth) * 100;
      const yPercent = (y / window.innerHeight) * 100;

      const newState = {
          ...myStateRef.current,
          x: xPercent,
          y: yPercent,
          last_active: Date.now(),
      };

      myStateRef.current = newState;
      channelRef.current.track(newState); // 변경된 상태 전송
  }, []);

  return { fireflies, broadcastTouch };
}