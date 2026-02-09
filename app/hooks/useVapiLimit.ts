'use client';
import { useState, useEffect, useRef } from 'react';

// 회원 등급별 시간 제한 (초 단위)
const LIMITS = {
    FREE: 3 * 60, // 3분
    PRO: 60 * 60, // 60분
};

export const useVapiLimit = (isPremium: boolean, isConnected: boolean, disconnectVapi: () => void) => {
    const [usageSeconds, setUsageSeconds] = useState(0);
    const [isLimitReached, setIsLimitReached] = useState(false);
    
    // 현재 등급의 제한 시간
    const maxSeconds = isPremium ? LIMITS.PRO : LIMITS.FREE;
    const remainingSeconds = Math.max(0, maxSeconds - usageSeconds);
    const progress = (remainingSeconds / maxSeconds) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isConnected && !isLimitReached) {
            interval = setInterval(() => {
                setUsageSeconds((prev) => {
                    const next = prev + 1;
                    
                    // 제한 시간 도달 시
                    if (next >= maxSeconds) {
                        disconnectVapi(); // Vapi 연결 끊기
                        setIsLimitReached(true);
                        return maxSeconds;
                    }
                    return next;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isConnected, isLimitReached, maxSeconds, disconnectVapi]);

    // 하루가 지나면 초기화 (실제로는 DB나 로컬스토리지에 날짜와 함께 저장해야 함)
    // 여기서는 간단히 로컬스토리지 예시만 구현
    useEffect(() => {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('vapi_date');
        const savedUsage = localStorage.getItem('vapi_usage');

        if (savedDate !== today) {
            // 날짜가 바뀌었으면 리셋
            setUsageSeconds(0);
            localStorage.setItem('vapi_date', today);
        } else if (savedUsage) {
            setUsageSeconds(parseInt(savedUsage));
        }
    }, []);

    // 사용량 변경될 때마다 저장
    useEffect(() => {
        localStorage.setItem('vapi_usage', usageSeconds.toString());
    }, [usageSeconds]);

    return {
        remainingSeconds,
        progress, // 0 ~ 100% (남은 에너지)
        isLimitReached,
        resetUsage: () => { setUsageSeconds(0); setIsLimitReached(false); } // 테스트용 리셋
    };
};