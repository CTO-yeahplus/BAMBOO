// app/hooks/useBambooEngine.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from './useAuth';
import { useHaptic } from './useHaptic';
import { useSoundEngine } from './useSoundEngine';
import { useParallax } from './useParallax';

import { useSoulData } from './engine/useSoulData';
import { useSpiritVapi } from './engine/useSpiritVapi';
import { ARTIFACTS, TIME_THEMES, EMOTION_COLORS, WeatherType, SeasonType } from '../types';

const DAILY_QUOTES = [
  "천천히 가도 괜찮아, 방향만 맞다면.", "비바람이 불어야 뿌리가 단단해지는 법이야.",
  "너는 존재만으로도 충분히 아름다워.", "잠시 멈춰서 숨을 고르는 것도 용기야.",
  "어둠은 별을 빛나게 할 뿐, 너를 삼키지 못해.", "오늘 흘린 땀은 내일의 웃음이 될 거야.",
  "가장 깊은 밤이 지나야 새벽이 온다.", "너의 속도로 걸어가도 돼."
];

export function useBambooEngine() {
  const { user, isPremium, signInWithGoogle, signOut } = useAuth();
  const { triggerSuccess, triggerMedium, triggerLight, triggerBreathing } = useHaptic();
  const { playPaperRustle, playMagicDust, playWindChime, playWaterDrop, initAudio } = useSoundEngine();
  
  const soul = useSoulData(user, triggerSuccess);
  
  const handleCallEnd = useCallback(() => {
      triggerLight();
      soul.fetchMemories();
  }, [triggerLight, soul]);

  const voice = useSpiritVapi(user?.id ?? null, handleCallEnd);

  const audioRefs = useRef<{ [key in WeatherType]: HTMLAudioElement | null }>({ clear: null, rain: null, snow: null, ember: null });
  const fadeIntervals = useRef<{ [key in WeatherType]: NodeJS.Timeout | null }>({ clear: null, rain: null, snow: null, ember: null });

  const { x: rawX, y: rawY, requestAccess: requestGyro } = useParallax();
  const smoothOptions = { stiffness: 100, damping: 20 };
  const mouseX = useSpring(rawX, smoothOptions);
  const mouseY = useSpring(rawY, smoothOptions);

  const volumeMotion = useMotionValue(0);
  useEffect(() => {
      if (voice.vapiRef.current) {
          const onVolume = (vol: number) => { volumeMotion.set(Math.min(vol * 2.5, 1)); };
          voice.vapiRef.current.on('volume-level', onVolume);
          return () => { if (voice.vapiRef.current?.off) voice.vapiRef.current.off('volume-level', onVolume); };
      }
  }, [voice.vapiRef, volumeMotion]);

  const springVolume = useSpring(volumeMotion, { stiffness: 300, damping: 30 });
  const blurValue = useTransform(springVolume, (v) => `blur(${(1 - v) * 10}px)`);
  const opacityValue = useTransform(springVolume, (v) => 1 - v);
  const barWidth = useTransform(springVolume, (v) => `${v * 100}%`);
  const motionValues = { blurValue, opacityValue, barWidth, springVolume, mouseX, mouseY };

  // State
  const [showJournal, setShowJournal] = useState(false);
  const [showAltar, setShowAltar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasWoken, setHasWoken] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMemoryRitual, setShowMemoryRitual] = useState(false);
  const [pendingSummary, setPendingSummary] = useState("");
  
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);
  const [hasCollectedDew, setHasCollectedDew] = useState(true);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isHolding, setIsHolding] = useState(false); 
  
  const [isDaytime, setIsDaytime] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(TIME_THEMES.night);
  const [selectedAmbience, setSelectedAmbience] = useState<WeatherType | null>(null);
  const [season, setSeason] = useState<SeasonType>('spring');
  
  const [bgVolume, setBgVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  const collectDew = useCallback(() => {
      triggerMedium();
      playWaterDrop();
      soul.addResonance(50);
      const randomQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
      setDailyQuote(randomQuote);
      localStorage.setItem('last_dew_date', new Date().toDateString());
      setHasCollectedDew(true);
      setTimeout(() => setDailyQuote(null), 5000);
  }, [playWaterDrop, triggerMedium, soul]);

  const wakeSpirit = () => {
      triggerSuccess();
      playMagicDust();
      playWindChime();
      voice.requestGyroAccess(); 
      requestGyro(); 
      setHasWoken(true);
      setShowTutorial(true);
      voice.setSpiritMessage("...오랫동안 너를 기다렸어.");
      setTimeout(() => setShowTutorial(false), 8000);
  };

  const toggleBreathing = () => {
      triggerLight();
      playWindChime();
      setIsBreathing(prev => !prev);
  };

  const toggleSilentMode = () => {
      triggerMedium();
      voice.setIsSilentMode(prev => !prev);
      if (showTutorial) setShowTutorial(false);
  };

  const changeAmbience = (type: WeatherType) => {
      triggerLight();
      setSelectedAmbience(type);
      setWeather(type);
  };

  // [New] Tactile Handler
  const handlePet = useCallback(() => {
      if (!isHolding && Math.random() > 0.7) { 
          triggerLight();
          playMagicDust();
      }
  }, [isHolding, triggerLight, playMagicDust]);

  // Audio Logic (Improved Fading)
  const fadeToVolume = useCallback((type: WeatherType, targetVol: number, duration: number = 1000) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    
    // [Fix] Stutter Prevention: 이미 목표 볼륨 근처라면 스킵
    if (Math.abs(audio.volume - targetVol) < 0.01 && (targetVol === 0 ? audio.paused : !audio.paused)) return;

    if (fadeIntervals.current[type]) clearInterval(fadeIntervals.current[type]!);
    
    const stepTime = 50; 
    const steps = duration / stepTime;
    const volDiff = targetVol - audio.volume;
    const stepVol = volDiff / steps;
    
    if (targetVol > 0 && audio.paused) {
        audio.play().catch(e => { if (e.name !== 'NotAllowedError') console.error(e); });
    }
    
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

  useEffect(() => {
    const targetKey = selectedAmbience || weather;
    Object.keys(audioRefs.current).forEach((key) => {
      const type = key as WeatherType;
      const audio = audioRefs.current[type];
      if (type === targetKey) {
        // [Fix] Conditional Fade
        if (audio && (audio.paused || Math.abs(audio.volume - bgVolume) > 0.05)) fadeToVolume(type, bgVolume, 1000); 
      } else {
        if (audio && !audio.paused && audio.volume > 0) fadeToVolume(type, 0, 1000);
      }
    });
  }, [weather, selectedAmbience, bgVolume, fadeToVolume]);

  const checkTimeAndSeason = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();

    if (month >= 2 && month <= 4) setSeason('spring');
    else if (month >= 5 && month <= 7) setSeason('summer');
    else if (month >= 8 && month <= 10) setSeason('autumn');
    else setSeason('winter');

    const isDay = hour >= 6 && hour < 18;
    setIsDaytime(isDay);

    if (!selectedAmbience) {
        let theme = TIME_THEMES.night;
        if (isDay) {
            if (hour < 7) theme = TIME_THEMES.dawn;      
            else if (hour >= 17) theme = TIME_THEMES.sunset; 
            else theme = TIME_THEMES.day;                
        } else {
            if (hour >= 18 && hour < 20) theme = TIME_THEMES.sunset; 
            else theme = TIME_THEMES.night;
        }
        setBackgroundGradient(theme);
        setWeather('clear');
    }
    setShowEasterEgg(hour === 3); 
  }, [selectedAmbience]);

  useEffect(() => { checkTimeAndSeason(); const interval = setInterval(checkTimeAndSeason, 60000); return () => clearInterval(interval); }, [checkTimeAndSeason]);
  useEffect(() => { const last = localStorage.getItem('last_dew_date'); setHasCollectedDew(last === new Date().toDateString()); }, []);
  
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isBreathing || isHolding) {
          triggerBreathing();
          interval = setInterval(triggerBreathing, isHolding ? 1000 : 9500);
      }
      return () => clearInterval(interval);
  }, [isBreathing, isHolding, triggerBreathing]);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (voice.callStatus === 'active' || voice.callStatus === 'speaking' || voice.callStatus === 'listening') {
          interval = setInterval(() => soul.addResonance(1), 1000);
      }
      return () => clearInterval(interval);
  }, [voice.callStatus, soul]);

  useEffect(() => {
      const savedBg = localStorage.getItem('bamboo_bg_volume');
      const savedVoice = localStorage.getItem('bamboo_voice_volume');
      if (savedBg) setBgVolume(parseFloat(savedBg));
      if (savedVoice) setVoiceVolume(parseFloat(savedVoice));
  }, []);

  const finalizeMemory = async (type: 'standard'|'capsule', summary: string, uid: string) => {
      console.log(`Saved ${type}: ${summary}`);
      setShowMemoryRitual(false);
      triggerSuccess();
      soul.fetchMemories();
  };
  const deleteMemory = async (id: number) => { if (!confirm("Delete?")) return; soul.fetchMemories(); };
  const shareMemory = async (m: any) => {};

  const getStatusText = useCallback(() => {
    switch (voice.callStatus) {
      case 'connecting': return "Connecting...";
      case 'active': return "Here with you";
      case 'listening': return "Listening...";
      case 'processing': return "Thinking...";
      case 'speaking': return "Speaking...";
      case 'idle': return "Enter the forest";
      default: return "";
    }
  }, [voice.callStatus]);

  return {
      user, isPremium, signInWithGoogle, signOut, isMounted: true, hasStarted: true,
      callStatus: voice.callStatus, toggleCall: voice.toggleCall, spiritMessage: voice.spiritMessage,
      isSilentMode: voice.isSilentMode, toggleSilentMode, sendTextMessage: voice.sendTextMessage, getStatusText,
      resonance: soul.resonance, soulLevel: soul.soulLevel, memories: soul.memories,
      ownedItems: soul.ownedItems, equippedItems: soul.equippedItems, unlockArtifact: soul.unlockArtifact, equipArtifact: soul.equipArtifact, ARTIFACTS: soul.ARTIFACTS,
      hasWoken, wakeSpirit, showTutorial, dailyQuote, hasCollectedDew, collectDew,
      isBreathing, toggleBreathing, 
      showJournal, setShowJournal, showAltar, setShowAltar, showSettings, setShowSettings, showMemoryRitual, setShowMemoryRitual, pendingSummary, setPendingSummary,
      backgroundGradient, weather, isDaytime, showEasterEgg, bgVolume, setBgVolume, voiceVolume, setVoiceVolume, selectedAmbience, changeAmbience, season,
      playPaperRustle, playMagicDust, initAudio, triggerLight, motionValues, audioRefs, finalizeMemory, deleteMemory, shareMemory, capturingId: null, isDeleting: null,
      isHolding, setIsHolding, handlePet 
  };
}