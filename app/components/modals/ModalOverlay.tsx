'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUISound } from '../../hooks/useUISound';

interface ModalOverlayProps {
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const ModalOverlay = ({ onClose, children, title, subtitle }: ModalOverlayProps) => {
    const sound = useUISound();
    const playSwoosh = sound?.playSwoosh || (() => {});
    const playTick = sound?.playTick || (() => {});

    useEffect(() => {
        try { playSwoosh(); } catch (e) {}
    }, [playSwoosh]);

    // 🕵️‍♂️ 디버깅용: 배경 클릭 로그
    const handleBackgroundClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🟢 [ModalOverlay] Background Clicked -> Closing");
        try { playTick(); } catch (err) {}
        onClose();
    };

    // 🕵️‍♂️ 디버깅용: 닫기 버튼 클릭 로그
    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🔴 [ModalOverlay] Close Button Clicked! -> Closing");
        try { playTick(); } catch (err) {}
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleButtonClick}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    // 모달 내부 클릭 시 로그 출력 (전파 방지 확인용)
                    onClick={(e) => {
                        console.log("⚪ [ModalOverlay] Inner Content Clicked (Propagtion Stopped)");
                        e.stopPropagation();
                    }}
                    className="relative w-full max-w-[340px] md:max-w-md bg-gradient-to-b from-[#1c1c22] to-[#0f0f12] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ring-1 ring-white/5"                >
                        {/* Header Area */}
                    <div 
                        className="flex flex-col items-center justify-center pt-8 pb-4 px-6 relative z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Title: 명조체(Serif)로 우아하게 */}
                        {title && (
                            <h2 className="text-2xl font-serif font-medium text-white/90 tracking-wide drop-shadow-md">
                                {title}
                            </h2>
                        )}
                        {/* Subtitle: 고딕체로 작고 소중하게 */}
                        {subtitle && (
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1 font-sans">
                                {subtitle}
                            </p>
                        )}

                        {/* Close Button: 우측 상단에 은은하게 배치 */}
                        <button 
                            onClick={handleButtonClick}
                            className="absolute top-5 right-5 p-2 text-white/30 hover:text-white/80 hover:bg-white/5 rounded-full transition-all duration-300 cursor-pointer"
                            aria-label="Close"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="relative z-10 p-0 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        {children}
                    </div>

                    {/* Lighting Effect: 상단에 은은한 조명 효과 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-[50px] pointer-events-none rounded-full" />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};