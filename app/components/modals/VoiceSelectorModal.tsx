'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Leaf, Check, Smile } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 🎭 페르소나 데이터 (4인 + 이미지 추가)
const PERSONAS = [
    {
        id: 'cjVigAj5msChJcoj2', 
        name: 'Deep Forest',
        desc: '깊고 고요한 숲의 지혜',
        message: '"모든 잎사귀가 잠든 밤... 당신의 이야기를 듣습니다."',
        color: 'from-emerald-600 to-teal-800',
        textColor: 'text-emerald-100',
        icon: Leaf,
        // 숲 이미지 (Unsplash 예시)
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
        // 햇살/들판 이미지
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
        // 밤하늘/우주 이미지
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'PLfpgtLkFW07fDYbUiRJ', // 👈 [New] 봉팔 할배 Voice ID
        name: 'Bong Pal',
        desc: '유쾌하고 구수한 옛날 이야기',
        message: '"허허, 왔는가! 어디 한번 재미난 이야기 좀 해보세."',
        color: 'from-yellow-700 to-amber-900',
        textColor: 'text-amber-100',
        icon: Smile,
        // 따뜻한 오두막/시골 이미지
        //imageUrl: 'https://images.unsplash.com/photo-1464166258902-6019a5015b3e?q=80&w=600&auto=format&fit=crop'
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
}

export const VoiceSelectorModal = ({ isOpen, onClose, userId, currentVoiceId, onSelect }: VoiceSelectorProps) => {
    const [justSelected, setJustSelected] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSelect = async (persona: any) => {
        // 1. 선택 효과 (메시지 표시)
        setJustSelected(persona.message);
        onSelect(persona.id);

        // 2. DB 저장 (백그라운드)
        supabase.from('profiles').update({ voice_id: persona.id }).eq('id', userId).then();

        // 3. 2.5초 뒤 모달 닫기 (메시지를 읽을 시간)
        setTimeout(() => {
            setJustSelected(null);
            onClose();
        }, 2500);
    };

    return (
        <ModalOverlay onClose={onClose} title="Soul Resonance" subtitle="Choose the voice that echoes within you">
            <div className="p-4 md:p-6 relative min-h-[450px] flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                    {/* A. 선택 완료 시: 시적인 메시지만 화면 중앙에 표시 */}
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
                        /* B. 선택 전: Bento Grid (2x2) */
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-2 gap-3 w-full"
                        >
                            {PERSONAS.map((persona) => {
                                const isSelected = currentVoiceId === persona.id;
                                const Icon = persona.icon;

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
                                        {/* 1. 배경 이미지 */}
                                        <img 
                                            src={persona.imageUrl} 
                                            alt={persona.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* 2. 오버레이 (텍스트 가독성용) */}
                                        <div className={`absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300`} />
                                        
                                        {/* 3. 그라데이션 오버레이 (하단 텍스트 강조) */}
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
                                                    <div className="bg-white/10 backdrop-blur-md rounded-full p-2">
                                                        <Icon className="w-4 h-4 text-white/80" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 텍스트 정보 */}
                                            <h4 className="text-white font-serif text-lg md:text-xl font-medium tracking-wide drop-shadow-md">
                                                {persona.name}
                                            </h4>
                                            <p className={`text-sm md:text-sm font-light opacity-90 ${persona.textColor} mt-1 line-clamp-2 drop-shadow-sm`}>
                                                {persona.desc}
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