// app/hooks/useBambooEngine.ts
import { useState, useEffect, useRef, useCallback } from 'react';
// [New] MouseEvent 타입 추가
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
// @ts-ignore
import Vapi from '@vapi-ai/web';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas'; // import 유지
import { createClient } from '@supabase/supabase-js';
import { WeatherType, CallStatus, TIME_THEMES, EMOTION_COLORS, Memory } from '../types';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useBambooEngine() {
  // --- State ---
  const [hasStarted, setHasStarted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(TIME_THEMES.night);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [userId, setUserId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [capturingId, setCapturingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // --- Animation Values ---
  const volumeMotion = useMotionValue(0);
  const springVolume = useSpring(volumeMotion, { stiffness: 300, damping: 30 });
  const blurValue = useTransform(springVolume, (v) => `blur(${(1 - v) * 10}px)`);
  const opacityValue = useTransform(springVolume, (v) => 1 - v);
  const barWidth = useTransform(springVolume, (v) => `${v * 100}%`);

  // [New] Parallax Motion Values (마우스 위치 -1 ~ 1 정규화)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // [New] Mouse Move Handler
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    // 화면 중앙을 0,0으로 하고 -1 ~ 1 사이 값으로 정규화
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  // [Fix] motionValues 객체 미리 정의
  const motionValues = {
    blurValue,
    opacityValue,
    barWidth,
    springVolume,
    mouseX, // [New] 내보내기
    mouseY  // [New] 내보내기
  };

  // --- Refs ---
  const vapiRef = useRef<any>(null);
  const audioRefs = useRef<{ [key in WeatherType]: HTMLAudioElement | null }>({
    clear: null, rain: null, snow: null, ember: null,
  });

  // --- Helpers ---
  const checkTimeOfDay = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    let theme = TIME_THEMES.night;
    if (hour >= 5 && hour < 7) theme = TIME_THEMES.dawn;
    else if (hour >= 7 && hour < 17) theme = TIME_THEMES.day;
    else if (hour >= 17 && hour < 20) theme = TIME_THEMES.sunset;
    setBackgroundGradient(theme);
    setWeather('clear');
    setShowEasterEgg(hour === 3); 
  }, []);

  const fetchMemories = useCallback(async (uid: string) => {
    if (!uid) return;
    const { data } = await supabase.from('memories').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data) {
      setMemories(data.map((m: any) => ({
        ...m, x: 10 + Math.random() * 80, y: 15 + Math.random() * 60,
      })));
    }
  }, []);

  const startExperience = () => {
    setHasStarted(true);
    const currentAudio = audioRefs.current['clear'];
    if (currentAudio) {
      currentAudio.volume = 0;
      currentAudio.play().then(() => {
        currentAudio.animate([{ volume: 0 }, { volume: 0.2 }], { duration: 3000, fill: 'forwards' });
      }).catch(e => console.log("Audio play failed", e));
    }
  };

  // 캡처, 삭제 함수들
  const shareMemory = useCallback(async (memory: Memory) => {
    const elementId = `memory-card-${memory.id}`;
    const element = document.getElementById(elementId);
    if (!element || capturingId) return;
    setCapturingId(memory.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(element, { backgroundColor: null, scale: 3, logging: false, useCORS: true, allowTaint: true });
      const link = document.createElement('a');
      link.download = `bamboo_memory_${memory.created_at.slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (e) { console.error('Capture failed:', e); } finally { setCapturingId(null); }
  }, [capturingId]);

  const deleteMemory = useCallback(async (id: number) => {
    if (!confirm("이 기억을 정말 바람에 날려보낼까?")) return;
    setIsDeleting(id);
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (e) { console.error("Failed to delete:", e); alert("실패했어. 다시 시도해줘."); } finally { setIsDeleting(null); }
  }, []);

  // --- Audio Logic ---
  useEffect(() => {
    if (!isMounted || !hasStarted || callStatus === 'idle') return;
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (!audio) return;
      if (key === weather) {
        audio.play().catch(() => {});
        audio.animate([{ volume: audio.volume }, { volume: 0.2 }], { duration: 2000, fill: 'forwards' });
      } else if (!audio.paused) {
        audio.animate([{ volume: audio.volume }, { volume: 0 }], { duration: 2000, fill: 'forwards' }).onfinish = () => {
          audio.pause(); audio.currentTime = 0;
        };
      }
    });
  }, [weather, callStatus, isMounted, hasStarted]);

  // --- Init ---
  useEffect(() => {
    setIsMounted(true);
    checkTimeOfDay();
    const interval = setInterval(checkTimeOfDay, 60000); // 1분마다 시간 체크

    let storedId = localStorage.getItem('spirit_user_id');
    if (!storedId) { storedId = uuidv4(); localStorage.setItem('spirit_user_id', storedId); }
    setUserId(storedId);
    fetchMemories(storedId);

    if (!VAPI_PUBLIC_KEY) return;
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => { setCallStatus('active'); setSpiritMessage(null); });
    vapi.on('call-end', () => {
      setCallStatus('idle'); volumeMotion.set(0);
      const messages = [ "비가 그치면 땅이 더 단단해질 거야.", "언제든 여기서 기다릴게.", "오늘 밤은 푹 잘 수 있을 거야.", "바람이 네 걱정을 가져갔어." ];
      setSpiritMessage(messages[Math.floor(Math.random() * messages.length)]);
      checkTimeOfDay(); 
      if (userId) fetchMemories(userId);
    });
    vapi.on('volume-level', (volume: number) => volumeMotion.set(Math.min(volume * 2.5, 1)));
    vapi.on('speech-start', () => setCallStatus('listening'));
    vapi.on('speech-end', () => setCallStatus('processing'));
    vapi.on('assistant-speech-start', () => setCallStatus('speaking'));
    vapi.on('assistant-speech-end', () => setCallStatus('active'));
    vapi.on('structured-output', (output: { type: string; value: any }) => {
        if (output.type === 'primary_struggle_category') {
          const category = (output.value as string).toLowerCase();
          if (Object.keys(EMOTION_COLORS).includes(category)) setBackgroundGradient(EMOTION_COLORS[category as keyof typeof EMOTION_COLORS]);
          if (category === 'sadness') setWeather('rain');
          else if (category === 'loneliness') setWeather('snow');
          else if (category === 'anger') setWeather('ember');
          else setWeather('clear');
        }
      });

    return () => { clearInterval(interval); try { vapi.stop(); vapi.removeAllListeners(); } catch (e) {} };
  }, [volumeMotion, weather, userId, fetchMemories, checkTimeOfDay]);

  const toggleCall = () => {
    if (callStatus === 'idle') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); 
      setCallStatus('connecting');
      vapiRef.current?.start(ASSISTANT_ID, { metadata: { userId: userId } });
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

  return {
    isMounted, hasStarted, startExperience,
    callStatus, backgroundGradient, weather, spiritMessage, memories,
    toggleCall, getStatusText, audioRefs, motionValues,
    capturingId, shareMemory, deleteMemory, isDeleting,
    showEasterEgg, handleMouseMove // [New] 내보내기
  };
}