'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Trash2, Send, Clock, Lock } from 'lucide-react';

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
        onClose();
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

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => { onFinalize('standard', pendingSummary, user.id); resetAndClose(); }} className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 transition-all">
                                <div className="p-3 bg-blue-500/20 rounded-full text-blue-200 group-hover:scale-110 transition-transform"><Send size={20} /></div>
                                <span className="text-white/60 text-[10px] uppercase tracking-wider group-hover:text-white">Release</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (isPremium) {
                                        if (audioBlob) handleSaveCapsule();
                                        else alert("먼저 목소리를 녹음해주세요.");
                                    } else {
                                        alert("성소 멤버십이 필요한 기능입니다.");
                                    }
                                }}
                                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isPremium ? (audioBlob ? 'bg-yellow-500/10 border-yellow-500/50 cursor-pointer' : 'bg-white/5 hover:bg-yellow-500/10 border-white/10 hover:border-yellow-500/30') : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'}`}
                            >
                                <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/20 text-yellow-200' : 'bg-white/5 text-white/20'}`}>
                                    {isPremium ? <Clock size={20} /> : <Lock size={20} />}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider ${isPremium ? 'text-white/60 group-hover:text-white' : 'text-white/20'}`}>
                                    {audioBlob ? "Bury Capsule" : "Time Capsule"}
                                </span>
                            </button>
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={resetAndClose} className="text-white/20 text-[10px] hover:text-white/50 transition-colors uppercase tracking-widest">Discard Memory</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};