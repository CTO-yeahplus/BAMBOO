'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { ChevronLeft, ChevronRight, Share2, Sparkles, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryRecord {
    id: number;
    user_id: string;
    summary: string;
    created_at: string;
    emotion: string;
}

interface SoulCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentYear: number;
    currentMonth: number;
    memories: MemoryRecord[]; 
    onMonthChange: (year: number, month: number) => void;
    onShare: (type: 'calendar' | 'letter', data: any) => void;
    currentUser?: any;
}

export const SoulCalendarModal = ({ 
    isOpen, 
    onClose, 
    currentYear, 
    currentMonth, 
    onMonthChange, 
    memories = [], 
    onShare,
    currentUser
}: SoulCalendarModalProps) => {
    
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [direction, setDirection] = useState(0);

    // 1. 내 기록만 안전하게 필터링
    const myMemories = useMemo(() => {
        if (!memories) return [];
        if (!currentUser) return memories; 
        return memories.filter(m => m.user_id === currentUser.id);
    }, [memories, currentUser]);

    // 2. 달력 데이터 계산
    const calendarData = useMemo(() => {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const startDay = new Date(currentYear, currentMonth - 1, 1).getDay();
        
        const prevMonthDays = Array.from({ length: startDay }, (_, i) => ({ type: 'prev', day: i }));
        const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({ type: 'current', day: i + 1 }));
        
        const totalSlots = 42; 
        const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays.length);
        const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => ({ type: 'next', day: i + 1 }));

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }, [currentYear, currentMonth]);

    // 3. 날짜 비교 로직
    const getRecordForDate = (day: number) => {
        if (!myMemories) return undefined;
        const targetDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return myMemories.find(m => {
            const dbDate = new Date(m.created_at);
            const localY = dbDate.getFullYear();
            const localM = String(dbDate.getMonth() + 1).padStart(2, '0');
            const localD = String(dbDate.getDate()).padStart(2, '0');
            return `${localY}-${localM}-${localD}` === targetDateStr;
        });
    };

    // 4. 선택된 기록 찾기
    const selectedRecord = useMemo(() => {
        if (!selectedDate) return null;
        return myMemories?.find(m => {
            const dbDate = new Date(m.created_at);
            const localY = dbDate.getFullYear();
            const localM = String(dbDate.getMonth() + 1).padStart(2, '0');
            const localD = String(dbDate.getDate()).padStart(2, '0');
            return `${localY}-${localM}-${localD}` === selectedDate;
        });
    }, [selectedDate, myMemories]);

    if (!isOpen) return null;

    // --- Handlers ---
    const handlePrev = (e: React.MouseEvent) => { 
        e.preventDefault(); e.stopPropagation(); 
        setDirection(-1); setSelectedDate(null);
        onMonthChange(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth === 1 ? 12 : currentMonth - 1); 
    };
    const handleNext = (e: React.MouseEvent) => { 
        e.preventDefault(); e.stopPropagation(); 
        setDirection(1); setSelectedDate(null);
        onMonthChange(currentMonth === 12 ? currentYear + 1 : currentYear, currentMonth === 12 ? 1 : currentMonth + 1); 
    };
    
    // 👇 [Fix] 공유하기 핸들러 수정
    const handleShare = () => {
        // 1. 이번 달 데이터만 정확히 필터링 & 날짜순 정렬 (1일 -> 31일)
        const monthMemories = (myMemories || [])
            .filter(m => {
                const date = new Date(m.created_at);
                return date.getFullYear() === currentYear && (date.getMonth() + 1) === currentMonth;
            })
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // 오름차순 정렬

        // 2. 통계 계산
        const stats = { happy: 0, sadness: 0, anger: 0, loneliness: 0, neutral: 0, total: 0 };
        monthMemories.forEach(m => {
            const emotion = (m.emotion || 'neutral') as keyof typeof stats;
            if (stats[emotion] !== undefined) stats[emotion]++;
            else stats.neutral++;
            stats.total++;
        });

        // 3. 지배적 감정
        let max = 0; let dominant = 'neutral';
        Object.entries(stats).forEach(([key, val]) => { if (key !== 'total' && val > max) { max = val; dominant = key; } });
        if (stats.total === 0) dominant = 'neutral'; 

        onClose();
        setTimeout(() => { 
            onShare('calendar', { 
                year: currentYear, 
                month: currentMonth, 
                stats, 
                dominant,
                memories: monthMemories // 👈 필터링 및 정렬된 데이터 전달
            }); 
        }, 300);
    };

    const getMoodVisuals = (emotion: string) => {
        switch (emotion?.toLowerCase()) {
            case 'happy': return 'bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_20px_rgba(234,179,8,0.6)] ring-1 ring-yellow-200';
            case 'sadness': return 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-1 ring-blue-300';
            case 'anger': return 'bg-gradient-to-br from-red-400 to-rose-700 shadow-[0_0_20px_rgba(239,68,68,0.6)] ring-1 ring-red-300';
            case 'loneliness': return 'bg-gradient-to-br from-purple-400 to-violet-700 shadow-[0_0_20px_rgba(168,85,247,0.6)] ring-1 ring-purple-300';
            default: return 'bg-white/10 border border-white/20';
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 })
    };

    return (
        <ModalOverlay onClose={onClose} title="Emotion Map" subtitle="Constellation of your soul"> 
            <div className="flex flex-col h-full max-h-[85vh] pointer-events-auto w-full px-2 pb-2 relative min-w-[320px]">

                <div className="flex-shrink-0 mb-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg relative z-20 flex justify-between items-center">
                    <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"><ChevronLeft size={20} /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-white font-serif text-lg font-bold tracking-widest flex items-center gap-2">
                             {String(currentMonth).padStart(2, '0')} <span className="text-white/30 text-xs font-sans font-normal">/ {currentYear}</span>
                        </span>
                    </div>
                    <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"><ChevronRight size={20} /></button>
                </div>

                <div className="flex-shrink-0 px-2">
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className={`text-[9px] font-bold tracking-widest ${i === 0 ? 'text-red-400/50' : 'text-white/30'}`}>{d}</div>
                        ))}
                    </div>

                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div 
                            key={`${currentYear}-${currentMonth}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.3, type: "spring" }}
                            className="grid grid-cols-7 gap-1.5"
                        >
                            {calendarData.map((slot, i) => {
                                if (slot.type !== 'current') return <div key={i} className="aspect-square rounded-full opacity-0" />; 

                                const day = slot.day as number;
                                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const record = getRecordForDate(day);
                                const isSelected = selectedDate === dateStr;

                                return (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (record) setSelectedDate(dateStr);
                                        }}
                                        className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all duration-300 relative group
                                            ${record ? getMoodVisuals(record.emotion) : 'text-white/10 hover:bg-white/5'}
                                            ${isSelected ? 'ring-2 ring-white scale-105 z-20' : ''}
                                        `}
                                    >
                                        <span className={`relative z-10 ${record ? 'text-white drop-shadow-sm' : 'text-white/30'}`}>{day}</span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex-1 mt-2 min-h-0 overflow-hidden px-1">
                    <AnimatePresence mode="wait">
                        {selectedRecord ? (
                            <motion.div
                                key={selectedRecord.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-full bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col relative overflow-hidden group"
                            >
                                <div className="flex items-center gap-2 mb-2 z-10 flex-shrink-0">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getMoodVisuals(selectedRecord.emotion)}`}>
                                        <Sparkles size={10} className="text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-white/40 uppercase tracking-wider">
                                            {new Date(selectedRecord.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-white font-serif text-xs font-bold capitalize">
                                            {selectedRecord.emotion}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    <Quote size={10} className="text-white/20 mb-1" />
                                    <p className="text-white/80 text-[11px] leading-relaxed font-serif italic">
                                        "{selectedRecord.summary}"
                                    </p>
                                </div>
                                
                                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[40px] opacity-20 transition-colors duration-500
                                    ${selectedRecord.emotion === 'happy' ? 'bg-yellow-500' : 
                                      selectedRecord.emotion === 'sadness' ? 'bg-blue-500' : 
                                      selectedRecord.emotion === 'anger' ? 'bg-red-500' : 'bg-purple-500'}`} 
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-white/20 border border-white/5 rounded-2xl bg-black/20"
                            >
                                <p className="text-[10px] tracking-widest uppercase mb-2">Select a glowing star</p>
                                <div className="flex gap-2 opacity-50">
                                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                                    <div className="w-1 h-1 rounded-full bg-red-400" />
                                    <div className="w-1 h-1 rounded-full bg-purple-400" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/5 w-full flex justify-center flex-shrink-0">
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
                        className="group relative px-5 py-2 rounded-full bg-white text-black font-bold text-[10px] tracking-widest uppercase hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    >
                        <span className="flex items-center gap-1.5">
                            <Share2 size={12} /> 
                            Share Artifact
                        </span>
                    </button>
                </div>

            </div>
        </ModalOverlay>
    );
};