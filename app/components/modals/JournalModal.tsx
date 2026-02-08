'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, LayoutGrid, Headphones, Loader2, Trash2, Share2, Sparkles } from 'lucide-react';
import { ConstellationLayer, OrbitLayer, MemoryFlower, GoldenCocoon } from '../visuals';
import { Memory } from '../../types';

interface JournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    memories: Memory[];
    processedMemories: any[]; 
    engine: any;
}

// 🌌 [New] 배경 별 파티클 컴포넌트
const StarField = () => {
    // SSR 이슈 방지를 위해 클라이언트 마운트 후 렌더링
    const [stars, setStars] = useState<any[]>([]);

    useEffect(() => {
        const newStars = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-0"
                    style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                    animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

// 🌠 [New] 유성 애니메이션
const ShootingStar = () => (
    <motion.div
        className="absolute top-0 right-0 w-[100px] h-[1px] bg-gradient-to-l from-transparent via-white to-transparent opacity-0"
        style={{ rotate: -45 }}
        animate={{ 
            x: [-100, -800], 
            y: [0, 800], 
            opacity: [0, 1, 0] 
        }}
        transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 5, 
            ease: "easeIn" 
        }}
    />
);

export const JournalModal = ({ isOpen, onClose, memories, processedMemories, engine }: JournalModalProps) => {
    const [viewMode, setViewMode] = useState<'stars' | 'orbit'>('stars');
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-40 bg-[#050508]/95 backdrop-blur-2xl pointer-events-auto overflow-hidden"
        >
            {/* 🌌 1. 살아있는 배경 효과 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.15),transparent_70%)] pointer-events-none animate-pulse-slow" />
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-screen animate-float" />
            <StarField />
            <ShootingStar />

            {/* Top Navigation Bar */}
            <div className="absolute top-6 left-0 right-0 px-8 flex justify-between items-center z-50">
                {/* View Mode Switcher */}
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md shadow-lg">
                    <button 
                        onClick={() => { engine.triggerLight(); setViewMode('stars'); }}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'stars' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/50 hover:text-white'}`}
                    >
                        <Star size={14} /> <span className="hidden sm:inline">Constellation</span>
                    </button>
                    <button 
                        onClick={() => { engine.triggerLight(); setViewMode('orbit'); }}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'orbit' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/50 hover:text-white'}`}
                    >
                        <LayoutGrid size={14} /> <span className="hidden sm:inline">Orbit</span>
                    </button>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="p-3 bg-white/5 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all border border-white/5 shadow-lg hover:shadow-white/10 hover:rotate-90 duration-500"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 flex items-center justify-center">
                {viewMode === 'stars' ? (
                    <motion.div 
                        key="stars"
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full h-full relative"
                    >
                        {/* Constellation Lines (Static but glowy) */}
                        <div className="opacity-60 animate-pulse">
                            <ConstellationLayer memories={processedMemories} />
                        </div>

                        {/* 🌟 2. 살아있는 별들 (Floating Memories) */}
                        {processedMemories.map((item, index) => {
                            const memory = item as Memory & { x: number; y: number; unlock_date?: string };
                            const isTimeCapsule = !!memory.unlock_date; 
                            const isLocked = isTimeCapsule && new Date(memory.unlock_date!) > new Date(); 
                            
                            return (
                                <motion.button 
                                    key={memory.id} 
                                    layoutId={`memory-container-${memory.id}`} 
                                    className="absolute flex items-center justify-center group -translate-x-1/2 -translate-y-1/2" 
                                    style={{ top: `${memory.y}%`, left: `${memory.x}%`, zIndex: selectedMemory?.id === memory.id ? 50 : 10 }} 
                                    onClick={() => { 
                                        if (isLocked) { alert(`이 기억은 ${new Date(memory.unlock_date!).toLocaleDateString()}에 깨어납니다.`); } 
                                        else { engine.playMagicDust(); engine.triggerLight(); setSelectedMemory(memory); } 
                                    }} 
                                    // ✨ Breathing & Floating Animation
                                    animate={{ 
                                        y: [0, -10, 0], // 둥둥 떠다님
                                        scale: selectedMemory?.id === memory.id ? 1 : [1, 1.05, 1], // 숨쉬듯 크기 변화
                                        opacity: isLocked ? 0.5 : 1
                                    }}
                                    transition={{ 
                                        y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 },
                                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
                                    }}
                                >
                                    <div className="relative hover:scale-125 transition-transform duration-300">
                                        {isTimeCapsule && isLocked ? ( 
                                            <div className="relative">
                                                <GoldenCocoon isLocked={true} /> 
                                                <motion.div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                                            </div>
                                        ) : ( 
                                            <> 
                                                <MemoryFlower emotion={memory.emotion} isSelected={selectedMemory?.id === memory.id} /> 
                                                <motion.div 
                                                    className={`absolute inset-0 blur-md rounded-full opacity-40 ${memory.emotion === 'anger' ? 'bg-red-500' : memory.emotion === 'sadness' ? 'bg-blue-500' : 'bg-yellow-200'}`} 
                                                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </> 
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                ) : (
                    // 🌀 3. 회전하는 은하수 (Rotating Orbit)
                    <motion.div 
                        key="orbit"
                        initial={{ opacity: 0, rotate: -20 }} 
                        animate={{ opacity: 1, rotate: 0 }} 
                        exit={{ opacity: 0, rotate: 20 }}
                        transition={{ duration: 0.8 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <motion.div 
                            className="w-full h-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 200, repeat: Infinity, ease: "linear" }} // 아주 천천히 전체 회전
                        >
                            <OrbitLayer memories={memories} onSelect={(m) => { engine.playMagicDust(); engine.triggerLight(); setSelectedMemory(m); }} />
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Memory Detail Card (Overlay) */}
            <AnimatePresence>
                {selectedMemory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedMemory(null)} />
                        
                        <motion.div 
                            layoutId={`memory-container-${selectedMemory.id}`} 
                            className="relative w-full max-w-md bg-[#121216] border border-white/10 p-8 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden" 
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Decorative Glow */}
                            <div className={`absolute -top-20 -left-20 w-60 h-60 blur-[100px] opacity-40 pointer-events-none animate-pulse ${selectedMemory.emotion === 'happy' ? 'bg-yellow-500' : selectedMemory.emotion === 'sadness' ? 'bg-blue-500' : selectedMemory.emotion === 'anger' ? 'bg-red-500' : 'bg-purple-500'}`} />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                            
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                {/* Top Bar */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="transform scale-90 origin-left shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-full">
                                            <MemoryFlower emotion={selectedMemory.emotion} isSelected={true} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Memory of</p>
                                            <p className="text-lg text-white font-serif tracking-wide">{new Date(selectedMemory.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedMemory(null)} className="text-white/30 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                                </div>

                                {/* Content */}
                                <div className="relative z-10 mb-8 min-h-[100px] flex items-center justify-center">
                                    <Sparkles className="absolute -top-2 -left-2 text-white/10 w-4 h-4" />
                                    <p className="text-white/90 font-light text-xl leading-relaxed italic text-center drop-shadow-md">
                                        "{selectedMemory.summary}"
                                    </p>
                                    <Sparkles className="absolute -bottom-2 -right-2 text-white/10 w-4 h-4" />
                                </div>

                                {/* Audio Player */}
                                {selectedMemory.audio_url && (
                                    <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 relative z-10 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-200 animate-pulse"><Headphones size={14} /></div>
                                            <span className="text-[10px] text-yellow-200/80 uppercase tracking-widest font-bold">Voice Record</span>
                                        </div>
                                        <audio src={selectedMemory.audio_url} controls className="w-full h-8 opacity-80" />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-end border-t border-white/5 pt-6 relative z-10">
                                    <motion.button 
                                        onClick={() => engine.deleteMemory(selectedMemory.id)} 
                                        disabled={engine.isDeleting === selectedMemory.id} 
                                        className="px-4 py-3 bg-red-500/5 rounded-xl hover:bg-red-500/20 text-red-400/60 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-all"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    >
                                        {engine.isDeleting === selectedMemory.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </motion.button>
                                    <motion.button 
                                        onClick={() => engine.openSoulography('memory', selectedMemory)}                                        disabled={engine.capturingId === selectedMemory.id} 
                                        className="flex-1 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/10 shadow-lg"
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    >
                                        {engine.capturingId === selectedMemory.id ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} 
                                        Share Artifact
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {memories.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none">
                    <div className="relative">
                        <Star size={40} className="mb-4 opacity-20" />
                        <motion.div className="absolute inset-0 bg-white/20 blur-xl" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                    </div>
                    <p className="font-light text-sm tracking-wider">The sky is empty.</p>
                    <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">Create your first star.</p>
                </div>
            )}
        </motion.div>
    );
};