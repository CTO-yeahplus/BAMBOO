'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, PanInfo, useTransform } from 'framer-motion';
import { Book, X, Star, Share2, Loader2, Trash2, Headphones, Sparkles, Droplets, Wind, Trees, CloudRain, Flame, Waves, Lock, Sun, Settings2, Volume2, Mic, LogIn, LogOut, Hourglass, Send, Clock, LayoutGrid, MousePointerClick, ArrowUp, Keyboard, SendHorizontal, Palette, Gem, Check } from 'lucide-react';
import { useBambooEngine } from './hooks/useBambooEngine';
import { useRipple } from './hooks/useRipple';
import { Particle, Memory } from './types';
import { getMoonPhase, getMoonIconPath } from './utils/moonPhase';

type VisualMemory = Memory & { x: number; y: number; unlock_date?: string };

const WHISPERS = ["오늘 하루는 어땠어?", "누구에게도 말 못 할 고민이 있니?", "그냥 빗소리만 듣고 싶다면, 그래도 돼.", "무거운 짐은 잠시 여기에 내려놓아.", "바람이 네 이야기를 기다리고 있어.", "괜찮아, 아무 말 안 해도 돼.", "어제보다 오늘 마음은 좀 어때?"];
const SOUL_LEVELS: { [key: number]: { name: string, color: string } } = { 1: { name: "Mist", color: "rgba(255, 255, 255, 0.4)" }, 2: { name: "Dew", color: "rgba(0, 255, 255, 0.6)" }, 3: { name: "Bloom", color: "rgba(200, 100, 255, 0.6)" }, 4: { name: "Aurora", color: "rgba(255, 215, 0, 0.7)" }, };

const AMBIENT_SOUNDS: { id: string, name: string, icon: any, level: number, type: 'clear' | 'rain' | 'ember' | 'snow' }[] = [
    { id: 'forest', name: 'Deep Forest', icon: Trees, level: 1, type: 'clear' },
    { id: 'rain', name: 'Rainy Window', icon: CloudRain, level: 1, type: 'rain' },
    { id: 'fire', name: 'Crackling Fire', icon: Flame, level: 1, type: 'ember' },
    { id: 'ocean', name: 'Windy Peaks', icon: Waves, level: 1, type: 'snow' },
];

const Hydrangea = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-blue-400/30 fill-blue-500/20" style={{ filter: 'blur(4px)' }} /><circle cx="12" cy="12" r="2" className="fill-blue-200" /><circle cx="8" cy="12" r="2" className="fill-purple-200" /><circle cx="16" cy="12" r="2" className="fill-indigo-200" /><circle cx="12" cy="8" r="2" className="fill-blue-200" /><circle cx="12" cy="16" r="2" className="fill-purple-200" /></svg>);
const SpiderLily = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-red-500/30 fill-red-600/20" style={{ filter: 'blur(4px)' }} /><path d="M12 12L12 4M12 12L18 6M12 12L20 12M12 12L18 18M12 12L12 20M12 12L6 18M12 12L4 12M12 12L6 6" stroke="currentColor" className="text-red-400" /><circle cx="12" cy="12" r="1.5" className="fill-red-200" /></svg>);
const Moonflower = ({ className }: { className?: string }) => ( <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" className="text-white/30 fill-white/10" style={{ filter: 'blur(5px)' }} /><path d="M12 6L13.5 10.5L18 12L13.5 13.5L12 18L10.5 13.5L6 12L10.5 10.5L12 6Z" className="fill-yellow-100 text-yellow-100" /></svg>);
const MemoryFlower = ({ emotion, isSelected }: { emotion?: string; isSelected: boolean }) => { const glowClass = isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"; switch (emotion) { case 'sadness': return <Hydrangea className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; case 'anger': return <SpiderLily className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; default: return <Moonflower className={`w-8 h-8 ${glowClass} transition-all duration-500`} />; }};
const GoldenCocoon = ({ isLocked }: { isLocked: boolean }) => ( <div className="relative group"> <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full animate-pulse" /> {isLocked ? ( <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" fill="none"> <line x1="12" y1="0" x2="12" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" /> <path d="M12 4C9 4 7 8 7 13C7 18 9 22 12 22C15 22 17 18 17 13C17 8 15 4 12 4Z" className="fill-yellow-600/80 stroke-yellow-200" strokeWidth="1.5" /> <path d="M8 10C9 11 11 11.5 12 11C13 10.5 15 11 16 12" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> <path d="M8 14C9 15 11 15.5 12 15C13 14.5 15 15 16 16" stroke="rgba(255,255,255,0.4)" strokeLinecap="round" /> </svg> ) : ( <svg viewBox="0 0 24 24" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-[bounce_3s_infinite]"> <path d="M12 12C12 12 8 6 4 8C0 10 2 16 6 16C8 16 11 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 16 6 20 8C24 10 22 16 18 16C16 16 13 14 12 12Z" className="fill-yellow-300 opacity-90" /> <path d="M12 12C12 12 10 18 8 20C6 22 4 20 6 18C8 16 11 14 12 12Z" className="fill-yellow-500 opacity-80" /> <path d="M12 12C12 12 14 18 16 20C18 22 20 20 18 18C16 16 13 14 12 12Z" className="fill-yellow-500 opacity-80" /> </svg> )} </div> );

const ConstellationLayer = ({ memories }: { memories: Memory[] }) => {
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [memories]);
  const getEmotionColor = (emotion?: string) => { switch (emotion) { case 'anger': return '#EF4444'; case 'sadness': return '#60A5FA'; case 'loneliness': return '#9CA3AF'; default: return '#FCD34D'; } };
  if (sortedMemories.length < 2) return null;
  return ( <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"> <defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory | undefined; const curr = memory as VisualMemory; if (!prev) return null; const id = `grad-${prev.id}-${curr.id}`; return ( <linearGradient key={id} id={id} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} gradientUnits="userSpaceOnUse"> <stop offset="0%" stopColor={getEmotionColor(prev.emotion)} stopOpacity="0.4" /> <stop offset="100%" stopColor={getEmotionColor(curr.emotion)} stopOpacity="0.4" /> </linearGradient> ); })} </defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory | undefined; const curr = memory as VisualMemory; if (!prev) return null; const gradId = `grad-${prev.id}-${curr.id}`; const isClient = typeof window !== 'undefined'; const startX = isClient ? prev.x * window.innerWidth / 100 : 0; const startY = isClient ? prev.y * window.innerHeight / 100 : 0; const endX = isClient ? curr.x * window.innerWidth / 100 : 0; const endY = isClient ? curr.y * window.innerHeight / 100 : 0; return ( <motion.g key={`connection-${curr.id}`}> <motion.line x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} stroke={`url(#${gradId})`} strokeWidth="1.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: index * 0.3, ease: "easeInOut" }} /> {isClient && (<motion.circle r="1" fill="white" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }}><animateMotion dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" path={`M${startX},${startY} L${endX},${endY}`} /></motion.circle>)} </motion.g> ); })} </svg> );
};

const OrbitLayer = ({ memories, onSelect }: { memories: Memory[], onSelect: (m: Memory) => void }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const orbitPoints = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1; const angle = 0.5 * i; const radius = 12 + (i * 1.5); const x = 50 + radius * Math.cos(angle); const y = 50 + radius * Math.sin(angle);
      const memory = memories.find(m => { const mDate = new Date(m.created_at); return mDate.getDate() === day && mDate.getMonth() === today.getMonth(); });
      const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
      const moonPhase = getMoonPhase(checkDate); const moonPath = getMoonIconPath(moonPhase);
      return { day, x, y, memory, moonPath };
    });
  }, [memories]);
  const getGlowColor = (emotion?: string) => { switch (emotion) { case 'anger': return 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]'; case 'sadness': return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]'; case 'loneliness': return 'text-gray-300 drop-shadow-[0_0_15px_rgba(209,213,219,0.8)]'; case 'happy': return 'text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]'; default: return 'text-white/20'; } };
  return ( <div className="absolute inset-0 w-full h-full pointer-events-none"> <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none"> <path d={orbitPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1,1" /> </svg> {orbitPoints.map((point, index) => ( <motion.div key={point.day} className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto" style={{ left: `${point.x}%`, top: `${point.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.03, type: "spring" }}> <button onClick={() => point.memory && onSelect(point.memory)} disabled={!point.memory} className={`group relative p-2 transition-transform hover:scale-125 ${!point.memory ? 'cursor-default' : 'cursor-pointer'}`}> <svg viewBox="0 0 24 24" className={`w-4 h-4 md:w-6 md:h-6 ${point.memory ? getGlowColor(point.memory.emotion) : 'text-white/5'}`}><path d={point.moonPath} fill="currentColor" /></svg> <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{point.day}</span> {point.memory && (<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[120px] bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none truncate z-50">{point.memory.summary}</div>)} </button> </motion.div> ))} </div> );
};

const SpiritAura = ({ type }: { type: string | null }) => {
    if (!type) return null;
    switch (type) {
        case 'aura_firefly':
            return ( <div className="absolute inset-0 pointer-events-none"> {Array.from({ length: 5 }).map((_, i) => ( <motion.div key={i} className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_5px_yellow]" animate={{ x: [Math.random() * 200 - 100, Math.random() * 200 - 100], y: [Math.random() * 200 - 100, Math.random() * 200 - 100], opacity: [0, 1, 0] }} transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }} style={{ left: '50%', top: '50%' }} /> ))} </div> );
        case 'aura_moonlight': return <div className="absolute inset-[-20%] bg-blue-500/20 blur-3xl rounded-full animate-pulse mix-blend-screen pointer-events-none" />;
        case 'aura_ember': return <div className="absolute inset-[-20%] bg-orange-500/20 blur-3xl rounded-full animate-pulse mix-blend-screen pointer-events-none" />;
        default: return null;
    }
};
const SpiritAccessory = ({ type }: { type: string | null }) => {
    if (!type) return null;
    switch (type) {
        case 'head_flower': return <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[60%] h-10 pointer-events-none opacity-80"><div className="flex justify-center gap-1"><span className="text-2xl drop-shadow-lg filter hue-rotate-15">🌸</span><span className="text-xl drop-shadow-lg mt-2">🌼</span><span className="text-2xl drop-shadow-lg filter -hue-rotate-15">🌸</span></div></div>;
        case 'head_fox': return <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none border border-red-500/30"><div className="absolute top-4 left-3 w-3 h-1 bg-red-500 rounded-full rotate-12" /><div className="absolute top-4 right-3 w-3 h-1 bg-red-500 rounded-full -rotate-12" /><span className="text-3xl mt-1">🦊</span></div>;
        default: return null;
    }
};

const SpringPetal = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-80"> <path d="M12 2C12 2 14 5 16 8C18 11 18 14 16 16C14 18 11 18 8 16C6 14 6 11 8 8C10 5 12 2 12 2Z" /> </svg> );
const SummerFirefly = ({ color }: { color: string }) => ( <div className="w-full h-full rounded-full bg-yellow-300 blur-[1px] shadow-[0_0_4px_yellow]" /> );
const AutumnLeaf = ({ color }: { color: string }) => ( <svg viewBox="0 0 24 24" fill={color} className="w-full h-full opacity-90"> <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" /> </svg> );

export default function BambooForest() {
  const {
    isMounted, hasStarted,
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
    user, isPremium, signInWithGoogle, signOut, handlePet,
    showMemoryRitual, setShowMemoryRitual, pendingSummary, setPendingSummary, finalizeMemory,
    hasWoken, wakeSpirit, showTutorial,
    isSilentMode, toggleSilentMode, sendTextMessage,
    ownedItems, equippedItems, showAltar, setShowAltar, unlockArtifact, equipArtifact, ARTIFACTS,
    season
  } = useBambooEngine();

  const { ripples, addRipple } = useRipple();
  const [showJournal, setShowJournal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'stars' | 'orbit'>('stars');
  const [inputText, setInputText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);

  // [Fix] Generate particles only on Client Side
  useEffect(() => {
      const newParticles = Array.from({ length: 100 }).map((_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 5 + 2,
          delay: Math.random() * 2
      }));
      setParticles(newParticles);
  }, []);

  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);
  const moonPath = getMoonIconPath(moonPhase);

  // [Fix] motionValues are now available
  const moonX = useTransform(motionValues.mouseX, [-1, 1], ["2%", "-2%"]); 
  const moonY = useTransform(motionValues.mouseY, [-1, 1], ["2%", "-2%"]);
  const bgX = useTransform(motionValues.mouseX, [-1, 1], ["-5%", "5%"]); 
  const bgY = useTransform(motionValues.mouseY, [-1, 1], ["-5%", "5%"]);
  const particleX = useTransform(motionValues.mouseX, [-1, 1], ["-10%", "10%"]); 
  const particleY = useTransform(motionValues.mouseY, [-1, 1], ["-10%", "10%"]);
  const spiritX = useTransform(motionValues.mouseX, [-1, 1], ["15%", "-15%"]); 
  const spiritY = useTransform(motionValues.mouseY, [-1, 1], ["15%", "-15%"]);
  const spiritScale = useTransform(motionValues.springVolume, (v) => 1 + v * 0.15);
  const spiritGlowOpacity = useTransform(motionValues.springVolume, [0, 1], [0, 0.6]);
  const [isHolding, setIsHolding] = useState(false);

  const handleSendMessage = () => { if (inputText.trim()) { sendTextMessage(inputText); setInputText(""); } };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } else { playPaperRustle(); } };

  useEffect(() => { const interval = setInterval(() => setWhisperIndex((prev) => (prev + 1) % WHISPERS.length), 6000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (callStatus !== 'idle') setShowJournal(false); }, [callStatus]);
  useEffect(() => { if (selectedMemory && !memories.find(m => m.id === selectedMemory.id)) setSelectedMemory(null); }, [memories, selectedMemory]);
  
  const particleCount = weather === 'rain' ? 60 : weather === 'snow' ? 40 : 20;
  
  const handleDragEnd = (event: any, info: PanInfo) => { if (info.offset.y > 100) setSelectedMemory(null); };
  const getProgress = () => { if (soulLevel === 1) return (resonance / 60) * 100; if (soulLevel === 2) return ((resonance - 60) / 240) * 100; if (soulLevel === 3) return ((resonance - 300) / 300) * 100; return 100; };

  const handleToggleJournal = () => { playPaperRustle(); triggerLight(); setShowJournal(!showJournal); };
  const handleSelectFlower = (m: Memory) => { playMagicDust(); triggerLight(); setSelectedMemory(m); };
  const handleSelectMemoryWrapper = (m: Memory) => { const visualMem: VisualMemory = { ...m, x: 50, y: 50 }; handleSelectFlower(visualMem); };
  const handleGlobalClick = (e: React.PointerEvent) => { addRipple(e); };
  const getUserInitial = () => { if (user?.email) return user.email[0].toUpperCase(); return "U"; };
  const avatarBorderClass = isPremium ? "border-yellow-400/50 shadow-[0_0_15px_rgba(253,224,71,0.3)]" : "border-white/20";
  const handleSpiritClick = () => { if (!hasWoken && hasStarted) { wakeSpirit(); } };

  return (
    <main className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none" onMouseMove={(e) => {}} onPointerDown={handleGlobalClick}>
      {/* [Fix] audioRefs are now properly available */}
      <audio ref={(el) => { audioRefs.current.clear = el; }} src="/sounds/forest_ambience.mp3" loop />
      <audio ref={(el) => { audioRefs.current.rain = el; }} src="/sounds/rain.mp3" loop />
      <audio ref={(el) => { audioRefs.current.snow = el; }} src="/sounds/wind.mp3" loop />
      <audio ref={(el) => { audioRefs.current.ember = el; }} src="/sounds/fire.mp3" loop />
      
      <motion.div className="absolute inset-0 w-full h-full" animate={{ filter: hasStarted ? 'blur(0px)' : 'blur(20px)', opacity: hasStarted ? 1 : 0 }} transition={{ duration: 2 }}>
        
        {/* Mist Layer */}
        <motion.div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-gray-900/50 to-transparent mix-blend-hard-light" animate={{ opacity: hasWoken ? 0 : 1 }} transition={{ duration: 3, ease: "easeInOut" }} />
        
        <motion.div className="absolute inset-[-5%] w-[110%] h-[110%]" style={{ x: bgX, y: bgY }}>
           <motion.div className={`absolute inset-0 bg-gradient-to-b ${backgroundGradient.join(' ')}`} animate={{ opacity: callStatus === 'idle' && !showJournal ? 0.7 : showJournal ? 0.2 : 1 }} transition={{ duration: 2.5 }} />
        </motion.div>
        
        <motion.div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-0 mix-blend-screen" style={{ x: moonX, y: moonY }}>
            {isDaytime ? ( <div className="relative w-32 h-32 opacity-90"><svg viewBox="0 0 24 24" className="w-full h-full text-orange-100 blur-[1px] drop-shadow-[0_0_30px_rgba(255,200,100,0.8)]"><circle cx="12" cy="12" r="8" fill="currentColor" /></svg><div className="absolute inset-0 bg-orange-200/30 blur-[60px] rounded-full" /></div> ) : ( <div className="relative w-32 h-32 opacity-80"><svg viewBox="0 0 24 24" className="w-full h-full text-yellow-100 blur-[0.5px] drop-shadow-[0_0_15px_rgba(255,255,200,0.5)]"><path d={moonPath} fill="currentColor" /></svg><div className="absolute inset-0 bg-yellow-100/20 blur-[50px] rounded-full" /></div> )}
        </motion.div>
        
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"><AnimatePresence>{ripples.map((ripple) => (<motion.div key={ripple.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="absolute border border-white/30 rounded-full bg-white/5 backdrop-blur-[1px]" style={{ left: ripple.x, top: ripple.y, width: 100, height: 100, x: "-50%", y: "-50%" }} />))}</AnimatePresence></div>
        <AnimatePresence>{showEasterEgg && callStatus === 'idle' && !showJournal && (<motion.div className="absolute pointer-events-none z-5" style={{ bottom: '15%', left: '-20%' }} initial={{ opacity: 0, x: 0 }} animate={{ opacity: [0, 0.3, 0], x: '140vw' }} transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatDelay: 30 }}><svg width="150" height="150" viewBox="0 0 24 24" fill="white" className="blur-[2px] opacity-60 transform -scale-x-100"><path d="M16.53 11.5l-2.09-1.21c-.33-.19-.59-.47-.76-.81L13 8V4h-2v4l-.68 1.48c-.17.34-.43.62-.76.81L7.47 11.5c-.88.51-1.47 1.46-1.47 2.5V21h2v-5h2v5h2v-5h2v5h2v-7c0-1.04-.59-1.99-1.47-2.5zM10 3.5C10 2.67 10.67 2 11.5 2S13 2.67 13 3.5 12.33 5 11.5 5 10 4.33 10 3.5z"/></svg></motion.div>)}</AnimatePresence>

        {/* ... TopRightControls, Profile, etc ... */}
        <AnimatePresence>
            {hasWoken && callStatus === 'idle' && !showJournal && !isBreathing && user && (
                <div className="absolute top-8 right-8 z-50 flex flex-col items-end gap-4">
                    {isPremium && (
                        <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="group cursor-pointer flex flex-col items-center gap-2" onClick={() => alert("타임 캡슐은 곧 열립니다.")}>
                            <div className="relative flex items-center justify-center w-12 h-12 bg-black/40 backdrop-blur-md rounded-full border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)] group-hover:bg-yellow-500/10 transition-colors"><Hourglass className="text-yellow-200" size={18} /><div className="absolute inset-0 bg-yellow-400 rounded-full opacity-10 animate-pulse" /></div>
                        </motion.button>
                    )}
                    {!hasCollectedDew && (
                        <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={collectDew} className="group cursor-pointer flex flex-col items-center gap-2">
                            <div className="relative flex items-center justify-center w-12 h-12 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg group-hover:bg-white/10 transition-colors"><Droplets className="text-blue-200" size={20} /><div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping" /></div>
                        </motion.button>
                    )}
                    <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { triggerLight(); setShowProfile(!showProfile); }} className={`flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md border rounded-full text-white/90 hover:bg-white/20 transition-all shadow-lg overflow-hidden ${avatarBorderClass}`}><span className="text-lg font-bold">{getUserInitial()}</span></motion.button>
                </div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showProfile && user && (
                <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="absolute top-24 right-8 z-50 w-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl origin-top-right">
                    <div className="flex justify-between items-center mb-6"><span className="text-white/60 text-xs font-mono tracking-widest uppercase">My Forest</span><button onClick={() => setShowProfile(false)} className="text-white/40 hover:text-white"><X size={14}/></button></div>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg border ${isPremium ? 'border-yellow-400/50 text-yellow-100' : 'border-white/10'}`}>
                                {getUserInitial()}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-white text-sm font-medium truncate w-full">{user.email}</span>
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${isPremium ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-white/40'}`}>
                                    {isPremium ? 'Sanctuary Member' : 'Traveler'}
                                </span>
                            </div>
                        </div>
                        
                        {!isPremium && (
                            <button className="w-full py-3 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-500/30 rounded-xl text-yellow-200 text-xs tracking-widest uppercase hover:from-yellow-600/30 hover:to-yellow-400/30 transition-all flex items-center justify-center gap-2">
                                <Sparkles size={12} /> Become a Member
                            </button>
                        )}

                        <div className="h-px bg-white/10 w-full" />
                        <button onClick={() => { if(confirm("로그아웃 하시겠습니까?")) { signOut(); setShowProfile(false); } }} className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-red-500/10 text-white/80 hover:text-red-200 text-xs font-medium rounded-xl transition-all border border-white/5 hover:border-red-500/20"><LogOut size={14} /> Sign Out</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {dailyQuote && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="absolute top-28 right-8 z-50 w-[280px] md:w-[320px] pointer-events-none">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden"><div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/20 blur-2xl rounded-full" /><p className="text-white/90 text-sm md:text-base font-light italic leading-relaxed relative z-10">"{dailyQuote}"</p><div className="mt-4 flex justify-between items-center border-t border-white/10 pt-3"><span className="text-blue-200/60 text-[10px] uppercase tracking-widest flex items-center gap-1"><Sparkles size={10} /> Daily Wisdom</span><span className="text-yellow-200/80 text-[10px] font-mono font-bold">+50 XP</span></div></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Layer */}
        <AnimatePresence>
          {showJournal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl">
              
              <div className="absolute top-8 right-20 z-50 flex gap-2">
                  <button 
                      onClick={() => { triggerLight(); setViewMode(viewMode === 'stars' ? 'orbit' : 'stars'); }}
                      className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white/70 transition-all flex items-center gap-2 border border-white/5"
                  >
                      {viewMode === 'stars' ? <LayoutGrid size={20} /> : <Star size={20} />}
                      <span className="text-[10px] uppercase tracking-widest hidden md:block">
                          {viewMode === 'stars' ? 'Orbit View' : 'Star View'}
                      </span>
                  </button>
              </div>

              {viewMode === 'stars' ? (
                  <>
                    <ConstellationLayer memories={memories} />
                    {memories.map((item, index) => {
                      const memory = item as VisualMemory;
                      const isTimeCapsule = !!memory.unlock_date; 
                      const isLocked = isTimeCapsule && new Date(memory.unlock_date!) > new Date(); 
                      return (
                        <motion.button key={memory.id} layoutId={`memory-container-${memory.id}`} className="absolute flex items-center justify-center group -translate-x-1/2 -translate-y-1/2" style={{ top: `${memory.y}%`, left: `${memory.x}%`, zIndex: selectedMemory?.id === memory.id ? 50 : 10 }} 
                            onClick={() => { if (isLocked) { alert(`이 기억은 ${new Date(memory.unlock_date!).toLocaleDateString()}에 깨어납니다.`); } else { handleSelectFlower(memory); } }}
                            initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: isLocked ? 0 : 0, y: isLocked ? [0, 3, 0] : 0 }} transition={{ default: { delay: index * 0.1, type: "spring", stiffness: 200, damping: 15 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
                          <div className="relative hover:scale-125 transition-transform duration-300">
                              {isTimeCapsule && isLocked ? ( <GoldenCocoon isLocked={true} /> ) : ( <> <MemoryFlower emotion={memory.emotion} isSelected={selectedMemory?.id === memory.id} /> <div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${memory.emotion === 'anger' ? 'bg-red-500' : memory.emotion === 'sadness' ? 'bg-blue-500' : 'bg-yellow-200'}`} /> </> )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </>
              ) : (
                  <OrbitLayer memories={memories} onSelect={handleSelectMemoryWrapper} />
              )}

              <AnimatePresence>
                {selectedMemory && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                      <div className="absolute inset-0 pointer-events-auto" onClick={() => setSelectedMemory(null)} />
                      <motion.div key="memory-card" layoutId={`memory-container-${selectedMemory.id}`} className="relative w-[90%] md:w-[400px] bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden cursor-auto pointer-events-auto" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                            <div className="absolute top-3 left-0 right-0 flex justify-center opacity-30"><div className="w-12 h-1 bg-white rounded-full" /></div>
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[80px] pointer-events-none" />
                            <div className="absolute top-8 right-8 opacity-20 pointer-events-none transform scale-150"><MemoryFlower emotion={selectedMemory.emotion} isSelected={true} /></div>
                            <div className="relative z-10 mt-4">
                                <p className="text-xs text-white/50 mb-4 font-mono tracking-[0.2em] uppercase">{new Date(selectedMemory.created_at).toLocaleDateString()} — {selectedMemory.emotion?.toUpperCase() || 'MEMORY'}</p>
                                <p className="text-white/90 font-light text-lg leading-relaxed italic">"{selectedMemory.summary}"</p>
                            </div>
                            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                            <div className="flex gap-3 mt-8 justify-end">
                                <motion.button onClick={() => deleteMemory(selectedMemory.id)} disabled={isDeleting === selectedMemory.id} className="p-3 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-200/70 hover:text-red-200 transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{isDeleting === selectedMemory.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}</motion.button>
                                <motion.button onClick={() => shareMemory(selectedMemory)} disabled={capturingId === selectedMemory.id} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{capturingId === selectedMemory.id ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}</motion.button>
                            </div>
                        </motion.div>
                      </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {memories.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/30 font-light pointer-events-none"><p>아직 피어난 꽃이 없어.</p></div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particles */}
        <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none" style={{ x: particleX, y: particleY }}>
            {!showJournal && isMounted && particles.length > 0 && particles.slice(0, particleCount).map((p) => {
                let animateProps = {};
                let styleProps: any = { width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, borderRadius: '50%' };
                if (weather === 'rain') { styleProps = { ...styleProps, width: 1, height: p.size * 4, opacity: 0.6, backgroundColor: SOUL_LEVELS[soulLevel].color }; animateProps = { y: ['-10vh', '110vh'] }; } 
                else if (weather === 'snow') { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)`, backgroundColor: 'rgba(255, 255, 255, 0.8)' }; animateProps = { y: ['-10vh', '110vh'], x: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`] }; } 
                else if (weather === 'ember') { styleProps = { ...styleProps, backgroundColor: 'rgba(255, 80, 0, 0.6)', filter: 'blur(1px)' }; animateProps = { y: ['110vh', '-10vh'], opacity: [0, 1, 0] }; } 
                else {
                    if (season === 'spring') { return ( <motion.div key={`spring-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 2, height: p.size * 2 }} animate={{ y: ['-10vh', '110vh'], rotate: [0, 360], x: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: p.duration + 2, ease: "linear" }}> <SpringPetal color="pink" /> </motion.div> ); } 
                    else if (season === 'summer') { return ( <motion.div key={`summer-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }} animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0], opacity: [0, 1, 0.5, 1, 0] }} transition={{ repeat: Infinity, duration: p.duration + 4, ease: "easeInOut" }}> <SummerFirefly color="yellow" /> </motion.div> ); } 
                    else if (season === 'autumn') { return ( <motion.div key={`autumn-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 2.5, height: p.size * 2.5 }} animate={{ y: ['-10vh', '110vh'], rotate: [0, -180], x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: p.duration + 3, ease: "linear" }}> <AutumnLeaf color="#D97706" /> </motion.div> ); } 
                    else { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)`, backgroundColor: 'rgba(255, 255, 255, 0.6)' }; animateProps = { y: ['-10vh', '110vh'], x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`] }; }
                }
                return <motion.div key={`${weather}-${p.id}`} className="absolute pointer-events-none" style={styleProps} animate={animateProps} transition={{ repeat: Infinity, duration: p.duration, delay: Math.random() * 2, ease: "linear" }} />;
            })}
        </motion.div>
        
        {/* [Updated] Spirit Interaction: Pet (Pan) & Hold (PointerDown) */}
        <motion.div className={`absolute inset-0 flex items-center justify-center ${!hasWoken ? 'cursor-pointer z-30' : 'z-30'}`} style={{ x: spiritX, y: spiritY }} onClick={handleSpiritClick}>
           <motion.div 
               className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden" 
               style={{ scale: isBreathing || isHolding ? 1 : spiritScale }} 
               animate={ isSilentMode ? { scale: 1.15, y: 20, filter: 'brightness(1.1) drop-shadow(0 0 30px rgba(255,255,255,0.4))' } : !hasWoken ? { scale: 0.95, filter: 'brightness(0.4) grayscale(0.8) blur(2px)', y: [0, 5, 0] } : isBreathing || isHolding ? { scale: [1, 1.15, 1.15, 1], filter: ['brightness(1)', 'brightness(1.3) drop-shadow(0 0 30px rgba(255,255,255,0.6))', 'brightness(1.3) drop-shadow(0 0 30px rgba(255,255,255,0.6))', 'brightness(1)'] } : callStatus === 'idle' ? { y: [0, -15, 0], filter: ['brightness(0.8) drop-shadow(0 0 10px rgba(255,255,255,0.1))', 'brightness(1) drop-shadow(0 0 25px rgba(255,255,255,0.3))', 'brightness(0.8) drop-shadow(0 0 10px rgba(255,255,255,0.1))'] } : callStatus === 'speaking' ? { y: 0, filter: 'brightness(1.2) drop-shadow(0 0 40px rgba(255,255,255,0.5))' } : { scale: 1.05, y: 0, filter: 'brightness(1.1)' } } 
               transition={ !hasWoken ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : isBreathing || isHolding ? { duration: isHolding ? 1 : 19, times: isHolding ? [0, 0.5, 0.5, 1] : [0, 0.21, 0.58, 1], repeat: Infinity, ease: "easeInOut" } : { y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, filter: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" } } }
               onPan={(e, info) => { if(hasWoken) handlePet(); }}
               onPointerDown={() => { if(hasWoken) setIsHolding(true); }}
               onPointerUp={() => setIsHolding(false)}
               onPointerLeave={() => setIsHolding(false)}
           >
            <SpiritAura type={equippedItems.aura} />
            <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{ backdropFilter: motionValues.blurValue as any, opacity: motionValues.opacityValue as any }} />
            <Image src="/images/spirit_final.png" alt="Bamboo Spirit" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            <SpiritAccessory type={equippedItems.head} />
            <motion.div className="absolute inset-0 bg-white mix-blend-overlay z-30" style={{ opacity: spiritGlowOpacity }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
            
            {!hasWoken && hasStarted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="flex flex-col items-center gap-4">
                        <MousePointerClick className="text-white/50 w-12 h-12" />
                        <p className="text-white/60 font-light text-sm tracking-[0.2em] uppercase">Touch to awaken</p>
                    </motion.div>
                </div>
            )}
            {isBreathing && (<div className="absolute inset-0 flex items-center justify-center z-50"><motion.p className="text-white/90 font-light text-xl tracking-[0.4em] uppercase drop-shadow-lg" animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.1, 1.1, 0.9] }} transition={{ duration: 19, times: [0, 0.2, 0.8, 1], repeat: Infinity }}>Breathe</motion.p></div>)}
          </motion.div>
        </motion.div>

        {/* Silent Input UI */}
        <AnimatePresence>
            {isSilentMode && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute bottom-32 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto">
                    <div className="w-full max-w-md relative">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-2 shadow-2xl">
                            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="정령에게 속삭여보세요..." className="flex-1 bg-transparent border-none text-white/90 placeholder-white/30 px-4 py-2 text-sm focus:outline-none focus:ring-0" autoFocus />
                            <button onClick={handleSendMessage} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"><SendHorizontal size={18} /></button>
                        </div>
                        <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
                            <button onClick={toggleSilentMode} className="text-white/30 hover:text-white/50 text-[10px] uppercase tracking-widest flex items-center gap-1"><X size={12} /> Close Whispers</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute top-[65%] left-0 right-0 z-40 w-full flex flex-col items-center gap-8 pointer-events-none">
          <AnimatePresence mode="wait">
            {callStatus === 'idle' && !showJournal && !spiritMessage && !isBreathing && (
              <motion.div key={WHISPERS[whisperIndex]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute -top-16 text-white/60 text-sm font-light italic tracking-wider drop-shadow-md text-center px-4 w-full">
                {WHISPERS[whisperIndex]}
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {callStatus === 'idle' && !showJournal && !isBreathing ? (
              !hasWoken ? null : 
              !user ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4 pointer-events-auto">
                    <button onClick={signInWithGoogle} className="group flex items-center gap-3 px-8 py-4 bg-white/90 hover:bg-white text-black font-medium rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all active:scale-95">
                        <svg className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span className="tracking-widest text-xs uppercase">Begin your journey</span>
                    </button>
                    <span className="text-white/20 text-[9px] uppercase tracking-[0.3em] opacity-0 animate-[fadeIn_2s_ease-in_forwards]">Sanctuary Awaits</span>
                </motion.div>
              ) : (
                <motion.div className="flex flex-col items-center gap-4 pointer-events-auto relative">
                    {showTutorial && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-12 flex flex-col items-center gap-1">
                            <span className="text-yellow-200/80 text-[10px] font-mono tracking-widest uppercase">Start here</span>
                            <ArrowUp className="text-yellow-200 w-4 h-4 animate-bounce" />
                        </motion.div>
                    )}
                    <motion.button key="start-btn" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={toggleCall} className="px-12 py-6 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 transition-all tracking-widest cursor-pointer">
                    숲으로 입장하기
                    </motion.button>
                </motion.div>
              )
            ) : callStatus !== 'idle' ? (
              <motion.div key="active-status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 pointer-events-auto">
                <div className="flex items-center gap-6">
                    <button onClick={toggleSilentMode} className={`p-4 rounded-full border transition-all duration-300 ${isSilentMode ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}><Keyboard size={20} /></button>
                    <button onClick={toggleCall} className="group relative z-50 p-6 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer active:scale-90">
                        <span className="sr-only">End Call</span>
                        <motion.div animate={{ rotate: callStatus === 'connecting' ? 0 : 90 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/80 group-hover:text-red-200"><path d="M18 6L6 18M6 6l12 12" /></svg></motion.div>
                    </button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <motion.span className="text-[10px] font-medium text-green-400/60 tracking-[0.4em] uppercase" animate={callStatus === 'processing' ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 1.5, repeat: Infinity }}>{getStatusText()}</motion.span>
                  <div className="flex gap-1 items-center h-1 w-24 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-green-400/40" style={{ width: motionValues.barWidth }} /></div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
          {hasWoken && callStatus === 'idle' && (
            <motion.button onClick={handleToggleJournal} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {showJournal ? <X size={20} /> : <Book size={20} />}
            </motion.button>
          )}
          {hasWoken && callStatus === 'idle' && !showJournal && (
             <motion.button onClick={toggleBreathing} className={`p-3 rounded-full backdrop-blur-md border transition-all duration-500 ${isBreathing ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {isBreathing ? <X size={20} /> : <Wind size={20} />}
             </motion.button>
          )}
        </div>

        {hasWoken && callStatus === 'idle' && !showJournal && !isBreathing && (
            <>
                {/* [Restored] Ambience Selectors (Bottom Center) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                    {AMBIENT_SOUNDS.map((sound) => (
                        <button key={sound.id} onClick={() => changeAmbience(sound.type)} className={`p-3 rounded-full transition-all ${selectedAmbience === sound.type ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/10'}`}>
                            <sound.icon size={18} />
                        </button>
                    ))}
                </motion.div>

                <div className="absolute bottom-8 right-24 z-50">
                    <motion.button onClick={() => { triggerLight(); setShowAltar(true); }} className="p-3 rounded-full backdrop-blur-md border bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Palette size={20} />
                    </motion.button>
                </div>
                <div className="absolute bottom-8 right-8 z-50">
                    <motion.button onClick={() => { triggerLight(); setShowSettings(!showSettings); }} className={`p-3 rounded-full backdrop-blur-md border transition-all ${showSettings ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Settings2 size={20} />
                    </motion.button>
                </div>
            </>
        )}

      </motion.div>

      {/* [Restored] Settings Modal */}
      <AnimatePresence>
        {showSettings && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-24 right-8 z-[60] w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60 text-xs font-mono tracking-widest uppercase">Audio Mix</span>
                    <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white"><X size={14}/></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider"><span>Ambience</span><span>{Math.round(bgVolume * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.01" value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))} className="w-full accent-white/50 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider"><span>Voice</span><span>{Math.round(voiceVolume * 100)}%</span></div>
                        <input type="range" min="0" max="1" step="0.01" value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-white/50 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Altar Modal */}
      <AnimatePresence>
        {showAltar && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-black via-zinc-900/95 to-transparent pt-12 pb-8 px-6 rounded-t-3xl backdrop-blur-xl border-t border-white/10 h-[60vh] flex flex-col">
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-white/90 text-xl font-light tracking-widest uppercase">Spirit's Altar</h2>
                        <p className="text-white/40 text-xs mt-1">Offer resonance to bestow gifts.</p>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20"><Gem size={14} /><span className="text-sm font-mono font-bold">{resonance}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-20 no-scrollbar">
                    {ARTIFACTS.map((item) => {
                        const isOwned = ownedItems.includes(item.id);
                        const isEquipped = equippedItems[item.type] === item.id;
                        const canAfford = resonance >= item.cost;
                        return (
                            <button key={item.id} onClick={() => isOwned ? equipArtifact(item) : unlockArtifact(item)} disabled={!isOwned && !canAfford} className={`relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${isEquipped ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : isOwned ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/20 border-white/5 opacity-70'}`}>
                                <div className="text-3xl filter drop-shadow-md">{item.icon}</div>
                                <div className="text-center"><div className="text-white/90 text-xs font-medium uppercase tracking-wider">{item.name}</div><div className="text-white/40 text-[10px] mt-1 line-clamp-1">{item.description}</div></div>
                                <div className="mt-2 w-full">
                                    {isOwned ? ( <div className={`text-[10px] uppercase tracking-widest py-1 rounded-full text-center border ${isEquipped ? 'bg-purple-500 text-white border-purple-500' : 'bg-white/10 text-white/60 border-transparent'}`}>{isEquipped ? 'Equipped' : 'Select'}</div> ) : ( <div className={`flex items-center justify-center gap-1 text-[10px] font-mono py-1 rounded-full border ${canAfford ? 'text-yellow-200 border-yellow-500/30 bg-yellow-500/10' : 'text-red-300 border-red-500/30 bg-red-500/5'}`}>{canAfford ? <Gem size={10} /> : <Lock size={10} />}<span>{item.cost}</span></div> )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => setShowAltar(false)} className="absolute top-4 right-6 text-white/30 hover:text-white"><X size={24} /></button>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMemoryRitual && user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <h3 className="text-white/80 text-lg font-light text-center mb-6 tracking-widest uppercase">Memory Ritual</h3>
                <div className="mb-8">
                    <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-2 text-center">Summary of the Soul</label>
                    <textarea value={pendingSummary} onChange={(e) => setPendingSummary(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white/90 text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none text-center italic" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => finalizeMemory('standard', pendingSummary, user.id)} className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 transition-all">
                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-200 group-hover:scale-110 transition-transform"><Send size={20} /></div>
                        <span className="text-white/60 text-[10px] uppercase tracking-wider group-hover:text-white">Release</span>
                    </button>
                    <button onClick={() => { if (isPremium) { finalizeMemory('capsule', pendingSummary, user.id); } else { alert("성소 멤버십이 필요한 기능입니다."); } }} className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isPremium ? 'bg-white/5 hover:bg-yellow-500/10 border-white/10 hover:border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'}`}>
                        <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/20 text-yellow-200' : 'bg-white/5 text-white/20'}`}>{isPremium ? <Clock size={20} /> : <Lock size={20} />}</div>
                        <span className={`text-[10px] uppercase tracking-wider ${isPremium ? 'text-white/60 group-hover:text-white' : 'text-white/20'}`}>Time Capsule</span>
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={() => setShowMemoryRitual(false)} className="text-white/20 text-[10px] hover:text-white/50 transition-colors uppercase tracking-widest">Discard Memory</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAltar && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-black via-zinc-900/95 to-transparent pt-12 pb-8 px-6 rounded-t-3xl backdrop-blur-xl border-t border-white/10 h-[60vh] flex flex-col">
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-white/90 text-xl font-light tracking-widest uppercase">Spirit's Altar</h2>
                        <p className="text-white/40 text-xs mt-1">Offer resonance to bestow gifts.</p>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20"><Gem size={14} /><span className="text-sm font-mono font-bold">{resonance}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-20 no-scrollbar">
                    {ARTIFACTS.map((item) => {
                        const isOwned = ownedItems.includes(item.id);
                        const isEquipped = equippedItems[item.type] === item.id;
                        const canAfford = resonance >= item.cost;
                        return (
                            <button key={item.id} onClick={() => isOwned ? equipArtifact(item) : unlockArtifact(item)} disabled={!isOwned && !canAfford} className={`relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${isEquipped ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : isOwned ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/20 border-white/5 opacity-70'}`}>
                                <div className="text-3xl filter drop-shadow-md">{item.icon}</div>
                                <div className="text-center"><div className="text-white/90 text-xs font-medium uppercase tracking-wider">{item.name}</div><div className="text-white/40 text-[10px] mt-1 line-clamp-1">{item.description}</div></div>
                                <div className="mt-2 w-full">
                                    {isOwned ? ( <div className={`text-[10px] uppercase tracking-widest py-1 rounded-full text-center border ${isEquipped ? 'bg-purple-500 text-white border-purple-500' : 'bg-white/10 text-white/60 border-transparent'}`}>{isEquipped ? 'Equipped' : 'Select'}</div> ) : ( <div className={`flex items-center justify-center gap-1 text-[10px] font-mono py-1 rounded-full border ${canAfford ? 'text-yellow-200 border-yellow-500/30 bg-yellow-500/10' : 'text-red-300 border-red-500/30 bg-red-500/5'}`}>{canAfford ? <Gem size={10} /> : <Lock size={10} />}<span>{item.cost}</span></div> )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => setShowAltar(false)} className="absolute top-4 right-6 text-white/30 hover:text-white"><X size={24} /></button>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMemoryRitual && user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <h3 className="text-white/80 text-lg font-light text-center mb-6 tracking-widest uppercase">Memory Ritual</h3>
                <div className="mb-8">
                    <label className="block text-white/40 text-[10px] uppercase tracking-wider mb-2 text-center">Summary of the Soul</label>
                    <textarea value={pendingSummary} onChange={(e) => setPendingSummary(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white/90 text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none text-center italic" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => finalizeMemory('standard', pendingSummary, user.id)} className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 transition-all">
                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-200 group-hover:scale-110 transition-transform"><Send size={20} /></div>
                        <span className="text-white/60 text-[10px] uppercase tracking-wider group-hover:text-white">Release</span>
                    </button>
                    <button onClick={() => { if (isPremium) { finalizeMemory('capsule', pendingSummary, user.id); } else { alert("성소 멤버십이 필요한 기능입니다."); } }} className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isPremium ? 'bg-white/5 hover:bg-yellow-500/10 border-white/10 hover:border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'}`}>
                        <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/20 text-yellow-200' : 'bg-white/5 text-white/20'}`}>{isPremium ? <Clock size={20} /> : <Lock size={20} />}</div>
                        <span className={`text-[10px] uppercase tracking-wider ${isPremium ? 'text-white/60 group-hover:text-white' : 'text-white/20'}`}>Time Capsule</span>
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={() => setShowMemoryRitual(false)} className="text-white/20 text-[10px] hover:text-white/50 transition-colors uppercase tracking-widest">Discard Memory</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}