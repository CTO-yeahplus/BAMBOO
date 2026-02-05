'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Memory, FireflyUser } from '../types'; // FireflyUser import 확인
import { getMoonPhase, getMoonIconPath } from '../utils/moonPhase';

// --- Visual Memory Helper Type ---
type VisualMemory = Memory & { x: number; y: number; unlock_date?: string };

// --- Small SVG Components (Existing) ---
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

export const GoldenCocoon = ({ isLocked }: { isLocked: boolean }) => ( <div className="relative group"> <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" /> {isLocked ? ( <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" fill="none"> <line x1="12" y1="0" x2="12" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" /> <path d="M12 4C9 4 7 8 7 13C7 18 9 22 12 22C15 22 17 18 17 13C17 8 15 4 12 4Z" className="fill-yellow-600/80 stroke-yellow-200" strokeWidth="1.5" /> <path d="M8 10C9 11 11 11.5 12 11C13 10.5 15 11 16 12" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> <path d="M8 14C9 15 11 15.5 12 15C13 14.5 15 15 16 16" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> </svg> ) : ( <svg viewBox="0 0 24 24" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-[bounce_3s_infinite]"> <path d="M12 12C12 12 8 6 4 8C0 10 2 16 6 16C8 16 11 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 16 6 20 8C24 10 22 16 18 16C16 16 13 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 10 18 8 20C6 22 4 20 6 18C8 16 11 14 12 12Z" className="fill-yellow-500 opacity-80" /> <path d="M12 12C12 12 14 18 16 20C18 22 20 20 18 18C16 16 13 14 12 12Z" className="fill-yellow-500 opacity-80" /> </svg> )} </div> );

export const SpringPetal = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-80"> <path d="M12 2C12 2 14 5 16 8C18 11 18 14 16 16C14 18 11 18 8 16C6 14 6 11 8 8C10 5 12 2 12 2Z" /> </svg> );
export const SummerFirefly = ({ color }: { color: string }) => ( <div className="w-full h-full rounded-full bg-yellow-300 blur-[1px] shadow-[0_0_4px_yellow]" /> );
export const AutumnLeaf = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-90"> <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" /> </svg> );

// --- Complex Layers ---
export const ConstellationLayer = ({ memories }: { memories: Memory[] }) => {
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [memories]);
  const getEmotionColor = (emotion?: string) => { switch (emotion) { case 'anger': return '#EF4444'; case 'sadness': return '#60A5FA'; case 'loneliness': return '#9CA3AF'; default: return '#FCD34D'; } };
  if (sortedMemories.length < 2) return null;
  return ( <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"> <defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory; const curr = memory as VisualMemory; if (!prev) return null; const id = `grad-${prev.id}-${curr.id}`; return ( <linearGradient key={id} id={id} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} gradientUnits="userSpaceOnUse"> <stop offset="0%" stopColor={getEmotionColor(prev.emotion)} stopOpacity="0.4" /> <stop offset="100%" stopColor={getEmotionColor(curr.emotion)} stopOpacity="0.4" /> </linearGradient> ); })} </defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory; const curr = memory as VisualMemory; if (!prev) return null; const gradId = `grad-${prev.id}-${curr.id}`; return ( <motion.g key={`connection-${curr.id}`}> <motion.line x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} stroke={`url(#${gradId})`} strokeWidth="1.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: index * 0.3, ease: "easeInOut" }} /> </motion.g> ); })} </svg> );
};

export const OrbitLayer = ({ memories, onSelect }: { memories: Memory[], onSelect: (m: Memory) => void }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const orbitPoints = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1; const angle = 0.5 * i; const radius = 12 + (i * 1.5); const x = 50 + radius * Math.cos(angle); const y = 50 + radius * Math.sin(angle);
      const memory = memories.find(m => { const mDate = new Date(m.created_at); return mDate.getDate() === day && mDate.getMonth() === today.getMonth(); });
      const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
      const moonPhase = getMoonPhase(checkDate); const moonPath = getMoonIconPath(moonPhase);
      return { day, x, y, memory, moonPath };
    });
  }, [memories]);
  const getGlowColor = (emotion?: string) => { switch (emotion) { case 'anger': return 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]'; case 'sadness': return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]'; case 'loneliness': return 'text-gray-300 drop-shadow-[0_0_15px_rgba(209,213,219,0.8)]'; case 'happy': return 'text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]'; default: return 'text-white/20'; } };
  return ( <div className="absolute inset-0 w-full h-full pointer-events-none"> <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none"> <path d={orbitPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1,1" /> </svg> {orbitPoints.map((point, index) => ( <motion.div key={point.day} className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto" style={{ left: `${point.x}%`, top: `${point.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.03, type: "spring" }}> <button onClick={() => point.memory && onSelect(point.memory)} disabled={!point.memory} className={`group relative p-2 transition-transform hover:scale-125 ${!point.memory ? 'cursor-default' : 'cursor-pointer'}`}> <svg viewBox="0 0 24 24" className={`w-4 h-4 md:w-6 md:h-6 ${point.memory ? getGlowColor(point.memory.emotion) : 'text-white/5'}`}><path d={point.moonPath} fill="currentColor" /></svg> <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{point.day}</span> {point.memory && (<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[120px] bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none truncate z-50">{point.memory.summary}</div>)} </button> </motion.div> ))} </div> );
};

// [Added] Soul Tree Component
export const SoulTree = ({ resonance, memories }: { resonance: number, memories: Memory[] }) => {
    // 성장 단계 계산 (0: Sprout, 1: Sapling, 2: Tree, 3: Divine)
    const stage = useMemo(() => {
        if (resonance < 100) return 0;
        if (resonance < 300) return 1;
        if (resonance < 600) return 2;
        return 3;
    }, [resonance]);

    // 단계별 나무 형태 (SVG Paths)
    const treePaths = [
        // Stage 0: Sprout
        "M50 100 Q50 90 50 80 Q45 70 30 65 M50 80 Q55 70 70 65",
        // Stage 1: Sapling
        "M50 100 Q50 60 50 40 M50 70 Q30 50 20 40 M50 60 Q70 40 80 30 M50 40 Q40 30 35 20",
        // Stage 2: Tree
        "M50 100 L50 40 M50 80 Q20 60 10 30 M50 70 Q80 50 90 20 M50 50 Q30 30 20 10 M50 50 Q70 30 80 10 M50 40 L50 10",
        // Stage 3: Divine Tree (Complex)
        "M50 100 L50 30 M50 90 Q10 70 5 20 M50 85 Q90 65 95 20 M50 60 Q20 40 15 10 M50 60 Q80 40 85 10 M50 40 L50 5 M30 30 L20 5 M70 30 L80 5"
    ];

    const glowColor = stage === 3 ? "drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" : "drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]";
    const strokeColor = stage === 3 ? "#FCD34D" : "rgba(255,255,255,0.4)";
    const strokeWidth = stage === 0 ? 2 : stage === 1 ? 3 : stage === 2 ? 4 : 5;

    // Memories as Fruits
    const memoryFruits = useMemo(() => {
        return memories.slice(0, 15).map((m, i) => {
            // Pseudo-random position based on index
            const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
            const r = 20 + (i % 3) * 10;
            const x = 50 + r * Math.cos(angle);
            const y = 40 + r * Math.sin(angle);
            return { ...m, x, y };
        });
    }, [memories]);

    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-end justify-center pb-[10%]">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.6 }} 
                transition={{ duration: 3 }}
                className="relative w-[300px] h-[400px] md:w-[500px] md:h-[600px]"
            >
                {/* Tree Trunk & Branches */}
                <svg viewBox="0 0 100 100" className={`w-full h-full overflow-visible ${glowColor}`} preserveAspectRatio="none">
                    <motion.path 
                        d={treePaths[stage]} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth={strokeWidth} 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                    />
                </svg>

                {/* Leaves / Aura */}
                <motion.div 
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-2/3 rounded-full blur-[40px] mix-blend-screen ${stage >= 2 ? 'bg-green-500/10' : 'bg-transparent'}`} 
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity }}
                />

                {/* Memory Fruits */}
                {stage >= 1 && memoryFruits.map((m, i) => (
                    <motion.div
                        key={m.id}
                        className="absolute w-2 h-2 rounded-full bg-yellow-200 blur-[1px]"
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ delay: i * 0.2, duration: 3 + Math.random(), repeat: Infinity }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export const FireflyLayer = ({ fireflies }: { fireflies: FireflyUser[] }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {fireflies.map((user) => (
                <motion.div
                    key={user.id}
                    className="absolute rounded-full blur-[2px]"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0.4, 0.8, 0.4], 
                        scale: [1, 1.5, 1],
                        x: [0, 10, -10, 0], 
                        y: [0, -10, 10, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                        x: { duration: 10 + Math.random() * 5, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 10 + Math.random() * 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                        left: `${user.x}%`,
                        top: `${user.y}%`,
                        width: '6px',
                        height: '6px',
                        backgroundColor: user.color,
                        boxShadow: `0 0 10px ${user.color}, 0 0 20px ${user.color}`
                    }}
                />
            ))}
        </div>
    );
};

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

// [New] Floating Bottle Component
export const FloatingBottle = ({ onClick }: { onClick: () => void }) => {
    return (
        <motion.div
            className="absolute z-20 cursor-pointer group"
            initial={{ x: -100, y: '80%', opacity: 0, rotate: 15 }}
            animate={{ 
                x: ['-10vw', '110vw'], // 화면 왼쪽에서 오른쪽으로 흐름
                y: ['80%', '75%', '85%', '80%'], // 위아래로 출렁임
                opacity: [0, 1, 1, 0],
                rotate: [15, -15, 15]
            }}
            transition={{ 
                x: { duration: 40, repeat: Infinity, ease: "linear" }, // 천천히 흐름
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 40, times: [0, 0.1, 0.9, 1], repeat: Infinity },
                rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            <div className="relative group-hover:scale-125 transition-transform duration-500">
                <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full animate-pulse" />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_10px_rgba(100,200,255,0.8)]">
                    <path d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" className="fill-stone-300" />
                    <path d="M6 10C6 7.79086 7.79086 6 10 6H14C16.2091 6 18 7.79086 18 10V16C18 19.3137 15.3137 22 12 22C8.68629 22 6 19.3137 6 16V10Z" className="fill-white/20 stroke-blue-200" strokeWidth="1" />
                    <path d="M8 12L16 12" stroke="white" strokeOpacity="0.5" strokeDasharray="2 2" />
                    <rect x="9" y="10" width="6" height="8" rx="1" className="fill-yellow-100/80" />
                </svg>
            </div>
        </motion.div>
    );
};

// [New] Burning Paper Visual Effect
export const BurningPaperEffect = ({ isBurning, onComplete }: { isBurning: boolean, onComplete: () => void }) => {
    if (!isBurning) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* 1. Fire Overlay (Orange Glow climbing up) */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent mix-blend-color-dodge"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '-100%', opacity: 1 }}
                transition={{ duration: 3, ease: "easeIn" }}
            />

            {/* 2. Charring Effect (Black climbing up) */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent"
                initial={{ y: '110%' }}
                animate={{ y: '-110%' }}
                transition={{ duration: 3.2, ease: "easeIn" }}
                onAnimationComplete={onComplete}
            />

            {/* 3. Flying Embers (Particles) */}
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bottom-0 w-1 h-1 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_5px_orange]"
                    style={{ left: `${Math.random() * 100}%` }}
                    initial={{ y: 0, opacity: 1, scale: 0 }}
                    animate={{ 
                        y: -window.innerHeight, 
                        x: (Math.random() - 0.5) * 200,
                        opacity: [1, 1, 0],
                        scale: [0, Math.random() * 2 + 1, 0]
                    }}
                    transition={{ 
                        duration: 2 + Math.random(), 
                        delay: Math.random() * 1.5,
                        ease: "easeOut" 
                    }}
                />
            ))}
        </div>
    );
};