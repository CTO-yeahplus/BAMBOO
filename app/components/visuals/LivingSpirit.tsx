// app/components/visuals/LivingSpirit.tsx
'use client';
import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { SpiritFormType } from '../../types';
import { SpiritFoxSilhouette, SpiritGuardianSilhouette } from './SpiritForms';

type PersonaStyle = {
    core: string;
    glow: string;
    aura: string;
    blend: string;
};

const PERSONA_STYLES: Record<string, PersonaStyle> = {
    spirit: { core: '#ffd86f', glow: '#ffa740', aura: 'rgba(251, 191, 36, 0.2)', blend: 'mix-blend-screen' },
    shadow: { core: '#7f1d1d', glow: '#ef4444', aura: 'rgba(0,0,0,0.8)', blend: 'mix-blend-hard-light' }, 
    light: { core: '#fbcfe8', glow: '#f472b6', aura: 'rgba(244, 114, 182, 0.3)', blend: 'mix-blend-screen' } 
};

// [Helper] Particles System (LivingSpirit 전용)
const SpiritParticles = ({ color, volume }: { color: string, volume: MotionValue }) => {
    return (
        <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full blur-[1px]"
                    style={{ 
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`,
                        marginLeft: Math.cos(i) * 100,
                        marginTop: Math.sin(i) * 100,
                    }}
                    animate={{ scale: [0.5, 1.5, 0.5], opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 3 + Math.random(), repeat: Infinity, delay: i * 0.5 }}
                />
            ))}
        </div>
    );
};

export const LivingSpirit = ({ 
    emotion = 'neutral', 
    volume, 
    isTalking,
    persona = 'spirit',
    form
}: { 
    emotion?: string, 
    volume: MotionValue,
    isTalking: boolean,
    persona?: string,
    form: SpiritFormType
}) => {
    const style = PERSONA_STYLES[persona] || PERSONA_STYLES['spirit'];
    const isShadow = persona === 'shadow';

    return (
        <motion.div 
            className="relative flex items-center justify-center pointer-events-none"
            style={{ width: 400, height: 400 }}
        >
            {/* Aura */}
            <motion.div 
                className={`absolute inset-0 rounded-full blur-[60px] ${style.blend} `}
                style={{ backgroundColor: style.aura }}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: isShadow ? [0.6, 0.8, 0.6] : [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
            />

            {/* Core Blob */}
            <motion.div style={{ scale: useTransform(volume, [0, 1], [1, 1.5]) }} className="relative w-64 h-64">
                <motion.div 
                    className={`absolute inset-0 rounded-full blur-[20px] ${style.blend} opacity-80`}
                    style={{ 
                        background: isShadow 
                            ? `radial-gradient(circle, ${style.glow}, #000000)` 
                            : `conic-gradient(from 0deg, ${style.core}, transparent, ${style.glow}, transparent)` 
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                    className="absolute inset-8 rounded-full blur-[15px] mix-blend-overlay"
                    style={{ backgroundColor: style.core }}
                />
                </motion.div>

            {/* Form Projection */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-soft-light">
                {form === 'fox' && <SpiritFoxSilhouette color={style.core} />}
                {form === 'guardian' && <SpiritGuardianSilhouette color={style.core} />}
            </div>

            {/* Particles */}
            <SpiritParticles color={style.core} volume={volume} />
        </motion.div>
    );
};