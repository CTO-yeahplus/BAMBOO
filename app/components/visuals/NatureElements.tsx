// app/components/visuals/NatureElements.tsx
'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Memory } from '../../types';

export const Hydrangea = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-blue-400/30 fill-blue-500/20" style={{ filter: 'blur(4px)' }} /><circle cx="12" cy="12" r="2" className="fill-blue-200" /><circle cx="8" cy="12" r="2" className="fill-purple-200" /><circle cx="16" cy="12" r="2" className="fill-indigo-200" /><circle cx="12" cy="8" r="2" className="fill-blue-200" /><circle cx="12" cy="16" r="2" className="fill-purple-200" /></svg>);
export const SpiderLily = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-red-500/30 fill-red-600/20" style={{ filter: 'blur(4px)' }} /><path d="M12 12L12 4M12 12L18 6M12 12L20 12M12 12L18 18M12 12L12 20M12 12L6 18M12 12L4 12M12 12L6 6" stroke="currentColor" className="text-red-400" /><circle cx="12" cy="12" r="1.5" className="fill-red-200" /></svg>);
export const Moonflower = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-white/30 fill-white/10" style={{ filter: 'blur(5px)' }} /><path d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" className="fill-yellow-100 text-yellow-100" /></svg>);

export const MemoryFlower = ({ emotion, isSelected }: { emotion?: string; isSelected: boolean }) => { 
    const glowClass = isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"; 
    switch (emotion) { 
        case 'sadness': return <Hydrangea className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; 
        case 'anger': return <SpiderLily className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; 
        default: return <Moonflower className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; 
    }
};

export const SpringPetal = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-80"> <path d="M12 2C12 2 14 5 16 8C18 11 18 14 16 16C14 18 11 18 8 16C6 14 6 11 8 8C10 5 12 2 12 2Z" /> </svg> );
export const SummerFirefly = ({ color }: { color: string }) => ( <div className="w-full h-full rounded-full bg-yellow-300 blur-[1px] shadow-[0_0_4px_yellow]" /> );
export const AutumnLeaf = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-90"> <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" /> </svg> );

export const GoldenCocoon = ({ isLocked }: { isLocked: boolean }) => ( <div className="relative group"> <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" /> {isLocked ? ( <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" fill="none"> <line x1="12" y1="0" x2="12" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" /> <path d="M12 4C9 4 7 8 7 13C7 18 9 22 12 22C15 22 17 18 17 13C17 8 15 4 12 4Z" className="fill-yellow-600/80 stroke-yellow-200" strokeWidth="1.5" /> <path d="M8 10C9 11 11 11.5 12 11C13 10.5 15 11 16 12" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> <path d="M8 14C9 15 11 15.5 12 15C13 14.5 15 15 16 16" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> </svg> ) : ( <svg viewBox="0 0 24 24" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-[bounce_3s_infinite]"> <path d="M12 12C12 12 8 6 4 8C0 10 2 16 6 16C8 16 11 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 16 6 20 8C24 10 22 16 18 16C16 16 13 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 10 18 8 20C6 22 4 20 6 18C8 16 11 14 12 12Z" className="fill-yellow-500 opacity-80" /> <path d="M12 12C12 12 14 18 16 20C18 22 20 20 18 18C16 16 13 14 12 12Z" className="fill-yellow-500 opacity-80" /> </svg> )} </div> );

export const SoulTree = ({ resonance, memories }: { resonance: number, memories: Memory[] }) => {
    const stage = useMemo(() => {
        if (resonance < 100) return 0;
        if (resonance < 300) return 1;
        if (resonance < 600) return 2;
        return 3;
    }, [resonance]);

    const treePaths = [
        "M50 100 Q50 90 50 80 Q45 70 30 65 M50 80 Q55 70 70 65",
        "M50 100 Q50 60 50 40 M50 70 Q30 50 20 40 M50 60 Q70 40 80 30 M50 40 Q40 30 35 20",
        "M50 100 L50 40 M50 80 Q20 60 10 30 M50 70 Q80 50 90 20 M50 50 Q30 30 20 10 M50 50 Q70 30 80 10 M50 40 L50 10",
        "M50 100 L50 30 M50 90 Q10 70 5 20 M50 85 Q90 65 95 20 M50 60 Q20 40 15 10 M50 60 Q80 40 85 10 M50 40 L50 5 M30 30 L20 5 M70 30 L80 5"
    ];

    const glowColor = stage === 3 ? "drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" : "drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]";
    const strokeColor = stage === 3 ? "#FCD34D" : "rgba(255,255,255,0.4)";
    const strokeWidth = stage === 0 ? 2 : stage === 1 ? 3 : stage === 2 ? 4 : 5;

    const memoryFruits = useMemo(() => {
        return memories.slice(0, 15).map((m, i) => {
            const angle = (i * 137.5) * (Math.PI / 180);
            const r = 20 + (i % 3) * 10;
            const x = 50 + r * Math.cos(angle);
            const y = 40 + r * Math.sin(angle);
            return { ...m, x, y };
        });
    }, [memories]);

    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-end justify-center pb-[10%]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 3 }} className="relative w-[300px] h-[400px] md:w-[500px] md:h-[600px]">
                <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible ${glowColor}`} preserveAspectRatio="none">
                    <motion.path d={treePaths[stage]} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut" }} />
                </svg>
                <motion.div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-2/3 rounded-full blur-[40px] mix-blend-screen ${stage >= 2 ? 'bg-green-500/10' : 'bg-transparent'}`} animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity }} />
                {stage >= 1 && memoryFruits.map((m, i) => (
                    <motion.div key={m.id} className="absolute w-2 h-2 rounded-full bg-yellow-200 blur-[1px]" style={{ left: `${m.x}%`, top: `${m.y}%` }} initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ delay: i * 0.2, duration: 3 + Math.random(), repeat: Infinity }} />
                ))}
            </motion.div>
        </div>
    );
};