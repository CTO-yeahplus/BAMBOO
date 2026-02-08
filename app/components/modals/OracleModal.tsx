// app/components/modals/OracleModal.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export const OracleModal = ({ isOpen, onClose, todaysCard, drawOracleCard, isOracleLoading }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-lg p-6">
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><X /></button>
            
            <div className="flex flex-col items-center text-center max-w-md w-full">
                {!todaysCard ? (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <h2 className="text-2xl font-serif text-white/90 italic">The Forest Oracle</h2>
                        <p className="text-white/50 text-sm leading-relaxed">
                            숲의 정령에게 오늘의 조언을 구하세요.<br/>
                            마음을 비우고 카드를 선택하세요.
                        </p>
                        
                        <button 
                            onClick={drawOracleCard}
                            disabled={isOracleLoading}
                            className="group relative w-48 h-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-500"
                        >
                            <div className="absolute inset-2 border border-white/5 rounded-lg border-dashed" />
                            {isOracleLoading ? (
                                <Sparkles className="animate-spin text-purple-400" size={32} />
                            ) : (
                                <div className="text-white/20 font-serif italic group-hover:text-purple-400 transition-colors">Draw Card</div>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="bg-[#121212] border border-white/10 p-8 rounded-2xl w-full shadow-[0_0_50px_rgba(168,85,247,0.1)]"
                    >
                        <div className="mb-6 flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Sparkles className="text-purple-400" size={20} />
                            </div>
                        </div>
                        <h3 className="text-xl font-serif text-purple-200 mb-2">{todaysCard.name}</h3>
                        <p className="text-xs text-purple-400/60 uppercase tracking-widest mb-6">{todaysCard.theme}</p>
                        <p className="text-white/80 font-serif leading-loose italic mb-8">"{todaysCard.message}"</p>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Guidance</p>
                            <p className="text-sm text-white/70">{todaysCard.advice}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};