'use client';
import { motion } from 'framer-motion';
import { Zap, Lock } from 'lucide-react';

interface SpiritEnergyProps {
    progress: number; // 0 ~ 100
    isPremium: boolean;
    onUpgradeClick: () => void;
}

export const SpiritEnergy = ({ progress, isPremium, onUpgradeClick }: SpiritEnergyProps) => {
    // 에너지가 20% 미만이면 붉은색 경고
    const isLow = progress < 20;
    const color = isLow ? 'text-red-400' : (isPremium ? 'text-purple-400' : 'text-amber-400');
    const ringColor = isLow ? 'stroke-red-500' : (isPremium ? 'stroke-purple-500' : 'stroke-amber-500');

    return (
        <div className="relative w-12 h-12 flex items-center justify-center group cursor-pointer" onClick={onUpgradeClick}>
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                {/* Progress Circle */}
                <motion.circle 
                    cx="24" cy="24" r="20" 
                    stroke="currentColor" strokeWidth="3" fill="transparent" 
                    className={`${ringColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
                    strokeDasharray="125.6"
                    initial={{ strokeDashoffset: 125.6 }}
                    animate={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }}
                    transition={{ duration: 1 }}
                />
            </svg>

            {/* Icon */}
            <div className={`relative z-10 ${color}`}>
                {progress <= 0 ? (
                    <Lock size={16} className="animate-pulse" />
                ) : (
                    <Zap size={16} fill="currentColor" className={isLow ? 'animate-pulse' : ''} />
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Spirit Energy: {Math.floor(progress)}%
            </div>
        </div>
    );
};