'use client';
import { motion } from 'framer-motion';
import { Zap, Lock, Coins } from 'lucide-react';

interface SpiritEnergyProps {
    progress: number; // 0 ~ 100
    isPremium: boolean;
    credits?: number;
    onUpgradeClick: () => void;
}

export const SpiritEnergy = ({ progress, isPremium, credits = 0, onUpgradeClick }: SpiritEnergyProps) => {
    // 20% 미만이면 붉은색, 아니면 등급별 색상
    const isLow = progress < 20;
    const color = isLow ? 'text-red-400' : (isPremium ? 'text-indigo-400' : 'text-amber-400');
    const ringColor = isLow ? 'stroke-red-500' : (isPremium ? 'stroke-indigo-500' : 'stroke-amber-500');

    return (
        // 👇 [Layout] flex-col 제거 -> 원형 유지
        <div className="relative group cursor-pointer flex items-center justify-center" onClick={onUpgradeClick}>
            
            {/* 1. 에너지 링 (Visual) */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                    <motion.circle 
                        cx="24" cy="24" r="20" 
                        stroke="currentColor" strokeWidth="3" fill="transparent" 
                        className={`${ringColor}`}
                        strokeDasharray="125.6"
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }}
                        transition={{ duration: 1 }}
                    />
                </svg>

                {/* 중앙 아이콘 */}
                <div className={`relative z-10 ${color}`}>
                    {credits <= 0 ? <Lock size={16} /> : <Zap size={16} fill="currentColor" />}
                </div>
            </div>

            {/* 2. [변경] Tooltip (우측 배치 & 코인 정보 포함) */}
            {/* 위치: left-full (우측), ml-3 (간격), top-1/2 (수직 중앙) */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur border border-white/10 rounded-xl text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl flex flex-col gap-1 items-start">
                
                {/* 상단: 코인 잔액 */}
                <div className={`font-mono font-bold flex items-center gap-1.5 ${color}`}>
                    <Coins size={10} />
                    <span>{Math.floor(credits)} Coins</span>
                </div>
                
                {/* 하단: 설명 */}
                <div className="text-[10px] text-white/50">
                    {isPremium ? 'Monthly Limit' : 'Free Trial'}
                </div>

                {/* 화살표 (Tooltip Arrow) */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-black/80" />
            </div>

        </div>
    );
};