'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { 
    Trees, CloudRain, Wind, Flame, 
    Volume2, Sliders, Palette, Bell, 
    Lock, Check, Zap, Sparkles, 
    Moon, Sun, Music, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../../types';

export const SettingsModal = ({ 
    isOpen, onClose, 
    bgVolume, setBgVolume, voiceVolume, setVoiceVolume, 
    isMixerMode, setIsMixerMode, mixerVolumes, setMixerVolumes, applyPreset, 
    currentTheme, setTheme, isPremium, binauralMode, setBinauralMode,
    pushPermission, requestPushPermission,
}: any) => {

    const [tab, setTab] = useState<'audio' | 'visual'>('audio');

    if (!isOpen) return null;

    const channels = [
        { id: 'forest', icon: Trees, label: 'Trees', color: 'text-green-400' },
        { id: 'rain', icon: CloudRain, label: 'Rain', color: 'text-blue-400' },
        { id: 'wind', icon: Wind, label: 'Breeze', color: 'text-gray-300' },
        { id: 'ember', icon: Flame, label: 'Fire', color: 'text-orange-400' },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <ModalOverlay onClose={onClose} title="Sanctuary" subtitle="Tuning your senses">
            <div className="px-1 py-2 flex flex-col h-full">
                
                {/* 1. Elegant Tab Switcher */}
                <div className="flex bg-white/5 p-1 rounded-2xl mb-6 relative mx-4 border border-white/5">
                    <motion.div 
                        layoutId="activeTab"
                        className={`absolute inset-1 w-[calc(50%-4px)] bg-white/10 rounded-xl shadow-sm ${tab === 'visual' ? 'left-[calc(50%)]' : 'left-1'}`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    {[
                        { id: 'audio', label: 'Soundscape', icon: Music },
                        { id: 'visual', label: 'Dreamscape', icon: Palette }
                    ].map((t) => (
                        <button 
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors relative z-10 ${tab === t.id ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-6">
                    <AnimatePresence mode='wait'>
                        
                        {/* 🎵 AUDIO TAB */}
                        {tab === 'audio' && (
                            <motion.div 
                                key="audio"
                                variants={containerVariants}
                                initial="hidden" animate="visible" exit="hidden"
                                className="space-y-8"
                            >
                                {/* Master Controls */}
                                <motion.div variants={itemVariants} className="space-y-6">
                                    {/* Ambience Slider */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-3 px-1">
                                            <span className="text-white/60 font-medium flex items-center gap-2">
                                                <Volume2 size={14} className="text-white/40" /> Forest Depth
                                            </span>
                                            <span className="text-white/40 font-mono">{Math.round(bgVolume * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                                style={{ width: `${bgVolume * 100}%` }} 
                                            />
                                            <input 
                                                type="range" min="0" max="1" step="0.05" 
                                                value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Voice Slider */}
                                    <div className="group">
                                        <div className="flex justify-between text-xs mb-3 px-1">
                                            <span className="text-white/60 font-medium flex items-center gap-2">
                                                <Sparkles size={14} className="text-yellow-500/50" /> Spirit Whisper
                                            </span>
                                            <span className="text-white/40 font-mono">{Math.round(voiceVolume * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600/50 to-orange-500/50 rounded-full" 
                                                style={{ width: `${voiceVolume * 100}%` }} 
                                            />
                                            <input 
                                                type="range" min="0" max="1" step="0.05" 
                                                value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mixer Section */}
                                <motion.div variants={itemVariants} className="bg-white/5 rounded-3xl p-5 border border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-serif text-white/90 flex items-center gap-2">
                                            <Sliders size={16} className="text-white/40" /> Elemental Mix
                                        </h3>
                                        <button 
                                            onClick={() => setIsMixerMode(!isMixerMode)}
                                            className={`relative w-10 h-6 rounded-full transition-all duration-300 ${isMixerMode ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isMixerMode ? 'translate-x-4 scale-110' : 'scale-90 opacity-80'}`} />
                                        </button>
                                    </div>

                                    {/* Channels */}
                                    <div className={`space-y-4 transition-all duration-500 ${isMixerMode ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                                        {channels.map((ch) => (
                                            <div key={ch.id} className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 ${ch.color}`}>
                                                    <ch.icon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <input 
                                                        type="range" min="0" max="1" step="0.1"
                                                        value={mixerVolumes?.[ch.id] ?? 0}
                                                        onChange={(e) => setMixerVolumes((prev: any) => ({ ...prev, [ch.id]: parseFloat(e.target.value) }))}
                                                        className="w-full h-1 bg-black/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Presets */}
                                    {isMixerMode && (
                                        <div className="mt-6 flex gap-2">
                                            {['Focus', 'Sleep', 'Morning'].map((preset) => (
                                                <button 
                                                    key={preset}
                                                    onClick={() => applyPreset(preset.toLowerCase())}
                                                    className="flex-1 py-2 rounded-lg bg-black/20 hover:bg-white/10 text-[10px] text-white/50 hover:text-white border border-white/5 transition-all uppercase tracking-wider"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Binaural Beats (Premium) */}
                                <motion.div variants={itemVariants}>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                            <Headphones size={12} /> Brainwave Therapy
                                        </h3>
                                        {!isPremium && <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded">PREMIUM</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'delta', label: 'Deep Sleep', desc: 'Delta 0.5Hz', icon: Moon },
                                            { id: 'alpha', label: 'Flow State', desc: 'Alpha 10Hz', icon: Sun },
                                            { id: 'theta', label: 'Meditation', desc: 'Theta 6Hz', icon: Zap }
                                        ].map((beat) => (
                                            <button
                                                key={beat.id}
                                                onClick={() => isPremium && setBinauralMode(binauralMode === beat.id ? 'none' : beat.id)}
                                                className={`relative p-3 rounded-2xl border text-left transition-all ${
                                                    binauralMode === beat.id 
                                                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <beat.icon size={16} className={`mb-2 ${binauralMode === beat.id ? 'text-indigo-300' : 'text-white/30'}`} />
                                                <div className={`text-xs font-bold mb-0.5 ${binauralMode === beat.id ? 'text-white' : 'text-white/60'}`}>{beat.label}</div>
                                                <div className="text-[9px] text-white/30 font-mono">{beat.desc}</div>
                                                {!isPremium && <Lock size={12} className="absolute top-3 right-3 text-white/20" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* 🎨 VISUAL TAB */}
                        {tab === 'visual' && (
                            <motion.div 
                                key="visual"
                                variants={containerVariants}
                                initial="hidden" animate="visible" exit="hidden"
                                className="space-y-6"
                            >
                                {/* 👇 [Fix] p-1 추가하여 그림자 잘림 방지 */}
                                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 p-1">
                                    {THEMES.map((theme) => {
                                        const isLocked = !isPremium && theme.id !== 'bamboo';
                                        const isSelected = currentTheme === theme.id;
                                        
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => {
                                                    if (isLocked) return alert("Available for Premium Souls");
                                                    setTheme(theme.id);
                                                }}
                                                // 👇 [Fix] scale-[1.02] 제거하고 ring 효과로 강조
                                                className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]' : 'ring-1 ring-white/10 opacity-80 hover:opacity-100 hover:ring-white/30'}`}
                                            >
                                                {/* Background Preview */}
                                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ background: theme.bgGradient }} />
                                                
                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                
                                                {/* Content */}
                                                <div className="absolute bottom-0 left-0 w-full p-4 text-left">
                                                    <div className="text-white font-serif text-sm tracking-wide mb-1">{theme.name}</div>
                                                    {isSelected && <div className="text-[10px] text-indigo-300 font-bold flex items-center gap-1"><Check size={10} /> ACTIVE</div>}
                                                </div>

                                                {/* Lock */}
                                                {isLocked && (
                                                    <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                                                        <Lock size={14} className="text-white/60" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </motion.div>

                                {/* Notifications Setting (기존 유지) */}
                                <motion.div variants={itemVariants} className="mt-4 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div>
                                            <h4 className="text-sm text-white/90 font-medium mb-1 flex items-center gap-2">
                                                <Bell size={14} className="text-white/50" /> Spirit's Call
                                            </h4>
                                            <p className="text-[10px] text-white/40 leading-relaxed max-w-[180px]">
                                                Allow the spirit to send you whispers and oracle messages.
                                            </p>
                                        </div>
                                        <button
                                            onClick={requestPushPermission}
                                            disabled={pushPermission === 'granted'}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                                pushPermission === 'granted' 
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        >
                                            {pushPermission === 'granted' ? 'Active' : 'Enable'}
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ModalOverlay>
    );
};