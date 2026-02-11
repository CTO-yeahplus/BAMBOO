'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Leaf, Check, Smile, Lock, User, Music } from 'lucide-react'; // 아이콘 추가
import { createClient } from '@supabase/supabase-js';
import { UserTier } from '../../types';

// 🔒 Premium 전용 보이스 ID 목록 (기존 4개 모두 포함)
const PREMIUM_VOICE_IDS = [
    'cjVigAj5msChJcoj2',      // Deep Forest
    'wMrz30qBeYiSkAtnZGtn',   // Warm Breeze
    'IAETYMYM3nJvjnlkVTKI',   // Mystic Star
    'PLfpgtLkFW07fDYbUiRJ'    // Bong Pal
];

// 🎭 페르소나 데이터 (기본 2종 + 프리미엄 4종)
const PERSONAS = [
    // 👇 1. [New] 기본 남성 음성
    {
        id: 'basic_male_01', 
        name: 'Silent Guardian',
        desc: '차분하고 든든한 숲의 수호자',
        message: '"걱정 마세요. 제가 곁에서 지키고 있겠습니다."',
        color: 'from-slate-600 to-gray-700',
        textColor: 'text-gray-100',
        icon: User,
        imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop' // 차분한 자연 풍경 or 남성적 이미지
    },
    // 👇 2. [New] 기본 여성 음성
    {
        id: 'basic_female_01', 
        name: 'Gentle Whisper',
        desc: '상냥하고 부드러운 바람의 속삭임',
        message: '"당신의 이야기에 귀 기울이고 있어요."',
        color: 'from-rose-400 to-pink-500',
        textColor: 'text-pink-100',
        icon: Music,
        imageUrl: 'https://images.unsplash.com/photo-1516575150278-77136aed6920?q=80&w=600&auto=format&fit=crop' // 부드러운 꽃/자연 이미지
    },
    // 👇 3. Premium 음성들 (이제 잠금 처리됨)
    {
        id: 'cjVigAj5msChJcoj2', 
        name: 'Deep Forest',
        desc: '깊고 고요한 숲의 지혜 (Premium)',
        message: '"모든 잎사귀가 잠든 밤... 당신의 이야기를 듣습니다."',
        color: 'from-emerald-600 to-teal-800',
        textColor: 'text-emerald-100',
        icon: Leaf,
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'wMrz30qBeYiSkAtnZGtn', 
        name: 'Warm Breeze',
        desc: '봄날의 햇살 같은 다정함 (Premium)',
        message: '"괜찮아요. 바람이 당신의 눈물을 닦아줄 거예요."',
        color: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-100',
        icon: Wind,
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'IAETYMYM3nJvjnlkVTKI', 
        name: 'Mystic Star',
        desc: '밤하늘 너머의 신비로움 (Premium)',
        message: '"우리는 모두 별의 조각입니다. 빛을 잃지 마세요."',
        color: 'from-indigo-600 to-purple-800',
        textColor: 'text-indigo-100',
        icon: Sparkles,
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'PLfpgtLkFW07fDYbUiRJ', 
        name: 'Bong Pal',
        desc: '유쾌하고 구수한 옛날 이야기 (Premium)',
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

    if (!isOpen) return null;

    const handleSelect = async (persona: any) => {
        // 🔒 잠금 로직: Premium ID 목록에 있고, 유저가 Premium이 아니면 차단
        const isLocked = PREMIUM_VOICE_IDS.includes(persona.id) && userTier !== 'premium';
        
        if (isLocked) {
            if (confirm(`'${persona.name}' is a Premium voice.\nWould you like to upgrade to unlock?`)) {
                onClose();
                if (onOpenShop) onOpenShop();
            }
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
                                        <img 
                                            src={persona.imageUrl} 
                                            alt={persona.name}
                                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale opacity-50' : ''}`}
                                        />
                                        <div className={`absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300`} />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${persona.color} opacity-40 mix-blend-multiply`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        <div className="absolute inset-0 p-4 flex flex-col justify-end items-start z-10">
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
            </div>
        </ModalOverlay>
    );
};