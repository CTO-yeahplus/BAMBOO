'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, PanInfo, useTransform } from 'framer-motion';
import { Book, X, Star, Share2, Loader2, Trash2, ChevronDown, Headphones } from 'lucide-react'; 
import { useBambooEngine } from './hooks/useBambooEngine';
import { Particle, Memory } from './types';

const WHISPERS = [
  "오늘 하루는 어땠어?", "누구에게도 말 못 할 고민이 있니?", "그냥 빗소리만 듣고 싶다면, 그래도 돼.",
  "무거운 짐은 잠시 여기에 내려놓아.", "바람이 네 이야기를 기다리고 있어.", "괜찮아, 아무 말 안 해도 돼.",
  "어제보다 오늘 마음은 좀 어때?"
];

export default function BambooForest() {
  const {
    isMounted, hasStarted, startExperience,
    callStatus, backgroundGradient, weather, spiritMessage, memories,
    toggleCall, getStatusText, audioRefs, motionValues,
    capturingId, shareMemory, deleteMemory, isDeleting,
    showEasterEgg, handleMouseMove // [New] 가져오기
  } = useBambooEngine();

  const [showJournal, setShowJournal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);

  // --- [Parallax Transforms] ---
  // 마우스 위치(-1 ~ 1)에 따라 각 레이어의 이동 범위 설정
  // 배경: 아주 조금 움직임 (먼 거리)
  const bgX = useTransform(motionValues.mouseX, [-1, 1], ["-2%", "2%"]);
  const bgY = useTransform(motionValues.mouseY, [-1, 1], ["-2%", "2%"]);
  
  // 파티클: 중간 정도 움직임
  const particleX = useTransform(motionValues.mouseX, [-1, 1], ["-5%", "5%"]);
  const particleY = useTransform(motionValues.mouseY, [-1, 1], ["-5%", "5%"]);

  // 정령: 많이 움직임 (가까운 거리) - 반대 방향으로 움직여 입체감 극대화
  const spiritX = useTransform(motionValues.mouseX, [-1, 1], ["5%", "-5%"]);
  const spiritY = useTransform(motionValues.mouseY, [-1, 1], ["5%", "-5%"]);

  // 정령 크기/빛 반응 (기존 유지)
  const spiritScale = useTransform(motionValues.springVolume, (v) => 1 + v * 0.15);
  const spiritGlowOpacity = useTransform(motionValues.springVolume, [0, 1], [0, 0.6]);

  useEffect(() => {
    const interval = setInterval(() => setWhisperIndex((prev) => (prev + 1) % WHISPERS.length), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (callStatus !== 'idle') setShowJournal(false);
  }, [callStatus]);

  useEffect(() => {
    if (selectedMemory && !memories.find(m => m.id === selectedMemory.id)) {
      setSelectedMemory(null);
    }
  }, [memories, selectedMemory]);

  const particles = useMemo<Particle[]>(() => 
    Array.from({ length: 100 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1,
      duration: Math.random() * 5 + 2, delay: Math.random() * 2,
    })), []);
  const particleCount = weather === 'rain' ? 60 : weather === 'snow' ? 40 : 20;
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      setSelectedMemory(null);
    }
  };

  return (
    <main 
      className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none"
      onMouseMove={handleMouseMove} // [New] 마우스 움직임 감지
    >
      {/* Audio Sources */}
      <audio ref={(el) => { audioRefs.current.clear = el; }} src="/sounds/forest_ambience.mp3" loop />
      <audio ref={(el) => { audioRefs.current.rain = el; }} src="/sounds/rain.mp3" loop />
      <audio ref={(el) => { audioRefs.current.snow = el; }} src="/sounds/wind.mp3" loop />
      <audio ref={(el) => { audioRefs.current.ember = el; }} src="/sounds/fire.mp3" loop />
      
      <motion.div className="absolute inset-0 w-full h-full" animate={{ filter: hasStarted ? 'blur(0px)' : 'blur(20px)', opacity: hasStarted ? 1 : 0 }} transition={{ duration: 2 }}>
        
        {/* [Parallax] Background Layer */}
        <motion.div 
          className="absolute inset-[-5%] w-[110%] h-[110%]" // 화면보다 조금 크게 잡아서 잘림 방지
          style={{ x: bgX, y: bgY }} // [New] 움직임 적용
        >
           <motion.div className={`absolute inset-0 bg-gradient-to-b ${backgroundGradient.join(' ')}`} animate={{ opacity: callStatus === 'idle' && !showJournal ? 0.7 : showJournal ? 0.2 : 1 }} transition={{ duration: 2.5 }} />
        </motion.div>

        {/* Easter Egg Layer */}
        <AnimatePresence>
          {showEasterEgg && callStatus === 'idle' && !showJournal && (
            <motion.div
              className="absolute pointer-events-none z-5"
              style={{ bottom: '15%', left: '-20%' }}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: [0, 0.3, 0], x: '140vw' }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatDelay: 30 }}
            >
               <svg width="150" height="150" viewBox="0 0 24 24" fill="white" className="blur-[2px] opacity-60 transform -scale-x-100">
                <path d="M16.53 11.5l-2.09-1.21c-.33-.19-.59-.47-.76-.81L13 8V4h-2v4l-.68 1.48c-.17.34-.43.62-.76.81L7.47 11.5c-.88.51-1.47 1.46-1.47 2.5V21h2v-5h2v5h2v-5h2v5h2v-7c0-1.04-.59-1.99-1.47-2.5zM10 3.5C10 2.67 10.67 2 11.5 2S13 2.67 13 3.5 12.33 5 11.5 5 10 4.33 10 3.5z"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Layer */}
        <AnimatePresence>
          {showJournal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm">
              {memories.map((memory, index) => (
                <motion.button
                  key={memory.id}
                  className="absolute flex items-center justify-center group"
                  style={{ top: `${memory.y}%`, left: `${memory.x}%` }}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1, type: "spring" }}
                  onClick={() => setSelectedMemory(memory)}
                >
                  <div className="relative">
                    <Star size={20} className={`text-yellow-100 ${selectedMemory?.id === memory.id ? 'fill-yellow-100' : 'fill-none'}`} strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-yellow-200 blur-md opacity-50 animate-pulse" />
                  </div>
                </motion.button>
              ))}

              <AnimatePresence>
                {selectedMemory && (
                  <motion.div
                    key="memory-card"
                    id={`memory-card-${selectedMemory.id}`}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0.05, bottom: 0.5 }}
                    onDragEnd={handleDragEnd}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileDrag={{ scale: 0.98 }}
                    className="absolute bottom-32 left-0 right-0 mx-auto w-[90%] md:w-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                  >
                    <div className="absolute top-3 left-0 right-0 flex justify-center opacity-30">
                      <div className="w-12 h-1 bg-white rounded-full" />
                    </div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/30 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 mt-2">
                      <p className="text-xs text-white/50 mb-4 font-mono tracking-[0.2em] uppercase">{new Date(selectedMemory.created_at).toLocaleDateString()} — Bamboo Forest</p>
                      <p className="text-white/90 font-light text-lg leading-relaxed italic">"{selectedMemory.summary}"</p>
                    </div>
                    <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                    <div className="absolute bottom-4 right-4 flex gap-3">
                      <motion.button onClick={() => deleteMemory(selectedMemory.id)} disabled={isDeleting === selectedMemory.id} className="p-2 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-200/70 hover:text-red-200 transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        {isDeleting === selectedMemory.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                      </motion.button>
                      <motion.button onClick={() => shareMemory(selectedMemory)} disabled={capturingId === selectedMemory.id} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        {capturingId === selectedMemory.id ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                      </motion.button>
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                        <p className="text-[10px] text-white/20 tracking-widest uppercase animate-pulse">Swipe down to close</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {memories.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/30 font-light"><p>아직 밤하늘에 별이 뜨지 않았어.</p></div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* [Parallax] Particles Layer */}
        <motion.div 
            className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none"
            style={{ x: particleX, y: particleY }} // [New] 파티클도 움직임
        >
            {!showJournal && isMounted && particles.slice(0, particleCount).map((p) => {
            let animateProps = {};
            let styleProps: any = { width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: '50%' };
            if (weather === 'rain') { styleProps = { ...styleProps, width: 1, height: p.size * 4, opacity: 0.6 }; animateProps = { y: ['-10vh', '110vh'] }; } 
            else if (weather === 'snow') { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)`, backgroundColor: 'rgba(255, 255, 255, 0.8)' }; animateProps = { y: ['-10vh', '110vh'], x: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`] }; } 
            else if (weather === 'ember') { styleProps = { ...styleProps, backgroundColor: 'rgba(255, 80, 0, 0.6)', filter: 'blur(1px)' }; animateProps = { y: ['110vh', '-10vh'], opacity: [0, 1, 0] }; } 
            else { styleProps = { ...styleProps, filter: `blur(${p.size/2}px)` }; animateProps = { x: [`${p.x}%`, `${p.x + (Math.random() > 0.5 ? 10 : -10)}%`], y: [`${p.y}%`, `${p.y + (Math.random() > 0.5 ? 10 : -10)}%`], opacity: [0, 1, 0] }; }
            return <motion.div key={`${weather}-${p.id}`} className="absolute pointer-events-none" style={styleProps} animate={animateProps} transition={{ repeat: Infinity, duration: weather === 'rain' ? 0.8 + Math.random() : p.duration, delay: Math.random() * 2, ease: weather === 'rain' ? "linear" : "easeInOut" }} />;
            })}
        </motion.div>

        {/* [Parallax] Spirit Image Layer */}
        <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ x: spiritX, y: spiritY }} // [New] 정령은 반대로 움직여 깊이감 생성
        >
           <motion.div
            className="relative z-10 w-[280px] h-[380px] md:w-[400px] md:h-[550px] rounded-[40px] overflow-hidden"
            style={{ scale: spiritScale }}
            animate={
              showJournal ? { filter: 'blur(20px) brightness(0.3)', opacity: 0.5 } :
              callStatus === 'speaking' ? { y: 0, filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.4))' }
              : callStatus === 'listening' ? { scale: 1.05, y: 0, filter: 'brightness(1.1)' }
              : callStatus === 'idle' ? { scale: 1, filter: 'blur(10px) grayscale(100%) opacity(0.7)', y: 0 }
              : { scale: 1, filter: 'brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))', y: [0, -10, 0] }
            }
            transition={{ default: { duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{ backdropFilter: motionValues.blurValue, opacity: motionValues.opacityValue }} />
            <Image src="/images/spirit_final.png" alt="Bamboo Spirit" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            <motion.div className="absolute inset-0 bg-white mix-blend-overlay z-30" style={{ opacity: spiritGlowOpacity }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/5 to-white/10 mix-blend-overlay" />
          </motion.div>
        </motion.div>

        {/* Spirit Message */}
        <AnimatePresence>
          {callStatus === 'idle' && spiritMessage && !showJournal && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute w-full z-40 top-1/4 px-8 text-center pointer-events-none">
              <p className="text-white/80 font-light text-lg leading-relaxed italic drop-shadow-lg">"{spiritMessage}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Toggle */}
        <div className="absolute top-8 left-8 z-50">
          {callStatus === 'idle' && (
            <motion.button onClick={() => setShowJournal(!showJournal)} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {showJournal ? <X size={20} /> : <Book size={20} />}
            </motion.button>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-20 z-50 w-full flex flex-col items-center gap-8 pointer-events-none">
          <AnimatePresence mode="wait">
            {callStatus === 'idle' && !showJournal && !spiritMessage && (
              <motion.div key={WHISPERS[whisperIndex]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute -top-20 text-white/60 text-sm font-light italic tracking-wider drop-shadow-md text-center px-4 w-full">
                {WHISPERS[whisperIndex]}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {callStatus === 'idle' && !showJournal ? (
              <motion.button key="start-btn" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={toggleCall} className="pointer-events-auto px-10 py-5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl shadow-2xl hover:bg-white/10 transition-all tracking-widest cursor-pointer">
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
      </motion.div>

      {/* Cinematic Texture */}
      <div className="absolute inset-0 pointer-events-none z-[60]">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Intro Layer */}
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