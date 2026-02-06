'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 반딧불이 생성 헬퍼
const Firefly = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
            opacity: [0, 1, 0], 
            scale: [0.5, 1.2, 0.5],
            x: [0, Math.random() * 100 - 50, 0], 
            y: [0, -Math.random() * 100, 0] 
        }}
        transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity, 
            delay: delay,
            ease: "easeInOut" 
        }}
        className="absolute w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"
        style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${40 + Math.random() * 60}%` 
        }}
    />
);

export const ForestEvolution = ({ level }: { level: number }) => {
    const [fireflies, setFireflies] = useState<number[]>([]);

    useEffect(() => {
        // 레벨 5 이상일 때 반딧불이 20마리 생성
        if (level >= 5) {
            setFireflies(Array.from({ length: 20 }, (_, i) => i));
        }
    }, [level]);

    return (
        <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
            {/* Lv 5+: Fireflies (반딧불이) */}
            {level >= 5 && fireflies.map((i) => (
                <Firefly key={i} delay={i * 0.5} />
            ))}

            {/* Lv 10+: Sacred Flowers (바닥에 피어나는 빛나는 꽃) */}
            {level >= 10 && (
                <div className="absolute bottom-0 left-0 right-0 h-1/3">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
                        className="absolute bottom-[10%] left-[10%] w-2 h-2 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_15px_blue]" 
                    />
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }}
                        className="absolute bottom-[15%] right-[20%] w-3 h-3 bg-purple-400 rounded-full blur-[2px] shadow-[0_0_15px_purple]" 
                    />
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
                        className="absolute bottom-[5%] left-[40%] w-2 h-2 bg-white rounded-full blur-[2px] shadow-[0_0_15px_white]" 
                    />
                    {/* 실루엣 사슴 (SVG or Image) */}
                    <motion.img 
                        src="/images/deer-silhouette.png" // (public 폴더에 이미지가 있다고 가정, 없으면 투명하게 처리됨)
                        alt="Spirit Deer"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 0.3, x: 0 }}
                        transition={{ duration: 5 }}
                        className="absolute bottom-[10%] right-[5%] w-24 h-24 opacity-20 mix-blend-overlay"
                    />
                </div>
            )}
            
            {/* Lv 15+: Ethereal Fog (신비로운 안개) */}
            {level >= 15 && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent mix-blend-screen animate-pulse" />
            )}
        </div>
    );
};