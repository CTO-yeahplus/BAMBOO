// app/hooks/useSoundEngine.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { CallStatus } from '../types'; // types.ts에 CallStatus가 정의되어 있어야 합니다.

// [Modified] 인자에 mouseX와 callStatus 추가
export function useSoundEngine(
    selectedAmbience: string | null, 
    bgVolume: number, 
    mouseX: any, // MotionValue (Framer Motion)
    callStatus: CallStatus // 대화 상태
) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // [New] Web Audio API Nodes 저장소
  const sourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode>>({});
  const pannerNodesRef = useRef<Record<string, StereoPannerNode>>({});
  const gainNodesRef = useRef<Record<string, GainNode>>({});

  // Mixer State
  const [isMixerMode, setIsMixerMode] = useState(false);
  const [mixerVolumes, setMixerVolumes] = useState({
      forest: 0.5,
      rain: 0,
      wind: 0,
      ember: 0
  });

  // 1. Audio Context & Nodes 초기화 (User Interaction 후 한 번만 실행)
  const initAudioNodes = useCallback(() => {
      if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      // 각 오디오 엘리먼트를 Web Audio API 그래프에 연결
      Object.keys(audioRefs.current).forEach(key => {
          const audioEl = audioRefs.current[key];
          // 이미 연결된 노드가 없고, 오디오 엘리먼트가 존재할 때만 연결
          if (audioEl && !sourceNodesRef.current[key]) {
              try {
                  // [Graph] Source -> Gain -> Panner -> Destination
                  const source = ctx.createMediaElementSource(audioEl);
                  const gain = ctx.createGain();
                  const panner = ctx.createStereoPanner();

                  source.connect(gain);
                  gain.connect(panner);
                  panner.connect(ctx.destination);

                  // 레퍼런스 저장
                  sourceNodesRef.current[key] = source;
                  gainNodesRef.current[key] = gain;
                  pannerNodesRef.current[key] = panner;
                  
                  console.log(`🔌 Audio Node Connected: ${key}`);
              } catch (e) {
                  console.warn(`Audio Node Connection Warning (${key}):`, e);
              }
          }
      });
  }, []);

  // 2. [Sonic Reality] Spatial Audio (Pan Control)
  useEffect(() => {
      if (!audioCtxRef.current || !mouseX) return;
      
      // mouseX.get()은 -1(왼쪽) ~ 1(오른쪽) 사이의 값
      // 너무 극단적인 패닝을 방지하기 위해 0.8 계수 적용
      const updatePan = () => {
          const currentPan = mouseX.get() * 0.8; 
          
          Object.values(pannerNodesRef.current).forEach(panner => {
              // 부드러운 전환 (0.1초 딜레이)
              panner.pan.setTargetAtTime(currentPan, audioCtxRef.current!.currentTime, 0.1);
          });
      };

      // MotionValue 구독
      const unsubscribe = mouseX.on("change", updatePan);
      return () => unsubscribe();
  }, [mouseX]);

  // 3. [Sonic Reality] Dynamic Silence (Volume & Ducking Logic)
  useEffect(() => {
      // AudioContext가 없거나 suspended 상태면 노드 제어가 안될 수 있음 (초기화 전)
      if (!audioCtxRef.current) return;

      // 더킹(Ducking) 계수: 대화 중이면 30%, 아니면 100%
      const isTalking = callStatus === 'speaking' || callStatus === 'listening' || callStatus === 'processing';
      const duckingMultiplier = isTalking ? 0.3 : 1.0;

      // 믹서 키 매핑
      const keyMap: Record<string, string> = { 
          'forest': 'clear', 'rain': 'rain', 'wind': 'snow', 'ember': 'ember' 
      };

      // 모든 트랙 순회하며 볼륨 조절
      Object.keys(audioRefs.current).forEach(key => {
          const gainNode = gainNodesRef.current[key];
          const audioEl = audioRefs.current[key];
          
          if (!gainNode || !audioEl) return;

          let targetVol = 0;

          if (isMixerMode) {
              // 믹서 모드
              const mixerKey = Object.keys(keyMap).find(k => keyMap[k] === key);
              if (mixerKey) {
                  targetVol = (mixerVolumes as any)[mixerKey] * bgVolume;
              }
          } else {
              // 일반 모드 (선택된 앰비언스만 재생)
              targetVol = (key === selectedAmbience) ? bgVolume : 0;
          }

          // 최종 볼륨 = 목표 볼륨 * 더킹 계수
          const finalVol = targetVol * duckingMultiplier;
          
          // Gain Node를 통한 부드러운 볼륨 전환 (Fade)
          try {
              gainNode.gain.setTargetAtTime(finalVol, audioCtxRef.current!.currentTime, 0.5);
          } catch(e) { /* Ignore context error */ }

          // 오디오 엘리먼트 재생/일시정지 관리
          if (finalVol > 0.01) {
              if (audioEl.paused) {
                  audioEl.play().catch(() => {});
              }
          } else {
              // 완전히 꺼질 때만 pause (약간의 여유 시간 후)
              if (!audioEl.paused && finalVol === 0) {
                  setTimeout(() => {
                      // 비동기 딜레이 후 볼륨이 여전히 0이면 정지
                      if (gainNode.gain.value < 0.01) audioEl.pause();
                  }, 1000);
              }
          }
      });

  }, [callStatus, bgVolume, selectedAmbience, isMixerMode, mixerVolumes]);

  // [New] Mixer Logic Controller
  useEffect(() => {
      // 1. 믹서 모드가 켜져있을 때
      if (isMixerMode) {
        const existingKeys = Object.keys(audioRefs.current);
        console.log("🎹 [Debug] Registered Audio Keys:", existingKeys);
        // [Key Logic] 믹서의 이름(Key)과 실제 오디오 파일의 이름(Key)을 연결해주는 지도
        const keyMap: Record<string, string> = {
          'forest': 'clear', // 믹서의 Forest는 -> 무조건 'clear' 태그를 조작
          'rain': 'rain',    // 믹서의 Rain은 -> 'rain' 태그
          'wind': 'snow',    // 믹서의 Wind는 -> 'snow' 태그 (파일명은 winter_wind지만 키는 snow)
          'ember': 'ember'   // 믹서의 Fire는 -> 'ember' 태그
        };
        // 🔍 [수사 기록 1] 현재 사용 가능한 오디오 트랙이 무엇인지 확인
        console.log("🎧 [Mixer Debug] Available Audio Keys:", Object.keys(audioRefs.current));
        console.log("🎚️ [Mixer Debug] Master Volume (bgVolume):", bgVolume);

        Object.keys(mixerVolumes).forEach((mixerKey) => {
          const audioKey = keyMap[mixerKey];
              
            // 🚨 [핵심 변경] Ref 대신 ID로 직접 찾습니다.
            // page.tsx에서 부여한 id="spirit-audio-..." 를 찾습니다.
            const audio = document.getElementById(`spirit-audio-${audioKey}`) as HTMLAudioElement;
            
            const sliderValue = (mixerVolumes as any)[mixerKey];
            const targetVol = sliderValue * bgVolume;

            if (!audio) {
                console.warn(`⚠️ [Mixer] Cannot find element by ID: spirit-audio-${audioKey}`);
                return;
            }

            // 오디오가 멈춰있으면 재생 시도
            if (audio.paused && targetVol > 0) {
              console.log(`▶️ Starting audio: ${audioKey}`);
              audio.play().catch(e => console.warn(`⚠️ Play failed for ${audioKey}:`, e));
            }

            // 볼륨 적용
            audio.volume = Math.max(0, Math.min(1, targetVol));
            console.log(`✅ [Applied] ${audioKey} volume set to: ${audio.volume.toFixed(2)} (Target: ${targetVol.toFixed(2)})`);

          if (audio) {
            // 목표 볼륨 계산: (슬라이더 값) * (마스터 볼륨)
            const sliderValue = (mixerVolumes as any)[mixerKey];
            const targetVol = sliderValue * bgVolume;
            
            // 소리가 꺼져있거나 멈춰있는데 볼륨을 올렸다면 -> 재생 시작
            if (audio.paused && targetVol > 0) {
                audio.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // [핵심] 실제 오디오 볼륨에 적용
            audio.volume = Math.max(0, Math.min(1, targetVol)); 
            
            // 디버깅용 로그 (개발자 도구 콘솔에서 확인 가능)
            console.log(`Mixing: ${audioKey} -> ${audio.volume}`);
          }
        });
      } 
      // 2. 믹서 모드가 꺼졌을 때 (기존 날씨 로직으로 복귀)
      else {
          Object.keys(audioRefs.current).forEach((key) => {
              const audio = audioRefs.current[key];
              if (audio) {
                  // 선택된 날씨만 켜고 나머지는 끈다
                  const isTarget = key === selectedAmbience;
                  // fadeToVolume 함수가 있다면 그것을 활용, 아니면 직접 제어
                  // 여기서는 간단히 직접 제어 로직 예시:
                  if (isTarget) {
                      if (audio.paused) audio.play().catch(() => {});
                      audio.volume = bgVolume; 
                  } else {
                      audio.volume = 0;
                      // 완전히 끄지 않고 0으로 두어 부드러운 전환 대기
                  }
              }
          });
      }
  }, [isMixerMode, mixerVolumes, bgVolume, selectedAmbience]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
  }, []);

  const resumeContext = useCallback(() => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const initAudio = useCallback(() => {
    resumeContext();
    // [New] 여기서 노드 초기화 실행
    initAudioNodes();

    const ctx = audioCtxRef.current;
    if (ctx) {
        // Silent Oscillator to wake up AudioContext (iOS workaround)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.1);
    }
  }, [resumeContext, initAudioNodes]);

  const playWaterDrop = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }, [resumeContext]);

  const playWindChime = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const freqs = [2000, 2500, 3200, 4200];
    const detune = Math.random() * 100;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.value = f + detune;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2 + i * 0.5);
      pan.pan.value = (Math.random() * 2 - 1) * 0.5;
      osc.start(now);
      osc.stop(now + 3);
    });
  }, [resumeContext]);

  const playPaperRustle = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    const gain = ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    noise.start(now);
  }, [resumeContext]);

  const playMagicDust = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        const notes = [880, 987, 1109, 1318, 1480]; 
        const freq = notes[Math.floor(Math.random() * notes.length)] * 2;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }, i * 50);
    }
  }, [resumeContext]);

  const playIntroBoom = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Deep Sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 2.0);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.linearRampToValueAtTime(100, now + 1.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1.0, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
    osc.start(now);
    osc.stop(now + 4.0);

    // Rumble Noise
    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 80; 
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    noise.start(now);
  }, [resumeContext]);

  // Preset Functions
  const applyPreset = (preset: 'focus' | 'sleep' | 'morning') => {
    setIsMixerMode(true);
    switch (preset) {
        case 'focus': // 숲 소리 + 약한 바람
            setMixerVolumes({ forest: 0.6, wind: 0.3, rain: 0, ember: 0 });
            break;
        case 'sleep': // 빗소리 + 장작불
            setMixerVolumes({ forest: 0.1, wind: 0.1, rain: 0.7, ember: 0.4 });
            break;
        case 'morning': // 맑은 숲 소리만
            setMixerVolumes({ forest: 0.8, wind: 0.1, rain: 0, ember: 0 });
            break;
    }
  };

  // Binaural State
  const [binauralMode, setBinauralMode] = useState<string>('none');

  // Binaural Logic (동일 유지)
  useEffect(() => {
      const beats = ['delta', 'alpha', 'theta'];
      beats.forEach(beat => {
          const audio = document.getElementById(`binaural-${beat}`) as HTMLAudioElement;
          if (!audio) return;

          if (binauralMode === beat) {
              if (audio.paused) audio.play().catch(() => {});
              audio.volume = Math.max(0, Math.min(1, bgVolume * 0.3)); 
          } else {
              if (!audio.paused) {
                  audio.volume = 0;
                  setTimeout(() => audio.pause(), 1000); 
              }
          }
      });
  }, [binauralMode, bgVolume]);

  return { 
      initAudio, 
      playWaterDrop, playWindChime, playPaperRustle, playMagicDust, playIntroBoom,
      isMixerMode, setIsMixerMode,
      mixerVolumes, setMixerVolumes,
      applyPreset, 
      binauralMode, setBinauralMode,
      audioRefs, // Refs 반환 필수
   };
}