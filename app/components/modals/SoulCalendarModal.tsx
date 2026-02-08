// app/components/modals/SoulCalendarModal.tsx

'use client';
import React from 'react';
import { ModalOverlay } from './ModalOverlay';
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react'; // X 아이콘 확인
import { DailyMood } from '../../types';

interface SoulCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentYear: number;
    currentMonth: number;
    moods: DailyMood[];
    onMonthChange: (year: number, month: number) => void;
    onShare: (type: 'calendar' | 'letter', data: any) => void;
}

export const SoulCalendarModal = ({ 
    isOpen, 
    onClose, 
    currentYear, 
    currentMonth, 
    onMonthChange, 
    moods,
    onShare 
}: SoulCalendarModalProps) => {
    if (!isOpen) return null;


    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); onMonthChange(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth === 1 ? 12 : currentMonth - 1); };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); onMonthChange(currentMonth === 12 ? currentYear + 1 : currentYear, currentMonth === 12 ? 1 : currentMonth + 1); };
    // 👇 [Fix] 공유 버튼 클릭 시: 통계 데이터를 계산해서 함께 보냅니다!
    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // 1. 감정 통계 초기화
        const stats = {
            happy: 0,
            sadness: 0,
            anger: 0,
            loneliness: 0,
            neutral: 0,
            total: 0
        };

        // 2. [중요] 문자열 비교 대신, 날짜를 숫자로 쪼개서 정확히 비교
        // 예: "2026-02-07" -> year:2026, month:2
        moods.forEach(m => {
            const [y, mon] = m.date.split('-').map(Number); // 연, 월 추출
            
            if (y === currentYear && mon === currentMonth) {
                // 해당 월의 데이터가 맞다면 카운트
                if (stats[m.dominantEmotion as keyof typeof stats] !== undefined) {
                    stats[m.dominantEmotion as keyof typeof stats]++;
                } else {
                    stats.neutral++; // 예외 처리
                }
                stats.total++;
            }
        });

        // 3. 가장 많이 느낀 감정 (Dominant) 찾기
        let max = 0;
        let dominant = 'neutral';
        
        // stats 객체를 순회하며 최대값 찾기 (total 제외)
        Object.entries(stats).forEach(([key, val]) => {
            if (key !== 'total' && val > max) {
                max = val;
                dominant = key;
            }
        });
        
        // 기록이 하나도 없는데 공유를 눌렀을 때의 방어 코드
        if (stats.total === 0) {
            dominant = 'neutral'; 
            // alert("이번 달 기록이 없지만, 빈 서식을 공유합니다.");
        }

        console.log(`📊 Stats Calculated for ${currentYear}-${currentMonth}:`, stats);
        
        // 4. 데이터 전송
        onShare('calendar', { 
            year: currentYear, 
            month: currentMonth, 
            stats,      
            dominant    
        });
        onClose();
    };
    // Days Calculation
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const startDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const blanks = Array.from({ length: startDay }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mood Color Logic
    const getMoodColor = (day: number) => {
        const targetDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = moods.find((m) => m.date === targetDate);
        if (!record) return 'bg-white/5 text-white/30';
        switch (record.dominantEmotion) {
            case 'happy': return 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.6)] font-bold';
            case 'sadness': return 'bg-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.6)] font-bold';
            case 'anger': return 'bg-red-400 text-white shadow-[0_0_15px_rgba(248,113,113,0.6)] font-bold';
            case 'loneliness': return 'bg-purple-400 text-white shadow-[0_0_15px_rgba(192,132,252,0.6)] font-bold';
            default: return 'bg-white/20 text-white';
        }
    };

    return (
        <ModalOverlay onClose={onClose} title=""> 
        
            <div className="p-6 relative z-50 pointer-events-auto min-w-[320px]">

                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                    <button onClick={handlePrev} className="p-2 hover:bg-white/20 rounded-full"><ChevronLeft className="text-white" /></button>
                    <span className="text-white font-serif text-2xl font-bold tracking-widest">{currentYear}. {String(currentMonth).padStart(2, '0')}</span>
                    <button onClick={handleNext} className="p-2 hover:bg-white/20 rounded-full"><ChevronRight className="text-white" /></button>
                </div>

                {/* 달력 그리드 */}
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-xs text-white/50 font-bold">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-3 mb-6">
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(d => (
                        <div key={d} className={`aspect-square rounded-xl flex items-center justify-center text-sm cursor-pointer ${getMoodColor(d)}`}>
                            {d}
                        </div>
                    ))}
                </div>
                
                {/* 하단 공유 버튼 */}
                <div className="flex justify-center border-t border-white/10 pt-4">
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-500/80 hover:bg-indigo-500 px-6 py-3 rounded-full shadow-lg transition-all active:scale-95"
                    >
                        <Share2 size={18} /> Share Mood
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};