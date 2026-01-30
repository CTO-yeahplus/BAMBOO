'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
// @ts-ignore
import Vapi from '@vapi-ai/web';
import { v4 as uuidv4 } from 'uuid';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';

// --- [Step 1] 시간대별 배경 테마 정의 ---
const TIME_THEMES = {
  dawn: ['from-slate-900', 'via-purple-900', 'to-black'],      // 새벽 (05~07)
  day: ['from-sky-900', 'via-emerald-900', 'to-black'],        // 낮 (07~17)
  sunset: ['from-orange-950', 'via-red-950', 'to-black'],      // 노을 (17~20)
  night: ['from-gray-900', 'via-[#051a05]', 'to-black'],       // 밤 (20~05)
};

// 감정별 배경 (감정이 감지되면 시간보다 우선됨)
const EMOTION_COLORS = {
  loneliness: ['from-blue-950', 'via-indigo-950', 'to-black'],
  anger: ['from-red-950', 'via-orange-950', 'to-black'],
  sadness: ['from-purple-950', 'via-blue-950', 'to-black'],
  selfEsteem: ['from-green-900', 'via-teal-950', 'to-black'],
  family: ['from-brown-950', 'via-gray-950', 'to-black'],
  work: ['from-zinc-950', 'via-slate-950', 'to-black'],
};

// 파티클 인터페이스
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function BambooForest() {
  // --- 상태 관리 ---
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing'>('idle');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(TIME_THEMES.night); // 초기값은 밤
  const [isMounted, setIsMounted] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null); // [Step 2] 정령의 편지 메시지
  const [userId, setUserId] = useState<string>(''); // [추가] 사용자 ID

  // --- 애니메이션 값 ---
  const volumeMotion = useMotionValue(0);
  const springVolume = useSpring(volumeMotion, { stiffness: 300, damping: 30 });
  const blurValue = useTransform(springVolume, (v) => `blur(${(1 - v) * 10}px)`);
  const opacityValue = useTransform(springVolume, (v) => 1 - v);
  const barWidth = useTransform(springVolume, (v) => `${v * 100}%`);

  const vapiRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- 파티클 초기화 ---
  const particles = useMemo<Particle[]>(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
    })), []);

  // --- [Step 1] 시간대 체크 함수 ---
  const checkTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    let theme = TIME_THEMES.night;

    if (hour >= 5 && hour < 7) theme = TIME_THEMES.dawn;
    else if (hour >= 7 && hour < 17) theme = TIME_THEMES.day;
    else if (hour >= 17 && hour < 20) theme = TIME_THEMES.sunset;
    else theme = TIME_THEMES.night;

    setBackgroundGradient(theme);
  }, []);

  // --- Vapi 이벤트 핸들러 ---
  const handleVapiEvents = useCallback((vapiInstance: any) => {
    vapiInstance.on('call-start', () => {
      setCallStatus('active');
      setSpiritMessage(null); // 통화 시작하면 메시지 초기화
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
      checkTimeOfDay(); // 통화 끝나면 다시 시간 기반 배경으로 복귀
      if (audioRef.current) audioRef.current.pause();

      // [Step 2] 통화 종료 시 감성 메시지 출력 (랜덤 혹은 분석 기반)
      const messages = [
        "바람이 짐을 가져갔기를...",
        "언제든 다시 찾아와. 숲은 여기 있으니까.",
        "오늘 밤은 편안하게 잠들 거야.",
        "너는 혼자가 아니야.",
        "깊은 숨을 쉬어봐. 숲의 향기가 날 거야."
      ];
      setSpiritMessage(messages[Math.floor(Math.random() * messages.length)]);
    });

    vapiInstance.on('volume-level', (volume: number) => {
      volumeMotion.set(Math.min(volume * 2.5, 1));
    });

    vapiInstance.on('speech-start', () => setCallStatus('listening'));
    vapiInstance.on('speech-end', () => setCallStatus('processing'));
    vapiInstance.on('assistant-speech-start', () => setCallStatus('speaking'));
    vapiInstance.on('assistant-speech-end', () => setCallStatus('active'));

    vapiInstance.on('error', (e: any) => {
      console.error('Vapi Error:', JSON.stringify(e, null, 2));
    });

    // 감정 분석 결과에 따라 배경 변경
    vapiInstance.on('structured-output', (output: { type: string; value: any }) => {
      if (output.type === 'primary_struggle_category') {
        const category = output.value as string;
        if (Object.keys(EMOTION_COLORS).includes(category.toLowerCase())) {
          setBackgroundGradient(EMOTION_COLORS[category.toLowerCase() as keyof typeof EMOTION_COLORS]);
        }
      }
    });
  }, [volumeMotion, checkTimeOfDay]);

  // --- 초기화 ---
  useEffect(() => {
    setIsMounted(true);
    checkTimeOfDay();

    // [추가] 사용자 ID 로드 또는 생성 (브라우저에 영구 저장)
    let storedUserId = localStorage.getItem('bamboo_user_id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('bamboo_user_id', storedUserId);
    }
    setUserId(storedUserId);

    if (!VAPI_PUBLIC_KEY) return;
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;
    handleVapiEvents(vapi);

    return () => {
      try {
        vapi.stop();
        vapi.removeAllListeners();
      } catch (e) {}
    };
  }, [handleVapiEvents, checkTimeOfDay]);

  // --- 통화 제어 ---
  const toggleCall = () => {
    if (callStatus === 'idle') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); 
      setCallStatus('connecting');
      vapiRef.current?.start(ASSISTANT_ID, {
        metadata: {
          userId: userId 
        }
      });
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); 
      vapiRef.current?.stop();
      setTimeout(() => setCallStatus('idle'), 500);
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
      
      {/* 배경 레이어 (동적 그라디언트) */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-b ${backgroundGradient.join(' ')}`}
        animate={{ opacity: callStatus === 'idle' ? 0.7 : 1 }}
        transition={{ duration: 2.5 }}
      />

      {/* 파티클 레이어 */}
      {isMounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{ 
            width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
            filter: `blur(${p.size / 2}px)`
          }}
          animate={{
            x: [`${p.x}%`, `${p.x + (Math.random() > 0.5 ? 20 : -20)}%`], 
            y: [`${p.y}%`, `${p.y + (Math.random() > 0.5 ? 20 : -20)}%`], 
            opacity: [0, 1, 0], 
            scale: [1, 1 + springVolume.get() * 0.5, 1], 
          }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* 정령 이미지 */}
      <motion.div
        className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden pointer-events-none"
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
        <Image 
          src="/images/spirit_final.png" alt="Bamboo Spirit" fill className="object-cover" priority 
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
      </motion.div>

      {/* [Step 2] 정령의 편지 메시지 오버레이 */}
      <AnimatePresence>
        {callStatus === 'idle' && spiritMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-40 top-1/4 px-8 text-center pointer-events-none"
          >
            <p className="text-white/80 font-light text-lg leading-relaxed tracking-wide italic drop-shadow-lg">
              "{spiritMessage}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI 컨트롤 */}
      <div className="absolute bottom-20 z-50 flex flex-col items-center gap-8 w-full pointer-events-none">
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
              className="pointer-events-auto px-10 py-5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl shadow-2xl hover:bg-white/10 transition-all tracking-widest cursor-pointer"
            >
              숲으로 입장하기
            </motion.button>
          ) : (
            <motion.div
              key="active-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 pointer-events-auto"
            >
              <button 
                onClick={toggleCall}
                className="group relative z-50 p-6 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer active:scale-90"
              >
                 <span className="sr-only">End Call</span>
                 <motion.div animate={{ rotate: callStatus === 'connecting' ? 0 : 90 }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/80 group-hover:text-red-200">
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
                  <motion.div className="h-full bg-green-400/40" style={{ width: barWidth }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}