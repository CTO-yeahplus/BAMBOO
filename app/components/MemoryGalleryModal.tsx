'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Image as ImageIcon, Sparkles, Eye, Expand } from 'lucide-react';
import Image from 'next/image';
import { MemoryIllustration, MEMORY_GALLERY } from '../types';
import { ModalOverlay } from './modals/ModalOverlay'; // 👈 공통 모달 사용

// 1. 갤러리 모달 (The Ethereal Gallery)
export const MemoryGalleryModal = ({ 
    isOpen, 
    onClose, 
    currentResonance, 
    onSelect 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    currentResonance: number, 
    onSelect: (img: MemoryIllustration) => void 
}) => {
    
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} title="Gallery of Visions" subtitle="Glimpses of your journey">
            <div className="flex flex-col h-full relative">
                
                {/* 🌌 Background Atmosphere */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(50,50,80,0.2),transparent_70%)] pointer-events-none" />
                
                {/* Stats / Header Info */}
                <div className="px-6 py-2 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5 z-10">
                    <span>Collection</span>
                    <span>Resonance: {currentResonance}%</span>
                </div>

                {/* Gallery Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
                    {MEMORY_GALLERY.map((item, index) => {
                        const isUnlocked = currentResonance >= item.unlockResonance;
                        
                        return (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
                                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                                onClick={() => isUnlocked && onSelect(item)}
                                className={`group relative aspect-[3/4] rounded-xl overflow-hidden border transition-all duration-500
                                    ${isUnlocked 
                                        ? 'border-white/10 bg-white/5 cursor-pointer hover:border-white/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                                        : 'border-white/5 bg-black/40 cursor-not-allowed grayscale'
                                    }`}
                            >
                                {/* Image Layer */}
                                <Image 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    fill 
                                    className={`object-cover transition-all duration-700 
                                        ${isUnlocked 
                                            ? 'opacity-80 group-hover:opacity-100 group-hover:scale-110' 
                                            : 'opacity-30 blur-sm scale-100'
                                        }`}
                                />

                                {/* Locked Overlay */}
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 bg-black/40 backdrop-blur-[2px]">
                                        <div className="p-3 rounded-full bg-white/5 border border-white/5 mb-2">
                                            <Lock size={16} />
                                        </div>
                                        <p className="text-[10px] font-mono tracking-wider uppercase">
                                            Resonance {item.unlockResonance}%
                                        </p>
                                    </div>
                                )}

                                {/* Unlocked Hover Overlay */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white text-sm font-serif italic mb-1">{item.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-wider">
                                                <Expand size={10} /> Tap to Expand
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Shine Effect */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-1000 pointer-events-none" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </ModalOverlay>
    );
};

// 2. 전체 화면 뷰어 (Cinema Mode)
export const FullImageViewer = ({ image, onClose }: { image: MemoryIllustration | null, onClose: () => void }) => {
    if (!image) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center"
                onClick={onClose}
            >
                {/* Close Button (Floating) */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all z-50 group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden md:rounded-3xl bg-[#0f0f12] border border-white/10 shadow-2xl mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image Area */}
                    <div className="flex-1 relative h-[50vh] md:h-full bg-black flex items-center justify-center overflow-hidden">
                         {/* Background Blur Image for Ambiance */}
                         <Image 
                            src={image.imageUrl} 
                            alt="ambiance" 
                            fill 
                            className="object-cover opacity-20 blur-[100px] scale-150" 
                        />
                        
                        <div className="relative w-full h-full p-4 md:p-12">
                            <Image 
                                src={image.imageUrl} 
                                alt={image.title} 
                                fill 
                                className="object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
                            />
                        </div>
                    </div>
                    
                    {/* Text Area (Sidebar on Desktop, Bottom on Mobile) */}
                    <div className="w-full md:w-[350px] bg-[#1a1a1e] border-t md:border-t-0 md:border-l border-white/5 flex flex-col">
                        <div className="p-8 flex-1 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-white/40 uppercase tracking-widest mb-3">
                                    Visual Memory
                                </span>
                                <h3 className="text-white text-3xl font-serif leading-tight">{image.title}</h3>
                            </div>
                            
                            <div className="w-10 h-px bg-white/10 mb-6" />
                            
                            <p className="text-white/60 text-sm leading-loose font-light">
                                {image.description}
                            </p>
                        </div>
                        
                        {/* Footer (Actions) */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <Sparkles size={14} /> Set as Wallpaper
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};