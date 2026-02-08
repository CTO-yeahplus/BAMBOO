// app/components/visuals/InteractiveItems.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FireflyUser } from '../../types';

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

export const FloatingBottle = ({ onClick }: { onClick: () => void }) => {
    return (
        <motion.div
            className="absolute z-20 cursor-pointer group pointer-events-auto"
            initial={{ x: -100, y: '80%', opacity: 0, rotate: 15 }}
            animate={{ 
                x: ['-10vw', '110vw'], 
                y: ['80%', '75%', '85%', '80%'], 
                opacity: [0, 1, 1, 0],
                rotate: [15, -15, 15]
            }}
            transition={{ 
                x: { duration: 40, repeat: Infinity, ease: "linear" }, 
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

export const BurningPaperEffect = ({ isBurning, onComplete }: { isBurning: boolean, onComplete: () => void }) => {
    if (!isBurning) return null;
    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent mix-blend-color-dodge" initial={{ y: '100%', opacity: 0 }} animate={{ y: '-100%', opacity: 1 }} transition={{ duration: 3, ease: "easeIn" }} />
            <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent" initial={{ y: '110%' }} animate={{ y: '-110%' }} transition={{ duration: 3.2, ease: "easeIn" }} onAnimationComplete={onComplete} />
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div key={i} className="absolute bottom-0 w-1 h-1 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_5px_orange]" style={{ left: `${Math.random() * 100}%` }} initial={{ y: 0, opacity: 1, scale: 0 }} animate={{ y: -window.innerHeight, x: (Math.random() - 0.5) * 200, opacity: [1, 1, 0], scale: [0, Math.random() * 2 + 1, 0] }} transition={{ duration: 2 + Math.random(), delay: Math.random() * 1.5, ease: "easeOut" }} />
            ))}
        </div>
    );
};

// [New] Memory Lantern (기억의 등불)
export const MemoryLantern = ({ onClick, delay = 0 }: { onClick: () => void, delay?: number }) => {
    return (
        <motion.div
            className="absolute z-20 cursor-pointer group pointer-events-auto"
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
                y: ['60vh', '55vh', '65vh'], // 둥실둥실
                x: [0, 20, -20, 0],
                opacity: 1 
            }}
            transition={{ 
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
                x: { duration: 8, repeat: Infinity, ease: "easeInOut", delay },
                opacity: { duration: 2 }
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {/* 빛 번짐 효과 */}
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
            
            {/* 등불 아이콘 */}
            <div className="relative text-4xl filter drop-shadow-[0_0_15px_rgba(255,165,0,0.6)] group-hover:scale-110 transition-transform">
                🏮
            </div>
            
            {/* 텍스트 힌트 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] text-orange-200/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-2 font-serif">
                Touch to Remember
            </div>
        </motion.div>
    );
};