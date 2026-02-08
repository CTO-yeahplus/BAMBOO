// app/components/modals/AltarModal.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalOverlay } from './ModalOverlay';
import { Lock, Sparkles, CheckCircle2, Droplets } from 'lucide-react';
import { SANCTUARY_ITEMS, SOUL_MASKS } from '../../types'; // 경로 확인

export const AltarModal = ({ 
    isOpen, onClose, 
    resonance, soulLevel, // 현재 보유 재화 & 레벨
    ownedItems, equippedItems,
    unlockArtifact, equipArtifact,
    currentPersona, changePersona, isPremium // 페르소나 관련
}: any) => {
    const [tab, setTab] = useState<'masks' | 'offerings'>('masks');

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            {/* Header: Resonance Status */}
            <div className="text-center mb-6 relative z-10 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-serif text-white/90 italic mb-1">The Sanctuary</h2>
                <div className="flex items-center justify-center gap-2 text-blue-300/80 bg-blue-500/10 px-4 py-1 rounded-full w-fit mx-auto border border-blue-500/20">
                    <Droplets size={14} className="fill-blue-400" />
                    <span className="text-xs font-bold tracking-widest">{resonance} Soul Dew</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-8 mb-6 text-sm">
                <button onClick={() => setTab('masks')} className={`pb-2 transition-all ${tab === 'masks' ? 'text-white border-b border-white' : 'text-white/40'}`}>
                    Soul Masks
                </button>
                <button onClick={() => setTab('offerings')} className={`pb-2 transition-all ${tab === 'offerings' ? 'text-white border-b border-white' : 'text-white/40'}`}>
                    Offerings & Relics
                </button>
            </div>

            <div className="h-[400px] overflow-y-auto custom-scrollbar px-2">
                <AnimatePresence mode="wait">
                    {tab === 'masks' ? (
                        // [Tab 1] Masks (Personas)
                        <motion.div key="masks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {SOUL_MASKS.map((mask: any) => {
                                const isSelected = currentPersona === mask.id;
                                const isLocked = mask.id !== 'spirit' && !isPremium;
                                return (
                                    <button
                                        key={mask.id}
                                        onClick={() => !isLocked && changePersona(mask.id)}
                                        className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${isSelected ? 'bg-white/10 border-white/50' : 'bg-white/5 border-white/5 hover:bg-white/10'} ${isLocked ? 'opacity-50' : ''}`}
                                    >
                                        <div className="text-2xl grayscale-0">{mask.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="text-white text-sm font-bold">{mask.name}</h4>
                                            <p className="text-[10px] text-white/50 line-clamp-1">{mask.desc}</p>
                                        </div>
                                        {isLocked && <Lock size={14} className="text-white/30" />}
                                        {isSelected && <CheckCircle2 size={16} className="text-green-400" />}
                                    </button>
                                );
                            })}
                             {!isPremium && <p className="text-center text-[10px] text-white/30 mt-4">* Become a Guardian to unlock all masks.</p>}
                        </motion.div>
                    ) : (
                        // [Tab 2] Offerings (Shop)
                        <motion.div key="offerings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                            {SANCTUARY_ITEMS.map((item: any) => {
                                const isOwned = ownedItems.includes(item.id);
                                const isEquipped = item.type === 'atmosphere' 
                                    ? equippedItems.atmosphere === item.id 
                                    : equippedItems.artifacts.includes(item.id);
                                const isLevelLocked = item.requiredLevel && soulLevel < item.requiredLevel;

                                return (
                                    <div key={item.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 relative overflow-hidden ${isOwned ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5'}`}>
                                        {/* Background Glow */}
                                        {isEquipped && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />}
                                        
                                        <div className="text-3xl filter drop-shadow-lg">{item.icon}</div>
                                        <div>
                                            <h4 className="text-white text-xs font-bold mb-1">{item.name}</h4>
                                            <p className="text-[10px] text-white/40 h-8 leading-tight overflow-hidden">{item.desc}</p>
                                        </div>

                                        {isOwned ? (
                                            <button 
                                                onClick={() => equipArtifact(item.id, item.type)}
                                                className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all ${isEquipped ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                            >
                                                {isEquipped ? 'Active' : 'Equip'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => !isLevelLocked && unlockArtifact(item.id)}
                                                disabled={isLevelLocked || resonance < item.cost}
                                                className={`w-full py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${isLevelLocked || resonance < item.cost ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'}`}
                                            >
                                                {isLevelLocked ? (
                                                    <><Lock size={10} /> Lv.{item.requiredLevel}</>
                                                ) : (
                                                    <><Droplets size={10} /> {item.cost}</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalOverlay>
    );
};