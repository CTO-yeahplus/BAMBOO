'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Sparkles } from 'lucide-react';

export const ForestGuide = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome, Traveler",
            content: "대나무 숲에 오신 것을 환영합니다.\n이곳은 지친 당신의 영혼을 위한 작은 쉼터입니다.",
            position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", // 정중앙
            arrow: null
        },
        {
            title: "Awaken the Spirit",
            content: "화면 중앙을 눌러 정령을 깨워보세요.\n당신의 목소리를 듣고 따뜻한 위로를 건넬 것입니다.",
            position: "top-[40%] left-1/2 -translate-x-1/2", // 중앙보다 조금 위
            arrow: "down"
        },
        {
            title: "The Magic Satchel",
            content: "우측 하단의 가방을 열어보세요.\n당신의 감정 기록, 유리병 편지, 갤러리가 담겨 있습니다.",
            position: "bottom-24 right-6", // 우측 하단 (가방 위)
            arrow: "down-right"
        },
        {
            title: "Echo of Souls",
            content: "새로 추가된 'Whisper' 기능을 통해\n익명의 누군가와 서로의 아픔을 위로할 수 있습니다.",
            position: "bottom-24 right-6", // 우측 하단 (동일 위치)
            arrow: "down-right"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* 1. 배경 (딤 처리) - 첫 단계에서만 진하게, 이후엔 약하게 */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 0 ? 0.8 : 0.4 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black transition-opacity duration-500"
            />

            {/* 2. 가이드 카드 */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute pointer-events-auto ${steps[step].position} w-80`}
                >
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                        
                        {/* 장식용 아이콘 */}
                        <div className="absolute -top-3 -left-3 bg-green-500/20 text-green-200 p-2 rounded-full border border-green-500/30">
                            <Sparkles size={16} />
                        </div>

                        <h3 className="text-white font-serif text-lg mb-2 flex justify-between items-center">
                            {steps[step].title}
                            <button onClick={onComplete} className="text-white/30 hover:text-white"><X size={14} /></button>
                        </h3>
                        
                        <p className="text-white/70 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                            {steps[step].content}
                        </p>

                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {steps.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`} />
                                ))}
                            </div>
                            <button 
                                onClick={handleNext}
                                className="flex items-center gap-1 text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
                            >
                                {step === steps.length - 1 ? 'Start Journey' : 'Next'} <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* 말풍선 꼬리 (Optional) */}
                        {steps[step].arrow === 'down' && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1a]/90 border-r border-b border-white/20 rotate-45" />
                        )}
                        {steps[step].arrow === 'down-right' && (
                            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#1a1a1a]/90 border-r border-b border-white/20 rotate-45" />
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};