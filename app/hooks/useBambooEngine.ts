// app/hooks/useBambooEngine.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from './useAuth';
import { useHaptic } from './useHaptic';
import { useSoundEngine } from './useSoundEngine';
import { useParallax } from './useParallax';
import { usePushNotification } from './usePushNotification';
import { useSoulData } from './engine/useSoulData';
import { useSpiritVapi } from './engine/useSpiritVapi';
import { supabase } from '../utils/supabase'; // 👈 [New] Supabase 클라이언트 Import
import { ARTIFACTS, TIME_THEMES, EMOTION_COLORS, WeatherType, SeasonType,THEMES, ThemeId, PersonaType } from '../types';
import { ORACLE_DECK } from '../types';

const DAILY_QUOTES = [
  "천천히 가도 괜찮아, 방향만 맞다면.", "비바람이 불어야 뿌리가 단단해지는 법이야.",
  "너는 존재만으로도 충분히 아름다워.", "잠시 멈춰서 숨을 고르는 것도 용기야.",
  "어둠은 별을 빛나게 할 뿐, 너를 삼키지 못해.", "오늘 흘린 땀은 내일의 웃음이 될 거야.",
  "가장 깊은 밤이 지나야 새벽이 온다.", "너의 속도로 걸어가도 돼."
];

export function useBambooEngine() {
// -----------------------------------------------------------
// 1. [Fix] 사운드 믹서 상태 변수 직접 선언 (useSoundEngine 대신 사용)
// -----------------------------------------------------------
  const [volume, setVolume] = useState(1);           // 마스터 볼륨 (0~1)
  const { user, tier, credits: dbCredits, signInWithGoogle, signOut } = useAuth();
  const { triggerSuccess, triggerMedium, triggerLight, triggerBreathing } = useHaptic();  
  const soul = useSoulData(user, triggerSuccess, tier);
  const [showFireRitual, setShowFireRitual] = useState(false);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [selectedAmbience, setSelectedAmbience] = useState<WeatherType | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'sadness' | 'anger' | 'loneliness' | 'happy'>('neutral');
  const handleEmotionDetected = useCallback((detectedWeather: WeatherType) => {
      setWeather((prev) => {
          if (prev !== detectedWeather) {
              triggerMedium();
              setSelectedAmbience(detectedWeather);
              return detectedWeather;
          }
          return prev;
      });

      // [New] 날씨를 감정으로 매핑하여 시각화 상태 업데이트
      const weatherToEmotion: Record<WeatherType, string> = {
          'rain': 'sadness',
          'ember': 'anger',
          'snow': 'loneliness',
          'clear': 'happy'
      };
      setCurrentEmotion(weatherToEmotion[detectedWeather] as any || 'neutral');

  }, [triggerMedium]);

  const handleCallEnd = useCallback(async (history: {role: string, content: string}[]) => {
    triggerLight();

    if (!history || history.length === 0) {
        // 대화가 없었더라도 목록은 최신화
        soul.fetchMemories();
        return;
    }

    // 대화 내용을 텍스트로 변환
    const fullContent = history
        .map(msg => `${msg.role === 'user' ? 'Traveler' : 'Spirit'}: ${msg.content}`)
        .join('\n');

    console.log("💾 Saving conversation...");
    
    // soul.createMemory 호출 (현재 감정 포함)
    await soul.createMemory(fullContent, "대화의 기록", currentEmotion);

  }, [triggerLight, soul, currentEmotion]);
  
  // [New] Soulography State
  const [showSoulography, setShowSoulography] = useState(false);
  const [soulographyType, setSoulographyType] = useState<'calendar' | 'letter'>('calendar');
  const [soulographyData, setSoulographyData] = useState<any>(null);
  const {permission, requestPermission } = usePushNotification();
  const [isWhisperOpen, setWhisperOpen] = useState(false);
  
  // [New] Bottle UI States
  const [showBottleMenu, setShowBottleMenu] = useState(false); // 메뉴 (쓰기 vs 줍기)
  const [showBottleWrite, setShowBottleWrite] = useState(false); // 쓰기 모달
  const [foundBottle, setFoundBottle] = useState<any>(null); // 읽기 모달 (데이터 있으면 열림)
  // Helper: 유리병 줍기 액션
  const handlePickUp = async () => {
    const bottle = await soul.pickUpBottle();
    if (bottle) {
        setFoundBottle(bottle);
        setShowBottleMenu(false); // 메뉴 닫기
    } else {
        alert("지금은 해변에 떠밀려온 유리병이 없습니다.\n직접 이야기를 띄워보시겠어요?");
    }
  };
  const openSoulography = (type: 'calendar' | 'letter', data: any) => {
    console.log("📸 Opening Soulography with:", data);
    setSoulographyType(type);
    setSoulographyData(data);
    setShowSoulography(true);
  };
  // [New] Oracle States
  const [todaysCard, setTodaysCard] = useState<any>(null);
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  // [New] 카드 뽑기 함수
  const drawOracleCard = () => {
    if (todaysCard) return; // 이미 뽑았으면 중복 방지 (선택 사항)
    
    setIsOracleLoading(true);
    
    // 신비로운 느낌을 위해 1.5초 딜레이 후 결과 공개
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * ORACLE_DECK.length);
        const pickedCard = ORACLE_DECK[randomIndex];
        setTodaysCard(pickedCard);
        setIsOracleLoading(false);
    }, 1500);
  };

  const voice = useSpiritVapi(
    user?.id ?? null, 
    tier || 'free', // tier 전달 (없으면 free)
    handleCallEnd, 
    handleEmotionDetected
);
  
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('bamboo');
  //const audioRefs = useRef<{ [key in WeatherType]: HTMLAudioElement | null }>({ clear: null, rain: null, snow: null, ember: null });
  const fadeIntervals = useRef<{ [key in WeatherType]: NodeJS.Timeout | null }>({ clear: null, rain: null, snow: null, ember: null });
  const [showSpiritCapsules, setShowSpiritCapsules] = useState(false);

  const { x: rawX, y: rawY, requestAccess: requestGyro } = useParallax();
  const smoothOptions = { stiffness: 100, damping: 20 };
  const mouseX = useSpring(rawX, { stiffness: 100, damping: 20 }); // mouseX 사용
  const mouseY = useSpring(rawY, smoothOptions);
  

  // [New] Change Theme Logic
  const setTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    
    // 테마에 맞는 사운드 프리셋 자동 적용 (useSoundEngine의 applyPreset 활용)
    const themeConfig = THEMES.find(t => t.id === themeId);
    if (themeConfig && applyPreset) { // applyPreset이 정의되어 있는지 확인
        applyPreset(themeConfig.soundPreset);
    }
    
    // 시각적 피드백 (햅틱 + 파티클)
    triggerSuccess();
    playMagicDust();
  };

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

  // Other States
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
  
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [initialSleepTime, setInitialSleepTime] = useState<number | null>(null);

  const [isDaytime, setIsDaytime] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(TIME_THEMES.night);
  const [season, setSeason] = useState<SeasonType>('spring');
  
  const [bgVolume, setBgVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [ambience, setAmbience] = useState('forest');
  const [showGuide, setShowGuide] = useState(false);

  // [New] Check First Visit (useEffect)
  useEffect(() => {
    // localStorage에서 확인
    const hasSeenGuide = localStorage.getItem('has_seen_guide_v1');
    if (!hasSeenGuide) {
        // 잠시 후(1초) 가이드 시작 (로딩 등을 고려)
        const timer = setTimeout(() => setShowGuide(true), 1000);
        return () => clearTimeout(timer);
  }
  }, []);

  // [New] Complete Handler
  const completeGuide = () => {
    setShowGuide(false);
    localStorage.setItem('has_seen_guide_v1', 'true'); // 봤다고 기록
  };

  const { 
    playPaperRustle, 
    playMagicDust, 
    playWindChime, 
    playWaterDrop, 
    initAudio, 
    playIntroBoom,
    // [New] 믹서 관련 기능들도 여기서 꺼냅니다
    isMixerMode, 
    setIsMixerMode, 
    mixerVolumes, 
    setMixerVolumes, 
    applyPreset,
    binauralMode, setBinauralMode, audioRefs,
  } = useSoundEngine(selectedAmbience, bgVolume, mouseX, voice.callStatus); 

  // [New] Mobile Audio Warm-up
  const startExperience = useCallback(() => {
      setHasStarted(true);
      // 1. iOS Gyroscope Permission Request (반드시 사용자 터치 직후 호출)
      // 이 함수는 useParallax에서 가져온 requestAccess입니다.
      requestGyro();
      
      // 1. iOS Gyroscope Permission Request (반드시 사용자 터치 직후 호출)
      // 이 함수는 useParallax에서 가져온 requestAccess입니다.
      requestGyro();

      // 2. Audio Elements Warm-up (모바일 브라우저 정책 우회)
      // 모든 오디오 태그를 0.1초간 재생하고 멈춰서 '재생 권한'을 획득합니다.
      Object.values(audioRefs.current).forEach(audio => {
          if (audio) {
              audio.muted = true; // 사용자에게 들리지 않게 무음 처리
              const playPromise = audio.play();
              
              if (playPromise !== undefined) {
                  playPromise.then(() => {
                      // 재생 성공! 브라우저가 "이 사이트는 오디오 재생 가능"으로 인식함.
                      // 아주 짧은 시간 후에 멈추고 음소거 해제
                      setTimeout(() => {
                        audio.pause();
                        audio.currentTime = 0; // 위치 초기화
                        audio.muted = false;   // 나중에 실제 재생할 때를 위해 음소거 해제
                      }, 50); // 50ms면 충분합니다.
                  }).catch(error => {
                      console.warn("Audio warm-up blocked (Auto-play policy):", error);
                  });
                }
              }
        });
      
      // 3. Web Audio API Context Resume
      initAudio(); 
      }, [initAudio, requestGyro]);

  const [hasStarted, setHasStarted] = useState(false);

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
      requestGyro(); 
      setHasWoken(true);
      setShowTutorial(true);
      // 👇 [수정] 유저 이름 + 환영 인사
      const name = user?.email?.split('@')[0] || 'Traveler';
      voice.setSpiritMessage(`어서와, 기다리고 있었어, ${name}.`);
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

  const handlePet = useCallback(() => {
      if (!isHolding && Math.random() > 0.7) { 
          triggerLight();
          playMagicDust();
      }
  }, [isHolding, triggerLight, playMagicDust]);

  const startSleepTimer = useCallback((minutes: number) => {
      triggerSuccess();
      const seconds = minutes * 60;
      setSleepTimer(seconds);
      setInitialSleepTime(seconds);
      setIsBreathing(true);
  }, [triggerSuccess]);

  const stopSleepTimer = useCallback(() => {
      setSleepTimer(null);
      setInitialSleepTime(null);
  }, []);

  
  // [New] Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  

  // 캘린더 열릴 때 데이터 로드
  useEffect(() => {
      if (showCalendar) {
          soul.fetchMonthlyMoods(calYear, calMonth);
      }
  }, [showCalendar, calYear, calMonth, soul.fetchMonthlyMoods]); // soul 객체가 dependency에 들어가면 무한루프 가능성 -> fetchMonthlyMoods만

  useEffect(() => {
      if (sleepTimer === null) return;
      if (sleepTimer <= 0) {
          stopSleepTimer();
          return;
      }
      const interval = setInterval(() => {
          setSleepTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
  }, [sleepTimer, stopSleepTimer]);

  const fadeToVolume = useCallback((type: WeatherType, targetVol: number, duration: number = 1000) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
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
    let sleepMultiplier = 1;
    if (sleepTimer !== null && initialSleepTime !== null) {
        sleepMultiplier = Math.max(0, sleepTimer / initialSleepTime);
    }
    const effectiveBgVolume = bgVolume * sleepMultiplier;
    const targetKey = selectedAmbience || weather;
    
    Object.keys(audioRefs.current).forEach((key) => {
      const type = key as WeatherType;
      const audio = audioRefs.current[type];
      if (type === targetKey) {
        if (audio && (audio.paused || Math.abs(audio.volume - effectiveBgVolume) > 0.01)) fadeToVolume(type, effectiveBgVolume, 1000); 
      } else {
        if (audio && !audio.paused && audio.volume > 0) fadeToVolume(type, 0, 1000);
      }
    });
  }, [weather, selectedAmbience, bgVolume, fadeToVolume, sleepTimer, initialSleepTime]);

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

  // 🌟 [Fix] finalizeMemory (수동 저장)
  const finalizeMemory = async (type: 'standard'|'capsule', summary: string, uid: string) => {
    console.log(`Saved ${type}: ${summary}`);
    
    // 단순 텍스트 메모 저장
    if (type === 'standard') {
        await soul.createMemory(summary, summary, 'neutral');
    } 
    // 캡슐은 별도 로직(saveVoiceCapsule)이 이미 있으므로 패스

    setShowMemoryRitual(false);
    // triggerSuccess는 createMemory 내부에서 호출됨
  };

  // 🌟 [Fix] deleteMemory (삭제)
  const deleteMemory = async (id: number) => { 
    if (!confirm("이 기억을 정말 지우시겠습니까?")) return; 
    await soul.deleteMemory(id); 
  };

  // 🌟 [Fix] shareMemory (공유 - 추후 구현)
  const shareMemory = async (m: any) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Soul Forest Memory',
                text: m.content,
            });
        } catch (e) {
            console.log('Share canceled');
        }
    } else {
        alert("공유하기가 지원되지 않는 환경입니다.");
    }
  };

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

  // [Fix] Import from usePresence
  const { fireflies, broadcastTouch } = require('./usePresence').usePresence(user?.id ?? null);

  // [New] Burn Logic
  const performFireRitual = useCallback(() => {
    // 0. [시각 효과 시작]
    setIsBurning(true);

    // 1. 강한 햅틱
    triggerSuccess(); 
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate([100, 50, 200, 50, 500]); 
    }

    // 2. 불 소리 재생
    const fireAudio = audioRefs.current['ember'];
    if (fireAudio) {
        fireAudio.volume = 1.0;
        fireAudio.currentTime = 0;
        fireAudio.play();
        setTimeout(() => {
           fadeToVolume('ember', selectedAmbience === 'ember' ? bgVolume : 0, 2000);
        }, 4000);
    }

    // 3. 보상
    soul.addResonance(20);
    
    // 4. [시각 효과 종료] 4초 뒤에 상태 끄기
    setTimeout(() => {
        setIsBurning(false);
    }, 4000);

  }, [triggerSuccess, audioRefs, fadeToVolume, selectedAmbience, bgVolume, soul]);

  const [showOnboarding, setShowOnboarding] = useState(false);

  // [Check] 최초 방문 여부 확인
  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited_forest');
    if (!hasVisited) {
        setShowOnboarding(true);
    }
  }, []);

  // [New] 온보딩 완료 핸들러
  const handleOnboardingComplete = (weatherId: string, personaId: string) => {
    // 1. 날씨(배경음) 설정
    changeAmbience(weatherId as any);
    
    // 2. 정령 페르소나 설정
    voice.setCurrentPersona(personaId as PersonaType);

    // 3. 완료 처리
    localStorage.setItem('has_visited_forest', 'true');
    setShowOnboarding(false);
    
    // 4. 환영 효과
    triggerSuccess();
    setTimeout(() => wakeSpirit(), 1000); // 1초 뒤 정령 깨우기
  };

  return {
    // 1. User & Auth
    user, 
    signInWithGoogle, 
    signOut, 
    isMounted: true, 
    tier,
    dbCredits,
    
    // 2. Mobile Experience
    hasStarted, 
    startExperience,

    // 3. Vapi (Voice)
    callStatus: voice.callStatus, 
    toggleCall: voice.toggleCall, 
    spiritMessage: voice.spiritMessage,
    stopVapi: voice.stopVapi,
    setSpiritMessage: voice.setSpiritMessage,
    isSilentMode: voice.isSilentMode, 
    toggleSilentMode, 
    sendTextMessage: voice.sendTextMessage, 
    getStatusText,
    setVoiceId: voice.setVoiceId, // 👈 [New] Voice ID 설정 함수 노출

    // 4. Soul Data (Profile & Items)
    resonance: soul.resonance, 
    soulLevel: soul.soulLevel, 
    memories: soul.memories,
    ownedItems: soul.ownedItems, 
    equippedItems: soul.equippedItems, 
    unlockArtifact: soul.unlockArtifact, 
    equipArtifact: soul.equipArtifact, 
    ARTIFACTS: soul.ARTIFACTS,
    isWhisperOpen,
    setWhisperOpen,

    // 5. Interaction States
    hasWoken, 
    wakeSpirit, 
    showTutorial, 
    dailyQuote, 
    hasCollectedDew, 
    collectDew,
    isBreathing, 
    toggleBreathing, 
    isHolding, 
    setIsHolding, 
    handlePet,

    // 6. UI Visibility States
    showJournal, setShowJournal, 
    showAltar, setShowAltar, 
    showSettings, setShowSettings, 
    showMemoryRitual, setShowMemoryRitual, 
    pendingSummary, setPendingSummary,
    
    // 7. Environment (Weather & Time)
    backgroundGradient, 
    weather, 
    isDaytime, 
    showEasterEgg, 
    bgVolume, setBgVolume, 
    voiceVolume, setVoiceVolume, 
    selectedAmbience, changeAmbience, 
    season,
    soul, ambience, setAmbience, volume, setVolume,

    // 8. Audio & Effects
    playPaperRustle, 
    playMagicDust, 
    initAudio, 
    triggerLight, 
    motionValues, 
    audioRefs, // [Critical] 이게 없어서 에러가 났을 확률이 높음
    playIntroBoom,

    // 9. Memory Actions
    finalizeMemory, 
    deleteMemory, 
    shareMemory, 
    capturingId: null, 
    isDeleting: null,

    // 10. Letter & Reports
    letters: soul.letters, 
    generateMonthlyLetter: soul.generateMonthlyLetter, 
    generateWeeklyReport: soul.generateWeeklyReport,

    // 11. Time Capsule
    saveVoiceCapsule: soul.saveVoiceCapsule, 
    sleepTimer, startSleepTimer, stopSleepTimer, 

    // 12. Oracle
    showOracleModal: soul.showOracleModal, 
    confirmOracle: soul.confirmOracle,
    todaysCard,
    isOracleLoading,
    drawOracleCard,

    // 13. Presence (Fireflies)
    fireflies, 
    broadcastTouch,

    // 14. Bottle (Social)
    sendBottle: soul.sendBottle, 
    findRandomBottle: soul.findRandomBottle, 
    likeBottle: soul.likeBottle, 
    foundBottle: soul.foundBottle, 
    setFoundBottle: soul.setFoundBottle, 
    replyToBottle: soul.replyToBottle, 
    showBottleMenu, setShowBottleMenu,
    showBottleWrite, setShowBottleWrite,
    handlePickUp,
    pickUpBottle: soul.pickUpBottle,
    sendWarmth: soul.sendWarmth,
    castBottle: soul.castBottle,

    // 15. Fire Ritual
    showFireRitual, setShowFireRitual, performFireRitual,
    isBurning, setIsBurning,

    // 16. Spirit Form & Evolution
    spiritForm: soul.spiritForm,
    changeSpiritForm: soul.changeSpiritForm,
    SPIRIT_FORMS: soul.SPIRIT_FORMS,
    currentEmotion,

    // 17. Gallery
    showGalleryModal: soul.showGalleryModal,
    setShowGalleryModal: soul.setShowGalleryModal,

    // 18. Sound Mixer
    isMixerMode, setIsMixerMode,
    mixerVolumes, setMixerVolumes,
    applyPreset, 
    
    // 19. Theme
    currentTheme, setTheme,

    // 20. Calendar
    monthlyMoods: soul.monthlyMoods,
    fetchMonthlyMoods: soul.fetchMonthlyMoods, // 👈 이 줄을 추가하세요!
    showCalendar, setShowCalendar,
    calYear, setCalYear,
    calMonth, setCalMonth, 

    // 21. Binaural
    binauralMode, setBinauralMode,

    // 22. Soulography (Share)
    showSoulography, setShowSoulography, 
    soulographyType, soulographyData, 
    openSoulography,

    // 23. Push Notification
    pushPermission: permission, 
    requestPushPermission: requestPermission,

    // 24. Onboarding
    showOnboarding, handleOnboardingComplete,
    
    // 25. Spirit Capsules (Voice Storage)
    spiritCapsules: soul.spiritCapsules,
    keepSpiritVoice: soul.keepSpiritVoice,
    forgetSpiritVoice: soul.forgetSpiritVoice,
    showSpiritCapsules, setShowSpiritCapsules,

    // 26. Guide
    showGuide, completeGuide,
    oracleHistory: soul.oracleHistory,
    
};
}