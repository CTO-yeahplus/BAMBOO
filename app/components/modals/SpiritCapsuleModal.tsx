// app/components/modals/SpiritCapsuleModal.tsx
'use client';
import React, { useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Play, Trash2, Clock, Pause, X } from 'lucide-react';

export const SpiritCapsuleModal = ({ isOpen, onClose, capsules, onDelete }: any) => {
    const [playingId, setPlayingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePlay = (capsule: any) => {
        // 브라우저 TTS 사용
        window.speechSynthesis.cancel(); // 기존 음성 중단
        
        const utterance = new SpeechSynthesisUtterance(capsule.text);
        utterance.lang = 'ko-KR'; // 한국어 설정
        utterance.rate = 0.9; // 조금 천천히
        utterance.pitch = 1.0;
        
        // 종료 시 상태 초기화
        utterance.onend = () => setPlayingId(null);
        
        setPlayingId(capsule.id);
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setPlayingId(null);
    };

    return (
        <ModalOverlay onClose={() => { handleStop(); onClose(); }} title="Spirit Whispers">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {capsules.length === 0 ? (
                        <div className="text-center text-white/30 text-xs py-10">
                            "간직하고 싶은 정령의 목소리가 있다면<br/>대화 중에 캡슐 버튼을 눌러보세요."
                        </div>
                    ) : (
                        capsules.map((cap: any) => (
                            <div key={cap.id} className={`p-4 rounded-xl border transition-all ${playingId === cap.id ? 'bg-white/10 border-purple-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{new Date(cap.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => onDelete(cap.id)} className="text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
                                </div>
                                <p className="text-white/80 text-sm font-serif leading-relaxed line-clamp-2 mb-4">"{cap.text}"</p>
                                
                                <button 
                                    onClick={() => playingId === cap.id ? handleStop() : handlePlay(cap)}
                                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${playingId === cap.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                >
                                    {playingId === cap.id ? <><Pause size={12} /> Playing...</> : <><Play size={12} /> Replay Voice</>}
                                </button>
                            </div>
                        ))
                    )}
                </div>
        </ModalOverlay>
    );
};