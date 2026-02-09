'use client';
import { useState, useEffect } from 'react';

// 💎 정책 설정
const COIN_COST_PER_SEC = 1 / 60; // 1초당 1/60 코인 소모 (1분 = 1코인)
const ALLOWANCE = {
    FREE: 5,   // 무료: 월 5코인 (약 5분)
    PRO: 60,   // 유료: 월 60코인 (약 60분)
};

export const useVapiLimit = (isPremium: boolean, isConnected: boolean, disconnectVapi: () => void) => {
    const [credits, setCredits] = useState<number>(0); // 현재 보유 코인
    const [isLimitReached, setIsLimitReached] = useState(false);
    
    // 이번 달 최대 한도 (UI 표시용)
    const maxCredits = isPremium ? ALLOWANCE.PRO : ALLOWANCE.FREE;
    
    // 에너지 잔량 (0 ~ 100%)
    const progress = Math.min(100, Math.max(0, (credits / maxCredits) * 100));

    // 1. 초기화 및 월간 지급 로직
    useEffect(() => {
        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`; // 예: 2024-5
        
        const savedMonth = localStorage.getItem('vapi_month_key');
        const savedCredits = parseFloat(localStorage.getItem('vapi_credits') || '0');
        const userTier = localStorage.getItem('vapi_tier') || 'FREE';

        // (A) 달이 바뀌었거나, 데이터가 없으면 -> 코인 지급 (리셋)
        if (savedMonth !== currentMonthKey) {
            const grant = isPremium ? ALLOWANCE.PRO : ALLOWANCE.FREE;
            setCredits(grant);
            localStorage.setItem('vapi_month_key', currentMonthKey);
            localStorage.setItem('vapi_credits', grant.toString());
            localStorage.setItem('vapi_tier', isPremium ? 'PRO' : 'FREE');
        } 
        // (B) 달은 같은데 티어가 '무료 -> 유료'로 올랐다면 -> 차액 지급 (보너스)
        else if (userTier === 'FREE' && isPremium) {
            const bonus = ALLOWANCE.PRO - ALLOWANCE.FREE;
            const newBalance = savedCredits + bonus;
            setCredits(newBalance);
            localStorage.setItem('vapi_credits', newBalance.toString());
            localStorage.setItem('vapi_tier', 'PRO');
            alert(`🎉 Moonlight Pass 활성화! ${bonus} 코인이 추가 지급되었습니다.`);
        }
        // (C) 그 외: 저장된 잔액 불러오기
        else {
            setCredits(savedCredits);
        }
    }, [isPremium]);

    // 2. 실시간 차감 로직
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isConnected && credits > 0) {
            interval = setInterval(() => {
                setCredits((prev) => {
                    const next = prev - COIN_COST_PER_SEC;
                    
                    // 코인 다 씀
                    if (next <= 0) {
                        disconnectVapi();
                        setIsLimitReached(true);
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        } else if (credits <= 0 && isConnected) {
             // 이미 0인데 연결되어 있으면 끊기
             disconnectVapi();
             setIsLimitReached(true);
        }

        return () => clearInterval(interval);
    }, [isConnected, credits, disconnectVapi]);

    // 3. 잔액 저장
    useEffect(() => {
        localStorage.setItem('vapi_credits', credits.toString());
    }, [credits]);

    return {
        credits,        // 남은 코인 (실수형)
        progress,       // 에너지 바 용도 (0~100)
        isLimitReached,
        // 👇 [수정] 충전 함수: 원하는 양만큼 추가
        refillEnergy: (amount: number) => {
            setCredits((prev) => {
                const newCredits = prev + amount;
                localStorage.setItem('vapi_credits', newCredits.toString());
                return newCredits;
            });
            setIsLimitReached(false);
        }
    };
};