'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Square, Play, Save, Calendar, Loader2, Hourglass, Sparkles, Sun, Moon, TreeDeciduous, ArrowRight, RotateCcw } from 'lucide-react';
import { ModalOverlay } from './modals/ModalOverlay'; // 공통 모달 오버레이 사용

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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 모달이 닫히거나 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            setStep('record');
            setAudioBlob(null);
            setAudioUrl(null);
            setRecordingTime(0);
            setSelectedDate(null);
        } else {
            handleReset();
        }
    }, [isOpen]);

    const handleReset = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveCapsule = async () => {
        if (!audioBlob || !selectedDate) return;
        setIsSaving(true);
        
        const now = new Date();
        let unlockDate = new Date();

        switch (selectedDate) {
            case 'tomorrow': unlockDate.setDate(now.getDate() + 1); break;
            case 'week': unlockDate.setDate(now.getDate() + 7); break;
            case 'month': unlockDate.setMonth(now.getMonth() + 1); break;
            case 'year': unlockDate.setFullYear(now.getFullYear() + 1); break;
        }

        await onSave(audioBlob, unlockDate);
        setIsSaving(false);
        onClose();
    };

    const timeOptions = [
        { id: 'tomorrow', label: 'Tomorrow', sub: '24 Hours', icon: Sun, color: 'text-orange-400' },
        { id: 'week', label: 'Next Week', sub: '7 Days', icon: Calendar, color: 'text-blue-400' },
        { id: 'month', label: 'Next Month', sub: '30 Days', icon: Moon, color: 'text-purple-400' },
        { id: 'year', label: 'Next Year', sub: '365 Days', icon: TreeDeciduous, color: 'text-green-400' },
    ];

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} title="Time Capsule" subtitle="Buried in time">
            <div className="relative w-full max-w-[320px] mx-auto min-h-[400px] flex flex-col">
                
                <AnimatePresence mode="wait">
                    {/* STEP 1: RECORDING */}
                    {step === 'record' && (
                        <motion.div 
                            key="record"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center justify-between h-full py-4"
                        >
                            {/* Visualizer Area */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                                {!audioUrl ? (
                                    // Recording State
                                    <div className="relative">
                                        {/* Pulse Effect */}
                                        {isRecording && (
                                            <>
                                                <motion.div 
                                                    className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl"
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                                <motion.div 
                                                    className="absolute inset-0 bg-amber-400/20 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                            </>
                                        )}
                                        
                                        {/* Mic Button */}
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 ${
                                                isRecording 
                                                ? 'bg-red-500/90 border-red-400 text-white scale-110' 
                                                : 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-200 text-black hover:scale-105'
                                            }`}
                                        >
                                            {isRecording ? <Square fill="currentColor" size={32} /> : <Mic size={36} />}
                                        </button>
                                    </div>
                                ) : (
                                    // Preview State
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-full flex flex-col items-center gap-6"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse">
                                            <Hourglass size={36} className="text-black spin-slow" />
                                        </div>
                                        <audio ref={audioRef} src={audioUrl} controls className="hidden" />
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => audioRef.current?.play()}
                                                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-all border border-white/10"
                                            >
                                                <Play size={16} fill="currentColor" /> Preview
                                            </button>
                                            <button 
                                                onClick={handleReset}
                                                className="px-6 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-all border border-red-500/10"
                                            >
                                                <RotateCcw size={16} /> Retry
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Timer & Helper Text */}
                                <div className="mt-8 text-center space-y-2">
                                    <div className="text-3xl font-mono font-bold text-amber-200 tracking-wider">
                                        {formatTime(recordingTime)}
                                    </div>
                                    <p className="text-xs text-white/40 uppercase tracking-widest">
                                        {isRecording ? "Recording Soul Fragment..." : !audioUrl ? "Tap to record voice" : "Fragment Captured"}
                                    </p>
                                </div>
                            </div>

                            {/* Next Button */}
                            {audioUrl && (
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    onClick={() => setStep('date')}
                                    className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    Select Unlock Time <ArrowRight size={16} />
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: DATE SELECTION */}
                    {step === 'date' && (
                        <motion.div 
                            key="date"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col h-full py-2"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-serif text-white/90">When shall it awaken?</h3>
                                <p className="text-xs text-white/40">Choose a moment in the future</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {timeOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedDate(opt.id)}
                                        className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 text-center group ${
                                            selectedDate === opt.id 
                                            ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-full bg-white/5 ${selectedDate === opt.id ? 'text-amber-400' : opt.color}`}>
                                            <opt.icon size={20} />
                                        </div>
                                        <div>
                                            <span className={`block text-sm font-bold ${selectedDate === opt.id ? 'text-white' : 'text-white/70'}`}>
                                                {opt.label}
                                            </span>
                                            <span className="block text-[10px] text-white/30 uppercase tracking-wider mt-1">
                                                {opt.sub}
                                            </span>
                                        </div>
                                        {selectedDate === opt.id && (
                                            <motion.div layoutId="glow" className="absolute inset-0 rounded-2xl ring-2 ring-amber-500/50" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto space-y-3">
                                <button 
                                    onClick={handleSaveCapsule}
                                    disabled={!selectedDate || isSaving}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    Bury Capsule
                                </button>
                                <button 
                                    onClick={() => setStep('record')}
                                    className="w-full py-3 text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
                                >
                                    Back to Recording
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalOverlay>
    );
};