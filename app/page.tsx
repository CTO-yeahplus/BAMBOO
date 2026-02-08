'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Book, X, Star, Share2, Disc, Loader2, Trash2, Headphones, Sparkles, Droplets, Wind, Settings2, Volume2, Mic, LogIn, Flame, LogOut, Hourglass, Send, Clock, LayoutGrid, MousePointerClick, Keyboard, SendHorizontal, Palette, Mail, Moon, Bed, Square, PenTool, ImageIcon } from 'lucide-react';
import { MemoryGalleryModal, FullImageViewer } from './components/MemoryGalleryModal';
import { useBambooEngine } from './hooks/useBambooEngine';
import { useRipple } from './hooks/useRipple';
import { Memory, WeatherType, Particle, THEMES } from './types';
import { getMoonPhase, getMoonIconPath } from './utils/moonPhase';
import { InstallPrompt } from './components/InstallPrompt';
import { ForestGuide } from './components/ForestGuide';
import { supabase } from './utils/supabase'; 
import { IntroSequence } from './components/IntroSequence';
import { MailboxModal } from './components/modals';
import { JournalModal } from './components/modals';
// Components
import { MemoryLantern, ForestBackground, LivingSpirit, SpiritRenderer, SoulTree, FireflyLayer, FloatingBottle, BurningPaperEffect, MemoryFlower, GoldenCocoon, SpringPetal, SummerFirefly, AutumnLeaf, ConstellationLayer, OrbitLayer} from './components/visuals';
import { OracleModal, SettingsModal, AltarModal, ProfileModal, BottleModals, FireRitualModal, SoulCalendarModal, SoulographyModal, SpiritCapsuleModal} from './components/modals'; // index.ts 덕분에 폴더명만 써도 됨
import { MemoryRitual } from './components/MemoryRitual';
import { TimeCapsuleModal } from './components/TimeCapsuleModal';
import { GenesisRitual } from './components/GenesisRitual';

// [New] UI Components
import { MagicSatchel, MinimalAmbience } from './components/ForestControls';

// Constants
const WHISPERS = ["오늘 하루는 어땠어?", "누구에게도 말 못 할 고민이 있니?", "그냥 빗소리만 듣고 싶다면, 그래도 돼.", "무거운 짐은 잠시 여기에 내려놓아.", "바람이 네 이야기를 기다리고 있어.", "괜찮아, 아무 말 안 해도 돼.", "어제보다 오늘 마음은 좀 어때?"];
const SOUL_LEVELS: { [key: number]: { name: string, color: string } } = { 1: { name: "Mist", color: "rgba(255, 255, 255, 0.4)" }, 2: { name: "Dew", color: "rgba(0, 255, 255, 0.6)" }, 3: { name: "Bloom", color: "rgba(200, 100, 255, 0.6)" }, 4: { name: "Aurora", color: "rgba(255, 215, 0, 0.7)" }, };

export default function BambooForest() {
  const engine = useBambooEngine();
  const [showIntro, setShowIntro] = useState(true); // 👈 인트로 상태 추가
  
  const { 
    user, isPremium, memories, 
    bgVolume, voiceVolume, 
    motionValues, hasWoken, callStatus, isSilentMode,
    fireflies, broadcastTouch,
    resonance,
    // Bottle functions
    sendBottle, findRandomBottle, likeBottle, foundBottle, setFoundBottle, replyToBottle,
    showFireRitual, setShowFireRitual, performFireRitual, saveVoiceCapsule,
    spiritForm, SPIRIT_FORMS, changeSpiritForm
  } = engine;

  const currentThemeConfig = THEMES.find(t => t.id === engine.currentTheme) || THEMES[0];
  const { ripples, addRipple } = useRipple();
  
  // Local UI States
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showWriteBottle, setShowWriteBottle] = useState(false);
  //const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<'stars' | 'orbit'>('stars');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // 👇 [New] 달력용 메모리 데이터 상태 추가
  const [calendarMemories, setCalendarMemories] = useState<any[]>([]);

  // Intro Visibility State
  const [introVisible, setIntroVisible] = useState(true);

  const handleEnterForest = () => {
      engine.initAudio(); 
      engine.startExperience();
      setIntroVisible(false);
  };

  const handleSendMessage = () => { if (inputText.trim()) { engine.sendTextMessage(inputText); setInputText(""); } };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } else { engine.playPaperRustle(); } };
  const handleGlobalClick = (e: React.PointerEvent) => { 
      addRipple(e);
      broadcastTouch(e.clientX, e.clientY);
  };
  const handleSpiritClick = () => { if (!hasWoken) engine.wakeSpirit(); };
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

  const processedMemories = useMemo(() => {
    return memories.map((m, i) => {
        const x = (m as any).x ?? ((i * 37) % 80 + 10);
        const y = (m as any).y ?? ((i * 53) % 80 + 10);
        return { ...m, x, y };
    });
  }, [memories]);

  useEffect(() => {
      const newParticles = Array.from({ length: 100 }).map((_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 5 + 2, delay: Math.random() * 2 }));
      setParticles(newParticles);
      const interval = setInterval(() => setWhisperIndex((prev) => (prev + 1) % WHISPERS.length), 6000); 
      return () => clearInterval(interval); 
  }, []);

  // 👇 [New] 1. Focus Logic Definition (대화 집중 모드 감지)
  const isFocusMode = ['active', 'speaking', 'listening'].includes(callStatus);

  // 시네마틱 애니메이션 설정 (아주 부드러운 전환)
  const cinematicTransition = { duration: 2.5, ease: "easeInOut" } as const;
  
  // [Fix] 캘린더가 열릴 때, 해당 월의 감정 데이터를 가져옵니다.
  // 👇 [Modified] 전체 메모리를 가져오도록 수정 (Supabase 연동)
  useEffect(() => {
    if (engine.showCalendar && user) {
        console.log(`📅 Calendar Opened: Fetching all memories for user ${user.id}`);
        
        const fetchCalendarData = async () => {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data) {
                console.log("✅ Fetched Memories Count:", data.length);
                setCalendarMemories(data);
            }
            if (error) console.error("❌ Failed to fetch memories:", error);
        };
        
        fetchCalendarData();
    }
  }, [engine.showCalendar, user]);

  return (
    <main className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-black touch-none" onMouseMove={(e) => {}} onPointerDown={handleGlobalClick}>
      
      {/* [Critical Fix] ID 직통 케이블 연결 (오디오 레이어) */}
        <div style={{ display: 'none' }}>
          <audio 
              id="spirit-audio-clear"
              ref={(el) => { if (el) engine.audioRefs.current['clear'] = el; }} 
              src="/sounds/forest_ambience.mp3" 
              loop playsInline 
          />
          <audio 
              id="spirit-audio-rain"
              ref={(el) => { if (el) engine.audioRefs.current['rain'] = el; }} 
              src="/sounds/rain.mp3" 
              loop playsInline 
          />
          <audio 
              id="spirit-audio-snow"
              ref={(el) => { if (el) engine.audioRefs.current['snow'] = el; }} 
              src="/sounds/wind.mp3" 
              loop playsInline 
          />
          <audio 
              id="spirit-audio-ember"
              ref={(el) => { if (el) engine.audioRefs.current['ember'] = el; }} 
              src="/sounds/fire.mp3" 
              loop playsInline 
          />
          {/* [New] Binaural Beats Layers (Invisible Therapy) */}
          <audio 
              id="binaural-delta"
              src="/sounds/binaural_delta.mp3" // Deep Sleep (0.5~4Hz)
              loop playsInline 
          />
          <audio 
              id="binaural-alpha"
              src="/sounds/binaural_alpha.mp3" // Focus (8~14Hz)
              loop playsInline 
          />
          <audio 
              id="binaural-theta"
              src="/sounds/binaural_theta.mp3" // Meditation (4~8Hz)
              loop playsInline 
          />
        </div>

        {/* 🎬 Intro Layer */}
        {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}

        {/* 🌲 Main Content (인트로가 끝날 때 부드럽게 등장) */}
        <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }} // 인트로 끝나면 1
            transition={{ duration: 2 }} // 2초 동안 천천히 밝아짐
        >
        {/* [New] Genesis Ritual (Onboarding) */}
        <AnimatePresence>
          {engine.showOnboarding && (
              <GenesisRitual onComplete={engine.handleOnboardingComplete} />
          )}
        </AnimatePresence>

        <InstallPrompt /> 

        <ForestBackground themeId={engine.currentTheme} themeConfig={currentThemeConfig}>
        
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

        {/* 2. Background Layers Group (배경 요소 그룹화 및 블러 처리) */}
        <motion.div 
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ 
                filter: isFocusMode ? "blur(8px) brightness(0.6)" : "blur(0px) brightness(1)",
                scale: isFocusMode ? 1.05 : 1 // 살짝 줌인되는 효과 추가 (Depth 강화)
            }}
            transition={cinematicTransition}
        >
            {/* 기존 배경 레이어들 (907라인 ~ 914라인)을 이 안으로 포함 */}
            <motion.div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-gray-900/50 to-transparent mix-blend-hard-light" animate={{ opacity: hasWoken ? 0 : 1 }} transition={{ duration: 3 }} />
            
            <motion.div className="absolute inset-[-5%] w-[110%] h-[110%]" style={{ x: bgX, y: bgY }}>
                <motion.div className={`absolute inset-0 bg-gradient-to-b ${engine.backgroundGradient.join(' ')}`} animate={{ opacity: callStatus === 'idle' && !engine.showJournal ? 0.7 : engine.showJournal ? 0.2 : 1 }} transition={{ duration: 2.5 }} />
            </motion.div>
            
            {engine.sleepTimer !== null && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 3 }} className="absolute inset-0 z-20 bg-black pointer-events-none" /> )}

            <motion.div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-0 mix-blend-screen" style={{ x: moonX, y: moonY }}>
                {engine.isDaytime ? ( <div className="relative w-32 h-32 opacity-90"><div className="absolute inset-0 bg-orange-200/30 blur-[60px] rounded-full" /></div> ) : ( <div className="relative w-32 h-32 opacity-80"><svg viewBox="0 0 24 24" className="w-full h-full text-yellow-100 blur-[0.5px] drop-shadow-[0_0_15px_rgba(255,255,200,0.5)]"><path d={moonPath} fill="currentColor" /></svg><div className="absolute inset-0 bg-yellow-100/20 blur-[50px] rounded-full" /></div> )}
            </motion.div>
            
            <FireflyLayer fireflies={fireflies} />

            {/* Floating Bottle Layer */}
            {hasWoken && !engine.showJournal && (
                <FloatingBottle onClick={() => { engine.playPaperRustle(); findRandomBottle(); }} />
            )}

            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"><AnimatePresence>{ripples.map((ripple) => (<motion.div key={ripple.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute border border-white/30 rounded-full bg-white/5 backdrop-blur-[1px]" style={{ left: ripple.x, top: ripple.y, width: 100, height: 100, x: "-50%", y: "-50%" }} />))}</AnimatePresence></div>

            <motion.div className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none" style={{ x: particleX, y: particleY }}>
                {!engine.showJournal && engine.isMounted && particles.length > 0 && particles.slice(0, 20).map((p) => {
                    if (engine.weather === 'rain') { return <motion.div key={`rain-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: 1, height: p.size * 4, opacity: 0.6, backgroundColor: SOUL_LEVELS[engine.soulLevel].color }} animate={{ y: ['-10vh', '110vh'] }} transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }} />; }
                    if (engine.season === 'spring') { return <motion.div key={`spring-${p.id}`} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 2, height: p.size * 2 }} animate={{ y: ['-10vh', '110vh'], rotate: [0, 360] }} transition={{ duration: p.duration + 2, repeat: Infinity, ease: "linear" }}><SpringPetal color="pink" /></motion.div>; }
                    return <motion.div key={p.id} className="absolute pointer-events-none bg-white/50 w-1 h-1 rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%` }} animate={{ y: ['-10vh', '110vh'] }} transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }} />;
                })}
            </motion.div>
        </motion.div>

        {/* 👇 [New] 3. Cinematic Vignette Layer (시네마틱 비네팅) */}
        {/* 정령 뒤쪽, 배경 앞쪽에 위치하여 가장자리를 어둡게 만듦 */}
        <motion.div 
            className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)]"
            animate={{ 
                opacity: isFocusMode ? 0.8 : 0, // 대화 중에만 어두워짐
            }}
            transition={cinematicTransition}
        />

        {/* Spirit & Tree Container */}
        <motion.div 
              className={`absolute inset-0 flex items-center justify-center ${!hasWoken ? 'cursor-pointer z-30' : 'z-30'}`} 
              style={{ x: spiritX, y: spiritY }}
          >
              <motion.div animate={{ filter: isFocusMode ? "blur(4px)" : "blur(0px)" }} transition={cinematicTransition}>
                <SoulTree resonance={engine.resonance} memories={engine.memories} />
             </motion.div>
             {/* 👇 [여기에 추가] 장착된 아티팩트 (기억의 등불) 렌더링 */}
            {engine.equippedItems.artifacts?.includes('artifact_lantern') && (
                <MemoryLantern 
                    onClick={() => {
                        const randomMemory = engine.memories[Math.floor(Math.random() * engine.memories.length)];
                        if (randomMemory) {
                            // 여기에 토스트 메시지나 음성 안내를 넣으면 더 좋습니다.
                            alert(`💡 기억의 등불이 속삭입니다:\n"${randomMemory.summary}"`);
                        } else {
                            alert("아직 등불에 담을 기억이 없습니다.");
                        }
                    }} 
                />
            )}
              
              {/* 👇 [NEW] Living Spirit Visualizer */}
              <motion.div 
                  className="relative z-10 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                  onClick={handleSpiritClick} 
                  onPan={(e, info) => { if(hasWoken) engine.handlePet(); }} 
                  onPointerDown={() => engine.setIsHolding(true)} 
                  onPointerUp={() => engine.setIsHolding(false)}
                  // 등장 애니메이션 (안개 속에서 피어오름)
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 2, ease: "easeOut" }}
              >
                  <LivingSpirit 
                      emotion={engine.currentEmotion || 'neutral'} // engine에 currentEmotion 추가 필요 (없으면 neutral)
                      volume={motionValues.springVolume}
                      isTalking={['speaking', 'listening'].includes(callStatus)}
                      form={spiritForm}
                  />

                  {/* 텍스트 오버레이 (Touch to awaken) */}
                  {!hasWoken && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                          <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: [0.3, 0.8, 0.3] }} 
                              transition={{ duration: 3, repeat: Infinity }} 
                              className="flex flex-col items-center gap-4"
                          >
                              <p className="text-white/60 font-light text-xs tracking-[0.4em] uppercase font-serif">
                                  Touch the Light
                              </p>
                          </motion.div>
                      </div>
                  )}
              </motion.div>
          </motion.div>

        {/* --- UI Controls (Apple Style Renovation) --- */}
        
        {/* 1. Silent Mode Chat UI */}
        <motion.div 
            className="absolute inset-0 z-40 pointer-events-none"
            animate={{ 
                opacity: isFocusMode ? 0 : 1, // 대화 중에는 UI가 사라짐
                //pointerEvents: isFocusMode ? 'none' : 'auto' 
            }}
            transition={{ duration: 1 }} // 천천히 사라짐
        >
        <AnimatePresence>{isSilentMode && (<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-32 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto"><div className="w-full max-w-md relative"><div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-2 shadow-2xl"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="정령에게 속삭여보세요..." className="flex-1 bg-transparent border-none text-white/90 placeholder-white/30 px-4 py-2 text-sm focus:outline-none" /><button onClick={handleSendMessage} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"><SendHorizontal size={18} /></button></div><div className="absolute -bottom-10 left-0 right-0 flex justify-center"><button onClick={engine.toggleSilentMode} className="text-white/30 hover:text-white/50 text-[10px] uppercase tracking-widest flex items-center gap-1"><X size={12} /> Close Whispers</button></div></div></motion.div>)}</AnimatePresence>

        {/* 2. Whisper Text Overlay */}
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

        {/* 3. Simplified Top Controls */}
        <div className="absolute top-8 left-8 z-50 pointer-events-auto">
            {hasWoken && callStatus === 'idle' && (
                <motion.button onClick={engine.setShowJournal.bind(null, !engine.showJournal)} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {engine.showJournal ? <X size={20} /> : <Book size={20} />}
                </motion.button>
            )}
        </div>

        <div className="absolute top-8 right-8 z-50 pointer-events-auto">
            {hasWoken && user && (
                <motion.button 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    onClick={() => { engine.triggerLight(); setShowProfile(!showProfile); }} 
                    className={`flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md border rounded-full text-white/90 hover:bg-white/20 transition-all shadow-lg overflow-hidden ${avatarBorderClass}`}
                >
                    <span className="text-lg font-bold">{getUserInitial()}</span>
                </motion.button>
            )}
        </div>

        {/* 4. Unified Bottom Controls */}
        {hasWoken && callStatus === 'idle' && !engine.showJournal && !engine.isBreathing && (
            <>
                {/* Center: Ambience Player */}
                <MinimalAmbience 
                    currentAmbience={engine.selectedAmbience || engine.weather} 
                    onChangeAmbience={engine.changeAmbience} 
                />

                {/* Right Bottom: Magic Satchel (Unified Menu) */}
                <MagicSatchel 
                  isPremium={isPremium}
                  hasCollectedDew={engine.hasCollectedDew}
                  onCollectDew={engine.collectDew}
                  onOpenFire={() => setShowFireRitual(true)}
                  //onOpenBottle={() => setShowWriteBottle(true)}
                  onOpenBottle={() => engine.setWhisperOpen(true)}
                  onOpenCapsule={() => setShowCapsuleModal(true)}
                  onOpenGallery={() => engine.setShowGalleryModal(true)}
                  onOpenCalendar={() => engine.setShowCalendar(true)}
                  onOpenMailbox={() => {
                    if (isPremium) {
                      setShowMailbox(true);
                      // 월간 편지와 주간 리포트 모두 체크
                      if (engine.letters.length === 0) {
                          engine.generateMonthlyLetter();
                          engine.generateWeeklyReport(); // [New] 주간 리포트 생성 시도
                      }
                    } else {
                        alert("영혼의 서신은 성소 멤버십 회원에게만 도착합니다.");
                    }
                  }}
                  // 정령 목소리 보관함 (Spirit Whispers) - 누락된 부분!
                  onOpenSpiritCapsules={() => engine.setShowSpiritCapsules(true)}
                />

                <SoulCalendarModal 
                    isOpen={engine.showCalendar} 
                    onClose={() => engine.setShowCalendar(false)}
                    
                    // 상태 전달
                    currentYear={engine.calYear}
                    currentMonth={engine.calMonth}
                    // moods={engine.monthlyMoods} // 👇 기존 방식 삭제
                    memories={calendarMemories}    // 👈 [Fix] 새로 가져온 전체 데이터 전달
                    currentUser={user}             // 👈 [Fix] 유저 정보 전달
                    
                    // 👇 [Fix] 달을 변경할 때: 1.숫자 변경 + 2.데이터 새로고침 (기존 로직 유지하되, 필요시 수정 가능)
                    onMonthChange={(year, month) => {
                        engine.setCalYear(year);
                        engine.setCalMonth(month);
                        // engine.fetchMonthlyMoods(year, month); // 필요하다면 유지
                    }}
                    
                    // 👇 [Fix] 공유 버튼 연결 (임시로 alert라도 뜨게)
                    onShare={(type, data) => {
                        if (engine.openSoulography) {
                            engine.openSoulography(type, data);
                        } else {
                            alert("공유 기능 준비 중입니다.");
                        }
                    }}
                />
                
                {/* Left Bottom: Settings */}
                <div className="absolute bottom-8 left-8 z-50 pointer-events-auto">
                    <motion.button 
                        onClick={() => { engine.triggerLight(); engine.setShowSettings(!engine.showSettings); }} 
                        className={`p-3 rounded-full backdrop-blur-md border transition-all ${engine.showSettings ? 'bg-white/20 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/10'}`} 
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    >
                        <Settings2 size={20} />
                    </motion.button>
                </div>
            </>
        )}

        {/* [New] 'Capture' Button (정령의 말 저장 UI) */}
        {engine.spiritMessage && (
            <div className="absolute top-[15%] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                {/* [Fix 1] onClick 추가: 이 박스를 누르면 메시지가 닫힙니다.
                    [Fix 2] cursor-pointer 추가: 클릭 가능하다는 것을 알려줍니다.
                */}
                <div 
                    onClick={() => engine.setSpiritMessage(null)} 
                    className="pointer-events-auto cursor-pointer bg-black/40 backdrop-blur-md border border-white/10 px-8 py-5 rounded-2xl max-w-md w-full text-center relative group shadow-2xl transition-all duration-500 hover:bg-black/60 hover:border-white/20"
                >
                    
                    {/* 정령의 메시지 텍스트 */}
                    <p className="text-white/90 font-serif text-sm md:text-base leading-relaxed drop-shadow-md animate-fade-in select-none">
                        {engine.spiritMessage}
                    </p>
                    
                    {/* 닫기 힌트 (선택 사항: 사용자에게 알려줌) */}
                    <p className="text-[10px] text-white/30 mt-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to dismiss
                    </p>
                    
                    {/* 캡슐 저장 버튼 (컨테이너에 호버 시 등장) */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // 👈 [중요] 부모의 '닫기' 클릭 이벤트를 막습니다. (저장 버튼만 눌리게 함)
                            engine.keepSpiritVoice(engine.spiritMessage!);
                        }} 
                        className="absolute -top-3 -right-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95 cursor-pointer pointer-events-auto"
                        title="이 속삭임을 기억 조각으로 보관하기"
                    >
                        {/* LP판처럼 천천히 돌아가는 아이콘 */}
                        <Disc size={16} className="animate-[spin_4s_linear_infinite]" />
                    </button>

                    {/* 장식용: 텍스트 하단의 미세한 빛 */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </div>
        )}
        </motion.div>
        </ForestBackground>

        {/* 👇 [New] 불타는 의식 시각 효과 (Fire Overlay) */}
        <AnimatePresence>
            {engine.isBurning && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    className="absolute inset-0 z-[200] pointer-events-none flex items-center justify-center"
                >
                    {/* 1. 전체 붉은 섬광 (화면 깜빡임) */}
                    <motion.div 
                        className="absolute inset-0 bg-orange-600/30 mix-blend-hard-light"
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                    />
                    
                    {/* 2. 하단에서 올라오는 붉은 그라데이션 */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-orange-600/20 to-transparent"
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />

                    {/* 3. 중앙 불꽃 심볼 (선택 사항) */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 3 }}
                        className="relative z-10"
                    >
                         <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 blur-[60px] animate-pulse" />
                            <Flame size={120} className="text-white drop-shadow-[0_0_30px_rgba(255,100,0,1)]" />
                         </div>
                         <p className="text-center text-orange-100 font-serif tracking-[0.5em] text-sm mt-8 opacity-80">
                            PURIFYING...
                         </p>
                    </motion.div>

                    {/* 4. 불티 파티클 (간단 효과) */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-orange-300 rounded-full"
                            initial={{ 
                                x: Math.random() * window.innerWidth, 
                                y: window.innerHeight 
                            }}
                            animate={{ 
                                y: -100,
                                x: Math.random() * window.innerWidth + (Math.random() - 0.5) * 200,
                                opacity: [1, 0]
                            }}
                            transition={{ 
                                duration: Math.random() * 2 + 1, 
                                ease: "easeOut",
                                delay: Math.random() * 0.5 
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODALS --- */}
        {/* 👇 DailyOracleModal 연결 수정 */}
        <OracleModal 
            isOpen={engine.showOracleModal && !introVisible} 
            onClose={() => engine.confirmOracle()} 
            onDrawCard={engine.drawOracleCard} 
            todaysCard={engine.todaysCard}
            isLoading={engine.isOracleLoading}
        />        
        <SettingsModal 
            isOpen={engine.showSettings} 
            onClose={() => engine.setShowSettings(false)}
            user={user}
            // 👇 [Fix] 볼륨 3형제를 모두 전달해야 믹서가 작동합니다!
            volume={engine.volume}
            setVolume={engine.setVolume}
            isMixerMode={engine.isMixerMode}
            bgVolume={engine.bgVolume}         // 배경음 볼륨
            setBgVolume={engine.setBgVolume}   // 배경음 조절 함수
            voiceVolume={engine.voiceVolume}       // 정령 목소리 볼륨
            setVoiceVolume={engine.setVoiceVolume} // 정령 목소리 조절 함수
            currentAmbience={engine.ambience}
            setAmbience={engine.setAmbience}
            onSignOut={async () => {
              // supabase가 import 되어있다고 가정
              // await supabase.auth.signOut(); 
              // window.location.reload();
              alert("로그아웃 되었습니다.");
            }}
            
            setIsMixerMode={engine.setIsMixerMode}
            mixerVolumes={engine.mixerVolumes}
            setMixerVolumes={engine.setMixerVolumes}
            applyPreset={engine.applyPreset}
            currentTheme={engine.currentTheme}
            setTheme={engine.setTheme}
            isPremium={isPremium}
            binauralMode={engine.binauralMode}
            setBinauralMode={engine.setBinauralMode}
            pushPermission={engine.pushPermission}
            requestPushPermission={engine.requestPushPermission}
            showOnboarding={engine.showOnboarding}
            handleOnboardingComplete={engine.handleOnboardingComplete}
        />
        
        <AltarModal 
            isOpen={engine.showAltar} onClose={() => engine.setShowAltar(false)} 
            resonance={engine.resonance} artifacts={engine.ARTIFACTS} 
            ownedItems={engine.ownedItems} equippedItems={engine.equippedItems} 
            onUnlock={engine.unlockArtifact} onEquip={engine.equipArtifact}
            spiritForm={spiritForm} changeSpiritForm={changeSpiritForm}
        />
        
        <ProfileModal 
            isOpen={showProfile} onClose={() => setShowProfile(false)} 
            user={user} isPremium={isPremium} signOut={engine.signOut} getUserInitial={getUserInitial} 
        />

        {/* Whisper(Bottle) Modal: 이제 이거 하나면 됩니다! */}
        <BottleModals 
            isOpen={engine.isWhisperOpen} 
            onClose={() => engine.setWhisperOpen(false)}
            
            // 👇 핵심: 여기에 함수를 넣어주면 BottleModals가 알아서 WriteModal에 전달합니다.
            sendBottle={engine.sendBottle} 
        />

        <FireRitualModal 
            isOpen={engine.showFireRitual} 
            onClose={() => engine.setShowFireRitual(false)} 
            //onBurn={engine.performFireRitual}
            onBurn={engine.performFireRitual} 
        />
        
        <TimeCapsuleModal 
            isOpen={showCapsuleModal} onClose={() => setShowCapsuleModal(false)} onSave={engine.saveVoiceCapsule} 
        />
        <SpiritCapsuleModal 
            isOpen={engine.showSpiritCapsules} // 변수명 변경
            onClose={() => engine.setShowSpiritCapsules(false)}
            capsules={engine.spiritCapsules} // 데이터 변경
            onDelete={engine.forgetSpiritVoice} // 함수 변경
        />
        
        <MemoryRitual 
            isOpen={engine.showMemoryRitual} onClose={() => engine.setShowMemoryRitual(false)} 
            user={user} isPremium={isPremium} onFinalize={engine.finalizeMemory} onSaveCapsule={engine.saveVoiceCapsule} 
        />

        {/* [New] The Guide */}
        {engine.showGuide && (
                <ForestGuide onComplete={engine.completeGuide} />
            )}

        {/* [New] Soulography Modal */}
        <SoulographyModal 
            isOpen={engine.showSoulography} 
            onClose={() => engine.setShowSoulography(false)}
            type={engine.soulographyType}
            data={engine.soulographyData}
            userName={user?.email?.split('@')[0] || "Traveler"}
        />

        {/* Gallery & Viewer */}
        <MemoryGalleryModal 
            isOpen={engine.showGalleryModal} onClose={() => engine.setShowGalleryModal(false)} 
            currentResonance={engine.resonance} onSelect={(img) => setSelectedImage(img)}
        />
        <FullImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} />

        {/* Mailbox (Clean Modal Component) */}
        <AnimatePresence>
            {showMailbox && (
                <MailboxModal 
                    isOpen={showMailbox}
                    onClose={() => setShowMailbox(false)}
                    letters={engine.letters}
                    onShare={engine.openSoulography}
                />
            )}
        </AnimatePresence>

        {/* Journal Layer (The Star Archives) */}
        <AnimatePresence>
          {engine.showJournal && (
            <JournalModal 
                isOpen={engine.showJournal}
                onClose={() => engine.setShowJournal(false)}
                memories={engine.memories}
                processedMemories={processedMemories}
                engine={engine}
            />
          )}
        </AnimatePresence>
        </motion.div>
    </main>
  );
}