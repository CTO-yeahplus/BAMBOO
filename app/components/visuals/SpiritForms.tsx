// app/components/visuals/SpiritForms.tsx
'use client';

import React from 'react';
import { motion, useTransform } from 'framer-motion';
import Image from 'next/image';
import { SpiritFormType } from '../../types';

// [Helper] Silhouettes (LivingSpirit에서 사용)
export const SpiritFoxSilhouette = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 100" className="w-48 h-48 blur-sm">
        <path d="M30 60 Q50 85 70 60 L65 85 Q50 95 35 85 Z" fill={color} />
        <path d="M30 60 Q20 40 35 25 Q45 15 50 30 Q55 15 65 25 Q80 40 70 60" fill="none" stroke={color} strokeWidth="2" />
    </svg>
);

export const SpiritGuardianSilhouette = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 100" className="w-64 h-64 blur-md opacity-60">
        <circle cx="50" cy="40" r="15" fill={color} />
        <path d="M20 100 Q50 40 80 100" fill={color} />
    </svg>
);

// 1단계: Wisp (빛의 구체)
export const SpiritWisp = () => {
    const orbits = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        radius: 40 + i * 8,
        duration: 4 + i * 1.5,
        delay: i * 0.5,
        reverse: i % 2 === 0,
    }));

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div
                className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-300 via-cyan-200 to-white blur-md mix-blend-screen z-20"
                animate={{
                    scale: [1, 1.3, 0.9, 1.2, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["50% 50% 50% 50%", "60% 40% 70% 30%", "50% 50% 50% 50%"]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
                className="absolute w-24 h-24 bg-blue-100/60 rounded-full blur-[15px] z-10"
                animate={{ scale: [1, 1.5, 1.2, 1.6, 1], opacity: [0.6, 1, 0.7, 0.9, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.5, 0.8, 1] }}
            />
            <motion.div 
                className="absolute inset-0 bg-cyan-400/20 rounded-full blur-[40px] mix-blend-overlay"
                animate={{ scale: [0.8, 1.2, 0.9], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
                {orbits.map(orb => (
                    <motion.div
                        key={orb.id}
                        className="absolute top-1/2 left-1/2 w-1 h-1"
                        animate={{ rotate: orb.reverse ? -360 : 360 }}
                        transition={{ duration: orb.duration, repeat: Infinity, ease: "linear", delay: orb.delay }}
                    >
                        <motion.div 
                            className="relative w-3 h-3 rounded-full bg-white blur-[1px] shadow-[0_0_10px_rgba(150,240,255,0.8)]"
                            style={{ left: orb.radius }}
                            animate={{ scale: [1, 1.5, 0.5, 1], opacity: [0.5, 1, 0.3, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                             <div className="absolute right-full top-0 h-full w-10 bg-gradient-to-l from-white/50 to-transparent blur-sm" />
                        </motion.div>
                    </motion.div>
                ))}
            </div>
             <motion.div 
                 className="absolute z-30 w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]"
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: [0, 1, 0], scale: [0, 3, 0] }}
                 transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 3 }}
             />
        </div>
    );
};

// 2단계: Spirit Fox (빛으로 빚어진 영물)
export const SpiritFox = () => {
    const bodyPath = "M30 60 Q50 85 70 60 L65 85 Q50 95 35 85 Z";
    const tailEarPath = "M30 60 Q20 40 35 25 Q45 15 50 30 Q55 15 65 25 Q80 40 70 60 Q85 45 95 30 Q90 20 80 30 Q70 40 70 60";

    return (
        <div className="relative w-72 h-72 flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full animate-pulse mix-blend-screen" />
             {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={`dust-${i}`}
                    className="absolute bottom-10 w-1 h-1 bg-blue-200 rounded-full blur-[1px]"
                    style={{ left: `${20 + Math.random() * 60}%` }}
                    animate={{ y: -150, opacity: [0, 0.8, 0], scale: [0, Math.random() * 2 + 1, 0] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: "easeOut" }}
                />
             ))}
             <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible relative z-20 drop-shadow-[0_0_10px_rgba(150,220,255,0.5)]">
                <motion.path d={bodyPath} fill="url(#fox-gradient)" stroke="none" initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
                {[bodyPath, tailEarPath].map((path, i) => (
                    <motion.path key={i} d={path} fill="none" stroke="url(#light-flow)" strokeWidth={i === 0 ? "1.5" : "2"} strokeLinecap="round" strokeDasharray="10 20" animate={{ strokeDashoffset: [0, -30] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                ))}
                <motion.circle cx="42" cy="45" r="1.5" fill="white" animate={{ r: [1.5, 2.5, 1.5], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="drop-shadow-[0_0_5px_white]" />
                <motion.circle cx="58" cy="45" r="1.5" fill="white" animate={{ r: [1.5, 2.5, 1.5], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} className="drop-shadow-[0_0_5px_white]" />
                <defs>
                    <linearGradient id="fox-gradient" x1="0%" y1="100%" x2="0%" y2="0%"> <stop offset="0%" stopColor="#90cdf4" stopOpacity="0.1" /> <stop offset="100%" stopColor="white" stopOpacity="0.3" /> </linearGradient>
                    <linearGradient id="light-flow" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="#a5f3fc" /> <stop offset="50%" stopColor="white" /> <stop offset="100%" stopColor="#a5f3fc" /> </linearGradient>
                </defs>
             </svg>
        </div>
    );
};

// 3단계: Spirit Guardian (최종 형태)
export const SpiritAura = ({ type }: { type: string | null }) => {
    if (!type) return null;
    switch (type) {
        case 'aura_firefly': return ( <div className="absolute inset-0 pointer-events-none"> {Array.from({ length: 5 }).map((_, i) => ( <motion.div key={i} className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_5px_yellow]" animate={{ x: [Math.random() * 200 - 100, Math.random() * 200 - 100], y: [Math.random() * 200 - 100, Math.random() * 200 - 100], opacity: [0, 1, 0] }} transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }} style={{ left: '50%', top: '50%' }} /> ))} </div> );
        case 'aura_moonlight': return <div className="absolute inset-[-20%] bg-blue-500/20 blur-3xl rounded-full animate-pulse mix-blend-screen pointer-events-none" />;
        case 'aura_ember': return <div className="absolute inset-[-20%] bg-orange-500/20 blur-3xl rounded-full animate-pulse mix-blend-screen pointer-events-none" />;
        default: return null;
    }
};

export const SpiritAccessory = ({ type }: { type: string | null }) => {
    if (!type) return null;
    switch (type) {
        case 'head_flower': return <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-10 pointer-events-none opacity-80"><div className="flex justify-center gap-1"><span className="text-2xl drop-shadow-lg filter hue-rotate-15">🌸</span><span className="text-xl drop-shadow-lg mt-2">🌼</span><span className="text-2xl drop-shadow-lg filter -hue-rotate-15">🌸</span></div></div>;
        case 'head_fox': return <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none border border-red-500/30"><div className="absolute top-4 left-3 w-3 h-1 bg-red-500 rounded-full rotate-12" /><div className="absolute top-4 right-3 w-3 h-1 bg-red-500 rounded-full -rotate-12" /><span className="text-3xl mt-1">🦊</span></div>;
        default: return null;
    }
};

export const SpiritGuardian = ({ resonance, isBreathing, isHolding, spiritGlowOpacity, equippedItems }: any) => {
    const blurValue = useTransform(resonance, [0, 500], [10, 0]);
    const scaleValue = useTransform(resonance, [0, 500], [0.8, 1]);
    const baseScale = isBreathing || isHolding ? 1.05 : 1;
    const finalScale = useTransform(scaleValue, v => v * baseScale);

    return (
        <motion.div 
            className="relative w-full h-full rounded-[40px] overflow-hidden cursor-pointer transition-all duration-500"
            style={{ scale: finalScale, filter: useTransform(blurValue, v => `blur(${v}px)`) as any }}
        >
            <SpiritAura type={equippedItems.aura} />
            <Image src="/images/spirit_final.png" alt="Spirit" fill className="object-cover transition-opacity duration-500" />
            <SpiritAccessory type={equippedItems.head} />
            <motion.div className="absolute inset-0 bg-white mix-blend-overlay z-30" style={{ opacity: spiritGlowOpacity }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
            <motion.div className="absolute inset-0 bg-white/10 mix-blend-screen pointer-events-none" style={{ opacity: useTransform(resonance, [0, 300], [0.5, 0]) }} />
        </motion.div>
    );
};

// 통합 Renderer
export const SpiritRenderer = ({ form, hasWoken, isBreathing }: { form: SpiritFormType, hasWoken: boolean, isBreathing: boolean }) => {
    const breatheAnim = isBreathing ? { scale: [1, 1.1, 1], opacity: 0.8 } : {};
    switch (form) {
        case 'wisp': return <motion.div animate={breatheAnim} transition={{ duration: 4, repeat: Infinity }}><SpiritWisp /></motion.div>;
        case 'fox': return <motion.div animate={breatheAnim} transition={{ duration: 4, repeat: Infinity }}><SpiritFox /></motion.div>;
        case 'guardian': default: return null; 
    }
};