'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Leaf, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 실제 11Labs ID로 교체해주세요
const PERSONAS = [
    {
        id: 'cjVigAj5msChJcoj2', 
        name: 'Deep Forest',
        desc: '깊고 고요한 숲의 지혜',
        message: '"모든 잎사귀가 잠든 밤... 당신의 이야기를 듣습니다."',
        color: 'from-emerald-600 to-teal-800',
        icon: Leaf
    },
    {
        id: 'JBFqnCBsd6RMkjVDRZzb', 
        name: 'Warm Breeze',
        desc: '봄날의 햇살 같은 다정함',
        message: '"괜찮아요. 바람이 당신의 눈물을 닦아줄 거예요."',
        color: 'from-amber-500 to-orange-600',
        icon: Wind
    },
    {
        id: 'EXAVOICEID_3', 
        name: 'Mystic Star',
        desc: '밤하늘 너머의 신비로움',
        message: '"우리는 모두 별의 조각입니다. 빛을 잃지 마세요."',
        color: 'from-indigo-600 to-purple-800',
        icon: Sparkles
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
            <div className="p-6 relative min-h-[400px] flex flex-col justify-center">
                
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
                            <Sparkles className="w-10 h-10 text-amber-200 mb-6 animate-pulse" />
                            <h3 className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed italic">
                                {justSelected}
                            </h3>
                            <p className="mt-4 text-xs text-white/40 tracking-widest uppercase">
                                영혼이 연결되었습니다
                            </p>
                        </motion.div>
                    ) : (
                        /* B. 선택 전: 카드 리스트 표시 */
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-4 w-full"
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
                                        className={`relative p-4 rounded-xl border cursor-pointer overflow-hidden group transition-all
                                            ${isSelected 
                                                ? 'bg-white/10 border-amber-500/30' 
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                        `}
                                    >
                                        {/* 배경 그라데이션 */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${persona.color} transition-opacity duration-500`} />
                                        
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${persona.color} shadow-lg`}>
                                                <Icon className="text-white w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-serif text-lg">{persona.name}</h4>
                                                <p className="text-white/40 text-xs">{persona.desc}</p>
                                            </div>
                                            {isSelected && <Check className="text-amber-400 w-5 h-5" />}
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