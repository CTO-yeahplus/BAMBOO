// app/components/visuals/ForestBackground.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThemeId } from '../../types';

export const ThemeParticles = ({ type }: { type: string }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const particles = Array.from({ length: 30 });

    if (type === 'firefly') {
        return <>{particles.map((_, i) => ( <motion.div key={i} className="absolute w-1 h-1 bg-yellow-300 rounded-full blur-[1px]" initial={{ opacity: 0, scale: 0 }} animate={{ x: [Math.random() * 100, Math.random() * 100 - 50], y: [Math.random() * 100, Math.random() * 100 - 50], opacity: [0, 0.8, 0], scale: [0, 1, 0] }} transition={{ duration: 3 + Math.random() * 4, repeat: Infinity }} style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} /> ))}</>;
    }
    if (type === 'snow') {
        return <>{particles.map((_, i) => ( <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]" initial={{ y: -10, opacity: 0 }} animate={{ y: ['0vh', '100vh'], x: ['0px', `${(Math.random() - 0.5) * 50}px`], opacity: [0, 0.8, 0.8, 0] }} transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }} style={{ left: `${Math.random() * 100}%` }} /> ))}</>;
    }
    if (type === 'petal') {
        return <>{particles.map((_, i) => ( <motion.div key={i} className="absolute w-2 h-2 bg-pink-300/60 rounded-full" initial={{ y: -10, rotate: 0 }} animate={{ y: ['0vh', '100vh'], x: ['0px', `${(Math.random() - 0.5) * 200}px`], rotate: [0, 360], opacity: [0, 1, 0] }} transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }} style={{ left: `${Math.random() * 100}%`, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} /> ))}</>;
    }
    if (type === 'digital_rain') {
        return <>{particles.map((_, i) => ( <motion.div key={i} className="absolute w-[1px] bg-green-500/50" style={{ height: Math.random() * 20 + 10, left: `${Math.random() * 100}%` }} animate={{ y: ['-100vh', '100vh'], opacity: [0, 1, 0] }} transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 2, ease: "linear" }} /> ))}</>;
    }
    return null;
};

export const ForestBackground = ({ themeId, themeConfig, children }: { themeId: ThemeId, themeConfig: any, children: React.ReactNode }) => {
    return (
        <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 transition-colors duration-1000" style={{ background: themeConfig.bgGradient }} />
            <ThemeParticles type={themeConfig.particleType} />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};