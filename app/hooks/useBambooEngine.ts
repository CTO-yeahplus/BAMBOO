// app/hooks/useBambooEngine.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
// @ts-ignore
import Vapi from '@vapi-ai/web';
import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';
import { WeatherType, CallStatus, TIME_THEMES, EMOTION_COLORS, Memory } from '../types';
import { useSoundEngine } from './useSoundEngine'; 
import { useHaptic } from './useHaptic';
import { useAuth } from './useAuth';
import { useParallax } from './useParallax'; 

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DAILY_QUOTES = [
  "천천히 가도 괜찮아, 방향만 맞다면.", "비바람이 불어야 뿌리가 단단해지는 법이야.",
  "너는 존재만으로도 충분히 아름다워.", "잠시 멈춰서 숨을 고르는 것도 용기야.",
  "어둠은 별을 빛나게 할 뿐, 너를 삼키지 못해.", "오늘 흘린 땀은 내일의 웃음이 될 거야.",
  "가장 깊은 밤이 지나야 새벽이 온다.", "너의 속도로 걸어가도 돼."
];

// [New] Artifact Definitions
export type ArtifactType = 'aura' | 'head';
export interface Artifact {
    id: string;
    type: ArtifactType;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

export const ARTIFACTS: Artifact[] = [
    { id: 'aura_firefly', type: 'aura', name: "Forest Whispers", description: "작은 숲의 정령들이 주위를 맴돕니다.", cost: 0, icon: "✨" }, 
    { id: 'aura_moonlight', type: 'aura', name: "Lunar Veil", description: "달빛의 가호가 깃듭니다.", cost: 150, icon: "🌙" },
    { id: 'aura_ember', type: 'aura', name: "Warmth of Hearth", description: "따뜻한 온기가 감돕니다.", cost: 300, icon: "🔥" },
    { id: 'head_flower', type: 'head', name: "Bloom Crown", description: "봄에 핀 첫 꽃으로 만든 화관.", cost: 100, icon: "🌸" },
    { id: 'head_fox', type: 'head', name: "Mystic Mask", description: "오래된 여우 가면.", cost: 500, icon: "🦊" },
];

export function useBambooEngine() {
  const [hasStarted, setHasStarted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(TIME_THEMES.night);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMounted, setIsMounted] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [capturingId, setCapturingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isDaytime, setIsDaytime] = useState(false);
  
  const [showMemoryRitual, setShowMemoryRitual] = useState(false); 
  const [pendingSummary, setPendingSummary] = useState("");        

  const [hasWoken, setHasWoken] = useState(false); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);

  // [New] Inventory State
  const [ownedItems, setOwnedItems] = useState<string[]>(['aura_firefly']); 
  const [equippedItems, setEquippedItems] = useState<{ aura: string | null, head: string | null }>({
      aura: 'aura_firefly',
      head: null
  });
  const [showAltar, setShowAltar] = useState(false); 

  const { user, isPremium, signInWithGoogle, signOut } = useAuth();
  const [bgVolume, setBgVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  const [resonance, setResonance] = useState(0); 
  const [soulLevel, setSoulLevel] = useState(1);
  const [hasCollectedDew, setHasCollectedDew] = useState(true);
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);

  const [isBreathing, setIsBreathing] = useState(false);
  const [selectedAmbience, setSelectedAmbience] = useState<WeatherType | null>(null);

  const { initAudio, playWaterDrop, playWindChime, playPaperRustle, playMagicDust } = useSoundEngine();
  const { triggerLight, triggerMedium, triggerBreathing, triggerSuccess } = useHaptic();

  const { x: rawX, y: rawY, requestAccess: requestGyro } = useParallax();
  const smoothOptions = { stiffness: 100, damping: 20 };
  const mouseX = useSpring(rawX, smoothOptions);
  const mouseY = useSpring(rawY, smoothOptions);

  const volumeMotion = useMotionValue(0);
  const springVolume = useSpring(volumeMotion, { stiffness: 300, damping: 30 });
  const blurValue = useTransform(springVolume, (v) => `blur(${(1 - v) * 10}px)`);
  const opacityValue = useTransform(springVolume, (v) => 1 - v);
  const barWidth = useTransform(springVolume, (v) => `${v * 100}%`);

  const motionValues = { blurValue, opacityValue, barWidth, springVolume, mouseX, mouseY };
  
  const vapiRef = useRef<any>(null);
  const audioRefs = useRef<{ [key in WeatherType]: HTMLAudioElement | null }>({ clear: null, rain: null, snow: null, ember: null });
  const fadeIntervals = useRef<{ [key in WeatherType]: NodeJS.Timeout | null }>({ clear: null, rain: null, snow: null, ember: null });

  // ... (fadeToVolume, checkTimeOfDay, useEffects... 기존 로직 유지) ...
  const fadeToVolume = useCallback((type: WeatherType, targetVol: number, duration: number = 1000) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    if (fadeIntervals.current[type]) clearInterval(fadeIntervals.current[type]!);
    const stepTime = 50; 
    const steps = duration / stepTime;
    const volDiff = targetVol - audio.volume;
    const stepVol = volDiff / steps;
    if (targetVol > 0 && audio.paused) audio.play().catch(e => console.error("Audio play failed:", e));
    fadeIntervals.current[type] = setInterval(() => {
        let newVol = audio.volume + stepVol;
        if ((stepVol > 0 && newVol >= targetVol) || (stepVol < 0 && newVol <= targetVol)) {
            audio.volume = targetVol;
            clearInterval(fadeIntervals.current[type]!);
            if (targetVol === 0) audio.pause();
        } else {
            newVol = Math.max(0, Math.min(1, newVol));
            audio.volume = newVol;
        }
    }, stepTime);
  }, []);

  const checkTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    let theme = TIME_THEMES.night;
    if (hour >= 6 && hour < 18) {
        setIsDaytime(true);
        if (hour < 7) theme = TIME_THEMES.dawn;      
        else if (hour >= 17) theme = TIME_THEMES.sunset; 
        else theme = TIME_THEMES.day;                
    } else {
        setIsDaytime(false);
        if (hour >= 18 && hour < 20) theme = TIME_THEMES.sunset; 
        else theme = TIME_THEMES.night;
    }
    setBackgroundGradient(theme);
    if (!selectedAmbience) setWeather('clear');
    setShowEasterEgg(hour === 3); 
  }, [selectedAmbience]);

  useEffect(() => {
    if (!isMounted || !hasStarted) return;
    const targetKey = selectedAmbience || weather;
    Object.keys(audioRefs.current).forEach((key) => {
      const type = key as WeatherType;
      const audio = audioRefs.current[type];
      if (type === targetKey) {
        if (audio && (audio.paused || Math.abs(audio.volume - bgVolume) > 0.05)) fadeToVolume(type, bgVolume, 1000); 
      } else {
        if (audio && !audio.paused && audio.volume > 0) fadeToVolume(type, 0, 1000);
      }
    });
  }, [weather, selectedAmbience, callStatus, isMounted, hasStarted, bgVolume, fadeToVolume]);

  const currentUserId = user ? user.id : null;

  useEffect(() => {
    const savedBgVol = localStorage.getItem('bamboo_bg_volume');
    const savedVoiceVol = localStorage.getItem('bamboo_voice_volume');
    const savedAmbience = localStorage.getItem('bamboo_ambience') as WeatherType | null;
    if (savedBgVol) setBgVolume(parseFloat(savedBgVol));
    if (savedVoiceVol) setVoiceVolume(parseFloat(savedVoiceVol));
    if (savedAmbience) { setSelectedAmbience(savedAmbience); setWeather(savedAmbience); }
  }, []);

  useEffect(() => { localStorage.setItem('bamboo_bg_volume', bgVolume.toString()); }, [bgVolume]);
  useEffect(() => { localStorage.setItem('bamboo_voice_volume', voiceVolume.toString()); }, [voiceVolume]);

  const changeAmbience = (type: WeatherType) => {
    if (selectedAmbience === type) return;
    triggerLight();
    setSelectedAmbience(type);
    setWeather(type);
    localStorage.setItem('bamboo_ambience', type);
  };

  const fetchMemories = useCallback(async (uid: string) => {
    if (!uid) return;
    const { data } = await supabase.from('memories').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data) {
      if (data.length > 0) setHasWoken(true); else setHasWoken(false);
      setMemories(data.map((m: any) => {
        let detectedEmotion: any = 'neutral';
        const text = m.summary.toLowerCase();
        if (text.includes('슬프') || text.includes('울') || text.includes('sad')) detectedEmotion = 'sadness';
        else if (text.includes('화') || text.includes('짜증') || text.includes('anger')) detectedEmotion = 'anger';
        else if (text.includes('외로') || text.includes('혼자') || text.includes('lonely')) detectedEmotion = 'loneliness';
        else {
           const randomEmotions = ['sadness', 'anger', 'loneliness', 'neutral'];
           detectedEmotion = randomEmotions[m.id % randomEmotions.length];
        }
        return { ...m, emotion: m.emotion || detectedEmotion, x: 10 + Math.random() * 80, y: 15 + Math.random() * 60 };
      }));
    }
  }, []);

  const wakeSpirit = () => {
      if (triggerSuccess) triggerSuccess(); 
      playMagicDust();
      playWindChime();
      requestGyro();
      setHasWoken(true);
      setShowTutorial(true);
      setSpiritMessage("...오랫동안 너를 기다렸어."); 
      setTimeout(() => setShowTutorial(false), 8000); 
  };

  const generateDefaultTitle = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return "새벽의 속삭임";
      else if (hour >= 11 && hour < 17) return "오후의 대화";
      else if (hour >= 17 && hour < 20) return "노을 진 숲에서의 기억";
      return "밤하늘에 남긴 이야기";
  };

  const finalizeMemory = async (type: 'standard' | 'capsule', summary: string, uid: string) => {
      const emotions = ['neutral', 'happy', 'sadness', 'loneliness'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      let unlockDate = null;
      if (type === 'capsule') {
          const date = new Date();
          date.setMinutes(date.getMinutes() + 1);      
          unlockDate = date.toISOString();
      }
      const { error } = await supabase.from('memories').insert({ 
          user_id: uid, summary: summary || generateDefaultTitle(), emotion: randomEmotion, unlock_date: unlockDate
      });
      if (!error) {
          await fetchMemories(uid);
          if (triggerSuccess) triggerSuccess(); 
      }
      setShowMemoryRitual(false); 
  };

  const startExperience = () => {
    setHasStarted(true);
    triggerLight();
    initAudio(); 
    playMagicDust();
    const currentAudioKey = selectedAmbience || 'clear';
    fadeToVolume(currentAudioKey, bgVolume, 2000); 
  };

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
    triggerMedium(); 
    setIsDeleting(id);
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (e) { console.error("Failed to delete:", e); alert("실패했어. 다시 시도해줘."); } finally { setIsDeleting(null); }
  }, [triggerMedium]);

  const toggleBreathing = () => {
    triggerLight(); playWindChime(); setIsBreathing(prev => !prev);
  };

  const toggleSilentMode = () => {
      triggerMedium(); setIsSilentMode(prev => !prev);
      if (showTutorial) setShowTutorial(false);
  };

  const sendTextMessage = (text: string) => {
      if (!vapiRef.current || !text.trim()) return;
      try {
          vapiRef.current.send({
              type: "add-message",
              message: { role: "user", content: text }
          });
          playPaperRustle(); 
      } catch (e) { console.error("Failed to send text message:", e); }
  };

  const collectDew = useCallback(() => {
    triggerMedium(); playWaterDrop();
    setResonance(prev => {
        const next = prev + 50;
        localStorage.setItem('spirit_resonance', next.toString());
        return next;
    });
    const randomQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
    setDailyQuote(randomQuote);
    const today = new Date().toDateString();
    localStorage.setItem('last_dew_date', today);
    setHasCollectedDew(true);
    setTimeout(() => setDailyQuote(null), 5000);
  }, [playWaterDrop, triggerMedium]);

  // [New] Artifact Logic
  const unlockArtifact = (item: Artifact) => {
      if (ownedItems.includes(item.id)) return;
      if (resonance < item.cost) { alert("공명도(Resonance)가 부족합니다."); return; }
      setResonance(prev => {
          const next = prev - item.cost;
          localStorage.setItem('spirit_resonance', next.toString());
          return next;
      });
      setOwnedItems(prev => [...prev, item.id]);
      triggerSuccess(); 
  };

  const equipArtifact = (item: Artifact) => {
      if (!ownedItems.includes(item.id)) return;
      setEquippedItems(prev => {
          if (prev[item.type] === item.id) return { ...prev, [item.type]: null };
          return { ...prev, [item.type]: item.id };
      });
      playMagicDust(); 
  };

  // ... (Effects kept same) ...
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      triggerBreathing(); interval = setInterval(() => { triggerBreathing(); }, 9500); 
    }
    return () => clearInterval(interval);
  }, [isBreathing, triggerBreathing]);

  useEffect(() => {
    const savedResonance = localStorage.getItem('spirit_resonance');
    if (savedResonance) setResonance(parseInt(savedResonance));
    const lastCollected = localStorage.getItem('last_dew_date');
    const today = new Date().toDateString();
    setHasCollectedDew(lastCollected === today);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'active' || callStatus === 'speaking' || callStatus === 'listening') {
      interval = setInterval(() => {
        setResonance((prev) => {
          const next = prev + 1;
          localStorage.setItem('spirit_resonance', next.toString());
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (resonance < 60) setSoulLevel(1);
    else if (resonance < 300) setSoulLevel(2);
    else if (resonance < 600) setSoulLevel(3);
    else setSoulLevel(4);
  }, [resonance]);

  useEffect(() => {
    setIsMounted(true);
    checkTimeOfDay();
    const interval = setInterval(checkTimeOfDay, 60000);
    if (currentUserId) fetchMemories(currentUserId); else setMemories([]); 
    if (!VAPI_PUBLIC_KEY) return;
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;
    vapi.on('call-start', () => { triggerMedium(); setCallStatus('active'); setSpiritMessage(null); setIsBreathing(false); });
    vapi.on('call-end', () => {
      triggerLight(); setCallStatus('idle'); volumeMotion.set(0); setIsSilentMode(false);
      const messages = [ "비가 그치면 땅이 더 단단해질 거야.", "언제든 여기서 기다릴게.", "오늘 밤은 푹 잘 수 있을 거야.", "바람이 네 걱정을 가져갔어." ];
      setSpiritMessage(messages[Math.floor(Math.random() * messages.length)]);
      checkTimeOfDay(); 
      if (currentUserId) { setPendingSummary(generateDefaultTitle()); setShowMemoryRitual(true); }
    });
    vapi.on('error', (e: any) => {
        console.log("Vapi Connection Closed (Silence/Error):", e);
        setCallStatus('idle'); volumeMotion.set(0);
        setSpiritMessage("바람이 잠시 멈추었어. 다시 말을 걸어줄래?");
        checkTimeOfDay();
    });
    vapi.on('volume-level', (volume: number) => volumeMotion.set(Math.min(volume * 2.5, 1)));
    vapi.on('speech-start', () => setCallStatus('listening'));
    vapi.on('speech-end', () => setCallStatus('processing'));
    vapi.on('assistant-speech-start', () => setCallStatus('speaking'));
    vapi.on('assistant-speech-end', () => setCallStatus('active'));
    vapi.on('structured-output', (output: { type: string; value: any }) => {
        if (output.type === 'primary_struggle_category') {
          if (!selectedAmbience) {
              const category = (output.value as string).toLowerCase();
              if (Object.keys(EMOTION_COLORS).includes(category)) setBackgroundGradient(EMOTION_COLORS[category as keyof typeof EMOTION_COLORS]);
              if (category === 'sadness') setWeather('rain'); else if (category === 'loneliness') setWeather('snow'); else if (category === 'anger') setWeather('ember'); else setWeather('clear');
          }
        }
      });
    return () => { clearInterval(interval); try { vapi.stop(); vapi.removeAllListeners(); } catch (e) {} };
  }, [volumeMotion, weather, currentUserId, fetchMemories, checkTimeOfDay, triggerLight, triggerMedium, selectedAmbience]);

  const toggleCall = () => {
    if (showTutorial) setShowTutorial(false);
    if (!currentUserId) { alert("로그인이 필요합니다."); return; }
    if (callStatus === 'idle') {
      triggerMedium(); setCallStatus('connecting'); 
      vapiRef.current?.start(ASSISTANT_ID, { metadata: { userId: currentUserId } }); 
    } else { triggerLight(); vapiRef.current?.stop(); setTimeout(() => setCallStatus('idle'), 500); }
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
    showEasterEgg,
    resonance, soulLevel,
    hasCollectedDew, collectDew, dailyQuote,
    isBreathing, toggleBreathing,
    playPaperRustle, playMagicDust,
    triggerLight, selectedAmbience, changeAmbience, initAudio,
    isDaytime, bgVolume, setBgVolume, voiceVolume, setVoiceVolume,
    user, isPremium, signInWithGoogle, signOut,
    showMemoryRitual, setShowMemoryRitual, pendingSummary, setPendingSummary, finalizeMemory,
    hasWoken, wakeSpirit, showTutorial,
    isSilentMode, toggleSilentMode, sendTextMessage,
    // [New] Exports
    ownedItems, equippedItems, showAltar, setShowAltar, unlockArtifact, equipArtifact, ARTIFACTS
  };
}