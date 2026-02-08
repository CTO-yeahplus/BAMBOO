'use client';
import React, { useRef, useState, useEffect } from 'react';
import { SpotlightCard } from '../ui/SpotlightCard'; // 👈 이미 있는 파일 사용
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Lock, Palette, Unlock, Zap, Sparkles, Check, HelpCircle, Repeat, Eye, EyeOff, Gem, Trash2, Quote, Pause, User, LogOut, Download, Share2, Settings2, Volume2, Square, Mic, Heart, Send, Flame, CloudRain, Wind, Trees, Sliders, Power, StopCircle, Play, Loader2, PenTool, Search } from 'lucide-react';
import Image from 'next/image';
import { Artifact, ARTIFACTS, WhisperBottle, THEMES, ThemeId, SpiritFormType, SPIRIT_FORMS, DailyMood, EMOTION_COLORS } from '../../types';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { BurningPaperEffect,  SpiritWisp, SpiritFox } from '../ForestVisuals'; 
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ShareCard } from '../ShareCard';
import { usePushNotification } from '../../hooks/usePushNotification';

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
        <ModalOverlay onClose={onClose} title="Free Env">
            <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl shadow-2xl w-full relative overflow-hidden min-h-[400px] flex flex-col">                
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