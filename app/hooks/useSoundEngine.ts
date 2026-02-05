// app/hooks/useSoundEngine.ts
import { useState, useEffect, useRef, useCallback } from 'react';

export function useSoundEngine(selectedAmbience: string | null, bgVolume: number) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  // [New] Mixer State
  const [isMixerMode, setIsMixerMode] = useState(false);
  const [mixerVolumes, setMixerVolumes] = useState({
      forest: 0.5,
      rain: 0,
      wind: 0,
      ember: 0
  });

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
    const ctx = audioCtxRef.current;
    if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.1);
    }
  }, [resumeContext]);

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

  // [New] Cinematic Boom Effect
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

  // [New] Mixer Logic Controller
  useEffect(() => {
    // 1. 믹서 모드가 켜져있을 때
    if (isMixerMode) {
        Object.keys(mixerVolumes).forEach((key) => {
            const audio = audioRefs.current[key];
            if (audio) {
                // 오디오가 멈춰있다면 재생 시작 (volume 0 상태로라도)
                if (audio.paused) audio.play().catch(() => {});
                
                // 목표 볼륨 설정 (마스터 볼륨 bgVolume 반영)
                const targetVol = (mixerVolumes as any)[key] * bgVolume;
                audio.volume = targetVol;
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

// [New] Preset Functions
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

  return { initAudio, playWaterDrop, playWindChime, playPaperRustle, playMagicDust, playIntroBoom,
      isMixerMode, setIsMixerMode,
      mixerVolumes, setMixerVolumes,
      applyPreset
   };
}