'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FireRitualModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBurn: () => void;
}

export const FireRitualModal = ({ isOpen, onClose, onBurn }: FireRitualModalProps) => {
    const [text, setText] = useState("");
    const [isBurning, setIsBurning] = useState(false);

    if (!isOpen) return null;

    const handleBurn = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!text.trim()) return;
        
        setIsBurning(true);
        onBurn(); 

        setTimeout(() => {
            setIsBurning(false);
            setText("");
            onClose();
        }, 100);
    };

    return (
        // 👇 [UX] 팩트 대신 감성을 전달하는 타이틀로 변경
        <ModalOverlay onClose={onClose} title="Letting Go" subtitle="Ritual of Purification">
            <div className="px-6 pb-8 relative flex flex-col items-center">
                
                <div className="text-center mb-6">
                    <p className="text-white/50 text-xs md:text-sm font-light leading-relaxed tracking-wide">
                        마음을 무겁게 하는 것들이 있나요?<br/>
                        여기에 적고, 불꽃과 함께 저 멀리 보내주세요.
                    </p>
                </div>

                <div className="relative w-full mb-8 group">
                    <AnimatePresence>
                        {!isBurning ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }}
                                className="relative"
                            >
                                {/* 👇 [Design] 양피지 질감의 입력창 */}
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="어떤 생각이 당신을 붙잡고 있나요..."
                                    className="w-full h-48 bg-[#151518] border border-white/5 rounded-xl p-5 text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-orange-500/30 focus:bg-[#1a1a1e] transition-all font-serif leading-loose shadow-inner text-sm md:text-base"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] text-white/20">
                                    {text.length} characters
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="burning-effect"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="w-full h-48 flex flex-col items-center justify-center bg-orange-900/10 rounded-xl border border-orange-500/20"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500 blur-[40px] animate-pulse opacity-40" />
                                    <Flame size={48} className="text-orange-400 animate-bounce relative z-10" />
                                </div>
                                <p className="mt-6 text-orange-200/60 text-[10px] tracking-[0.3em] uppercase animate-pulse font-light">
                                    Dissolving...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={handleBurn}
                    disabled={!text.trim() || isBurning}
                    className={`
                        w-full py-4 rounded-2xl font-medium text-sm tracking-widest uppercase transition-all duration-500
                        flex items-center justify-center gap-3 relative overflow-hidden group
                        ${isBurning 
                            ? 'bg-transparent text-white/20 cursor-default' 
                            : text.trim() 
                                ? 'bg-white text-black hover:bg-orange-100 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,100,0,0.3)]' 
                                : 'bg-white/5 text-white/20 cursor-not-allowed'}
                    `}
                >
                    {text.trim() && !isBurning && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                    
                    {!isBurning && <Sparkles size={14} className={text.trim() ? "text-orange-500" : "opacity-0"} />}
                    {isBurning ? "Scattering to ash..." : "Release to Fire"}
                </button>

            </div>
        </ModalOverlay>
    );
};