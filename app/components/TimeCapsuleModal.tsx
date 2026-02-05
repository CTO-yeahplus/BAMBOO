'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, Square, Play, Save, Calendar, Loader2, Hourglass } from 'lucide-react';

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
            {children}
        </motion.div>
    </motion.div>
);

export const TimeCapsuleModal = ({ isOpen, onClose, onSave }: any) => {
    const [step, setStep] = useState<'record' | 'date'>('record');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setStep('record');
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsRecording(false);
        setIsSaving(false);
        setSelectedDate(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

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
                stream.getTracks().forEach(track => track.stop()); // Stop stream
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Mic access denied:", err);
            alert("마이크 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSave = async () => {
        if (!audioBlob || !selectedDate) return;
        setIsSaving(true);
        // Date Logic
        const today = new Date();
        let unlockDate = new Date();
        
        switch (selectedDate) {
            case 'tomorrow': unlockDate.setDate(today.getDate() + 1); break;
            case 'week': unlockDate.setDate(today.getDate() + 7); break;
            case 'month': unlockDate.setMonth(today.getMonth() + 1); break;
            case 'year': unlockDate.setFullYear(today.getFullYear() + 1); break;
        }

        await onSave(audioBlob, "Time Capsule", unlockDate.toISOString());
        setIsSaving(false);
        onClose();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-yellow-500/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-yellow-200/90 text-lg font-serif italic flex items-center gap-2">
                        <Hourglass size={18} className="text-yellow-500" />
                        Voice Time Capsule
                    </h2>
                    <button onClick={onClose}><X className="text-white/30 hover:text-white" /></button>
                </div>

                {/* Content */}
                <div className="relative z-10 min-h-[250px] flex flex-col items-center justify-center">
                    {step === 'record' ? (
                        <>
                            {!audioBlob ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-white/10 bg-white/5'}`}>
                                        <button 
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className="w-full h-full flex items-center justify-center rounded-full"
                                        >
                                            {isRecording ? <Square size={32} className="text-red-400 fill-red-400" /> : <Mic size={32} className="text-white/50" />}
                                        </button>
                                    </div>
                                    <p className="text-white/60 font-mono text-xl">{formatTime(recordingTime)}</p>
                                    <p className="text-white/30 text-xs">미래의 나에게 목소리를 남기세요.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 w-full">
                                    <div className="w-full bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/10">
                                        <button onClick={() => audioPlayerRef.current?.play()} className="p-3 bg-yellow-500/20 rounded-full text-yellow-200 hover:bg-yellow-500/30">
                                            <Play size={20} fill="currentColor" />
                                        </button>
                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500/50 w-full animate-pulse" />
                                        </div>
                                        <audio ref={audioPlayerRef} src={audioUrl!} className="hidden" />
                                    </div>
                                    <div className="flex gap-4 w-full">
                                        <button onClick={() => { setAudioBlob(null); setRecordingTime(0); }} className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:bg-white/5 text-sm">재녹음</button>
                                        <button onClick={() => setStep('date')} className="flex-1 py-3 bg-yellow-600/20 border border-yellow-500/30 rounded-xl text-yellow-200 hover:bg-yellow-600/30 text-sm font-medium">다음</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex flex-col gap-4">
                            <p className="text-center text-white/60 text-sm mb-2">언제 이 기억을 열어볼까요?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'tomorrow', label: '내일', sub: 'Tomorrow' },
                                    { id: 'week', label: '일주일 뒤', sub: 'Next Week' },
                                    { id: 'month', label: '한 달 뒤', sub: 'Next Month' },
                                    { id: 'year', label: '일 년 뒤', sub: 'Next Year' }
                                ].map((opt) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => setSelectedDate(opt.id)}
                                        className={`p-4 rounded-xl border transition-all text-left ${selectedDate === opt.id ? 'bg-yellow-500/20 border-yellow-500/50 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                    >
                                        <span className="block text-sm font-bold">{opt.label}</span>
                                        <span className="block text-[10px] opacity-50 uppercase tracking-wider">{opt.sub}</span>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={!selectedDate || isSaving}
                                className="mt-4 w-full py-4 bg-yellow-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                묻어두기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ModalOverlay>
    );
};