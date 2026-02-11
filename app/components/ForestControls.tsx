'use client';

import React, { useState, useEffect, useMemo } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, ShoppingBag, Book, Mail, Sparkles, X, Menu,
    Flame, Send, Image as ImageIcon, Calendar, Disc, Hourglass, Droplets,
    ChevronUp, Zap, Trees, CloudRain, Wind, Settings2
} from 'lucide-react';
import { WeatherType, UserTier } from '../types';
import { SpiritEnergy } from './ui/SpiritEnergy'; 

const MAX_CREDITS_FREE = 5;
const MAX_CREDITS_PAID = 90;

interface ForestDockProps {
    hasCollectedDew?: boolean;
    hasUnreadMail?: boolean;
    credits?: number;  
    progress?: number; 
    userTier?: UserTier; 

    onOpenProfile: () => void;
    onOpenSettings: () => void;
    onOpenShop: () => void;
    onOpenVoice?: () => void;
    onOpenJournal: () => void;
    onOpenMailbox: () => void;
    onOpenFire: () => void;
    onOpenBottle: () => void;
    onOpenGallery: () => void;
    onOpenCalendar: () => void;
    onOpenSpiritCapsules: () => void;
    onOpenCapsule: () => void;
    onCollectDew: () => void;
}

export const MagicSatchel = ({
    hasCollectedDew, hasUnreadMail, credits = 0, progress: externalProgress,
    onOpenProfile, onOpenSettings, onOpenShop, onOpenVoice,
    onOpenJournal, onOpenMailbox, onOpenFire, userTier = 'free', // 기본값 free
    onOpenBottle, onOpenGallery, onOpenCalendar,
    onOpenSpiritCapsules, onOpenCapsule, onCollectDew
}: ForestDockProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // 유효한 유료 회원 여부 판단
    const isPaidUser = userTier === 'premium' || userTier === 'standard';
    const isPremium = userTier === 'premium'; 

    // 🕵️‍♂️ [디버깅 로그] - Console 창을 확인하세요
    useEffect(() => {
        console.log(`[MagicSatchel] Debug Info:`, {
            userTier,           // 들어온 등급 값 (예: 'premium', 'free', undefined)
            isPaidUser,         // 유료 여부 (true/false)
            isPremium,          // 프리미엄 여부 (true/false)
            credits
        });
    }, [userTier, isPaidUser, isPremium, credits]);

    const calculatedProgress = useMemo(() => {
        if (typeof externalProgress === 'number') return externalProgress;
        const maxCredits = isPaidUser ? MAX_CREDITS_PAID : MAX_CREDITS_FREE;
        const percent = (credits / maxCredits) * 100;
        return Math.min(100, Math.max(0, percent)); 
    }, [credits, isPaidUser, externalProgress]);

    // 📋 메뉴 리스트 구성
    const menuItems = useMemo(() => {
        const items = [
            { id: 'profile', icon: User, label: 'Profile', onClick: onOpenProfile },
            { id: 'settings', icon: Settings2, label: 'Settings', onClick: onOpenSettings },
            { id: 'shop', icon: ShoppingBag, label: 'Spirit Shop', onClick: onOpenShop },
            { id: 'voice', icon: Sparkles, label: 'Voice Select', 
                onClick: onOpenVoice || (() => console.warn("No Voice Handler")), special: true 
            },
            
            { id: 'limit', icon: Zap, label: 'Energy', onClick: onOpenShop },
            { id: 'journal', icon: Book, label: 'Journal', onClick: onOpenJournal },

            // Mailbox
            ...(isPaidUser ? [{ 
                id: 'mailbox', icon: Mail, label: 'Mailbox', 
                onClick: onOpenMailbox, badge: hasUnreadMail, special: true 
            }] : []),

            { id: 'calendar', icon: Calendar, label: 'Moods', onClick: onOpenCalendar },
            { id: 'gallery', icon: ImageIcon, label: 'Gallery', onClick: onOpenGallery },
            { id: 'fire', icon: Flame, label: 'Ritual', onClick: onOpenFire, color: 'text-red-300' },
            { id: 'bottle', icon: Send, label: 'Whisper', onClick: onOpenBottle, color: 'text-blue-300' },
            { id: 'spirit', icon: Disc, label: 'Voices', onClick: onOpenSpiritCapsules, color: 'text-indigo-300' },

            // Capsule
            ...(isPaidUser ? [{ 
                id: 'capsule', icon: Hourglass, label: 'Time Capsule', 
                onClick: onOpenCapsule, special: true 
            }] : []),

            ...(!hasCollectedDew ? [{ 
                id: 'dew', icon: Droplets, label: 'Collect Dew', 
                onClick: onCollectDew, color: 'text-cyan-300' 
            }] : [])
        ];

        console.log("[MagicSatchel] Generated Menu Items:", items.map(i => i.id)); // 생성된 메뉴 ID 목록 출력
        return items;
    }, [isPaidUser, hasCollectedDew, hasUnreadMail, userTier]);

    return (
        <div className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center items-end pointer-events-none">
            <div className="pointer-events-auto">
                <motion.div 
                    layout
                    className="flex items-center gap-2 p-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
                    initial={{ width: 56 }}
                    animate={{ width: isOpen ? 'auto' : 56 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <AnimatePresence mode="popLayout">
                        {isOpen && (
                            <motion.div 
                                className="flex items-center gap-1 pr-2 overflow-x-auto no-scrollbar max-w-[90vw] items-center"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {menuItems.map((item) => {
                                    if (item.id === 'limit') {
                                        return (
                                            <div key={item.id} className="shrink-0 mx-1">
                                                <SpiritEnergy 
                                                    progress={calculatedProgress} 
                                                    userTier={userTier} 
                                                    credits={credits}             
                                                    onUpgradeClick={onOpenShop} 
                                                />
                                            </div>
                                        );
                                    }

                                    const specialStyle = item.special 
                                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:bg-amber-500/30"
                                        : (item.color ? `hover:bg-white/10 ${item.color}` : 'text-white/60 hover:text-white hover:bg-white/10');

                                    return (
                                        <motion.button
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onClick();
                                            }}
                                            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all group shrink-0 border border-transparent
                                                ${specialStyle}
                                            `}
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <item.icon size={20} className={`stroke-[1.5] ${item.special ? 'drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : ''}`} />
                                            <span className="absolute -top-10 text-[10px] bg-black/90 border border-white/10 px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse shadow-lg ${typeof item.badge === 'boolean' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                            )}
                                        </motion.button>
                                    );
                                })}
                                <div className="w-px h-6 bg-white/10 mx-2 shrink-0" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        layout
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${isOpen ? 'bg-white/20 text-white' : 'bg-transparent text-white/80 hover:text-white'}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </motion.div>
                    </motion.button>

                </motion.div>
            </div>
        </div>
    );
};

export const MinimalAmbience = ({ currentAmbience, onChangeAmbience }: { currentAmbience: WeatherType, onChangeAmbience: (t: WeatherType) => void }) => {
    // 기존 코드 유지
    const [isExpanded, setIsExpanded] = useState(false);
    const sounds = [
        { id: 'clear', icon: <Trees size={16} /> },
        { id: 'rain', icon: <CloudRain size={16} /> },
        { id: 'ember', icon: <Flame size={16} /> },
        { id: 'snow', icon: <Wind size={16} /> },
    ];
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center gap-2">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="flex gap-1 p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 mb-2 shadow-xl"
                    >
                        {sounds.map((s) => (
                            <button 
                                key={s.id}
                                onClick={() => { onChangeAmbience(s.id as WeatherType); }}
                                className={`p-2.5 rounded-full transition-all ${currentAmbience === s.id ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                            >
                                {s.icon}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/5 rounded-full text-white/60 transition-all active:scale-95 shadow-sm hover:border-white/20"
            >
                {sounds.find(s => s.id === (currentAmbience || 'clear'))?.icon}
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80">Ambience</span>
                <ChevronUp size={12} className={`transition-transform duration-300 opacity-50 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};

interface ForestControlsProps extends ForestDockProps {
    currentAmbience: WeatherType;
    onChangeAmbience: (t: WeatherType) => void;
}

export const ForestControls = (props: ForestControlsProps) => {
    return (
        <>
            <MinimalAmbience 
                currentAmbience={props.currentAmbience} 
                onChangeAmbience={props.onChangeAmbience} 
            />
            <MagicSatchel {...props} />
        </>
    );
};