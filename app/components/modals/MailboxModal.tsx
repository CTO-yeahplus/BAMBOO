'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mail, ArrowRight, Share2 } from 'lucide-react';

interface MailboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    letters: any[]; // 편지 데이터 배열
    onShare: (type: 'letter', data: any) => void; // 공유(Soulography) 핸들러
}

export const MailboxModal = ({ isOpen, onClose, letters, onShare }: MailboxModalProps) => {
    const [selectedLetter, setSelectedLetter] = useState<any>(null);

    // 모달이 닫힐 때 상세 뷰도 초기화
    if (!isOpen) {
        if (selectedLetter) setSelectedLetter(null);
        return null;
    }

    return (
        <>
            {/* 1. 메인 리스트 뷰 (The Celestial Archive) */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
                onClick={onClose} // 배경 클릭 시 닫기
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                    className="w-full max-w-lg h-[70vh] flex flex-col bg-[#0f1014] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
                    onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫기 방지
                >
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(100,80,255,0.1),transparent_50%)]" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="relative z-10 p-6 pb-2 flex justify-between items-center border-b border-white/5">
                        <div>
                            <h2 className="text-yellow-100/90 text-xl font-serif italic tracking-wide flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-500" /> Soul Letters
                            </h2>
                            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">Messages from the Spirit</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* List Content */}
                    <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {letters.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                                <Mail size={40} strokeWidth={1} />
                                <div className="text-center">
                                    <p className="font-serif italic text-lg opacity-60">The mailbox is empty.</p>
                                    <p className="text-[10px] uppercase tracking-widest mt-2">Wait for the moon to rise.</p>
                                </div>
                            </div>
                        ) : (
                            letters.map((letter, i) => (
                                <motion.div 
                                    key={letter.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedLetter(letter)}
                                    className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-yellow-500/30 cursor-pointer transition-all duration-300 overflow-hidden"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    
                                    <div className="relative z-10 flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-yellow-500/80 text-xs font-bold uppercase tracking-wider border border-yellow-500/20 px-2 py-0.5 rounded-full bg-yellow-500/10">
                                                    {letter.month}
                                                </span>
                                                <span className="text-white/20 text-[10px] font-mono">
                                                    {new Date(letter.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-white/70 text-sm font-serif line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                {letter.content}
                                            </p>
                                        </div>
                                        <div className="mt-1 text-white/20 group-hover:text-yellow-200 transition-colors">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* 2. 상세 뷰 (The Paper) - 모달 위에 덮이는 오버레이 */}
            <AnimatePresence>
                {selectedLetter && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedLetter(null)}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.9, opacity: 0 }} 
                            animate={{ y: 0, scale: 1, opacity: 1 }} 
                            exit={{ y: 50, scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-xl w-full bg-[#fdfbf7] text-[#2c241b] rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden rotate-1"
                        >
                            {/* Paper Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-60 pointer-events-none mix-blend-multiply" />
                            
                            {/* Gold Border */}
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30" />

                            <button 
                                onClick={() => setSelectedLetter(null)} 
                                className="absolute top-4 right-4 text-[#2c241b]/30 hover:text-[#2c241b] transition-colors z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 md:p-12 relative z-10 flex flex-col items-center">
                                {/* Seal & Header */}
                                <div className="mb-8 flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-serif text-2xl font-bold tracking-widest text-[#2c241b]">
                                            {selectedLetter.month}
                                        </h3>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#2c241b]/40 mt-1">
                                            Chronicle of the Soul
                                        </p>
                                    </div>
                                </div>

                                <div className="w-10 h-px bg-[#2c241b]/20 mb-8" />

                                <p className="font-serif text-lg leading-loose text-justify opacity-90 whitespace-pre-wrap mb-12 w-full">
                                    {selectedLetter.content}
                                </p>
                                
                                {/* Footer */}
                                <div className="w-full flex justify-between items-end border-t border-[#2c241b]/10 pt-6">
                                    <button 
                                        onClick={() => onShare('letter', selectedLetter)}
                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2c241b]/40 hover:text-[#7c3aed] transition-colors group"
                                    >
                                        <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                                        Keep this memory
                                    </button>
                                    
                                    <div className="text-right">
                                        <p className="font-serif italic text-sm text-[#2c241b]/60">From the Forest Spirit</p>
                                        <p className="text-[10px] font-mono text-[#2c241b]/30 mt-1">
                                            {new Date(selectedLetter.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};