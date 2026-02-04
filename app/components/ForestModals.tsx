// app/components/ForestModals.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gem, Lock, Settings2, LogOut } from 'lucide-react';
import { Artifact, OracleCard } from '../types';

// --- Daily Oracle Modal ---
export const OracleModal = ({ 
    isOpen, card, onConfirm 
}: { 
    isOpen: boolean; card: OracleCard | null; onConfirm: () => void 
}) => (
    <AnimatePresence>
        {isOpen && card && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 pointer-events-auto">
                <motion.div initial={{ scale: 0.8, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: "spring", delay: 0.2 }} className="relative w-full max-w-sm aspect-[3/4] bg-zinc-900 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col items-center justify-between p-8 text-center">
                    <div className="absolute inset-2 border border-white/5 rounded-xl pointer-events-none" />
                    <div className="mt-8"><Sparkles className="w-8 h-8 text-yellow-200/80 mb-4 mx-auto animate-pulse" /><h3 className="text-yellow-200/90 text-sm font-mono tracking-[0.3em] uppercase">Daily Oracle</h3></div>
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-4xl text-white/90 drop-shadow-lg">{/* Icon logic simplified */}🔮</div>
                        <div><h2 className="text-2xl font-serif text-white mb-2">{card.keyword}</h2><p className="text-white/60 text-sm font-light italic">"{card.message}"</p></div>
                    </div>
                    <button onClick={onConfirm} className="mb-4 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white/80 text-xs tracking-widest uppercase transition-all">Accept Wisdom</button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- Settings Modal ---
export const SettingsModal = ({ 
    isOpen, onClose, bgVolume, setBgVolume, voiceVolume, setVoiceVolume 
}: any) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-24 right-8 z-[60] w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl pointer-events-auto">
                <div className="flex justify-between items-center mb-6"><span className="text-white/60 text-xs font-mono tracking-widest uppercase">Audio Mix</span><button onClick={onClose} className="text-white/40 hover:text-white"><X size={14}/></button></div>
                <div className="space-y-6">
                    <div className="space-y-2"><div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider"><span>Ambience</span><span>{Math.round(bgVolume * 100)}%</span></div><input type="range" min="0" max="1" step="0.01" value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))} className="w-full accent-white/50 h-1 bg-white/10 rounded-lg cursor-pointer" /></div>
                    <div className="space-y-2"><div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider"><span>Voice</span><span>{Math.round(voiceVolume * 100)}%</span></div><input type="range" min="0" max="1" step="0.01" value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-white/50 h-1 bg-white/10 rounded-lg cursor-pointer" /></div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- Altar Modal ---
export const AltarModal = ({
    isOpen, onClose, resonance, artifacts, ownedItems, equippedItems, onUnlock, onEquip
}: any) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-black via-zinc-900/95 to-transparent pt-12 pb-8 px-6 rounded-t-3xl backdrop-blur-xl border-t border-white/10 h-[60vh] flex flex-col pointer-events-auto">
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                    <div><h2 className="text-white/90 text-xl font-light tracking-widest uppercase">Spirit's Altar</h2><p className="text-white/40 text-xs mt-1">Offer resonance to bestow gifts.</p></div>
                    <div className="flex items-center gap-2 text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20"><Gem size={14} /><span className="text-sm font-mono font-bold">{resonance}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-20 no-scrollbar">
                    {artifacts.map((item: Artifact) => {
                        const isOwned = ownedItems.includes(item.id);
                        const isEquipped = equippedItems[item.type] === item.id;
                        const canAfford = resonance >= item.cost;
                        return (
                            <button key={item.id} onClick={() => isOwned ? onEquip(item) : onUnlock(item)} disabled={!isOwned && !canAfford} className={`relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${isEquipped ? 'bg-purple-500/20 border-purple-500/50 shadow' : isOwned ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-70'}`}>
                                <div className="text-3xl filter drop-shadow-md">{item.icon}</div>
                                <div className="text-center"><div className="text-white/90 text-xs font-medium uppercase tracking-wider">{item.name}</div><div className="text-white/40 text-[10px] mt-1 line-clamp-1">{item.description}</div></div>
                                <div className="mt-2 w-full">{isOwned ? ( <div className={`text-[10px] uppercase tracking-widest py-1 rounded-full text-center border ${isEquipped ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}>{isEquipped ? 'Equipped' : 'Select'}</div> ) : ( <div className={`flex items-center justify-center gap-1 text-[10px] font-mono py-1 rounded-full border ${canAfford ? 'text-yellow-200 bg-yellow-500/10' : 'text-red-300 bg-red-500/5'}`}>{canAfford ? <Gem size={10} /> : <Lock size={10} />}<span>{item.cost}</span></div> )}</div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} className="absolute top-4 right-6 text-white/30 hover:text-white"><X size={24} /></button>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- Profile Modal ---
export const ProfileModal = ({ isOpen, onClose, user, isPremium, signOut, getUserInitial }: any) => (
    <AnimatePresence>
        {isOpen && user && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="absolute top-24 right-8 z-50 w-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl origin-top-right pointer-events-auto">
                <div className="flex justify-between items-center mb-6"><span className="text-white/60 text-xs font-mono tracking-widest uppercase">My Forest</span><button onClick={onClose} className="text-white/40 hover:text-white"><X size={14}/></button></div>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg border ${isPremium ? 'border-yellow-400/50 text-yellow-100' : 'border-white/10'}`}>{getUserInitial()}</div>
                        <div className="flex flex-col overflow-hidden"><span className="text-white text-sm font-medium truncate w-full">{user.email}</span><span className={`text-[10px] uppercase tracking-wider font-bold ${isPremium ? 'text-yellow-400' : 'text-white/40'}`}>{isPremium ? 'Sanctuary Member' : 'Traveler'}</span></div>
                    </div>
                    {!isPremium && (<button className="w-full py-3 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-500/30 rounded-xl text-yellow-200 text-xs tracking-widest uppercase hover:from-yellow-600/30 hover:to-yellow-400/30 transition-all flex items-center justify-center gap-2"><Sparkles size={12} /> Become a Member</button>)}
                    <div className="h-px bg-white/10 w-full" />
                    <button onClick={() => { if(confirm("로그아웃 하시겠습니까?")) { signOut(); onClose(); } }} className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-red-500/10 text-white/80 hover:text-red-200 text-xs font-medium rounded-xl transition-all border border-white/5 hover:border-red-500/20"><LogOut size={14} /> Sign Out</button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);