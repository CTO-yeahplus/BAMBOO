'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Leaf, Check, Smile, Lock, Crown, Star, X, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { UserTier } from '../../types';

// 🎭 페르소나 데이터 (minTier 속성 추가)
// 이제 모든 페르소나는 실제 11Labs ID를 가집니다.
const PERSONAS = [
    {
        id: 'cjVigAj5msChJcoj2', // Silent Guardian
        name: 'Silent Guardian',
        desc: '차분하고 든든한 숲의 수호자',
        minTier: 'free', // 🟢 Free 부터 사용 가능 (기본)
        message: '"걱정 마세요. 제가 곁에서 지키고 있겠습니다."',
        color: 'from-emerald-600 to-teal-800',
        textColor: 'text-emerald-100',
        icon: User,
        imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'wMrz30qBeYiSkAtnZGtn', // Morning Dew
        name: 'Morning Dew',
        desc: '맑고 상쾌한 아침 이슬',
        minTier: 'standard', // 🟡 Standard 이상 사용 가능
        message: '"오늘 하루도 맑게 시작해볼까요?"',
        color: 'from-cyan-500 to-blue-600',
        textColor: 'text-cyan-100',
        icon: Leaf,
        imageUrl: 'https://images.unsplash.com/photo-1515966097209-ec48f3216288?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'IAETYMYM3nJvjnlkVTKI', // Mystic Star
        name: 'Mystic Star',
        desc: '밤하늘 너머의 신비로움',
        minTier: 'premium', // 🟣 Premium 전용
        message: '"우리는 모두 별의 조각입니다. 빛을 잃지 마세요."',
        color: 'from-indigo-600 to-purple-800',
        textColor: 'text-indigo-100',
        icon: Sparkles,
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'PLfpgtLkFW07fDYbUiRJ', // Bong Pal
        name: 'Bong Pal',
        desc: '유쾌하고 구수한 옛날 이야기',
        minTier: 'premium', // 🟣 Premium 전용
        message: '"허허, 왔는가! 어디 한번 재미난 이야기 좀 해보세."',
        color: 'from-yellow-700 to-amber-900',
        textColor: 'text-amber-100',
        icon: Smile,
        imageUrl: '/images/bongpal.png'
    }
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VoiceSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentVoiceId: string;
    onSelect: (id: string) => void;
    userTier: UserTier; 
    onOpenShop?: () => void;
}

export const VoiceSelectorModal = ({ isOpen, onClose, userId, currentVoiceId, onSelect, userTier, onOpenShop }: VoiceSelectorProps) => {
    const [justSelected, setJustSelected] = useState<string | null>(null);
    const [lockedSelection, setLockedSelection] = useState<typeof PERSONAS[0] | null>(null);

    if (!isOpen) return null;

    // 🔐 티어 레벨 계산 헬퍼
    const getTierValue = (tier: string) => {
        if (tier === 'premium') return 3;
        if (tier === 'standard') return 2;
        return 1; // free
    };

    const handleSelect = async (persona: typeof PERSONAS[0]) => {
        const userLevel = getTierValue(userTier);
        const requiredLevel = getTierValue(persona.minTier);
        
        // 🔒 잠금 확인 (내 레벨이 요구 레벨보다 낮으면 잠김)
        const isLocked = userLevel < requiredLevel;
        
        if (isLocked) {
            setLockedSelection(persona);
            return;
        }

        setJustSelected(persona.message);
        onSelect(persona.id);

        supabase.from('profiles').update({ voice_id: persona.id }).eq('id', userId).then();

        setTimeout(() => {
            setJustSelected(null);
            onClose();
        }, 2500);
    };

    const handleUpgrade = () => {
        setLockedSelection(null);
        onClose();
        if (onOpenShop) onOpenShop();
    };

    return (
        <ModalOverlay onClose={onClose} /* title, subtitle 제거 or 유지 */>
            <div className="p-5 md:p-6 relative min-h-[500px] flex flex-col justify-center bg-[#0A0A0A] rounded-3xl overflow-hidden">
                
                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <div>
                        <h2 className="text-2xl font-serif text-white">Select Voice</h2>
                        <p className="text-white/40 text-xs mt-1">당신의 영혼과 공명하는 목소리를 찾으세요</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {justSelected ? (
                        <motion.div
                            key="message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20"
                        >
                            <Sparkles className="w-12 h-12 text-amber-200 mb-6 animate-pulse" />
                            <h3 className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed italic whitespace-pre-line">
                                {justSelected}
                            </h3>
                            <p className="mt-6 text-xs text-white/40 tracking-widest uppercase">
                                연결되었습니다
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full mt-16 overflow-y-auto custom-scrollbar pb-4"
                        >
                            {PERSONAS.map((persona) => {
                                const isSelected = currentVoiceId === persona.id;
                                
                                // 🔒 잠금 상태 계산
                                const userLevel = getTierValue(userTier);
                                const requiredLevel = getTierValue(persona.minTier);
                                const isLocked = userLevel < requiredLevel;
                                
                                const Icon = isLocked ? Lock : persona.icon;

                                return (
                                    <motion.div
                                        key={persona.id}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(persona)}
                                        className={`
                                            relative h-32 md:h-40 rounded-2xl cursor-pointer overflow-hidden group transition-all
                                            border m-1
                                            ${isSelected 
                                                ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)]' 
                                                : 'border-white/10 hover:border-white/30'}
                                        `}
                                    >
                                        {/* Background Image */}
                                        <img 
                                            src={persona.imageUrl} 
                                            alt={persona.name}
                                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 
                                                ${isLocked ? 'grayscale brightness-[0.3]' : 'brightness-[0.6]'}
                                            `}
                                        />
                                        
                                        {/* Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${persona.color} opacity-40 mix-blend-multiply`} />
                                        
                                        {/* Content */}
                                        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                                            <div className="flex justify-between items-start">
                                                {/* 잠금 뱃지 */}
                                                {isLocked ? (
                                                     <div className={`
                                                        px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border
                                                        ${persona.minTier === 'premium' 
                                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                                                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}
                                                     `}>
                                                        {persona.minTier === 'premium' ? <Crown size={10} /> : <Star size={10} />}
                                                        {persona.minTier}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
                                                        <Icon className="w-4 h-4 text-white/90" />
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div className="bg-amber-400 rounded-full p-1 shadow-lg">
                                                        <Check className="w-3 h-3 text-black font-bold" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className={`font-serif text-lg font-medium tracking-wide ${isLocked ? 'text-white/50' : 'text-white'}`}>
                                                    {persona.name}
                                                </h4>
                                                <p className={`text-xs font-light opacity-80 mt-0.5 line-clamp-1 ${isLocked ? 'text-white/40' : 'text-white/80'}`}>
                                                    {isLocked ? `Unlock in ${persona.minTier}` : persona.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✨ Premium Unlock Overlay */}
                <AnimatePresence>
                    {lockedSelection && (
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-0 z-50 flex flex-col"
                        >
                             {/* Background Backdrop with Blur */}
                             <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

                             <div className="relative z-10 w-full h-full flex flex-col p-8 justify-center items-center text-center">
                                <button 
                                    onClick={() => setLockedSelection(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-2 border-white/10 shadow-2xl">
                                    <img src={lockedSelection.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                
                                <h3 className="text-3xl font-serif text-white mb-2">{lockedSelection.name}</h3>
                                <p className="text-white/60 mb-8 max-w-xs mx-auto text-sm">{lockedSelection.desc}</p>

                                <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl p-6 w-full max-w-sm">
                                    <div className="flex items-center gap-3 mb-2 text-amber-400">
                                        {lockedSelection.minTier === 'premium' ? <Crown size={20} /> : <Star size={20} />}
                                        <span className="font-bold text-sm tracking-widest uppercase">{lockedSelection.minTier} Plan Required</span>
                                    </div>
                                    <p className="text-white/70 text-sm text-left leading-relaxed">
                                        이 목소리는 <b>{lockedSelection.minTier}</b> 등급부터 사용할 수 있습니다. 업그레이드하여 더 깊은 대화를 경험하세요.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleUpgrade}
                                    className="mt-8 w-full max-w-sm py-4 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-black font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Sparkles size={18} />
                                    Unlock Now
                                </button>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalOverlay>
    );
};