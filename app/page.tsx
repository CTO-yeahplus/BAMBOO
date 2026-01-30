// app/page.tsx (전체 업데이트)

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
// @ts-ignore
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';

// --- 배경 그라디언트 ---
const BACKGROUND_COLORS = {
  default: ['from-gray-900', 'via-[#051a05]', 'to-black'],
  loneliness: ['from-blue-950', 'via-indigo-950', 'to-black'],
  anger: ['from-red-950', 'via-orange-950', 'to-black'],
  sadness: ['from-purple-950', 'via-blue-950', 'to-black'],
  selfEsteem: ['from-green-900', 'via-teal-950', 'to-black'],
  family: ['from-brown-950', 'via-gray-950', 'to-black'],
  work: ['from-zinc-950', 'via-slate-950', 'to-black'],
};

const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function BambooForest() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing'>('idle');
  const [currentEmotion, setCurrentEmotion] = useState<keyof typeof BACKGROUND_COLORS>('default');
  const [isMounted, setIsMounted] = useState(false);

  const volumeMotion = useMotionValue(0);
  const springVolume = useSpring(volumeMotion, { stiffness: 300, damping: 30 });
  
  // Framer Motion 변환 값
  const blurValue = useTransform(springVolume, (v) => `blur(${(1 - v) * 10}px)`);
  const opacityValue = useTransform(springVolume, (v) => 1 - v);
  const barWidth = useTransform(springVolume, (v) => `${v * 100}%`);

  const vapiRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null); // [추가] 침묵 타이머

  // 파티클 초기화
  const particles = useMemo<Particle[]>(() => 
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
    })), []);

  // [추가] 침묵 감지 및 정령의 선제 대화 함수
  const startSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    silenceTimerRef.current = setTimeout(() => {
      // 10초간 침묵 시 실행
      if (vapiRef.current && callStatus === 'listening') {
        console.log("🍃 Silence detected. Spirit speaks.");
        // Vapi에게 강제로 말하게 시킴 (대화 유도)
        vapiRef.current.send({
          type: "add-message",
          message: {
            role: "system",
            content: "사용자가 10초 동안 아무 말이 없습니다. '무슨 생각 해?' 혹은 '편하게 숨 쉬어도 돼'라고 짧게 말을 걸어주세요."
          }
        });
      }
    }, 12000); // 12초
  }, [callStatus]);

  const handleVapiEvents = useCallback((vapiInstance: any) => {
    vapiInstance.on('call-start', () => {
      setCallStatus('active');
      startSilenceTimer(); // [추가] 통화 시작 시 타이머 가동

      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current!.animate([{ volume: 0 }, { volume: 0.1 }], { duration: 1000, fill: 'forwards' });
        }).catch(() => console.log("Audio interaction needed"));
      }
    });

    vapiInstance.on('call-end', () => {
      setCallStatus('idle');
      volumeMotion.set(0);
      setCurrentEmotion('default');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); // [추가] 타이머 정리
      if (audioRef.current) audioRef.current.pause();
    });

    vapiInstance.on('volume-level', (volume: number) => {
      volumeMotion.set(Math.min(volume * 2.5, 1));
    });

    // [수정] 사용자가 말을 시작하면 타이머 리셋
    vapiInstance.on('speech-start', () => {
      setCallStatus('listening');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    });

    // [수정] 사용자가 말을 끝내면 타이머는 멈춤 (AI가 대답할 차례니까)
    vapiInstance.on('speech-end', () => setCallStatus('processing'));
    
    vapiInstance.on('assistant-speech-start', () => setCallStatus('speaking'));
    
    // [수정] AI가 말을 끝내면 다시 침묵 타이머 시작
    vapiInstance.on('assistant-speech-end', () => {
      setCallStatus('active'); // active 상태가 곧 listening 대기 상태
      startSilenceTimer();
    });

    vapiInstance.on('error', (e: any) => {
      // 에러 로그는 남기되, 사용자에게는 티내지 않음
      console.error('Vapi Web SDK Warning:', JSON.stringify(e, null, 2));
      // WASM 에러는 무시하고 상태만 유지 (필요 시 idle로 전환)
    });

    vapiInstance.on('structured-output', (output: { type: string; value: any }) => {
      if (output.type === 'primary_struggle_category') {
        const category = output.value as string;
        if (Object.keys(BACKGROUND_COLORS).includes(category.toLowerCase())) {
          setCurrentEmotion(category.toLowerCase() as keyof typeof BACKGROUND_COLORS);
        } else {
          setCurrentEmotion('default');
        }
      }
    });
  }, [volumeMotion, startSilenceTimer]);

  useEffect(() => {
    setIsMounted(true);
    if (!VAPI_PUBLIC_KEY) return;
    
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;
    handleVapiEvents(vapi);

    return () => {
      // [수정] 안전한 종료 처리
      try {
        vapi.stop();
        vapi.removeAllListeners();
      } catch (e) {
        console.warn("Cleanup warning:", e);
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [handleVapiEvents]);

  const toggleCall = () => {
    if (callStatus === 'idle') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); 
      setCallStatus('connecting');
      vapiRef.current?.start(ASSISTANT_ID); 
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); 
      vapiRef.current?.stop();
    }
  };

  const getStatusText = useCallback(() => {
    switch (callStatus) {
      case 'connecting': return "Connecting...";
      case 'active': return "Here with you";
      case 'listening': return "Listening...";
      case 'processing': return "Thinking...";
      case 'speaking': return "Speaking...";
      case 'idle': return "Enter the forest";
      default: return "";
    }
  }, [callStatus]);

  return (
    <main className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none">
      <audio ref={audioRef} src="/sounds/forest_ambience.mp3" loop />
      
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-b ${BACKGROUND_COLORS[currentEmotion].join(' ')}`}
        animate={{ opacity: callStatus === 'idle' ? 0.7 : 1 }}
        transition={{ duration: 2.5 }}
      />

      {isMounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/30 rounded-full"
          style={{ 
            width: p.size, 
            height: p.size, 
            left: `${p.x}%`, 
            top: `${p.y}%`,
            filter: `blur(${p.size / 2}px)`
          }}
          animate={{
            x: [`${p.x}%`, `${p.x + (Math.random() > 0.5 ? 20 : -20)}%`], 
            y: [`${p.y}%`, `${p.y + (Math.random() > 0.5 ? 20 : -20)}%`], 
            opacity: [0, 1, 0], 
            scale: [1, 1 + springVolume.get() * 0.5, 1], 
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div
        className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden"
        style={{ scale: useSpring(useMotionValue(1), { stiffness: 100 }) }}
        animate={{
          scale: 1 + (callStatus !== 'idle' ? 0.05 : 0),
          filter: callStatus === 'idle' ? 'blur(15px) grayscale(100%)' : 'blur(0px) grayscale(0%)',
        }}
      >
        <motion.div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ backdropFilter: blurValue, opacity: opacityValue }}
        />
        <Image src="/images/spirit_forrest.png" alt="Bamboo Spirit" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
      </motion.div>

      <div className="absolute bottom-20 z-30 flex flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          {callStatus === 'idle' ? (
            <motion.button
              key="start-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleCall}
              className="px-10 py-5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl shadow-2xl hover:bg-white/10 transition-all tracking-widest"
            >
              숲으로 입장하기
            </motion.button>
          ) : (
            <motion.div
              key="active-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <button 
                onClick={toggleCall}
                className="group p-5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-500"
              >
                <motion.div animate={{ rotate: callStatus === 'connecting' ? 0 : 90 }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.div>
              </button>

              <div className="flex flex-col items-center gap-2">
                <motion.span 
                  className="text-[10px] font-medium text-green-400/60 tracking-[0.4em] uppercase"
                  animate={callStatus === 'processing' ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {getStatusText()}
                </motion.span>
                <div className="flex gap-1 items-center h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-400/40"
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}