'use client';
import React, { useState, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface CelestialBodyProps {
    isDaytime: boolean;
    moonPath: string;
    mouseX?: MotionValue<number>;
    mouseY?: MotionValue<number>;
}

export const CelestialBody = ({ isDaytime, moonPath, mouseX, mouseY }: CelestialBodyProps) => {
    // 1. Fallback Motion Values
    const fallbackX = new MotionValue(0);
    const fallbackY = new MotionValue(0);
    const xM = mouseX || fallbackX;
    const yM = mouseY || fallbackY;

    // 2. Parallax Intensity
    const xBack = useTransform(xM, [-1, 1], [-15, 15]);
    const xMid = useTransform(xM, [-1, 1], [-40, 40]);
    const yMid = useTransform(yM, [-1, 1], [-40, 40]);
    const xFore = useTransform(xM, [-1, 1], [-80, 80]);
    const yFore = useTransform(yM, [-1, 1], [-80, 80]);

    // 3. [Fix] 랜덤 파티클 데이터를 State로 관리하여 하이드레이션 에러 방지
    const [dayDust, setDayDust] = useState<any[]>([]);
    const [nightStars, setNightStars] = useState<any[]>([]);

    useEffect(() => {
        // 클라이언트 마운트 후 랜덤 데이터 생성
        setDayDust(Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            top: `${Math.random() * 60}%`,
            left: `${Math.random() * 80 + 10}%`,
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 2
        })));

        setNightStars(Array.from({ length: 10 }).map((_, i) => ({
            id: i,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 90 + 5}%`,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 3
        })));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-[1]">
            
            {/* 🌌 Layer 1: Atmosphere (Background) - [수정됨] */}
            <motion.div 
                className="absolute inset-0 z-0 flex items-center justify-center" // 중앙 정렬
                style={{ x: xBack }}
            >
                {/* 1-A. Base Gradient (Deep Colors) - 화면보다 충분히 크게 설정 */}
                <div className={`absolute -inset-[20%] transition-colors duration-[2000ms] ${isDaytime ? 'bg-gradient-to-b from-sky-300/30 via-orange-100/20 to-transparent' : 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b]/80 to-transparent'}`} />

                {/* 1-B. Dynamic Aurora / Clouds (Pattern) */}
                {isDaytime ? (
                    // Day Clouds: 너비를 200%로 늘리고 왼쪽으로 충분히 당김
                    <motion.div 
                        className="absolute -top-[50%] -left-[50%] w-[200%] h-[150%] bg-[radial-gradient(circle,rgba(255,237,213,0.5)_0%,transparent_60%)] blur-[120px]"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                ) : (
                    // Night Aurora: 너비를 200%로 늘리고 중앙 정렬 보장
                    <>
                        <motion.div 
                            className="absolute -top-[20%] left-[-50%] w-[200%] h-[100%] bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30 blur-[150px]"
                            animate={{ opacity: [0.4, 0.6, 0.4], scaleX: [1, 1.1, 1] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Noise Texture도 충분히 크게 */}
                        <div className="absolute -inset-[50%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                    </>
                )}
            </motion.div>


            {/* 🌕 Layer 2: The Celestial Body (Main) */}
            <motion.div 
                className="absolute top-0 left-0 right-0 flex justify-center z-10"
                style={{ x: xMid, y: yMid }}
            >
                <div className="relative mt-20"> 
                    {isDaytime ? (
                        // ☀️ THE SUN
                        <div className="relative w-96 h-96 flex items-center justify-center">
                            
                            {/* 1. Outer Radiant Rays */}
                            <motion.div 
                                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,165,0,0.3)_30deg,transparent_60deg,rgba(255,165,0,0.3)_90deg,transparent_120deg,rgba(255,165,0,0.3)_150deg,transparent_180deg,rgba(255,165,0,0.3)_210deg,transparent_240deg,rgba(255,165,0,0.3)_270deg,transparent_300deg,rgba(255,165,0,0.3)_330deg,transparent_360deg)] blur-[30px]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            />

                            {/* 2. SVG Orbits */}
                            <motion.svg 
                                className="absolute w-80 h-80 opacity-60"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            >
                                <circle cx="160" cy="160" r="158" fill="none" stroke="#fdba74" strokeWidth="2" strokeDasharray="20 20" strokeOpacity="0.6" />
                            </motion.svg>
                            
                            <motion.div 
                                className="absolute w-80 h-64 rounded-[50%] border-[1px] border-amber-200/50"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                            />

                            {/* 3. Burning Corona */}
                            <motion.div 
                                className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-orange-500/0 via-amber-400/30 to-orange-500/0 blur-[20px]"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            {/* 4. The Core */}
                            <div className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-white via-amber-200 to-orange-500 shadow-[0_0_80px_rgba(255,140,0,0.8)]">
                                <motion.div 
                                    className="absolute inset-0 rounded-full bg-white/50 blur-[0px]"
                                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </div>
                    ) : (
                        // 🌙 THE MOON
                        <div className="relative w-72 h-72 flex items-center justify-center">
                            
                            {/* 1. Moon Halo */}
                            <motion.div 
                                className="absolute w-64 h-64 rounded-full bg-blue-100/10 blur-[40px]"
                                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 8, repeat: Infinity }}
                            />

                            {/* 2. Moon Body */}
                            <motion.div 
                                className="relative w-40 h-40 drop-shadow-[0_0_40px_rgba(186,230,253,0.3)]"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                {/* Base Circle */}
                                <div className="absolute inset-0 rounded-full bg-[#cbd5e1] opacity-20 blur-[16px]" />

                                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-200 opacity-50 blur-[16px]">
                                    <g className="filter blur-[0.3px]">
                                        <path d={moonPath} fill="currentColor" />
                                        <path d={moonPath} fill="#94a3b8" opacity="0.3" />
                                    </g>
                                </svg>
                                
                            </motion.div>
                        </div>
                    )}
                </div>
            </motion.div>


            {/* ✨ Layer 3: Foreground Effects (Particles) */}
            <motion.div 
                className="absolute inset-0 z-20 pointer-events-none"
                style={{ x: xFore, y: yFore }}
            >
                {isDaytime ? (
                    <>
                        <div className="absolute -top-[20%] left-[10%] w-[40%] h-[150%] bg-gradient-to-b from-amber-100/10 via-orange-100/5 to-transparent blur-[30px] -rotate-[20deg] mix-blend-screen" />
                        
                        {/* [Fix] State 기반 렌더링 */}
                        {dayDust.map((dust) => (
                            <motion.div
                                key={dust.id}
                                className="absolute bg-amber-200 rounded-full blur-[1px] shadow-[0_0_5px_rgba(255,200,100,0.8)]"
                                style={{
                                    width: dust.width,
                                    height: dust.height,
                                    top: dust.top,
                                    left: dust.left
                                }}
                                animate={{ y: [0, -30], opacity: [0, 0.8, 0] }}
                                transition={{ duration: dust.duration, repeat: Infinity, delay: dust.delay }}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        <div className="absolute top-[10%] inset-x-0 h-[50%] bg-gradient-to-b from-blue-400/5 to-transparent blur-[60px] mix-blend-screen" />
                        
                        {/* [Fix] State 기반 렌더링 */}
                        {nightStars.map((star) => (
                            <motion.div
                                key={star.id}
                                className="absolute bg-white rounded-full shadow-[0_0_4px_white]"
                                style={{
                                    width: star.width,
                                    height: star.height,
                                    top: star.top,
                                    left: star.left
                                }}
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                            />
                        ))}
                    </>
                )}
            </motion.div>

        </div>
    );
};