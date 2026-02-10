'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // 시퀀스 타이밍 조절
        const timer1 = setTimeout(() => setStep(1), 1000); // 1초 뒤 텍스트 등장
        const timer2 = setTimeout(() => setStep(2), 3500); // 3.5초 뒤 텍스트 퇴장
        const timer3 = setTimeout(() => onComplete(), 4500); // 4.5초 뒤 인트로 종료

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <motion.div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black pointer-events-none"
            initial={{ opacity: 1 }}
            animate={step === 2 ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 5.5, ease: "easeInOut" }}
        >
            <AnimatePresence>
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif text-white/90 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            BAMBOO FOREST
                        </h1>
                        <p className="mt-4 text-sm md:text-base text-white/40 font-light tracking-[0.3em] uppercase">
                            이 숲에서의 대화는 오직 당신과 저와의 비밀입니다
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};