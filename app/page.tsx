'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, PanInfo, useTransform } from 'framer-motion';
import { Book, X, Star, Share2, Loader2, Trash2, Headphones, Sparkles, Droplets, Wind, Trees, CloudRain, Flame, Waves, Lock, Sun, Settings2, Volume2, Mic } from 'lucide-react';
import { useBambooEngine } from './hooks/useBambooEngine';
import { useRipple } from './hooks/useRipple';
import { Particle, Memory } from './types';
import { getMoonPhase, getMoonIconPath } from './utils/moonPhase';

const WHISPERS = ["오늘 하루는 어땠어?", "누구에게도 말 못 할 고민이 있니?", "그냥 빗소리만 듣고 싶다면, 그래도 돼.", "무거운 짐은 잠시 여기에 내려놓아.", "바람이 네 이야기를 기다리고 있어.", "괜찮아, 아무 말 안 해도 돼.", "어제보다 오늘 마음은 좀 어때?"];
const SOUL_LEVELS: { [key: number]: { name: string, color: string } } = { 1: { name: "Mist", color: "rgba(255, 255, 255, 0.4)" }, 2: { name: "Dew", color: "rgba(0, 255, 255, 0.6)" }, 3: { name: "Bloom", color: "rgba(200, 100, 255, 0.6)" }, 4: { name: "Aurora", color: "rgba(255, 215, 0, 0.7)" }, };

// [Fix] Sound Mapping - level을 1로 풀어둠 (모두 해금)
// type 값은 audioRefs의 key와 일치해야 함: 'clear', 'rain', 'ember', 'snow'
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

const ConstellationLayer = ({ memories }: { memories: Memory[] }) => {
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [memories]);
  if (sortedMemories.length < 2) return null;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {sortedMemories.map((memory, index) => {
        if (index === 0) return null;
        const prev = sortedMemories[index - 1];
        return (
          <motion.line key={`line-${memory.id}`} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${memory.x}%`} y2={`${memory.y}%`} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: index * 0.2, ease: "easeInOut" }} />
        );
      })}
    </svg>
  );
};

export default function BambooForest() {
  const {
    isMounted, hasStarted, startExperience,
    callStatus, backgroundGradient, weather, spiritMessage, memories,
    toggleCall, getStatusText, audioRefs, motionValues,
    capturingId, shareMemory, deleteMemory, isDeleting,
    showEasterEgg, handleMouseMove,
    soulLevel, resonance,
    hasCollectedDew, collectDew, dailyQuote,
    isBreathing, toggleBreathing,
    playPaperRustle, playMagicDust, triggerLight,
    selectedAmbience, changeAmbience,
    isDaytime, bgVolume, setBgVolume, voiceVolume, setVoiceVolume
  } = useBambooEngine();

  const { ripples, addRipple } = useRipple();
  const [showJournal, setShowJournal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

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
  const spiritGlowOpacity = useTransform(motionValues.springVolume, [0, 1], [0, 0.6]);

  useEffect(() => { const interval = setInterval(() => setWhisperIndex((prev) => (prev + 1) % WHISPERS.length), 6000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (callStatus !== 'idle') setShowJournal(false); }, [callStatus]);
  useEffect(() => { if (selectedMemory && !memories.find(m => m.id === selectedMemory.id)) setSelectedMemory(null); }, [memories, selectedMemory]);
  const particles = useMemo<Particle[]>(() => Array.from({ length: 100 }).map((_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 5 + 2, delay: Math.random() * 2 })), []);
  const particleCount = weather === 'rain' ? 60 : weather === 'snow' ? 40 : 20;
  const handleDragEnd = (event: any, info: PanInfo) => { if (info.offset.y > 100) setSelectedMemory(null); };
  const getProgress = () => { if (soulLevel === 1) return (resonance / 60) * 100; if (soulLevel === 2) return ((resonance - 60) / 240) * 100; if (soulLevel === 3) return ((resonance - 300) / 300) * 100; return 100; };

  const handleToggleJournal = () => { playPaperRustle(); triggerLight(); setShowJournal(!showJournal); };
  const handleSelectFlower = (m: Memory) => { playMagicDust(); triggerLight(); setSelectedMemory(m); };
  const handleGlobalClick = (e: React.PointerEvent) => { addRipple(e); };

  return (
    <main className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none" onMouseMove={handleMouseMove} onPointerDown={handleGlobalClick}>
      {/* Audio Sources: ref 키와 src 파일이 올바르게 매핑되었는지 확인 */}
      <audio ref={(el) => { audioRefs.current.clear = el; }} src="/sounds/forest_ambience.mp3" loop />
      <audio ref={(el) => { audioRefs.current.rain = el; }} src="/sounds/rain.mp3" loop />
      <audio ref={(el) => { audioRefs.current.snow = el; }} src="/sounds/wind.mp3" loop />
      <audio ref={(el) => { audioRefs.current.ember = el; }} src="/sounds/fire.mp3" loop />
      
      <motion.div className="absolute inset-0 w-full h-full" animate={{ filter: hasStarted ? 'blur(0px)' : 'blur(20px)', opacity: hasStarted ? 1 : 0 }} transition={{ duration: 2 }}>
        
        {/* Background Layer */}
        <motion.div className="absolute inset-[-5%] w-[110%] h-[110%]" style={{ x: bgX, y: bgY }}>
           <motion.div className={`absolute inset-0 bg-gradient-to-b ${backgroundGradient.join(' ')}`} animate={{ opacity: callStatus === 'idle' && !showJournal ? 0.7 : showJournal ? 0.2 : 1 }} transition={{ duration: 2.5 }} />
        </motion.div>

        {/* Celestial Body Layer */}
        <motion.div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-0 mix-blend-screen" style={{ x: moonX, y: moonY }}>
            {isDaytime ? (
                <div className="relative w-32 h-32 opacity-90"><svg viewBox="0 0 24 24" className="w-full h-full text-orange-100 blur-[1px] drop-shadow-[0_0_30px_rgba(255,200,100,0.8)]"><circle cx="12" cy="12" r="8" fill="currentColor" /></svg><div className="absolute inset-0 bg-orange-200/30 blur-[60px] rounded-full" /></div>
            ) : (
                <div className="relative w-32 h-32 opacity-80"><svg viewBox="0 0 24 24" className="w-full h-full text-yellow-100 blur-[0.5px] drop-shadow-[0_0_15px_rgba(255,255,200,0.5)]"><path d={moonPath} fill="currentColor" /></svg><div className="absolute inset-0 bg-yellow-100/20 blur-[50px] rounded-full" /></div>
            )}
        </motion.div>
        
        {/* Ripples */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"><AnimatePresence>{ripples.map((ripple) => (<motion.div key={ripple.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="absolute border border-white/30 rounded-full bg-white/5 backdrop-blur-[1px]" style={{ left: ripple.x, top: ripple.y, width: 100, height: 100, x: "-50%", y: "-50%" }} />))}</AnimatePresence></div>

        {/* Easter Egg */}
        <AnimatePresence>
          {showEasterEgg && callStatus === 'idle' && !showJournal && (
            <motion.div className="absolute pointer-events-none z-5" style={{ bottom: '15%', left: '-20%' }} initial={{ opacity: 0, x: 0 }} animate={{ opacity: [0, 0.3, 0], x: '140vw' }} transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatDelay: 30 }}>
               <svg width="150" height="150" viewBox="0 0 24 24" fill="white" className="blur-[2px] opacity-60 transform -scale-x-100"><path d="M16.53 11.5l-2.09-1.21c-.33-.19-.59-.47-.76-.81L13 8V4h-2v4l-.68 1.48c-.17.34-.43.62-.76.81L7.47 11.5c-.88.51-1.47 1.46-1.47 2.5V21h2v-5h2v5h2v-5h2v5h2v-7c0-1.04-.59-1.99-1.47-2.5zM10 3.5C10 2.67 10.67 2 11.5 2S13 2.67 13 3.5 12.33 5 11.5 5 10 4.33 10 3.5z"/></svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Morning Dew */}
        <AnimatePresence>
          {!hasCollectedDew && callStatus === 'idle' && !showJournal && !isBreathing && (
            <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={collectDew} className="absolute top-8 right-8 z-50 group cursor-pointer flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center w-14 h-14 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg group-hover:bg-white/10 transition-colors"><Droplets className="text-blue-200 drop-shadow-[0_0_10px_rgba(100,200,255,0.8)]" size={24} strokeWidth={1.5} /><div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping" /></div><span className="text-[10px] text-blue-100/80 tracking-widest uppercase font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">Collect Dew</span>
            </motion.button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm">
              <ConstellationLayer memories={memories} />
              {memories.map((memory, index) => (
                <motion.button key={memory.id} className="absolute flex items-center justify-center group -translate-x-1/2 -translate-y-1/2" style={{ top: `${memory.y}%`, left: `${memory.x}%` }} initial={{ scale: 0, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 15 }} onClick={() => handleSelectFlower(memory)}>
                  <div className="relative hover:scale-125 transition-transform duration-300"><MemoryFlower emotion={memory.emotion} isSelected={selectedMemory?.id === memory.id} /><div className={`absolute inset-0 blur-md opacity-40 animate-pulse ${memory.emotion === 'anger' ? 'bg-red-500' : memory.emotion === 'sadness' ? 'bg-blue-500' : 'bg-yellow-200'}`} /></div>
                </motion.button>
              ))}
              <AnimatePresence>
                {selectedMemory && (
                  <motion.div key="memory-card" id={`memory-card-${selectedMemory.id}`} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.5 }} onDragEnd={handleDragEnd} initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} whileDrag={{ scale: 0.98 }} className="absolute bottom-32 left-0 right-0 mx-auto w-[90%] md:w-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing">
                    <div className="absolute top-3 left-0 right-0 flex justify-center opacity-30"><div className="w-12 h-1 bg-white rounded-full" /></div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/30 blur-[100px] pointer-events-none" />
                    <div className="absolute top-8 right-8 opacity-20 pointer-events-none transform scale-150"><MemoryFlower emotion={selectedMemory.emotion} isSelected={true} /></div>
                    <div className="relative z-10 mt-2"><p className="text-xs text-white/50 mb-4 font-mono tracking-[0.2em] uppercase">{new Date(selectedMemory.created_at).toLocaleDateString()} — {selectedMemory.emotion?.toUpperCase() || 'MEMORY'}</p><p className="text-white/90 font-light text-lg leading-relaxed italic">"{selectedMemory.summary}"</p></div>
                    <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                    <div className="absolute bottom-4 right-4 flex gap-3"><motion.button onClick={() => deleteMemory(selectedMemory.id)} disabled={isDeleting === selectedMemory.id} className="p-2 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-200/70 hover:text-red-200 transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{isDeleting === selectedMemory.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}</motion.button><motion.button onClick={() => shareMemory(selectedMemory)} disabled={capturingId === selectedMemory.id} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{capturingId === selectedMemory.id ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}</motion.button></div>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center"><p className="text-[10px] text-white/20 tracking-widest uppercase animate-pulse">Swipe down to close</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
              {memories.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/30 font-light"><p>아직 피어난 꽃이 없어.</p></div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particles & Spirit */}
        <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none" style={{ x: particleX, y: particleY }}>
            {!showJournal && isMounted && particles.slice(0, particleCount).map((p) => {
            let animateProps = {};
            let styleProps: any = { width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, backgroundColor: SOUL_LEVELS[soulLevel].color, borderRadius: '50%' };
            if (weather === 'rain') { styleProps = { ...styleProps, width: 1, height: p.size * 4, opacity: 0.6 }; animateProps = { y: ['-10vh', '110vh'] }; } 
            else if (weather === 'snow') { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)`, backgroundColor: 'rgba(255, 255, 255, 0.8)' }; animateProps = { y: ['-10vh', '110vh'], x: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`] }; } 
            else if (weather === 'ember') { styleProps = { ...styleProps, backgroundColor: 'rgba(255, 80, 0, 0.6)', filter: 'blur(1px)' }; animateProps = { y: ['110vh', '-10vh'], opacity: [0, 1, 0] }; } 
            else { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)` }; animateProps = { x: [`${p.x}%`, `${p.x + (Math.random() > 0.5 ? 10 : -10)}%`], y: [`${p.y}%`, `${p.y + (Math.random() > 0.5 ? 10 : -10)}%`], opacity: [0, 1, 0] }; }
            return <motion.div key={`${weather}-${p.id}`} className="absolute pointer-events-none" style={styleProps} animate={animateProps} transition={{ repeat: Infinity, duration: weather === 'rain' ? 0.8 + Math.random() : p.duration, delay: Math.random() * 2, ease: weather === 'rain' ? "linear" : "easeInOut" }} />;
            })}
        </motion.div>
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ x: spiritX, y: spiritY }}>
           <motion.div className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden" style={{ scale: isBreathing ? 1 : spiritScale }} animate={ isBreathing ? { scale: [1, 1.15, 1.15, 1], filter: ['brightness(1)', 'brightness(1.3) drop-shadow(0 0 30px rgba(255,255,255,0.6))', 'brightness(1.3) drop-shadow(0 0 30px rgba(255,255,255,0.6))', 'brightness(1)'], } : showJournal ? { filter: 'blur(20px) brightness(0.3)', opacity: 0.5 } : callStatus === 'speaking' ? { y: 0, filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.4))' } : callStatus === 'listening' ? { scale: 1.05, y: 0, filter: 'brightness(1.1)' } : callStatus === 'idle' ? { scale: 1, filter: 'blur(10px) grayscale(100%) opacity(0.7)', y: 0 } : { scale: 1, filter: 'brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))', y: [0, -10, 0] } } transition={ isBreathing ? { duration: 19, times: [0, 0.21, 0.58, 1], repeat: Infinity, ease: "easeInOut" } : { default: { duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } } }>
            <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{ backdropFilter: motionValues.blurValue, opacity: motionValues.opacityValue }} />
            <Image src="/images/spirit_final.png" alt="Bamboo Spirit" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            <motion.div className="absolute inset-0 bg-white mix-blend-overlay z-30" style={{ opacity: spiritGlowOpacity }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
            {isBreathing && (<div className="absolute inset-0 flex items-center justify-center z-50"><motion.p className="text-white/90 font-light text-xl tracking-[0.4em] uppercase drop-shadow-lg" animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1.1, 1.1, 0.9] }} transition={{ duration: 19, times: [0, 0.2, 0.8, 1], repeat: Infinity }}>Breathe</motion.p></div>)}
          </motion.div>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {callStatus === 'idle' && spiritMessage && !showJournal && !isBreathing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute w-full z-40 top-1/4 px-8 text-center pointer-events-none">
              <p className="text-white/80 font-light text-lg leading-relaxed italic drop-shadow-lg">"{spiritMessage}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Overlay (Volume) */}
        <AnimatePresence>
            {showSettings && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-24 right-8 z-50 w-64 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl origin-bottom-right">
                    <div className="flex justify-between items-center mb-6"><span className="text-white/60 text-xs font-mono tracking-widest uppercase">Harmony</span><button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white"><X size={14}/></button></div>
                    <div className="mb-6 space-y-3"><div className="flex justify-between text-white/80"><Volume2 size={14} /><span className="text-[10px] font-mono">{Math.round(bgVolume * 100)}%</span></div><input type="range" min="0" max="1" step="0.01" value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" /></div>
                    <div className="space-y-3"><div className="flex justify-between text-white/80"><Mic size={14} /><span className="text-[10px] font-mono">{Math.round(voiceVolume * 100)}%</span></div><input type="range" min="0" max="1" step="0.01" value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" /></div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- [Updated] UI Separation --- */}
        
        {/* 1. Ambient Bar (Bottom Footer) */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-4 z-50 pointer-events-none">
            <div className="absolute left-8 flex flex-col gap-1 items-start">
                <div className="flex items-center gap-2 text-white/40 text-xs font-mono tracking-widest uppercase"><Sparkles size={12} /><span>Phase {soulLevel}: {SOUL_LEVELS[soulLevel].name}</span></div>
                <div className="w-24 h-0.5 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-white/40" initial={{ width: 0 }} animate={{ width: `${getProgress()}%` }} transition={{ duration: 1 }} /></div>
            </div>
            {callStatus === 'idle' && !showJournal && !isBreathing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto flex items-center gap-2 px-2 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                    {AMBIENT_SOUNDS.map((sound) => {
                        const isLocked = soulLevel < sound.level;
                        const isSelected = (selectedAmbience || 'clear') === sound.type;
                        const Icon = sound.icon;
                        return (
                            <button key={sound.id} onClick={() => !isLocked && changeAmbience(sound.type)} disabled={isLocked} className={`relative p-3 rounded-full transition-all duration-300 group ${isSelected ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/40 hover:bg-white/10 hover:text-white/80'}`}>
                                {isLocked ? (<Lock size={16} className="opacity-50" />) : (<Icon size={18} strokeWidth={isSelected ? 2 : 1.5} />)}
                                {!isLocked && (<span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[9px] text-white/80 bg-black/60 backdrop-blur-md px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{sound.name}</span>)}
                            </button>
                        );
                    })}
                </motion.div>
            )}
        </div>

        {/* 2. Main Call Controls (Raised Position) */}
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
              <motion.button key="start-btn" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={toggleCall} className="pointer-events-auto px-12 py-6 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/20 transition-all tracking-widest cursor-pointer">
                숲으로 입장하기
              </motion.button>
            ) : callStatus !== 'idle' ? (
              <motion.div key="active-status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 pointer-events-auto">
                <button onClick={toggleCall} className="group relative z-50 p-6 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer active:scale-90">
                  <span className="sr-only">End Call</span>
                  <motion.div animate={{ rotate: callStatus === 'connecting' ? 0 : 90 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/80 group-hover:text-red-200"><path d="M18 6L6 18M6 6l12 12" /></svg></motion.div>
                </button>
                <div className="flex flex-col items-center gap-2">
                  <motion.span className="text-[10px] font-medium text-green-400/60 tracking-[0.4em] uppercase" animate={callStatus === 'processing' ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 1.5, repeat: Infinity }}>{getStatusText()}</motion.span>
                  <div className="flex gap-1 items-center h-1 w-24 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-green-400/40" style={{ width: motionValues.barWidth }} /></div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Top Left Buttons */}
        <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
          {callStatus === 'idle' && (
            <motion.button onClick={handleToggleJournal} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {showJournal ? <X size={20} /> : <Book size={20} />}
            </motion.button>
          )}
          {callStatus === 'idle' && !showJournal && (
             <motion.button onClick={toggleBreathing} className={`p-3 rounded-full backdrop-blur-md border transition-all duration-500 ${isBreathing ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {isBreathing ? <X size={20} /> : <Wind size={20} />}
             </motion.button>
          )}
        </div>

        {/* Bottom Right Settings Button */}
        {callStatus === 'idle' && !showJournal && !isBreathing && (
            <div className="absolute bottom-8 right-8 z-50">
                <motion.button onClick={() => { triggerLight(); setShowSettings(!showSettings); }} className={`p-3 rounded-full backdrop-blur-md border transition-all ${showSettings ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Settings2 size={20} />
                </motion.button>
            </div>
        )}

      </motion.div>

      {/* Cinematic Texture & Intro */}
      <div className="absolute inset-0 pointer-events-none z-[60]">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>
      <AnimatePresence>
        {!hasStarted && isMounted && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 2, ease: "easeInOut" } }} className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer" onClick={startExperience}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1 }} className="flex flex-col items-center gap-6">
              <Headphones size={32} className="text-white/50" strokeWidth={1} />
              <div className="text-center space-y-2"><p className="text-white/80 font-light tracking-[0.2em] text-sm uppercase">Immersion Mode</p><p className="text-white/40 font-light text-xs tracking-wider">Use headphones for the best experience</p></div>
              <motion.p className="mt-8 text-white/30 text-[10px] tracking-widest uppercase" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>Tap anywhere to enter</motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}