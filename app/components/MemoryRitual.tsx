'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Trash2, Clock, Lock, Sparkles } from 'lucide-react'; // Sparkles 아이콘 추가

interface MemoryRitualProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isPremium: boolean;
    onFinalize: (type: 'standard' | 'capsule', summary: string, uid: string) => void;
    onSaveCapsule: (audioBlob: Blob, summary: string, unlockDate: string) => Promise<void>;
}

export const MemoryRitual = ({ 
    isOpen, onClose, user, isPremium, onFinalize, onSaveCapsule 
}: MemoryRitualProps) => {
    const [pendingSummary, setPendingSummary] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // [New] Organic Interaction States (꾹 누르기 상태)
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (e) {
            alert("마이크 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSaveCapsule = async () => {
        if (!audioBlob || !user) return;
        // 30일 뒤 잠금 해제
        const unlockDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await onSaveCapsule(audioBlob, pendingSummary || "A whisper from the past", unlockDate);
        resetAndClose();
    };

    const resetAndClose = () => {
        if (isRecording) stopRecording();
        setAudioBlob(null);
        setAudioUrl(null);
        setPendingSummary("");
        setProgress(0);
        setIsHolding(false);
        if (holdTimer.current) clearInterval(holdTimer.current);
        onClose();
    };

    // [New] 꾹 누르기 핸들러 (Hold to Release)
    const handlePressStart = () => {
        // 내용이 없으면 반응하지 않음 (안전장치)
        if (!pendingSummary.trim() && !audioBlob) return; 
        
        setIsHolding(true);
        setProgress(0);

        let tick = 0;
        // 10ms마다 0.5%씩 증가 -> 약 2초 소요 (100 / 0.5 * 10 = 2000ms)
        holdTimer.current = setInterval(() => {
            tick += 0.5;
            setProgress(tick);
            
            // 햅틱 피드백: 게이지가 찰수록 더 자주 진동 (선택 사항)
            if (tick % 20 === 0 && navigator.vibrate) {
                navigator.vibrate(10); 
            }

            if (tick >= 100) {
                // 완료!
                clearInterval(holdTimer.current!);
                handleRelease();
            }
        }, 10);
    };

    const handlePressEnd = () => {
        if (progress < 100) {
            // 중도 포기 (손을 떼거나 마우스가 벗어남) -> 초기화
            setIsHolding(false);
            setProgress(0);
            if (holdTimer.current) clearInterval(holdTimer.current);
        }
    };

    const handleRelease = () => {
        // 전송 성공 효과
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]); // 징-징-징
        
        // 전송 로직 실행
        onFinalize('standard', pendingSummary, user.id);
        resetAndClose();
    };

    return (
        <AnimatePresence>
            {isOpen && user && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-6 pointer-events-auto">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <h3 className="text-white/80 text-lg font-light text-center mb-6 tracking-widest uppercase">Memory Ritual</h3>

                        {/* Recording UI */}
                        {isPremium ? (
                            <div className="mb-6 flex flex-col items-center gap-4">
                                {!audioUrl ? (
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse border-2' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white border'}`}
                                    >
                                        {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <audio src={audioUrl} controls className="h-8 w-48 opacity-70" />
                                        <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="text-white/30 hover:text-white"><Trash2 size={16} /></button>
                                    </div>
                                )}
                                <p className="text-white/30 text-[10px] uppercase tracking-widest">
                                    {isRecording ? "Listening..." : audioUrl ? "Voice Captured" : "Record your echo"}
                                </p>
                            </div>
                        ) : null}

                        <div className="mb-8">
                            <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-2 text-center">Summary of the Soul</label>
                            <textarea 
                                value={pendingSummary} 
                                onChange={(e) => setPendingSummary(e.target.value)} 
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white/90 text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none text-center italic" 
                                rows={3} 
                                placeholder={audioBlob ? "이 목소리에 제목을 붙여주세요..." : "어떤 기억을 남기시겠습니까?"} 
                            />
                        </div>

                        {/* 👇 [Modified] Organic Interaction Area */}
                        <div className="flex flex-col items-center gap-8">
                            
                            {/* Hold-to-Release Button */}
                            <div className="relative group">
                                {/* Charging Glow Effect */}
                                {isHolding && (
                                    <motion.div 
                                        className="absolute inset-0 rounded-full bg-blue-500/40 blur-xl"
                                        initial={{ scale: 1, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 1 }}
                                        transition={{ duration: 2 }} // 2초 동안 커짐
                                    />
                                )}
                                
                                <button
                                    // 마우스/터치 이벤트 바인딩
                                    onMouseDown={handlePressStart}
                                    onMouseUp={handlePressEnd}
                                    onMouseLeave={handlePressEnd}
                                    onTouchStart={handlePressStart}
                                    onTouchEnd={handlePressEnd}
                                    
                                    // 스타일링
                                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden select-none transition-transform active:scale-95"
                                >
                                    {/* Progress Background (차오르는 물) */}
                                    <motion.div 
                                        className="absolute bottom-0 left-0 right-0 bg-blue-500/30 backdrop-blur-sm"
                                        style={{ height: `${progress}%` }}
                                        transition={{ ease: "linear", duration: 0 }} // 즉각 반응
                                    />
                                    
                                    {/* Icon & Text */}
                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                        {progress >= 100 ? (
                                            <Sparkles className="text-white animate-spin" size={28} />
                                        ) : (
                                            <span className="text-2xl drop-shadow-md">🦋</span>
                                        )}
                                        <span className="text-[9px] text-blue-200/80 uppercase tracking-widest font-medium">
                                            {isHolding ? "Holding..." : "Hold"}
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Capsule Button (작게 배치) */}
                            {isPremium && (
                                <button
                                    onClick={() => {
                                        if (audioBlob) handleSaveCapsule();
                                        else alert("먼저 목소리를 녹음해주세요.");
                                    }}
                                    className="flex items-center gap-2 text-xs text-yellow-500/50 hover:text-yellow-500 transition-colors uppercase tracking-widest group"
                                >
                                    {audioBlob ? (
                                        <><Clock size={14} className="group-hover:animate-pulse" /> Bury Time Capsule</>
                                    ) : (
                                        <><Lock size={14} /> Record to bury capsule</>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={resetAndClose} className="text-white/20 text-[10px] hover:text-white/50 transition-colors uppercase tracking-widest">Discard Memory</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};