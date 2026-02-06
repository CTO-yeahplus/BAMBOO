'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, X, Flame, Hourglass, Image as ImageIcon, 
    Send, Droplets, Mail, ChevronUp, Trees, CloudRain, Wind, Calendar
} from 'lucide-react';
import { WeatherType } from '../types';

// 1. 통합 액션 메뉴 (우측 하단)
export const MagicSatchel = ({ 
    onOpenFire, onOpenBottle, onOpenCapsule, onOpenGallery, onOpenMailbox, onCollectDew,
    hasCollectedDew, isPremium, onOpenCalendar
}: any) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { id: 'fire', icon: <Flame size={20} />, label: 'Ritual', action: onOpenFire, color: 'bg-red-500/20 text-red-200' },
        { id: 'bottle', icon: <Send size={20} />, label: 'Whisper', action: onOpenBottle, color: 'bg-blue-500/20 text-blue-200' },
        { id: 'mailbox', icon: <Mail size={20} />, label: 'Letter', action: onOpenMailbox, color: 'bg-yellow-500/20 text-yellow-200' },
        { id: 'gallery', icon: <ImageIcon size={20} />, label: 'Gallery', action: onOpenGallery, color: 'bg-purple-500/20 text-purple-200' },
        { id: 'calendar', icon: <Calendar size={20} />, label: 'Moods', action: onOpenCalendar, color: 'bg-green-500/20 text-green-200' }, // [New]
    ];

    if (isPremium) {
        menuItems.push({ id: 'capsule', icon: <Hourglass size={20} />, label: 'Capsule', action: onOpenCapsule, color: 'bg-amber-500/20 text-amber-200' });
    }

    if (!hasCollectedDew) {
        menuItems.unshift({ id: 'dew', icon: <Droplets size={20} />, label: 'Dew', action: onCollectDew, color: 'bg-cyan-500/20 text-cyan-200' });
    }

    return (
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-3 pointer-events-auto">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ staggerChildren: 0.05 }}
                        className="flex flex-col gap-3 items-end mb-2"
                    >
                        {menuItems.map((item) => (
                            <motion.div key={item.id} className="flex items-center gap-3">
                                <span className="text-white/80 text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm shadow-sm">{item.label}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { item.action(); setIsOpen(false); }}
                                    className={`p-3 rounded-full backdrop-blur-xl border border-white/10 shadow-lg ${item.color}`}
                                >
                                    {item.icon}
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full backdrop-blur-xl border shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-45' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
            >
                <Plus size={24} />
            </motion.button>
        </div>
    );
};

// 2. 미니멀 앰비언스 플레이어 (하단 중앙)
export const MinimalAmbience = ({ currentAmbience, onChangeAmbience }: { currentAmbience: WeatherType, onChangeAmbience: (t: WeatherType) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const sounds = [
        { id: 'clear', icon: <Trees size={18} /> },
        { id: 'rain', icon: <CloudRain size={18} /> },
        { id: 'ember', icon: <Flame size={18} /> },
        { id: 'snow', icon: <Wind size={18} /> },
    ];

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center gap-2">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="flex gap-2 p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 mb-2"
                    >
                        {sounds.map((s) => (
                            <button 
                                key={s.id}
                                onClick={() => { onChangeAmbience(s.id as WeatherType); }}
                                className={`p-3 rounded-full transition-all ${currentAmbience === s.id ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                            >
                                {s.icon}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/70 transition-all active:scale-95"
            >
                {sounds.find(s => s.id === (currentAmbience || 'clear'))?.icon}
                <span className="text-xs uppercase tracking-widest font-medium">Ambience</span>
                <ChevronUp size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};