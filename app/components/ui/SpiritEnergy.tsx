'use client';

import React, { useState, useMemo } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Coins, Crown, Sparkles } from 'lucide-react'; 
import { ModalOverlay } from '../modals/ModalOverlay'; 
import { UserTier } from '../../types';

// ⚖️ 내부 계산용 상수 (부모와 동일하게 맞춤)
const MAX_CREDITS_FREE = 5;
const MAX_CREDITS_PAID = 90;

interface SpiritEnergyProps {
    progress?: number; // 부모가 준 퍼센트 (옵션으로 변경)
    userTier?: UserTier;
    credits?: number; // 남은 시간 (분) - Source of Truth
    onUpgradeClick: () => void;
    isPremium?: boolean; // 하위 호환성 (userTier가 없을 경우 대비)
}

export const SpiritEnergy = ({ 
    progress: externalProgress, 
    userTier, 
    credits = 0, 
    onUpgradeClick,
    isPremium: propPremium 
}: SpiritEnergyProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // 1. 유료 회원 여부 판단 (userTier 우선, 없으면 isPremium)
    const isPaidUser = userTier === 'premium' || userTier === 'standard';
    // UI 표시용 (Premium 뱃지는 premium 등급만)
    const isPremiumBadge = userTier === 'premium' || propPremium === true;

    // 2. 🧮 [핵심 수정] 퍼센트(Progress) 안전 계산
    // 부모가 준 progress가 이상하면, credits를 기준으로 직접 다시 계산합니다.
    const safeProgress = useMemo(() => {
        // credits가 90이면 무조건 100%가 나와야 함
        const maxCredits = isPaidUser ? MAX_CREDITS_PAID : MAX_CREDITS_FREE;

        const calculated = (credits / maxCredits) * 100;
        
        // 0~100 사이로 보정
        return Math.min(100, Math.max(0, calculated));
    }, [credits, isPaidUser]);

    // 3. 상태 변수 설정 (safeProgress 기준)
    const isLow = safeProgress < 20; // 20% 미만일 때만 Low Warning

    // 색상 클래스 정의
    const colorClass = isLow ? 'text-red-400' : (isPremiumBadge ? 'text-indigo-400' : 'text-amber-400');
    const ringColorClass = isLow ? 'text-red-500' : (isPremiumBadge ? 'text-indigo-500' : 'text-amber-500'); 
    
    const statusText = isPremiumBadge ? 'Premium Soul' : (isPaidUser ? 'Standard Soul' : 'Free Trial');
    const statusBgColor = isPremiumBadge 
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
        : (isPaidUser ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30');

    // SVG 원형 게이지 설정
    const radiusSmall = 20;
    const circumferenceSmall = 2 * Math.PI * radiusSmall; 

    const radiusLarge = 58;
    const circumferenceLarge = 2 * Math.PI * radiusLarge; 

    // strokeDashoffset 계산
    const offsetSmall = circumferenceSmall - (safeProgress / 100) * circumferenceSmall;
    const offsetLarge = circumferenceLarge - (safeProgress / 100) * circumferenceLarge;

    const handleRecharge = () => {
        setIsOpen(false); 
        onUpgradeClick(); 
    };

    return (
        <>
            {/* 1. Trigger Button */}
            <div 
                className="relative group cursor-pointer flex items-center justify-center" 
                onClick={() => setIsOpen(true)}
            >
                {/* 에너지 링 (Visual) */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        {/* 배경 링 */}
                        <circle 
                            cx="24" cy="24" r={radiusSmall} 
                            stroke="currentColor" strokeWidth="3" fill="transparent" 
                            className="text-white/10" 
                        />
                        {/* 진행 링 */}
                        <motion.circle 
                            cx="24" cy="24" r={radiusSmall} 
                            stroke="currentColor" strokeWidth="3" fill="transparent" 
                            className={ringColorClass}
                            strokeDasharray={circumferenceSmall}
                            initial={{ strokeDashoffset: circumferenceSmall }}
                            animate={{ strokeDashoffset: offsetSmall }}
                            transition={{ duration: 1 }}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* 중앙 아이콘 */}
                    <div className={`relative z-10 ${colorClass}`}>
                        {credits <= 0 ? <Lock size={16} /> : <Zap size={16} fill="currentColor" />}
                    </div>
                </div>

                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur border border-white/10 rounded-xl text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl flex flex-col gap-1 items-start">
                    <div className={`font-mono font-bold flex items-center gap-1.5 ${colorClass}`}>
                        <Coins size={10} />
                        <span>{Math.floor(credits)} Mins</span>
                    </div>
                    <div className="text-[10px] text-white/50">Click for details</div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
                </div>
            </div>

            {/* 2. Status Modal */}
            <AnimatePresence>
                {isOpen && (
                    <ModalOverlay 
                        onClose={() => setIsOpen(false)} 
                        title="Spirit Energy" 
                        subtitle="Your connection to the forest"
                        maxWidth="max-w-sm"
                    >
                        <div className="p-6 flex flex-col items-center gap-6 relative">
                            
                            {/* Energy Display (큰 원형 게이지) */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle 
                                        cx="64" cy="64" r={radiusLarge} 
                                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        className="text-white/5" 
                                    />
                                    <motion.circle 
                                        cx="64" cy="64" r={radiusLarge} 
                                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        className={`${ringColorClass} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                                        strokeDasharray={circumferenceLarge}
                                        initial={{ strokeDashoffset: circumferenceLarge }}
                                        animate={{ strokeDashoffset: offsetLarge }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                
                                <div className="flex flex-col items-center z-10">
                                    <Zap size={32} className={`mb-1 ${colorClass}`} fill="currentColor" />
                                    <span className="text-3xl font-bold text-white font-mono">
                                        {Math.floor(credits)}
                                    </span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">MINUTES</span>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="w-full space-y-3">
                                <div className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 ${statusBgColor}`}>
                                    {isPremiumBadge ? <Crown size={14} /> : <Sparkles size={14} />}
                                    <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <span className="text-xs text-white/40">Usage</span>
                                    <span className="text-xs text-white/60 font-mono">
                                        {Math.round(safeProgress)}% Remaining
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={handleRecharge}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Coins size={16} className="group-hover:rotate-12 transition-transform" />
                                Recharge Energy
                            </button>
                            
                        </div>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </>
    );
};