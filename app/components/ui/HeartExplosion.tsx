'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useUISound } from '../../hooks/useUISound';

export const HeartExplosion = ({ onClick, active = false }: any) => {
    const { playTick, playChime } = useUISound();
    const [isExploding, setIsExploding] = useState(false);

    const handleClick = (e: any) => {
        setIsExploding(true);
        if (!active) playChime(); // ❤️ 켜질 때 영롱한 소리
        else playTick();
        
        onClick && onClick(e);
        setTimeout(() => setIsExploding(false), 1000);
    };

    return (
        <div className="relative flex items-center justify-center">
            <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleClick}
                className="relative z-10 p-3 rounded-full hover:bg-white/5 transition-colors"
            >
                <Heart 
                    size={24} 
                    className={active ? "fill-red-500 text-red-500" : "text-white/50"} 
                />
            </motion.button>

            {/* 🎉 파티클 폭발 효과 */}
            <AnimatePresence>
                {isExploding && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{ 
                                    opacity: 0, 
                                    scale: 1, 
                                    x: Math.cos(i * 45 * (Math.PI / 180)) * 30, 
                                    y: Math.sin(i * 45 * (Math.PI / 180)) * 30 
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};