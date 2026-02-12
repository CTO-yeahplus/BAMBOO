'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Leaf, Check, Smile, Lock, Crown, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { UserTier } from '../../types';

// 🔒 Premium 전용 보이스 ID 목록
const PREMIUM_VOICE_IDS = [
    'PLfpgtLkFW07fDYbUiRJ', // Bong Pal
     'IAETYMYM3nJvjnlkVTKI', // Mystic Star (필요 시 주석 해제하여 잠금)
     'wMrz30qBeYiSkAtnZGtn',

];

const PERSONAS = [
    {
        id: 'cjVigAj5msChJcoj2', 
        name: 'Deep Forest',
        desc: '깊고 고요한 숲의 지혜',
        message: '"모든 잎사귀가 잠든 밤... 당신의 이야기를 듣습니다."',
        color: 'from-emerald-600 to-teal-800',
        textColor: 'text-emerald-100',
        icon: Leaf,
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'wMrz30qBeYiSkAtnZGtn', 
        name: 'Warm Breeze',
        desc: '봄날의 햇살 같은 다정함',
        message: '"괜찮아요. 바람이 당신의 눈물을 닦아줄 거예요."',
        color: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-100',
        icon: Wind,
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'IAETYMYM3nJvjnlkVTKI', 
        name: 'Mystic Star',
        desc: '밤하늘 너머의 신비로움',
        message: '"우리는 모두 별의 조각입니다. 빛을 잃지 마세요."',
        color: 'from-indigo-600 to-purple-800',
        textColor: 'text-indigo-100',
        icon: Sparkles,
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'PLfpgtLkFW07fDYbUiRJ', 
        name: 'Bong Pal',
        desc: '유쾌하고 구수한 옛날 이야기',
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
    //isPremium: boolean;
    userTier: UserTier; // 👈 [New] 유저 등급
    onOpenShop?: () => void; // 👈 [New] 잠긴 항목 클릭 시 상점 열기
}

export const VoiceSelectorModal = ({ isOpen, onClose, userId, currentVoiceId, onSelect, userTier, onOpenShop }: VoiceSelectorProps) => {
    const [justSelected, setJustSelected] = useState<string | null>(null);
    const [lockedSelection, setLockedSelection] = useState<typeof PERSONAS[0] | null>(null);

    if (!isOpen) return null;

    const handleSelect = async (persona: any) => {
        // 🔒 잠금 로직 확인
        const isLocked = PREMIUM_VOICE_IDS.includes(persona.id) && userTier !== 'premium';
        
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
        <ModalOverlay onClose={onClose} title="Soul Resonance" subtitle="Choose the voice that echoes within you">
            <div className="p-4 md:p-6 relative min-h-[450px] flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                    {justSelected ? (
                        <motion.div
                            key="message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20"
                        >
                            <Sparkles className="w-12 h-12 text-amber-200 mb-6 animate-pulse" />
                            <h3 className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed italic whitespace-pre-line">
                                {justSelected}
                            </h3>
                            <p className="mt-6 text-xs text-white/40 tracking-widest uppercase">
                                영혼이 연결되었습니다
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-2 gap-3 w-full"
                        >
                            {PERSONAS.map((persona) => {
                                const isSelected = currentVoiceId === persona.id;
                                // 🔒 잠금 여부 계산
                                const isLocked = PREMIUM_VOICE_IDS.includes(persona.id) && userTier !== 'premium';
                                const Icon = isLocked ? Lock : persona.icon;

                                return (
                                    <motion.div
                                        key={persona.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(persona)}
                                        className={`
                                            relative h-40 sm:h-48 rounded-2xl cursor-pointer overflow-hidden group transition-all
                                            border-2 
                                            ${isSelected 
                                                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                                                : 'border-white/10 hover:border-white/30'}
                                        `}
                                    >
                                        {/* 1. 배경 이미지 (잠겨있으면 흑백 처리) */}
                                        <img 
                                            src={persona.imageUrl} 
                                            alt={persona.name}
                                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale opacity-50' : ''}`}
                                        />
                                        
                                        {/* 2. 오버레이 */}
                                        <div className={`absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300`} />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${persona.color} opacity-40 mix-blend-multiply`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        {/* 4. 컨텐츠 */}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end items-start z-10">
                                            {/* 상단 아이콘 */}
                                            <div className="absolute top-3 right-3">
                                                {isSelected ? (
                                                    <div className="bg-amber-400 rounded-full p-1.5 shadow-lg">
                                                        <Check className="w-4 h-4 text-black font-bold" />
                                                    </div>
                                                ) : (
                                                    <div className={`rounded-full p-2 backdrop-blur-md ${isLocked ? 'bg-black/50' : 'bg-white/10'}`}>
                                                        <Icon className={`w-4 h-4 ${isLocked ? 'text-white/50' : 'text-white/80'}`} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 텍스트 정보 */}
                                            <h4 className={`font-serif text-lg md:text-xl font-medium tracking-wide drop-shadow-md ${isLocked ? 'text-white/60' : 'text-white'}`}>
                                                {persona.name}
                                            </h4>
                                            <p className={`text-sm md:text-sm font-light opacity-90 ${persona.textColor} mt-1 line-clamp-2 drop-shadow-sm`}>
                                                {isLocked ? "Premium Only" : persona.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* ✨ Premium Unlock Overlay (고급스런 구독 유도) */}
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
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
                            
                            {/* Content Layer */}
                            <div className="relative z-10 w-full h-full flex flex-col">
                                {/* Image Area (Top) */}
                                <div className="relative h-[55%] w-full overflow-hidden">
                                    <img 
                                        src={lockedSelection.imageUrl} 
                                        alt={lockedSelection.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${lockedSelection.color} opacity-60 mix-blend-multiply`} />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0A0A0A]" />
                                    
                                    <button 
                                        onClick={() => setLockedSelection(null)}
                                        className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white/80 hover:bg-black/40 backdrop-blur-md transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Details Area (Bottom) */}
                                <div className="flex-1 bg-[#0A0A0A] px-8 pb-10 pt-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Crown size={12} /> Premium Only
                                            </span>
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-serif text-white mb-3">
                                            {lockedSelection.name}
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mb-6 italic">
                                            {lockedSelection.message}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-white/40">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                11Labs High-Fidelity
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <div>Deep Immersion</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-6">
                                        <button 
                                            onClick={handleUpgrade}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-200 to-amber-400 text-black font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                                        >
                                            <Sparkles size={18} />
                                            Unlock Experience
                                        </button>
                                        <button 
                                            onClick={() => setLockedSelection(null)}
                                            className="w-full py-3 text-white/40 hover:text-white text-sm transition-colors"
                                        >
                                            Maybe later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ModalOverlay>
    );
};