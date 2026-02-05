'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { MemoryIllustration, MEMORY_GALLERY } from '../types';

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            {children}
        </motion.div>
    </motion.div>
);

// [Modified] 1. 갤러리 모달 (이미지 선택 기능만 남김)
export const MemoryGalleryModal = ({ isOpen, onClose, currentResonance, onSelect }: { isOpen: boolean, onClose: () => void, currentResonance: number, onSelect: (img: MemoryIllustration) => void }) => {
    
    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
                <h2 className="text-white/90 font-serif italic text-xl flex items-center gap-2">
                    <ImageIcon size={20} /> 추억 앨범
                </h2>
                <button onClick={onClose}><X className="text-white/50 hover:text-white" /></button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#0f0f0f]">
                {MEMORY_GALLERY.map((item) => {
                    const isUnlocked = currentResonance >= item.unlockResonance;
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                            whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                            // [Point] 클릭 시 상위 컴포넌트로 선택된 이미지 전달
                            onClick={() => isUnlocked && onSelect(item)}
                            className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${isUnlocked ? 'border-white/20 cursor-pointer shadow-lg' : 'border-white/5 cursor-not-allowed opacity-50'}`}
                        >
                            <Image 
                                src={item.imageUrl} 
                                alt={item.title} 
                                fill 
                                className={`object-cover transition-all duration-700 ${isUnlocked ? 'blur-0' : 'blur-[20px] grayscale'}`}
                            />
                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white/50">
                                    <Lock size={24} className="mb-2" />
                                    <p className="text-[10px] font-mono">Req: {item.unlockResonance}</p>
                                </div>
                            )}
                            {isUnlocked && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                                    <p className="text-white/90 font-medium">{item.title}</p>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
            {/* 기존에 있던 Detail Viewer 코드는 제거되었습니다. */}
        </ModalOverlay>
    );
};

// [New] 2. 전체 화면 뷰어 (독립된 컴포넌트로 분리)
// 이 컴포넌트는 page.tsx의 최상단에 배치되어 모든 모달 위에 뜹니다.
export const FullImageViewer = ({ image, onClose }: { image: MemoryIllustration | null, onClose: () => void }) => {
    return (
        <AnimatePresence>
            {image && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    // [Fix] z-index를 200으로 높여서 다른 모달보다 위에 뜨게 함
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-8"
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative max-w-5xl w-full bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 이미지 영역 */}
                        <div className="relative w-full h-[60vh] md:h-[75vh] bg-black"> 
                            <Image 
                                src={image.imageUrl} 
                                alt={image.title} 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                        
                        {/* 텍스트 영역 */}
                        <div className="p-6 bg-[#1a1a1a] border-t border-white/10 relative z-20">
                            <h3 className="text-white/90 text-2xl font-serif mb-2">{image.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{image.description}</p>
                        </div>
                        
                        {/* 닫기 버튼 */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors z-50 border border-white/10">
                            <X size={24} />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};