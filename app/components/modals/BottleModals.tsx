'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send,  MessageCircle, Waves, ArrowLeft, PenLine, Search, X, Sparkles, Loader2 } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';

// 🌊 파도 애니메이션 컴포넌트
const WaveDecoration = () => (
    <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none opacity-30">
        <motion.div 
            className="absolute bottom-0 w-[200%] h-full bg-gradient-to-t from-cyan-500/20 to-transparent"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
            className="absolute bottom-2 w-[200%] h-full bg-gradient-to-t from-indigo-500/20 to-transparent"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

// ------------------------------------------------------------------
// 1. Bottle Menu (메뉴 선택 - 밤바다 산책)
// ------------------------------------------------------------------
export const BottleMenuModal = ({ isOpen, onClose, onWrite, onFind }: any) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} title="Driftwood Beach" subtitle="Where souls connect">
            <div className="relative h-full flex flex-col justify-center px-4 gap-4 pb-8">
                
                {/* 1. Cast a Bottle (편지 보내기) */}
                <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onWrite}
                    className="relative group overflow-hidden p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/40 to-blue-900/40 backdrop-blur-md transition-all shadow-lg hover:shadow-cyan-500/10 text-left"
                >
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-200">
                                    <PenLine size={18} />
                                </div>
                                <h3 className="text-white font-serif text-lg tracking-wide">Cast a Bottle</h3>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed pl-1">
                                Write your soul's whisper and<br/>let the tide carry it away.
                            </p>
                        </div>
                        <ArrowRightIcon className="text-white/20 group-hover:text-cyan-200 transition-colors transform group-hover:translate-x-1" />
                    </div>
                </motion.button>

                {/* 2. Walk the Beach (편지 찾기) */}
                <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onFind}
                    className="relative group overflow-hidden p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-md transition-all shadow-lg hover:shadow-emerald-500/10 text-left"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-200">
                                    <Search size={18} />
                                </div>
                                <h3 className="text-white font-serif text-lg tracking-wide">Walk the Beach</h3>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed pl-1">
                                Find a bottle washed ashore<br/>from a stranger's heart.
                            </p>
                        </div>
                        <ArrowRightIcon className="text-white/20 group-hover:text-emerald-200 transition-colors transform group-hover:translate-x-1" />
                    </div>
                </motion.button>

                <WaveDecoration />
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 2. Bottle Write (편지 쓰기 - 양피지 감성)
// ------------------------------------------------------------------
export const BottleWriteModal = ({ isOpen, onClose, sendBottle }: any) => {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!content.trim()) return;
        setIsSending(true);
        // 애니메이션 효과를 위해 약간의 딜레이
        await new Promise(resolve => setTimeout(resolve, 1500));
        await sendBottle(content);
        setIsSending(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} title="Cast a Bottle">
            <div className="flex flex-col h-full px-4 pb-6 relative">
                
                {/* Writing Area (Parchment Style) */}
                <div className="flex-1 relative mt-2 mb-4">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm" />
                    <textarea 
                        className="relative z-10 w-full h-full bg-transparent border-none p-6 text-white/90 font-serif leading-loose resize-none focus:ring-0 placeholder-white/20 text-sm custom-scrollbar"
                        placeholder="What is weighing on your soul tonight?..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoFocus
                    />
                    <Sparkles className="absolute top-4 right-4 text-white/10 pointer-events-none" size={16} />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={onClose} className="px-4 py-2 text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={!content.trim() || isSending}
                        className={`
                            px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg
                            ${content.trim() && !isSending
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-cyan-500/20' 
                                : 'bg-white/10 text-white/30 cursor-not-allowed'}
                        `}
                    >
                        {isSending ? (
                            <><Loader2 className="animate-spin" size={16} /> Drifting...</>
                        ) : (
                            <><Send size={16} /> Cast into Sea</>
                        )}
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 3. Bottle Read (편지 읽기 - 발견)
// ------------------------------------------------------------------
export const BottleReadModal = ({ isOpen, onClose, bottle, onReply, onKeep, onThrowBack }: any) => {
    if (!isOpen) return null;

    // 만약 병이 없다면 (빈 화면)
    if (!bottle) {
        return (
            <ModalOverlay onClose={onClose} title="Empty Shore">
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                        <Waves size={32} className="text-white/20" />
                    </div>
                    <p className="text-white/60 font-serif italic text-lg">
                        "The tide is quiet tonight..."
                    </p>
                    <p className="text-white/30 text-xs">
                        No bottles have washed ashore yet.
                    </p>
                    <button onClick={onClose} className="mt-8 px-6 py-2 bg-white/10 rounded-full text-xs text-white/70 hover:bg-white/20 transition-all">
                        Return to Forest
                    </button>
                </div>
            </ModalOverlay>
        );
    }

    return (
        <ModalOverlay onClose={onClose} title="Message Found">
            <div className="flex flex-col h-full px-4 pb-4 relative">
                
                {/* Paper Content */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex-1 bg-[#fdfbf7] text-gray-800 rounded-lg p-6 md:p-8 shadow-2xl overflow-y-auto custom-scrollbar relative mb-4 rotate-1"
                >
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Anonymous Soul</span>
                            <span className="text-[10px] text-gray-400 font-mono">{new Date(bottle.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        
                        <p className="flex-1 font-serif text-base leading-loose whitespace-pre-wrap">
                            {bottle.content}
                        </p>
                        
                        <div className="mt-8 text-center text-gray-400 text-xs italic">
                            ~ Washed ashore from the deep ~
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={onThrowBack}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-bold uppercase hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Waves size={14} /> Return to Sea
                    </button>
                    {/* 답장/보관 기능이 있다면 활성화 */}
                    {onKeep && (
                        <button 
                            onClick={onKeep}
                            className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl text-white text-xs font-bold uppercase shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={14} /> Keep Whisper
                        </button>
                    )}
                </div>
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 🌟 4. Main Manager (통합 관리자)
// ------------------------------------------------------------------
export const BottleModals = ({ isOpen, onClose, sendBottle }: any) => {
    const [view, setView] = useState<'menu' | 'write' | 'read'>('menu');

    useEffect(() => {
        if (isOpen) setView('menu');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            {view === 'menu' && (
                <BottleMenuModal 
                    key="menu"
                    isOpen={true} 
                    onClose={onClose} 
                    onWrite={() => setView('write')} 
                    onFind={() => setView('read')} 
                />
            )}

            {view === 'write' && (
                <BottleWriteModal 
                    key="write"
                    isOpen={true} 
                    onClose={() => setView('menu')} // 뒤로가기 개념
                    sendBottle={sendBottle} 
                />
            )}

            {view === 'read' && (
                <BottleReadModal 
                    key="read"
                    isOpen={true} 
                    onClose={() => setView('menu')} // 뒤로가기 개념
                    bottle={null} // 실제 데이터 연결 시 여기에 bottle prop 전달
                    onThrowBack={() => setView('menu')}
                />
            )}
        </AnimatePresence>
    );
};

// Helper Icon
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);