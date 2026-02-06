'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, CloudFog, Wind, Heart, Sparkles, Ear } from 'lucide-react';

interface GenesisRitualProps {
    onComplete: (weather: string, persona: string) => void;
}

export const GenesisRitual = ({ onComplete }: GenesisRitualProps) => {
    const [step, setStep] = useState(0);
    const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

    const questions = [
        {
            id: 0,
            question: "지금 당신의 마음 날씨는 어떤가요?",
            options: [
                { id: 'rain', label: '슬픈 비', icon: <CloudRain size={24} />, desc: "울고 싶을 때" },
                { id: 'ember', label: '타는 노을', icon: <Sparkles size={24} />, desc: "지치고 힘들 때" },
                { id: 'snow', label: '차가운 바람', icon: <Wind size={24} />, desc: "외롭고 쓸쓸할 때" },
            ]
        },
        {
            id: 1,
            question: "숲의 정령에게 무엇을 바라시나요?",
            options: [
                { id: 'warm', label: '따뜻한 위로', icon: <Heart size={24} />, desc: "다정한 친구처럼" },
                { id: 'wise', label: '지혜로운 조언', icon: <CloudFog size={24} />, desc: "현명한 스승처럼" },
                { id: 'listen', label: '조용한 경청', icon: <Ear size={24} />, desc: "묵묵한 나무처럼" },
            ]
        }
    ];

    const handleSelect = (optionId: string) => {
        if (step === 0) {
            setSelectedWeather(optionId);
            setTimeout(() => setStep(1), 500); // 자연스러운 전환
        } else {
            // 종료: 선택된 날씨와 페르소나 전달
            onComplete(selectedWeather!, optionId);
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 1.5 } }}
        >
            <div className="max-w-md w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center text-center"
                    >
                        <p className="text-xs text-white/40 uppercase tracking-[0.3em] mb-8">Genesis Ritual</p>
                        <h2 className="text-2xl font-serif text-white/90 mb-12 leading-relaxed whitespace-pre-wrap">
                            {questions[step].question}
                        </h2>

                        <div className="grid grid-cols-1 gap-4 w-full">
                            {questions[step].options.map((opt, i) => (
                                <motion.button
                                    key={opt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    onClick={() => handleSelect(opt.id)}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 text-left group transition-all"
                                >
                                    <div className="p-3 bg-white/5 rounded-full text-white/70 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                        {opt.icon}
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-white/90">{opt.label}</p>
                                        <p className="text-xs text-white/40 mt-1">{opt.desc}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};