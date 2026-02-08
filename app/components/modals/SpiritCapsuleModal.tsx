'use client';
import React, { useState, useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Play, Pause, Trash2, Sparkles, Volume2, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 오디오 파동 애니메이션 컴포넌트
const AudioWave = () => (
    <div className="flex items-center gap-1 h-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
                key={i}
                className="w-1 bg-purple-300 rounded-full"
                animate={{ height: ['20%', '100%', '20%'] }}
                transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1
                }}
            />
        ))}
    </div>
);

export const SpiritCapsuleModal = ({ isOpen, onClose, capsules, onDelete }: any) => {
    const [playingId, setPlayingId] = useState<string | null>(null);

    // 모달 닫힐 때 오디오 정리
    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
            setPlayingId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePlay = (capsule: any) => {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(capsule.text);
        utterance.lang = 'ko-KR'; 
        utterance.rate = 0.85; // 조금 더 천천히, 신비롭게
        utterance.pitch = 1.05; // 살짝 높게 (정령 느낌)
        
        utterance.onend = () => setPlayingId(null);
        
        setPlayingId(capsule.id);
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setPlayingId(null);
    };

    return (
        <ModalOverlay onClose={() => { handleStop(); onClose(); }} title="Spirit Whispers" subtitle="Echoes of the forest">
            <div className="flex flex-col h-full px-2 pb-4">
                
                {/* Header Info */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Wind size={12} /> {capsules.length} Whispers stored
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                    <AnimatePresence mode='popLayout'>
                        {capsules.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                    <Volume2 size={24} className="text-white/20" />
                                </div>
                                <p className="text-white/40 text-xs font-light tracking-wider">
                                    The forest is silent...<br/>
                                    Talk to the spirit to hear echoes.
                                </p>
                            </motion.div>
                        ) : (
                            capsules.map((cap: any) => {
                                const isPlaying = playingId === cap.id;
                                
                                return (
                                    <motion.div
                                        key={cap.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className={`relative group rounded-2xl border p-4 transition-all duration-300 ${
                                            isPlaying 
                                            ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {/* Background Gradient for Active State */}
                                        {isPlaying && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl animate-pulse" />
                                        )}

                                        <div className="relative z-10 flex flex-col gap-3">
                                            {/* Top Row: Date & Delete */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold tracking-widest uppercase ${isPlaying ? 'text-indigo-300' : 'text-white/30'}`}>
                                                        {new Date(cap.created_at).toLocaleDateString()}
                                                    </span>
                                                    {isPlaying && <AudioWave />}
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDelete(cap.id); }} 
                                                    className="p-1.5 rounded-full text-white/20 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Content Text */}
                                            <p className={`text-sm font-serif leading-relaxed italic ${isPlaying ? 'text-white' : 'text-white/70 line-clamp-2'}`}>
                                                "{cap.text}"
                                            </p>

                                            {/* Play Button Area */}
                                            <button 
                                                onClick={() => isPlaying ? handleStop() : handlePlay(cap)}
                                                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wider ${
                                                    isPlaying 
                                                    ? 'bg-indigo-500 text-white shadow-lg' 
                                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {isPlaying ? (
                                                    <><Pause size={12} fill="currentColor" /> Listening...</>
                                                ) : (
                                                    <><Play size={12} fill="currentColor" /> Recall Voice</>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ModalOverlay>
    );
};