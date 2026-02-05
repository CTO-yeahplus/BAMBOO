'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Palette, Unlock, Zap, Sparkles,Trash2, User, LogOut, Download, Share2, Settings2, Volume2, Square, Mic, Heart, Send, Flame, CloudRain, Wind, Trees, Sliders, Power, StopCircle, Play } from 'lucide-react';
import Image from 'next/image';
import { Artifact, ARTIFACTS, OracleCard, WhisperBottle, THEMES, ThemeId } from '../types';
import { toPng } from 'html-to-image'; // [Fix] 교체된 라이브러리
import QRCode from 'react-qr-code';
import { BurningPaperEffect } from './ForestVisuals'; 
import { SpiritFormType, SPIRIT_FORMS } from '../types'; 
import { SpiritWisp, SpiritFox } from './ForestVisuals'; // Import Visuals

// --- Helper Components ---
const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
            {children}
        </motion.div>
    </motion.div>
);

// --- 1. Oracle Modal (Updated for html-to-image) ---
export const OracleModal = ({ isOpen, card, onConfirm }: { isOpen: boolean; card: OracleCard | null; onConfirm: () => void }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    if (!isOpen || !card) return null;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsCapturing(true); 
        
        try {
            // 폰트 로딩 등 렌더링 확보를 위한 미세 딜레이
            await new Promise(resolve => setTimeout(resolve, 100));

            // [Fix] html-to-image 사용 (oklab 에러 해결)
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#0a0a0a', // 배경색 명시
                pixelRatio: 2, // 고화질 설정
            });

            const link = document.createElement('a');
            link.download = `bamboo-oracle-${new Date().toISOString().slice(0,10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Image generation failed:", err);
            alert("이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <ModalOverlay onClose={() => {}}>
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                <button 
                    onClick={onConfirm} 
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Capture Area */}
                <div ref={cardRef} className="relative p-8 flex flex-col items-center text-center bg-gradient-to-b from-[#1a1a1a] to-black min-h-[550px] justify-between">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl" />

                    <div className="relative z-10 mt-4">
                        <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                            <Sparkles size={14} className="text-yellow-200" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-100">Daily Oracle</span>
                            <Sparkles size={14} className="text-yellow-200" />
                        </div>
                        <h2 className="text-2xl font-serif text-white/90 mb-1">{card.name}</h2>
                        <p className="text-xs text-white/40 font-mono">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="relative z-10 w-48 h-72 my-6 rounded-lg border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center bg-white/5 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-blue-500/20 opacity-50" />
                        <div className="text-center p-4">
                            <p className="text-4xl mb-4 opacity-80">{card.icon === 'Coffee' ? '☕' : card.icon === 'Footprints' ? '👣' : card.icon === 'Sun' ? '☀️' : card.icon === 'Sparkles' ? '✨' : card.icon === 'Wind' ? '🍃' : card.icon === 'Sunrise' ? '🌅' : '💖'}</p>
                            <p className="text-white/80 font-serif italic text-sm leading-relaxed word-keep-all">
                                "{card.message}"
                            </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                    </div>

                    <div className="relative z-10 w-full flex items-end justify-between border-t border-white/10 pt-4 mt-2">
                        <div className="text-left">
                            <p className="text-xs text-white/60 font-bold tracking-wider">Bamboo Forest</p>
                            <p className="text-[9px] text-white/30 mt-1">Listen to your soul.</p>
                        </div>
                        <div className="bg-white p-1 rounded-sm">
                            <QRCode 
                                value={typeof window !== 'undefined' ? window.location.origin : 'https://bamboo-forest.vercel.app'} 
                                size={48} 
                                fgColor="#000000" 
                                bgColor="#ffffff" 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex gap-3">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        disabled={isCapturing}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isCapturing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
                        Save Image
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-gray-200 transition-colors"
                    >
                        Accept
                    </motion.button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 2. Settings Modal ---
export const SettingsModal = ({ 
    isOpen, onClose, 
    bgVolume, setBgVolume, voiceVolume, setVoiceVolume, // Master Volumes
    isMixerMode, setIsMixerMode, mixerVolumes, setMixerVolumes, applyPreset, // Mixer Props
    currentTheme, setTheme, isPremium
}: any) => {

    const [tab, setTab] = useState<'audio' | 'dreamscapes'>('audio'); // Tab State
    
    if (!isOpen) return null;

    const channels = [
        { id: 'forest', icon: <Trees size={18} />, label: 'Forest', color: 'bg-green-500' },
        { id: 'rain', icon: <CloudRain size={18} />, label: 'Rain', color: 'bg-blue-500' },
        { id: 'wind', icon: <Wind size={18} />, label: 'Wind', color: 'bg-gray-400' },
        { id: 'ember', icon: <Flame size={18} />, label: 'Fire', color: 'bg-orange-500' },
    ];

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden min-h-[400px] flex flex-col">                
                {/* Header with Tabs */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                    <button 
                        onClick={() => setTab('audio')}
                        className={`text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'audio' ? 'text-white' : 'text-white/40 hover:text-white'}`}
                    >
                         <Sliders size={16} /> Audio
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button 
                        onClick={() => setTab('dreamscapes')}
                        className={`text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'dreamscapes' ? 'text-purple-300' : 'text-white/40 hover:text-white'}`}
                    >
                         <Palette size={16} /> Dreamscapes
                    </button>
                    <button onClick={onClose} className="ml-auto"><X className="text-white/30 hover:text-white" /></button>
                </div>

                {/* CONTENT: AUDIO (Existing) */}
                {tab === 'audio' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">

                        {/* 1. Master Volume Section */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-4">
                                <Volume2 size={16} className="text-white/40" />
                                <div className="flex-1">
                                    <label className="text-xs text-white/40 mb-1 block">Master Ambience</label>
                                    <input 
                                        type="range" min="0" max="1" step="0.05" 
                                        value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-4" /> {/* Indent */}
                                <div className="flex-1">
                                    <label className="text-xs text-white/40 mb-1 block">Spirit Voice</label>
                                    <input 
                                        type="range" min="0" max="1" step="0.05" 
                                        value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5 mb-8" />

                        {/* 2. Mixer Mode Toggle */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-white/80 font-medium">Custom Mix</span>
                            <button 
                                onClick={() => setIsMixerMode(!isMixerMode)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isMixerMode ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isMixerMode ? 'translate-x-6 bg-green-400' : 'bg-white/30'}`} />
                            </button>
                        </div>

                        {/* 3. Mixer Controls (Visible only when Mixer Mode is ON) */}
                        <div className={`space-y-5 transition-all duration-500 ${isMixerMode ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none blur-[2px]'}`}>
                            {channels.map((ch) => (
                                <div key={ch.id} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-white/5 text-white/60 ${isMixerMode ? 'text-white' : ''}`}>
                                        {ch.icon}
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="range" min="0" max="1" step="0.05"
                                            disabled={!isMixerMode}
                                            value={mixerVolumes?.[ch.id] ?? 0}
                                            onChange={(e) => setMixerVolumes((prev: any) => ({ ...prev, [ch.id]: parseFloat(e.target.value) }))}
                                            className={`w-full h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white ${isMixerMode ? 'bg-white/20' : 'bg-white/5'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 4. Presets */}
                        {isMixerMode && (
                            <div className="mt-8 grid grid-cols-3 gap-2">
                                {['Focus', 'Sleep', 'Morning'].map((preset) => (
                                    <button 
                                        key={preset}
                                        onClick={() => applyPreset(preset.toLowerCase())}
                                        className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-white/50 hover:text-white transition-all uppercase tracking-wider"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* CONTENT: DREAMSCAPES (New) */}
                {tab === 'dreamscapes' && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto">
                        {THEMES.map((theme) => {
                            const isLocked = !isPremium && theme.id !== 'bamboo';
                            const isSelected = currentTheme === theme.id;
                            
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => {
                                        if (isLocked) {
                                            alert("프리미엄 구독 시 모든 테마가 해금됩니다.");
                                            return;
                                        }
                                        setTheme(theme.id);
                                    }}
                                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all text-left group ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    {/* Preview Background (Gradient) */}
                                    <div className="absolute inset-0" style={{ background: theme.bgGradient }} />
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-white font-medium text-xs">{theme.name}</p>
                                    </div>

                                    {/* Selected Indicator */}
                                    {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_5px_purple]" />}

                                    {/* Lock Icon */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                                            <Lock size={20} className="text-white/50" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </ModalOverlay>
    );
};

// [Modified] Altar Modal
export const AltarModal = ({ isOpen, onClose, resonance, artifacts, ownedItems, equippedItems, onUnlock, onEquip, spiritForm, changeSpiritForm }: any) => {
    // Tab State: 'items' | 'spirit'
    const [tab, setTab] = useState<'items' | 'spirit'>('items');

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl overflow-hidden shadow-2xl h-[70vh] flex flex-col">
                {/* Header with Tabs */}
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white/90 font-serif italic text-xl">Spirit Altar</h2>
                        <button onClick={onClose}><X className="text-white/50 hover:text-white" /></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setTab('items')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === 'items' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}>Artifacts</button>
                        <button onClick={() => setTab('spirit')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === 'spirit' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'}`}>Spirit Form</button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {tab === 'items' ? (
                        // Existing Artifacts Grid
                        <div className="grid grid-cols-2 gap-4">
                             {artifacts.map((item: any) => {
                                 // ... (기존 아티팩트 렌더링 코드 그대로 유지)
                                 const isOwned = ownedItems.includes(item.id);
                                 const isEquipped = equippedItems[item.type] === item.id;
                                 return (
                                     <div key={item.id} className={`relative p-4 rounded-xl border transition-all flex flex-col gap-2 ${isOwned ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                         <div className="flex justify-between items-start"><span className="text-2xl">{item.icon}</span>{isEquipped && <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">EQUIPPED</span>}</div>
                                         <div><h3 className="text-white/90 text-sm font-medium">{item.name}</h3><p className="text-white/40 text-[10px] mt-1 line-clamp-2">{item.description}</p></div>
                                         <div className="mt-auto pt-3">
                                             {isOwned ? (
                                                 <button onClick={() => onEquip(item)} className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors ${isEquipped ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>{isEquipped ? 'Unequip' : 'Equip'}</button>
                                             ) : (
                                                 <button onClick={() => onUnlock(item)} disabled={resonance < item.cost} className={`w-full py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${resonance >= item.cost ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 hover:bg-yellow-600/30' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}><Zap size={10} /> {item.cost}</button>
                                             )}
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    ) : (
                        // [New] Spirit Form Grid
                        <div className="flex flex-col gap-4">
                             <div className="text-center mb-4">
                                 <span className="text-yellow-200 text-xs font-mono border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 rounded-full">Current Resonance: {resonance}</span>
                             </div>
                             {SPIRIT_FORMS.map((form: any) => {
                                 const isUnlocked = resonance >= form.minResonance;
                                 const isSelected = spiritForm === form.id;
                                 return (
                                     <button 
                                         key={form.id} 
                                         onClick={() => isUnlocked && changeSpiritForm(form.id)}
                                         disabled={!isUnlocked}
                                         className={`relative p-4 rounded-xl border flex items-center gap-4 transition-all text-left ${isSelected ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : isUnlocked ? 'bg-black/40 border-white/10 hover:bg-white/5' : 'bg-black/60 border-white/5 opacity-50 cursor-not-allowed'}`}
                                     >
                                         <div className="w-16 h-16 bg-black/50 rounded-lg flex items-center justify-center overflow-hidden border border-white/5">
                                             {form.id === 'wisp' && <div className="scale-50"><SpiritWisp /></div>}
                                             {form.id === 'fox' && <div className="scale-50"><SpiritFox /></div>}
                                             {form.id === 'guardian' && <span className="text-2xl">🧚</span>}
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex items-center gap-2">
                                                 <h3 className="text-white/90 font-medium">{form.name}</h3>
                                                 {!isUnlocked && <Lock size={12} className="text-white/30" />}
                                             </div>
                                             <p className="text-white/40 text-xs mt-1">{form.desc}</p>
                                             <p className="text-yellow-500/50 text-[10px] mt-1 font-mono">Req: {form.minResonance} Res</p>
                                         </div>
                                         {isSelected && <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_green]" />}
                                     </button>
                                 )
                             })}
                        </div>
                    )}
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 4. Profile Modal ---
export const ProfileModal = ({ isOpen, onClose, user, isPremium, signOut, getUserInitial }: any) => {
    if (!isOpen || !user) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6">
                <div className="relative"><div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isPremium ? 'bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/50 text-yellow-100' : 'bg-white/5 border-white/10 text-white'}`}>{getUserInitial()}</div>{isPremium && <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-300 shadow-lg">PREMIUM</div>}</div>
                <div className="text-center"><h2 className="text-white text-xl font-medium mb-1">{user.email?.split('@')[0]}</h2><p className="text-white/40 text-xs">{user.email}</p></div>
                <div className="w-full h-px bg-white/10 my-2" />
                <button onClick={() => { signOut(); onClose(); }} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-200 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"><LogOut size={16} /> Sign Out</button>
            </div>
        </ModalOverlay>
    );
};

// --- 5. Bottle Write Modal (구조 신호 추가됨) ---
export const BottleWriteModal = ({ isOpen, onClose, onSend }: any) => {
    const [text, setText] = useState("");
    const [isDistress, setIsDistress] = useState(false); // [Fix] 이 줄이 빠져서 에러가 났습니다.

    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-white/90 text-lg font-serif italic">Whisper to the Universe</h2><button onClick={onClose}><X className="text-white/30 hover:text-white" /></button></div>
                <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="누군가에게 닿을 마음을 적어주세요..." 
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-white/30 resize-none mb-4"
                    maxLength={100}
                />

                {/* [New] Distress Toggle Button */}
                <div 
                    className={`flex items-center justify-between mb-6 p-3 rounded-lg cursor-pointer transition-colors ${isDistress ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-white/5'}`} 
                    onClick={() => setIsDistress(!isDistress)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDistress ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-white/40'}`}>
                            <Sparkles size={16} />
                        </div>
                        <div className="text-left">
                            <p className={`text-sm font-medium ${isDistress ? 'text-red-200' : 'text-white/60'}`}>구조 신호 보내기</p>
                            <p className="text-[10px] text-white/30">수호자들에게 우선적으로 전달됩니다.</p>
                        </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isDistress ? 'bg-red-500/50' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDistress ? 'translate-x-4' : ''}`} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={() => { if(text.trim()) { onSend(text, isDistress); setText(""); setIsDistress(false); onClose(); } }}
                        disabled={!text.trim()}
                        className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Send size={14} /> Float Bottle
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 6. Bottle Read Modal (녹음 기능 완벽 구현됨) ---
export const BottleReadModal = ({ bottle, onClose, onLike, onReply, isPremium }: { bottle: WhisperBottle | null, onClose: () => void, onLike: (id: number) => void, onReply: (id: number, blob: Blob) => void, isPremium: boolean }) => {
    // [Fix] 녹음 관련 상태와 로직 추가
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (e) {
            alert("마이크 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    if (!bottle) return null;

    return (
        <ModalOverlay onClose={() => {
            // 모달 닫을 때 녹음 데이터 초기화
            setAudioBlob(null);
            setIsRecording(false);
            onClose();
        }}>
            <div className="relative bg-[#0c0c0c] border border-[#222] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10" />
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                    {/* Bottle Icon */}
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        {bottle.is_distress ? <span className="text-2xl animate-pulse">🆘</span> : <span className="text-2xl">🍾</span>}
                    </div>
                    
                    {/* Content */}
                    <p className="text-white/80 font-serif italic text-lg leading-relaxed mb-8 break-keep">
                        "{bottle.content}"
                    </p>
                    
                    {/* [New] Guardian Reply UI */}
                    {isPremium && !bottle.reply_audio_url && (
                        <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-yellow-500/70 uppercase tracking-widest mb-3">Guardian's Duty</p>
                            
                            {!audioBlob ? (
                                // 1. 녹음 버튼
                                <div className="flex flex-col items-center gap-2">
                                    <button 
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isRecording ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
                                    </button>
                                    <span className="text-[10px] text-white/30">{isRecording ? "Recording..." : "Reply with Voice"}</span>
                                </div>
                            ) : (
                                // 2. 전송/삭제 버튼
                                <div className="flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => onReply(bottle.id, audioBlob)}
                                        className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-200 text-xs rounded-full border border-yellow-500/30 flex items-center gap-2 transition-all"
                                    >
                                        <Send size={12} /> 답장 보내기
                                    </button>
                                    <button onClick={() => setAudioBlob(null)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-center gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-full border border-white/10 text-white/40 hover:bg-white/5 text-xs transition-colors">닫기</button>
                        <button 
                            onClick={() => { onLike(bottle.id); onClose(); }} 
                            className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-full text-xs flex items-center gap-2 transition-all group"
                        >
                            <Heart size={12} className="group-hover:fill-red-300 transition-all" /> 
                            따뜻해요 {bottle.likes}
                        </button>
                    </div>
                    
                    <p className="mt-6 text-[9px] text-white/20 uppercase tracking-widest">Someone's Whisper • {new Date(bottle.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </ModalOverlay>
    );
};

// [New] Fire Ritual Modal (번제 의식)
export const FireRitualModal = ({ isOpen, onClose, onBurn }: any) => {
    const [text, setText] = useState("");
    const [isBurning, setIsBurning] = useState(false);

    if (!isOpen) return null;

    const handleBurn = () => {
        if (!text.trim()) return;
        setIsBurning(true);
        onBurn(); // 소리 및 햅틱 트리거
        // 애니메이션이 끝난 후 모달 닫기 (BurningPaperEffect 시간과 동기화)
        setTimeout(() => {
            setIsBurning(false);
            setText("");
            onClose();
        }, 3500);
    };

    return (
        <ModalOverlay onClose={isBurning ? () => {} : onClose}>
            <div className="relative bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                
                {/* Burning Effect Layer */}
                {isBurning && <BurningPaperEffect isBurning={isBurning} onComplete={() => {}} />}

                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-red-200/90 text-lg font-serif italic flex items-center gap-2">
                        <Flame size={18} className={isBurning ? "animate-bounce text-orange-500" : "text-red-500/50"} />
                        Ritual of Fire
                    </h2>
                    {!isBurning && <button onClick={onClose}><X className="text-white/30 hover:text-white" /></button>}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col relative z-10 transition-opacity duration-1000" style={{ opacity: isBurning ? 0 : 1 }}>
                    <p className="text-white/40 text-xs mb-4 leading-relaxed">
                        당신을 괴롭히는 기억, 걱정, 두려움을 이곳에 적으세요.<br/>
                        이 종이는 태워질 것이며, 기록은 어디에도 남지 않습니다.
                    </p>
                    
                    <textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="여기에 버리고 싶은 마음을 적으세요..." 
                        className="w-full flex-1 bg-black/30 border border-white/5 rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-red-500/30 resize-none mb-6 placeholder-white/20 font-serif"
                    />
                    
                    <button 
                        onClick={handleBurn}
                        disabled={!text.trim()}
                        className="w-full py-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/20 hover:border-red-500/50 rounded-xl text-red-200 text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <span className="group-hover:text-red-100 transition-colors">Burn Away</span>
                    </button>
                </div>

                {/* Text to be burnt (Visible only during burning) */}
                {isBurning && (
                    <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
                        <p className="text-white/80 font-serif text-lg text-center leading-relaxed break-keep animate-pulse">
                            {text}
                        </p>
                    </div>
                )}
            </div>
        </ModalOverlay>
    );
};