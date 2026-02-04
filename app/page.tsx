'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Book, X, Star, Share2, Loader2, Trash2, Headphones, Sparkles, Droplets, Wind, Trees, CloudRain, Flame, Waves, Lock, Sun, Settings2, Volume2, Mic, LogIn, LogOut, Hourglass, Send, Clock, LayoutGrid, MousePointerClick, Keyboard, SendHorizontal, Palette, Mail, Moon, Bed, Square } from 'lucide-react';

import { useBambooEngine } from './hooks/useBambooEngine';
import { useRipple } from './hooks/useRipple';
import { Memory, WeatherType, Particle } from './types';
import { getMoonPhase, getMoonIconPath } from './utils/moonPhase';

// Components
import { SpiritAura, SpiritAccessory, SpringPetal, SummerFirefly, AutumnLeaf, ConstellationLayer, OrbitLayer, MemoryFlower, GoldenCocoon } from './components/ForestVisuals';
import { OracleModal, SettingsModal, AltarModal, ProfileModal } from './components/ForestModals';
import { MemoryRitual } from './components/MemoryRitual';

// Constants
const WHISPERS = ["오늘 하루는 어땠어?", "누구에게도 말 못 할 고민이 있니?", "그냥 빗소리만 듣고 싶다면, 그래도 돼.", "무거운 짐은 잠시 여기에 내려놓아.", "바람이 네 이야기를 기다리고 있어.", "괜찮아, 아무 말 안 해도 돼.", "어제보다 오늘 마음은 좀 어때?"];
const SOUL_LEVELS: { [key: number]: { name: string, color: string } } = { 1: { name: "Mist", color: "rgba(255, 255, 255, 0.4)" }, 2: { name: "Dew", color: "rgba(0, 255, 255, 0.6)" }, 3: { name: "Bloom", color: "rgba(200, 100, 255, 0.6)" }, 4: { name: "Aurora", color: "rgba(255, 215, 0, 0.7)" }, };
const AMBIENT_SOUNDS: { id: string, name: string, icon: any, type: WeatherType }[] = [
    { id: 'forest', name: 'Deep Forest', icon: Trees, type: 'clear' },
    { id: 'rain', name: 'Rainy Window', icon: CloudRain, type: 'rain' },
    { id: 'fire', name: 'Crackling Fire', icon: Flame, type: 'ember' },
    { id: 'ocean', name: 'Windy Peaks', icon: Waves, type: 'snow' },
];

export default function BambooForest() {
  const engine = useBambooEngine();
  
  // [Fix] Destructuring Variables properly (Fixed ReferenceError: bgVolume, user etc)
  const { 
      user, isPremium, memories, 
      bgVolume, voiceVolume, 
      motionValues, hasWoken, callStatus, isSilentMode 
  } = engine;

  const { ripples, addRipple } = useRipple();
  
  // Local UI States
  const [showMailbox, setShowMailbox] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'stars' | 'orbit'>('stars');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Intro Visibility State
  const [introVisible, setIntroVisible] = useState(true);

  const handleEnterForest = () => {
      engine.initAudio(); 
      engine.startExperience();
      setIntroVisible(false);
  };

  const handleSendMessage = () => { if (inputText.trim()) { engine.sendTextMessage(inputText); setInputText(""); } };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } else { engine.playPaperRustle(); } };
  const handleGlobalClick = (e: React.PointerEvent) => { addRipple(e); };
  const handleSpiritClick = () => { if (!hasWoken) engine.wakeSpirit(); };
  
  // [Fix] Defined getUserInitial properly
  const getUserInitial = () => { if (user?.email) return user.email[0].toUpperCase(); return "U"; };
  const avatarBorderClass = isPremium ? "border-yellow-400/50 shadow-[0_0_15px_rgba(253,224,71,0.3)]" : "border-white/20";

  // Motion Transforms
  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);
  const moonPath = getMoonIconPath(moonPhase);

  const moonX = useTransform(motionValues.mouseX, [-1, 1], ["2%", "-2%"]); 
  const moonY = useTransform(motionValues.mouseY, [-1, 1], ["2%", "-2%"]);
  const bgX = useTransform(motionValues.mouseX, [-1, 1], ["-5%", "5%"]); 
  const bgY = useTransform(motionValues.mouseY, [-1, 1], ["-5%", "5%"]);
  const particleX = useTransform(motionValues.mouseX, [-1, 1], ["-10%", "10%"]); 
  const particleY = useTransform(motionValues.mouseY, [-1, 1], ["-10%", "10%"]);
  const spiritX = useTransform(motionValues.mouseX, [-1, 1], ["15%", "-15%"]); 
  const spiritY = useTransform(motionValues.mouseY, [-1, 1], ["15%", "-15%"]);
  const spiritScale = useTransform(motionValues.springVolume, (v) => 1 + v * 0.15);
  const spiritGlow = useTransform(motionValues.springVolume, [0, 1], ["drop-shadow(0 0 10px rgba(255,255,255,0.2))", "drop-shadow(0 0 50px rgba(255,255,210,0.8))"]);
  const spiritGlowOpacity = useTransform(motionValues.springVolume, [0, 1], [0, 0.6]);

  useEffect(() => {
      const newParticles = Array.from({ length: 100 }).map((_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 5 + 2, delay: Math.random() * 2 }));
      setParticles(newParticles);
      const interval = setInterval(() => setWhisperIndex((prev) => (prev + 1) % WHISPERS.length), 6000); 
      return () => clearInterval(interval); 
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none" onMouseMove={(e) => {}} onPointerDown={handleGlobalClick}>
        
        {/* 1. Intro Overlay */}
        <AnimatePresence>
            {engine.isMounted && introVisible && (
                <motion.div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer" onClick={handleEnterForest} exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center gap-8">
                        <div className="p-6 rounded-full border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(255,255,255,0.05)]"><Headphones size={48} className="text-white/80" strokeWidth={1} /></div>
                        <div className="text-center space-y-4">
                            <p className="text-white/60 text-xs tracking-[0.3em] uppercase font-light">Headphones Recommended</p>
                            <motion.p className="text-white/30 text-[10px] tracking-[0.4em] uppercase" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>Touch to Enter</motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Audio */}
        <audio ref={(el) => { engine.audioRefs.current.clear = el; }} src="/sounds/forest_ambience.mp3" loop />
        <audio ref={(el) => { engine.audioRefs.current.rain = el; }} src="/sounds/rain.mp3" loop />
        <audio ref={(el) => { engine.audioRefs.current.snow = el; }} src="/sounds/wind.mp3" loop />
        <audio ref={(el) => { engine.audioRefs.current.ember = el; }} src="/sounds/fire.mp3" loop />

        {/* Background & Particles */}
        <motion.div className="absolute inset-0 w-full h-full" animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <motion.div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-gray-900/50 to-transparent mix-blend-hard-light" animate={{ opacity: hasWoken ? 0 : 1 }} transition={{ duration: 3 }} />
            <motion.div className="absolute inset-[-5%] w-[110%] h-[110%]" style={{ x: bgX, y: bgY }}>
                <motion.div className={`absolute inset-0 bg-gradient-to-b ${engine.backgroundGradient.join(' ')}`} animate={{ opacity: callStatus === 'idle' && !engine.showJournal ? 0.7 : engine.showJournal ? 0.2 : 1 }} transition={{ duration: 2.5 }} />
            </motion.div>
            
            {engine.sleepTimer !== null && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 3 }} className="absolute inset-0 z-20 bg-black pointer-events-none" /> )}

            <motion.div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-0 mix-blend-screen" style={{ x: moonX, y: moonY }}>
                {engine.isDaytime ? ( <div className="relative w-32 h-32 opacity-90"><div className="absolute inset-0 bg-orange-200/30 blur-[60px] rounded-full" /></div> ) : ( <div className="relative w-32 h-32 opacity-80"><svg viewBox="0 0 24 24" className="w-full h-full text-yellow-100 blur-[0.5px] drop-shadow-[0_0_15px_rgba(255,255,200,0.5)]"><path d={moonPath} fill="currentColor" /></svg><div className="absolute inset-0 bg-yellow-100/20 blur-[50px] rounded-full" /></div> )}
            </motion.div>
            
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"><AnimatePresence>{ripples.map((ripple) => (<motion.div key={ripple.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute border border-white/30 rounded-full bg-white/5 backdrop-blur-[1px]" style={{ left: ripple.x, top: ripple.y, width: 100, height: 100, x: "-50%", y: "-50%" }} />))}</AnimatePresence></div>

            <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none" style={{ x: particleX, y: particleY }}>
                {!engine.showJournal && engine.isMounted && particles.length > 0 && particles.slice(0, 20).map((p) => {
                    if (engine.weather === 'rain') { return <motion.div key={`rain-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: 1, height: p.size * 4, opacity: 0.6, backgroundColor: SOUL_LEVELS[engine.soulLevel].color }} animate={{ y: ['-10vh', '110vh'] }} transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }} />; }
                    if (engine.season === 'spring') { return <motion.div key={`spring-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 2, height: p.size * 2 }} animate={{ y: ['-10vh', '110vh'], rotate: [0, 360] }} transition={{ duration: p.duration + 2, repeat: Infinity, ease: "linear" }}><SpringPetal color="pink" /></motion.div>; }
                    return <motion.div key={p.id} className="absolute pointer-events-none bg-white/50 w-1 h-1 rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%` }} animate={{ y: ['-10vh', '110vh'] }} transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }} />;
                })}
            </motion.div>

            {/* Spirit */}
            <motion.div className={`absolute inset-0 flex items-center justify-center ${!hasWoken ? 'cursor-pointer z-30' : 'z-30'}`} style={{ x: spiritX, y: spiritY }} onClick={handleSpiritClick}>
                <motion.div className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden transition-all duration-300" style={{ scale: engine.isBreathing || engine.isHolding ? 1 : spiritScale, filter: spiritGlow as any }} animate={isSilentMode ? { scale: 1.15, y: 20 } : !hasWoken ? { scale: 0.95, y: [0, 5, 0] } : { scale: 1.05, y: 0 }} transition={{ duration: 4, ease: "easeInOut" }} onPan={(e, info) => { if(hasWoken) engine.handlePet(); }} onPointerDown={() => engine.setIsHolding(true)} onPointerUp={() => engine.setIsHolding(false)}>
                    <SpiritAura type={engine.equippedItems.aura} />
                    <Image src="/images/spirit_final.png" alt="Spirit" fill className="object-cover" />
                    <SpiritAccessory type={engine.equippedItems.head} />
                    <motion.div className="absolute inset-0 bg-white mix-blend-overlay z-30" style={{ opacity: spiritGlowOpacity as any }} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
                    {!hasWoken && <div className="absolute inset-0 flex flex-col items-center justify-center z-50"><motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="flex flex-col items-center gap-4"><MousePointerClick className="text-white/50 w-12 h-12" /><p className="text-white/60 font-light text-sm tracking-[0.2em] uppercase">Touch to awaken</p></motion.div></div>}
                    {engine.isBreathing && <div className="absolute inset-0 flex items-center justify-center z-50"><motion.p className="text-white/90 font-light text-xl tracking-[0.4em] uppercase drop-shadow-lg" animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.1, 1.1, 0.9] }} transition={{ duration: 19, times: [0, 0.2, 0.8, 1], repeat: Infinity }}>Breathe</motion.p></div>}
                </motion.div>
            </motion.div>
        </motion.div>

        {/* --- UI Controls --- */}
        <AnimatePresence>{isSilentMode && (<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-32 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto"><div className="w-full max-w-md relative"><div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-2 shadow-2xl"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="정령에게 속삭여보세요..." className="flex-1 bg-transparent border-none text-white/90 placeholder-white/30 px-4 py-2 text-sm focus:outline-none" /><button onClick={handleSendMessage} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"><SendHorizontal size={18} /></button></div><div className="absolute -bottom-10 left-0 right-0 flex justify-center"><button onClick={engine.toggleSilentMode} className="text-white/30 hover:text-white/50 text-[10px] uppercase tracking-widest flex items-center gap-1"><X size={12} /> Close Whispers</button></div></div></motion.div>)}</AnimatePresence>

        <div className="absolute top-[65%] left-0 right-0 z-40 w-full flex flex-col items-center gap-8 pointer-events-none">
            <AnimatePresence mode="wait">{callStatus === 'idle' && !engine.showJournal && !engine.spiritMessage && !engine.isBreathing && <motion.div key={WHISPERS[whisperIndex]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute -top-16 text-white/60 text-sm font-light italic tracking-wider drop-shadow-md text-center px-4 w-full">{WHISPERS[whisperIndex]}</motion.div>}</AnimatePresence>
            <AnimatePresence mode="wait">
                {callStatus === 'idle' && !engine.showJournal && !engine.isBreathing ? (
                    !hasWoken ? null : !user ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 pointer-events-auto">
                            <button onClick={engine.signInWithGoogle} className="group flex items-center gap-3 px-8 py-4 bg-white/90 hover:bg-white text-black font-medium rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all active:scale-95"><span className="tracking-widest text-xs uppercase">Begin your journey</span></button>
                        </motion.div>
                    ) : (
                        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={engine.toggleCall} className="px-12 py-6 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 transition-all tracking-widest cursor-pointer pointer-events-auto">숲으로 입장하기</motion.button>
                    )
                ) : engine.callStatus !== 'idle' ? (
                    <motion.div key="active-status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 pointer-events-auto">
                        <div className="flex items-center gap-6">
                            <button onClick={engine.toggleSilentMode} className={`p-4 rounded-full border transition-all duration-300 ${isSilentMode ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}><Keyboard size={20} /></button>
                            <button onClick={engine.toggleCall} className="group relative z-50 p-6 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer active:scale-90"><span className="sr-only">End Call</span><motion.div animate={{ rotate: engine.callStatus === 'connecting' ? 0 : 90 }}><X size={24} className="text-white/80 group-hover:text-red-200" /></motion.div></button>
                        </div>
                        <div className="flex flex-col items-center gap-2"><motion.span className="text-[10px] font-medium text-green-400/60 tracking-[0.4em] uppercase" animate={engine.callStatus === 'processing' ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 1.5, repeat: Infinity }}>{engine.getStatusText()}</motion.span></div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>

        {/* Top & Bottom Controls */}
        <div className="absolute top-8 left-8 z-50 flex flex-col gap-4 pointer-events-auto">
            {hasWoken && callStatus === 'idle' && (<motion.button onClick={engine.setShowJournal.bind(null, !engine.showJournal)} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{engine.showJournal ? <X size={20} /> : <Book size={20} />}</motion.button>)}
            {hasWoken && callStatus === 'idle' && !engine.showJournal && (<><motion.button onClick={engine.toggleBreathing} className={`p-3 rounded-full backdrop-blur-md border transition-all duration-500 ${engine.isBreathing ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{engine.isBreathing ? <X size={20} /> : <Wind size={20} />}</motion.button><motion.button onClick={() => { if(engine.sleepTimer) engine.stopSleepTimer(); else setShowSleepMenu(!showSleepMenu); }} className={`p-3 rounded-full backdrop-blur-md border transition-all duration-500 ${engine.sleepTimer ? 'bg-purple-500/20 border-purple-400/50 text-purple-200' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{engine.sleepTimer ? <span className="text-[10px] font-mono font-bold">{Math.floor(engine.sleepTimer / 60)}m</span> : <Moon size={20} />}</motion.button></>)}
        </div>

        <AnimatePresence>{showSleepMenu && !engine.sleepTimer && (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute top-8 left-24 z-50 flex gap-2 pointer-events-auto">{[15, 30, 60].map((min) => (<button key={min} onClick={() => { engine.startSleepTimer(min); setShowSleepMenu(false); }} className="px-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1"><Bed size={12} /> {min}m</button>))}</motion.div>)}</AnimatePresence>

        {hasWoken && callStatus === 'idle' && !engine.showJournal && !engine.isBreathing && (
            <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md pointer-events-auto">{AMBIENT_SOUNDS.map((sound) => (<button key={sound.id} onClick={() => engine.changeAmbience(sound.type)} className={`p-3 rounded-full transition-all ${engine.selectedAmbience === sound.type ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}><sound.icon size={18} /></button>))}</motion.div>
                <div className="absolute bottom-8 right-24 z-50 pointer-events-auto"><motion.button onClick={() => { engine.triggerLight(); engine.setShowAltar(true); }} className="p-3 rounded-full backdrop-blur-md border bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Palette size={20} /></motion.button></div>
                <div className="absolute bottom-8 right-8 z-50 pointer-events-auto"><motion.button onClick={() => { engine.triggerLight(); engine.setShowSettings(!engine.showSettings); }} className={`p-3 rounded-full backdrop-blur-md border transition-all ${engine.showSettings ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/10'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Settings2 size={20} /></motion.button></div>
            </>
        )}

      {/* [Fix] Expanded Top Right Controls - No Syntax Error */}
      <AnimatePresence>
        {hasWoken && callStatus === 'idle' && !engine.showJournal && !engine.isBreathing && user && (
            <div className="absolute top-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-auto">
                <motion.button 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => {
                        if (isPremium) {
                            setShowMailbox(true);
                            if (engine.letters.length === 0) engine.generateMonthlyLetter(); 
                        } else {
                            alert("영혼의 서신은 성소 멤버십 회원에게만 도착합니다.");
                        }
                    }} 
                    className={`flex items-center justify-center w-12 h-12 backdrop-blur-md border rounded-full transition-all shadow-lg ${isPremium ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' : 'bg-white/5 border-white/10 text-white/30'}`}
                >
                    {isPremium ? <Mail size={20} /> : <Lock size={16} />}
                </motion.button>

                {isPremium && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        className="group cursor-pointer flex flex-col items-center gap-2" 
                        onClick={() => alert("타임 캡슐은 곧 열립니다.")}
                    >
                        <div className="relative flex items-center justify-center w-12 h-12 bg-black/40 backdrop-blur-md rounded-full border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)] group-hover:bg-yellow-500/10 transition-colors">
                            <Hourglass className="text-yellow-200" size={18} />
                            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-10 animate-pulse" />
                        </div>
                    </motion.button>
                )}

                {!engine.hasCollectedDew && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0 }} 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={engine.collectDew} 
                        className="group cursor-pointer flex flex-col items-center gap-2"
                    >
                        <div className="relative flex items-center justify-center w-12 h-12 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg group-hover:bg-white/10 transition-colors">
                            <Droplets className="text-blue-200" size={20} />
                            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping" />
                        </div>
                    </motion.button>
                )}

                <motion.button 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => { engine.triggerLight(); setShowProfile(!showProfile); }} 
                    className={`flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md border rounded-full text-white/90 hover:bg-white/20 transition-all shadow-lg overflow-hidden ${avatarBorderClass}`}
                >
                    <span className="text-lg font-bold">{getUserInitial()}</span>
                </motion.button>
            </div>
        )}
      </AnimatePresence>

        {/* MODALS */}
        <OracleModal isOpen={engine.showOracleModal} card={engine.todaysCard} onConfirm={engine.confirmOracle} />
        <SettingsModal isOpen={engine.showSettings} onClose={() => engine.setShowSettings(false)} bgVolume={bgVolume} setBgVolume={engine.setBgVolume} voiceVolume={voiceVolume} setVoiceVolume={engine.setVoiceVolume} />
        <AltarModal isOpen={engine.showAltar} onClose={() => engine.setShowAltar(false)} resonance={engine.resonance} artifacts={engine.ARTIFACTS} ownedItems={engine.ownedItems} equippedItems={engine.equippedItems} onUnlock={engine.unlockArtifact} onEquip={engine.equipArtifact} />
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={user} isPremium={isPremium} signOut={engine.signOut} getUserInitial={getUserInitial} />
        
        {/* Memory Ritual */}
        <MemoryRitual isOpen={engine.showMemoryRitual} onClose={() => engine.setShowMemoryRitual(false)} user={user} isPremium={isPremium} onFinalize={engine.finalizeMemory} onSaveCapsule={engine.saveVoiceCapsule} />

        {/* Mailbox */}
        <AnimatePresence>
            {showMailbox && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 pointer-events-auto">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-lg bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-center mb-8"><h2 className="text-yellow-100/80 text-lg font-serif italic tracking-wider">Soul Letters</h2><button onClick={() => setShowMailbox(false)}><X className="text-white/30 hover:text-white" /></button></div>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">{engine.letters.length === 0 ? (<div className="text-center py-10 text-white/30 font-light text-sm"><p>아직 도착한 편지가 없습니다.</p><p className="mt-2 text-[10px]">달이 차오르면 정령이 편지를 보낼 것입니다.</p></div>) : (engine.letters.map((letter: any) => (<motion.div key={letter.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/5 p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => setSelectedLetter(letter)}><div className="flex justify-between items-baseline mb-2"><span className="text-yellow-500/80 text-xs font-mono uppercase tracking-widest">{letter.month}의 기록</span><span className="text-white/20 text-[10px]">{new Date(letter.created_at).toLocaleDateString()}</span></div><p className="text-white/60 text-sm line-clamp-2 font-serif italic group-hover:text-white/80 transition-colors">{letter.content}</p></motion.div>)))}</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {selectedLetter && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-black flex items-center justify-center p-4 md:p-12 pointer-events-auto">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl w-full bg-[#0c0c0c] border border-[#222] p-8 md:p-16 rounded-sm shadow-2xl relative">
                        <button onClick={() => setSelectedLetter(null)} className="absolute top-6 right-6 text-white/20 hover:text-white"><X /></button>
                        <div className="text-center mb-12"><Sparkles className="w-6 h-6 text-yellow-500/50 mx-auto mb-4" /><h3 className="text-white/40 text-xs font-mono uppercase tracking-[0.3em]">{selectedLetter.month}</h3></div>
                        <p className="text-white/80 font-serif text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-justify">{selectedLetter.content}</p>
                        <div className="mt-12 text-right"><p className="text-white/30 text-xs font-serif italic">- 숲의 정령</p></div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Journal Layer */}
        <AnimatePresence>
          {engine.showJournal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl pointer-events-auto">
              <div className="absolute top-8 right-20 z-50 flex gap-2"><button onClick={() => { engine.triggerLight(); setViewMode(viewMode === 'stars' ? 'orbit' : 'stars'); }} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white/70 transition-all flex items-center gap-2 border border-white/5">{viewMode === 'stars' ? <LayoutGrid size={20} /> : <Star size={20} />}<span className="text-[10px] uppercase tracking-widest hidden md:block">{viewMode === 'stars' ? 'Orbit View' : 'Star View'}</span></button></div>
              {viewMode === 'stars' ? (
                  <>
                    <ConstellationLayer memories={memories} />
                    {memories.map((item, index) => {
                      const memory = item as Memory & { x: number; y: number; unlock_date?: string };
                      if (typeof memory.x !== 'number' || typeof memory.y !== 'number') return null;
                      const isTimeCapsule = !!memory.unlock_date; 
                      const isLocked = isTimeCapsule && new Date(memory.unlock_date!) > new Date(); 
                      return (
                        <motion.button key={memory.id} layoutId={`memory-container-${memory.id}`} className="absolute flex items-center justify-center group -translate-x-1/2 -translate-y-1/2" style={{ top: `${memory.y}%`, left: `${memory.x}%`, zIndex: selectedMemory?.id === memory.id ? 50 : 10 }} onClick={() => { if (isLocked) { alert(`이 기억은 ${new Date(memory.unlock_date!).toLocaleDateString()}에 깨어납니다.`); } else { engine.playMagicDust(); engine.triggerLight(); setSelectedMemory(memory); } }} initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: isLocked ? 0 : 0, y: isLocked ? [0, 3, 0] : 0 }} transition={{ default: { delay: index * 0.1, type: "spring", stiffness: 200, damping: 15 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
                          <div className="relative hover:scale-125 transition-transform duration-300">{isTimeCapsule && isLocked ? ( <GoldenCocoon isLocked={true} /> ) : ( <> <MemoryFlower emotion={memory.emotion} isSelected={selectedMemory?.id === memory.id} /> <div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${memory.emotion === 'anger' ? 'bg-red-500' : memory.emotion === 'sadness' ? 'bg-blue-500' : 'bg-yellow-200'}`} /> </> )}</div>
                        </motion.button>
                      );
                    })}
                  </>
              ) : (
                  <OrbitLayer memories={memories} onSelect={(m) => { engine.playMagicDust(); engine.triggerLight(); setSelectedMemory(m); }} />
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
                                {selectedMemory.audio_url && (<div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"><div className="flex items-center gap-3 mb-2"><Headphones size={16} className="text-yellow-200" /><span className="text-[10px] text-yellow-200/80 uppercase tracking-widest">Voice from the past</span></div><audio src={selectedMemory.audio_url} controls className="w-full h-8 opacity-80" /></div>)}
                            </div>
                            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                            <div className="flex gap-3 mt-8 justify-end">
                                <motion.button onClick={() => engine.deleteMemory(selectedMemory.id)} disabled={engine.isDeleting === selectedMemory.id} className="p-3 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-200/70 hover:text-red-200 transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{engine.isDeleting === selectedMemory.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}</motion.button>
                                <motion.button onClick={() => engine.shareMemory(selectedMemory)} disabled={engine.capturingId === selectedMemory.id} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{engine.capturingId === selectedMemory.id ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}</motion.button>
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
    </main>
  );
}