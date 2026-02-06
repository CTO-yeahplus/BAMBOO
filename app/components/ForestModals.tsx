'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Lock, Palette, Unlock, Zap, Sparkles, HelpCircle, Repeat, Eye, EyeOff, Gem, Trash2, Quote, Pause, User, LogOut, Download, Share2, Settings2, Volume2, Square, Mic, Heart, Send, Flame, CloudRain, Wind, Trees, Sliders, Power, StopCircle, Play, Loader2, PenTool, Search } from 'lucide-react';
import Image from 'next/image';
import { Artifact, ARTIFACTS, WhisperBottle, THEMES, ThemeId, SpiritFormType, SPIRIT_FORMS, DailyMood, EMOTION_COLORS } from '../types';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { BurningPaperEffect,  SpiritWisp, SpiritFox } from './ForestVisuals'; 
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ShareCard } from './ShareCard';
import { usePushNotification } from '../hooks/usePushNotification';

// --- Helper Components ---
const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
            {children}
        </motion.div>
    </motion.div>
);

// 4-1. Oracle Card Component (개별 카드)
const OracleCard = ({ card, isFlipped, onClick, disabled }: any) => {
    return (
        <div 
            className={`relative w-full aspect-[2/3] perspective-1000 ${disabled ? 'cursor-default' : 'cursor-pointer group'}`} 
            onClick={() => !disabled && onClick()}
        >
            <motion.div
                className="w-full h-full relative transition-transform duration-700 transform-style-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                whileHover={!disabled && !isFlipped ? { scale: 1.02, y: -5 } : {}}
            >
                {/* Card Back (뒷면) */}
                <OracleCardBack />

                {/* Card Front (앞면) */}
                <OracleCardFront card={card} />
            </motion.div>
        </div>
    );
};

// 4-2. Oracle Card Back (고풍스러운 뒷면 디자인)
const OracleCardBack = () => (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl border-2 border-[#c5a47e]/50 shadow-2xl backface-hidden flex items-center justify-center overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/binding-dark.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#c5a47e]/20 via-transparent to-transparent"></div>
        
        {/* 중앙 심볼 및 장식 */}
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full border-2 border-[#c5a47e]/50 bg-[#1a1a2e]/80 shadow-[0_0_20px_rgba(197,164,126,0.3)]">
                <Gem size={40} className="text-[#c5a47e] animate-pulse-slow" />
            </div>
            <h3 className="text-[#c5a47e] font-serif text-sm mt-4 tracking-[0.2em] uppercase">Fate's Whisper</h3>
            
            {/* 테두리 장식 */}
            <div className="absolute inset-2 border border-[#c5a47e]/20 rounded-lg pointer-events-none"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#c5a47e]/20 to-transparent rounded-xl blur-sm -z-10 pointer-events-none"></div>
        </div>
    </div>
);

// 4-3. Oracle Card Front (화려한 앞면 디자인)
const OracleCardFront = ({ card }: any) => (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl border-2 border-[#c5a47e] shadow-2xl backface-hidden rotate-y-180 overflow-hidden flex flex-col">
        {/* 이미지 영역 (프레임 및 효과) */}
        <div className="relative flex-1 m-2 rounded-lg overflow-hidden border border-[#c5a47e]/50 group">
             {/* 금빛 프레임 장식 */}
            <div className="absolute inset-0 pointer-events-none z-10 border-[6px] border-transparent border-image-[url('https://i.imgur.com/4qW4X8w.png')] 10% round mix-blend-overlay opacity-60"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent z-10 opacity-40"></div>

            {card ? (
                <>
                    <Image
                        src={card.image_url}
                        alt={card.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                     {/* 빛 반사 효과 */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
                </>
            ) : (
                // 로딩 중 표시
                <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                    <Loader2 size={30} className="text-[#c5a47e] animate-spin" />
                </div>
            )}
        </div>

        {/* 텍스트 영역 */}
        <div className="p-4 text-center relative z-20 bg-[#1a1a2e]/90 border-t border-[#c5a47e]/30">
             {/* 텍스트 배경 장식 */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/binding-dark.png')] mix-blend-overlay pointer-events-none"></div>

            {card ? (
                <>
                    <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e0c3a3] via-[#c5a47e] to-[#e0c3a3] mb-1 drop-shadow-sm">
                        {card.name}
                    </h3>
                    <p className="text-xs text-[#c5a47e]/80 uppercase tracking-widest font-medium">
                        {card.keywords}
                    </p>
                </>
            ) : (
                 <div className="h-12 flex items-center justify-center">
                    <span className="text-[#c5a47e]/50 text-sm font-serif">Revealing fate...</span>
                 </div>
            )}
        </div>
    </div>
);

// 4-4. Main Modal Component
export const OracleModal = ({ isOpen, onClose, onDrawCard, todaysCard, isLoading, error }: any) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showInterpretation, setShowInterpretation] = useState(false);

    useEffect(() => {
        if (isOpen && todaysCard) {
            setIsFlipped(true); // 이미 뽑은 카드가 있으면 보여줌
        } else {
            setIsFlipped(false);
            setShowInterpretation(false);
        }
    }, [isOpen, todaysCard]);

    const handleCardClick = () => {
        if (!todaysCard && !isLoading) {
            onDrawCard(); // 카드 뽑기
            setIsFlipped(true); // 뒤집기 애니메이션 시작 (로딩 중일 수 있음)
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            {/* 배경 효과 강화 */}
            <div className="absolute inset-0 bg-gradient-radial from-[#1a1a2e] via-[#0a0a0a] to-[#050505] opacity-90 -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow -z-10 mix-blend-screen"></div>


            <div className="relative w-full max-w-md p-6 flex flex-col items-center">
                {/* Header */}
                <div className="absolute top-4 right-4 z-20">
                     <button onClick={onClose} className="p-2 rounded-full bg-[#1a1a2e]/50 border border-[#c5a47e]/30 text-[#c5a47e]/70 hover:text-[#c5a47e] hover:bg-[#c5a47e]/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 relative z-10"
                >
                    <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e0c3a3] via-[#c5a47e] to-[#e0c3a3] flex items-center justify-center gap-3 drop-shadow-lg">
                        <Sparkles className="text-[#c5a47e]" size={24} />
                        Daily Oracle
                        <Sparkles className="text-[#c5a47e]" size={24} style={{ transform: 'scaleX(-1)' }} />
                    </h2>
                    <p className="text-[#c5a47e]/70 text-sm mt-2 font-serif italic">
                        "오늘 당신에게 전하는 운명의 속삭임"
                    </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-center text-sm">
                        <p className="flex items-center justify-center gap-2"><HelpCircle size={16} /> {error}</p>
                        <button onClick={onDrawCard} className="mt-3 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-full text-xs flex items-center justify-center gap-2 mx-auto transition-colors">
                            <Repeat size={12} /> 다시 시도
                        </button>
                    </motion.div>
                )}

                {/* Card Area */}
                <div className="w-64 mx-auto mb-8 relative z-10">
                    <OracleCard 
                        card={todaysCard} 
                        isFlipped={isFlipped} 
                        onClick={todaysCard ? onClose : handleCardClick}
                        disabled={isLoading || todaysCard}
                    />
                    
                    {/* 안내 문구 */}
                    <AnimatePresence>
                        {!isFlipped && !isLoading && !todaysCard && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[#c5a47e]/60 text-sm text-center mt-6 font-serif animate-pulse"
                            >
                                카드를 터치하여 오늘의 운세를 확인하세요.
                            </motion.p>
                        )}
                         {isLoading && isFlipped && !todaysCard && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[#c5a47e]/60 text-sm text-center mt-6 font-serif flex items-center justify-center gap-2"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                정령이 카드를 고르는 중...
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Interpretation Area (해석) */}
                <AnimatePresence>
                    {todaysCard && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 20, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="w-full overflow-hidden relative z-10"
                        >
                            {showInterpretation ? (
                                <div className="bg-[#1a1a2e]/80 border border-[#c5a47e]/30 p-6 rounded-2xl shadow-inner relative overflow-hidden">
                                     <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/binding-dark.png')] mix-blend-overlay pointer-events-none"></div>
                                    <h3 className="text-[#c5a47e] font-serif font-bold mb-3 flex items-center gap-2">
                                        <Sparkles size={16} /> 정령의 메시지
                                    </h3>
                                    <p className="text-[#e0c3a3]/90 text-sm leading-relaxed font-serif italic text-justify">
                                        "{todaysCard.interpretation}"
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-[#c5a47e]/20 text-center">
                                         <p className="text-[#c5a47e]/60 text-xs mb-1">오늘의 행운 조언</p>
                                        <p className="text-[#e0c3a3] text-sm font-medium font-serif">"{todaysCard.lucky_advice}"</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowInterpretation(false)}
                                        className="absolute top-4 right-4 text-[#c5a47e]/50 hover:text-[#c5a47e] transition-colors"
                                    >
                                        <EyeOff size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowInterpretation(true)}
                                    className="w-full py-3 bg-[#1a1a2e]/60 hover:bg-[#1a1a2e]/80 border border-[#c5a47e]/30 hover:border-[#c5a47e]/50 rounded-xl text-[#c5a47e] flex items-center justify-center gap-2 transition-all group"
                                >
                                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-serif">해석 보기 (Reveal Interpretation)</span>
                                </button>
                            )}
                            {/* 👇 [NEW] 숲으로 입장하기 버튼 (필수 추가) */}
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-gradient-to-r from-[#c5a47e] to-[#e0c3a3] hover:brightness-110 text-[#0f0f1a] font-bold rounded-xl shadow-[0_0_20px_rgba(197,164,126,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
                            >
                                <span className="uppercase tracking-widest text-xs">Begin Journey</span>
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalOverlay>
    );
};

// --- 2. Settings Modal ---
export const SettingsModal = ({ 
    isOpen, onClose, 
    bgVolume, setBgVolume, voiceVolume, setVoiceVolume, // Master Volumes
    isMixerMode, setIsMixerMode, mixerVolumes, setMixerVolumes, applyPreset, // Mixer Props
    currentTheme, setTheme, isPremium, binauralMode, setBinauralMode,
    pushPermission, requestPushPermission,
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
                {/* 6. Notifications (New Section) */}
            <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-white/80 text-xs font-medium flex items-center gap-2">
                        <Bell size={14} className="text-white/60" /> 
                        Spirit's Call
                    </h3>
                    <button
                        // 👇 [Modified] 전달받은 Props 사용
                        onClick={requestPushPermission}
                        disabled={pushPermission === 'granted'}
                        className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${
                            pushPermission === 'granted' 
                            ? 'bg-green-500/20 border-green-500/30 text-green-200 cursor-default' 
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                    >
                        {pushPermission === 'granted' ? 'Active' : 'Enable Push'}
                    </button>
                </div>
            <p className="text-[9px] text-white/30 mt-2 leading-relaxed">
                활성화하면 정령이 가끔 안부를 묻거나, 오라클 카드가 도착했을 때 알려줍니다.
            </p>
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

                        {/* 5. Binaural Healing Layers (Premium Only) */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white/80 text-xs font-medium flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-200" /> 
                                    Brainwave Therapy
                                </h3>
                                {!isPremium && <span className="text-[10px] bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded border border-yellow-500/30">PREMIUM</span>}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'delta', label: 'Sleep', desc: 'Delta δ', color: 'bg-indigo-500/20 text-indigo-200' },
                                    { id: 'alpha', label: 'Focus', desc: 'Alpha α', color: 'bg-emerald-500/20 text-emerald-200' },
                                    { id: 'theta', label: 'Meditate', desc: 'Theta θ', color: 'bg-purple-500/20 text-purple-200' }
                                ].map((beat) => (
                                    <button
                                        key={beat.id}
                                        disabled={!isPremium}
                                        onClick={() => setBinauralMode(binauralMode === beat.id ? 'none' : beat.id)} // 토글 방식
                                        className={`relative p-3 rounded-xl border transition-all text-left group ${
                                            binauralMode === beat.id 
                                            ? `${beat.color} border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="text-xs font-bold mb-1">{beat.label}</div>
                                        <div className="text-[9px] opacity-60 font-mono">{beat.desc}</div>
                                        {binauralMode === beat.id && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
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

// [New] Soul Calendar Modal
export const SoulCalendarModal = ({ isOpen, onClose, moods, onMonthChange, currentYear, currentMonth, onShare }: { 
    isOpen: boolean, 
    onClose: () => void, 
    moods: DailyMood[], 
    onMonthChange: (y: number, m: number) => void,
    currentYear: number,
    currentMonth: number,
    onShare: (type: 'calendar', data: any) => void 
    }) => {
    
    if (!isOpen) return null;

    // 감정별 색상 매핑 (Tailwind 클래스 대신 인라인 스타일용 Hex 코드 필요시 변환 혹은 EMOTION_COLORS 활용)
    const getEmotionColor = (emotion: string, intensity: number) => {
        // intensity(1~3)에 따라 투명도 조절
        const opacity = 0.3 + (intensity * 0.2); 
        switch (emotion) {
            case 'happy': return `rgba(253, 224, 71, ${opacity})`; // Yellow
            case 'sadness': return `rgba(96, 165, 250, ${opacity})`; // Blue
            case 'anger': return `rgba(248, 113, 113, ${opacity})`; // Red
            case 'loneliness': return `rgba(167, 139, 250, ${opacity})`; // Purple
            case 'neutral': return `rgba(255, 255, 255, ${opacity * 0.5})`; // White
            default: return `rgba(255, 255, 255, 0.1)`;
        }
    };

    const handlePrevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 1) { newMonth = 12; newYear--; }
        onMonthChange(newYear, newMonth);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 12) { newMonth = 1; newYear++; }
        onMonthChange(newYear, newMonth);
    };

    // 달력 그리드 생성
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0: Sun, 1: Mon...
    
    const calendarDays = [];
    // 빈 칸 채우기
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    // 날짜 채우기
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayMood = moods.find(m => m.date === dateStr);
        
        calendarDays.push(
            <div key={d} className="aspect-square relative group">
                <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-xs text-white/80 transition-all border border-white/5 group-hover:scale-110 cursor-pointer"
                    style={{ 
                        backgroundColor: dayMood ? getEmotionColor(dayMood.dominantEmotion, dayMood.intensity) : 'rgba(255,255,255,0.02)',
                        boxShadow: dayMood ? `0 0 10px ${getEmotionColor(dayMood.dominantEmotion, 1)}` : 'none'
                    }}
                >
                    {d}
                </div>
                {/* Tooltip */}
                {dayMood && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black/90 border border-white/10 p-2 rounded-lg text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <p className="font-bold mb-1 text-center capitalize">{dayMood.dominantEmotion}</p>
                        <p className="line-clamp-2 italic">"{dayMood.summary}"</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><ChevronLeft size={20} /></button>
                    <div className="text-center">
                        <h2 className="text-xl font-serif text-white/90">{currentYear}. {String(currentMonth).padStart(2, '0')}</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Constellation of Emotions</p>
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"><ChevronRight size={20} /></button>
                </div>

                {/* Weekday Header */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-[10px] text-white/30 font-medium py-2">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays}
                </div>

                {/* [New] Footer Share Button */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                    {/* 기존 범례(Legend)는 유지 */}
                    <div className="mt-6 flex justify-center gap-4 text-[9px] text-white/30">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400/50" />Happy</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400/50" />Sad</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400/50" />Anger</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400/50" />Lonely</div>
                    </div>
                    {/* 공유 버튼 추가 */}
                    <button 
                        onClick={() => onShare('calendar', moods)}
                        className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all border border-purple-500/20"
                    >
                        <Share2 size={14} />
                        Share my Constellation
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// [New] Soulography Modal (The Studio)
export const SoulographyModal = ({ isOpen, onClose, type, data, userName }: { isOpen: boolean, onClose: () => void, type: 'calendar' | 'letter', data: any, userName: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [theme, setTheme] = useState<'modern' | 'receipt' | 'chart'>('modern'); // [Updated]

    if (!isOpen) return null;

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsCapturing(true);

        try {
            // 폰트 로딩 대기
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2, // 고해상도
                backgroundColor: '#050505'
            });

            // 1. Web Share API 시도 (모바일)
            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'soulography.png', { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'My Soulography',
                    text: 'From the Bamboo Forest.',
                });
            } else {
                // 2. PC면 다운로드
                const link = document.createElement('a');
                link.download = `soulography-${type}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Capture failed:", err);
            alert("이미지 생성에 실패했습니다.");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto w-full max-w-sm">
                {/* Header */}
                <div className="flex justify-between items-center w-full px-2">
                    <h3 className="text-white/80 font-serif italic">Soulography</h3>
                    <button onClick={onClose}><X size={20} className="text-white/50" /></button>
                </div>

                {/* [Updated] 3-Way Theme Switcher */}
                <div className="flex bg-black/40 p-1 rounded-full border border-white/10 w-full">
                    {[
                        { id: 'modern', label: 'Ethereal' },
                        { id: 'receipt', label: 'Receipt' },
                        { id: 'chart', label: 'Analysis' }
                    ].map((t) => (
                        <button 
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${theme === t.id ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Preview Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 scale-90 sm:scale-100 origin-top">
                    {/* Theme prop 전달 */}
                    <ShareCard ref={cardRef} type={type} data={data} userName={userName} theme={theme} />
                    <div className="absolute inset-0 z-50 bg-transparent" />
                </div>

                {/* Share Button */}
                <button 
                    onClick={handleShare}
                    disabled={isCapturing}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-bold text-sm tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isCapturing ? <Loader2 className="animate-spin" /> : <Share2 size={18} />}
                    {isCapturing ? "Developing..." : "Share to Story"}
                </button>
            </div>
        </ModalOverlay>
    );
};

// [New] Voice Capsule Modal
export const SpiritCapsuleModal = ({ isOpen, onClose, capsules, onDelete }: any) => {
    const [playingId, setPlayingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePlay = (capsule: any) => {
        // 브라우저 TTS 사용
        window.speechSynthesis.cancel(); // 기존 음성 중단
        
        const utterance = new SpeechSynthesisUtterance(capsule.text);
        utterance.lang = 'ko-KR'; // 한국어 설정
        utterance.rate = 0.9; // 조금 천천히
        utterance.pitch = 1.0;
        
        // 종료 시 상태 초기화
        utterance.onend = () => setPlayingId(null);
        
        setPlayingId(capsule.id);
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setPlayingId(null);
    };

    return (
        <ModalOverlay onClose={() => { handleStop(); onClose(); }}>
            <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md h-[60vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white/90 font-serif italic text-xl">Spirit Whispers</h3>
                    <button onClick={() => { handleStop(); onClose(); }}><X size={20} className="text-white/50" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {capsules.length === 0 ? (
                        <div className="text-center text-white/30 text-xs py-10">
                            "간직하고 싶은 정령의 목소리가 있다면<br/>대화 중에 캡슐 버튼을 눌러보세요."
                        </div>
                    ) : (
                        capsules.map((cap: any) => (
                            <div key={cap.id} className={`p-4 rounded-xl border transition-all ${playingId === cap.id ? 'bg-white/10 border-purple-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(cap.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => onDelete(cap.id)} className="text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                                <p className="text-white/80 text-sm font-serif leading-relaxed line-clamp-2 mb-4">"{cap.text}"</p>
                                
                                <button 
                                    onClick={() => playingId === cap.id ? handleStop() : handlePlay(cap)}
                                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${playingId === cap.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                >
                                    {playingId === cap.id ? <><Pause size={12} /> Playing...</> : <><Play size={12} /> Replay Voice</>}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ModalOverlay>
    );
};


// 1. [BottleMenu] 선택 화면: "띄울까, 주을까?"
export const BottleMenuModal = ({ isOpen, onClose, onWrite, onPickUp }: any) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center relative overflow-hidden">
                {/* 배경 효과 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                
                <h3 className="text-xl font-serif text-white/90 mb-2 italic">Echo of Souls</h3>
                <p className="text-xs text-white/40 mb-8 leading-relaxed">
                    이 바다에는 수많은 영혼들의 속삭임이 떠다닙니다.<br/>
                    당신의 이야기를 띄우거나, 누군가의 목소리를 들어보세요.
                </p>

                <div className="space-y-3">
                    <button onClick={onWrite} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 group">
                        <PenTool size={18} className="text-blue-300 group-hover:scale-110 transition-transform" />
                        <span className="text-white/80 text-sm">이야기 띄우기</span>
                    </button>
                    <button onClick={onPickUp} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 group">
                        <Search size={18} className="text-purple-300 group-hover:scale-110 transition-transform" />
                        <span className="text-white/80 text-sm">유리병 찾기</span>
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 6. Bottle Read Modal (읽기 전용) ---
export const BottleReadModal = ({ isOpen, onClose, bottle, onSendWarmth }: any) => {
    const [hasSentWarmth, setHasSentWarmth] = useState(false);

    // 모달이 열릴 때마다 상태 초기화
    useEffect(() => {
        if (isOpen) setHasSentWarmth(false);
    }, [isOpen, bottle]);

    if (!isOpen || !bottle) return null;

    const handleWarmth = () => {
        if (hasSentWarmth) return;
        onSendWarmth(bottle.id, bottle.likes || 0);
        setHasSentWarmth(true);
        // (선택사항) 온기를 보내고 잠시 후 자동으로 닫으려면 아래 주석 해제
        // setTimeout(() => onClose(), 2000); 
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                
                {/* [Header] */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-white/90 text-lg font-serif italic">Message from the Sea</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                            {new Date(bottle.created_at).toLocaleDateString()} • Anonymous
                        </p>
                    </div>
                    <button onClick={onClose}><X className="text-white/30 hover:text-white" /></button>
                </div>

                {/* [Distress Indicator] 구조 신호일 경우 표시 */}
                {bottle.is_distress && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="p-1.5 rounded-full bg-red-500/20 text-red-200 animate-pulse">
                            <Sparkles size={14} />
                        </div>
                        <span className="text-xs text-red-200 font-medium">구조 신호가 감지되었습니다.</span>
                    </div>
                )}

                {/* [Content Area] */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-6 mb-6 relative min-h-[140px] flex flex-col justify-center">
                    <Quote className="absolute top-4 left-4 text-white/10" size={24} />
                    <p className="text-white/90 text-sm font-serif leading-loose text-center italic relative z-10 whitespace-pre-wrap">
                        "{bottle.content}"
                    </p>
                    <Quote className="absolute bottom-4 right-4 text-white/10 rotate-180" size={24} />
                </div>

                {/* [Actions] */}
                <div className="flex justify-center">
                    {hasSentWarmth ? (
                        <div className="px-6 py-3 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs flex items-center gap-2 animate-fade-in cursor-default">
                            <Heart size={16} fill="currentColor" />
                            <span>따뜻한 온기가 전해졌습니다.</span>
                        </div>
                    ) : (
                        <button 
                            onClick={handleWarmth}
                            className="group px-6 py-3 bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-full text-xs text-white/60 hover:text-pink-200 transition-all flex items-center gap-2"
                        >
                            <Heart size={16} className="group-hover:scale-110 transition-transform group-hover:text-pink-400" />
                            <span>따뜻한 마음 전하기 (Send Warmth)</span>
                        </button>
                    )}
                </div>

            </div>
        </ModalOverlay>
    );
};