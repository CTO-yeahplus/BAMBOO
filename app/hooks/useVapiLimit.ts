'use client';
import { useState, useEffect, useRef } from 'react';

// 💎 정책 설정
const COIN_COST_PER_SEC = 1 / 60; // 1초당 1/60 코인 소모 (1분 = 1코인)
const ALLOWANCE = {
    FREE: 5,   // 무료: 월 5코인 (약 5분)
    PRO: 90,   // 유료: 월 90코인 (약 90분)
};

export const useVapiLimit = (
    isPremium: boolean, 
    isConnected: boolean, 
    disconnectVapi: () => void,
    dbCredits: number = 0 // 👈 [New] DB에서 가져온 실제 크레딧 (필수)
) => {
    // 내부 상태: DB값으로 초기화, 없으면 0
    const [credits, setCredits] = useState<number>(dbCredits); 
    const [isLimitReached, setIsLimitReached] = useState(false);
    
    // 이번 달 최대 한도 (UI 표시용)
    const maxCredits = isPremium ? ALLOWANCE.PRO : ALLOWANCE.FREE;
    
    // 에너지 잔량 (0 ~ 100%)
    const progress = Math.min(100, Math.max(0, (credits / maxCredits) * 100));

    // 🔄 1. DB 데이터 동기화 (Source of Truth)
    // 통화 중이 아닐 때만 DB 값을 내부 상태로 가져옵니다.
    // (통화 중일 때는 실시간 차감을 위해 내부 상태를 우선함)
    useEffect(() => {
        if (!isConnected) {
            // DB 값이 유효하고, 내부 값과 다를 때 업데이트
            setCredits(dbCredits);
            setIsLimitReached(dbCredits <= 0);
        }
    }, [dbCredits, isConnected]);


    // ⏱️ 2. 실시간 차감 로직 (타이머)
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isConnected) {
            // 안전장치: 크레딧이 0 이하면 즉시 종료하지 않고, 
            // 1초 뒤에 다시 확인 (DB 로딩 지연 가능성 대비)
            if (credits <= 0) {
                 // 아주 짧은 유예 시간을 둠 (0.5초 미만 컷 방지)
            }

            interval = setInterval(() => {
                setCredits((prev) => {
                    // 이미 0 이하라면 종료 트리거
                    if (prev <= 0) {
                        disconnectVapi();
                        setIsLimitReached(true);
                        return 0;
                    }
                    
                    const next = prev - COIN_COST_PER_SEC;
                    return next;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isConnected, disconnectVapi, credits]);


    // 💾 3. (옵션) 로컬 스토리지 백업
    // DB 업데이트가 실패했을 때를 대비해 UI용으로만 저장
    useEffect(() => {
        if (credits > 0) {
            localStorage.setItem('vapi_credits_backup', credits.toString());
        }
    }, [credits]);

    return {
        credits,        // 남은 코인 (실수형)
        progress,       // 에너지 바 용도 (0~100)
        isLimitReached,
        
        // 충전/관리자용 함수
        refillEnergy: (amount: number) => {
            setCredits((prev) => prev + amount);
            setIsLimitReached(false);
        }
    };
};