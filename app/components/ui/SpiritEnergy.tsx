'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Coins, Crown, Sparkles } from 'lucide-react';
// 👇 ModalOverlay import (경로 확인 필요)
import { ModalOverlay } from '../modals/ModalOverlay';

interface SpiritEnergyProps {
    progress: number; // 0 ~ 100
    isPremium: boolean;
    credits?: number;
    onUpgradeClick: () => void;
}

export const SpiritEnergy = ({ progress, isPremium, credits = 0, onUpgradeClick }: SpiritEnergyProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // 20% 미만이면 붉은색, 아니면 등급별 색상
    const isLow = progress < 20;
    const color = isLow ? 'text-red-400' : (isPremium ? 'text-indigo-400' : 'text-amber-400');
    const ringColor = isLow ? 'stroke-red-500' : (isPremium ? 'stroke-indigo-500' : 'stroke-amber-500');
    
    const statusText = isPremium ? 'Premium Soul' : 'Free Trial';
    const statusColor = isPremium ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    const handleRecharge = () => {
        setIsOpen(false); // 상태창 닫기
        onUpgradeClick(); // 결제창(PaymentModal) 열기
    };

    return (
        <>
            {/* 1. Trigger Button (기존 UI 유지 + onClick 변경) */}
            <div 
                className="relative group cursor-pointer flex items-center justify-center" 
                onClick={() => setIsOpen(true)}
            >
                {/* 에너지 링 (Visual) */}
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

                {/* Tooltip (Hover Preview) */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur border border-white/10 rounded-xl text-xs text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl flex flex-col gap-1 items-start">
                    <div className={`font-mono font-bold flex items-center gap-1.5 ${color}`}>
                        <Coins size={10} />
                        <span>{Math.floor(credits)} Coins</span>
                    </div>
                    <div className="text-[10px] text-white/50">Click for details</div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-black/80" />
                </div>
            </div>

            {/* 2. Status Modal (새로 추가된 상세 정보창) */}
            <AnimatePresence>
                {isOpen && (
                    <ModalOverlay 
                        onClose={() => setIsOpen(false)} 
                        title="Spirit Energy" 
                        subtitle="Your connection to the forest"
                        maxWidth="max-w-sm" // 작은 사이즈 모달
                    >
                        <div className="p-6 flex flex-col items-center gap-6">
                            
                            {/* Energy Display (큰 원형 게이지) */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Background Ring */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <motion.circle 
                                        cx="64" cy="64" r="58" 
                                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        className={`${ringColor} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                                        strokeDasharray="364.4" // 2 * PI * 58
                                        initial={{ strokeDashoffset: 364.4 }}
                                        animate={{ strokeDashoffset: 364.4 - (364.4 * progress) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                
                                <div className="flex flex-col items-center z-10">
                                    <Zap size={32} className={`mb-1 ${color}`} fill="currentColor" />
                                    <span className="text-3xl font-bold text-white font-mono">{Math.floor(credits)}</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">MINUTES</span>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="w-full space-y-3">
                                {/* Membership Badge */}
                                <div className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 ${statusColor}`}>
                                    {isPremium ? <Crown size={14} /> : <Sparkles size={14} />}
                                    <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
                                </div>

                                {/* Progress Text */}
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-xs text-white/40">Usage</span>
                                    <span className="text-xs text-white/60 font-mono">{Math.round(progress)}% Remaining</span>
                                </div>
                            </div>

                            {/* Action Button (결제창 열기) */}
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