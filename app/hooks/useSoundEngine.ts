// app/hooks/useSoundEngine.ts
import { useCallback, useEffect, useRef } from 'react';

export function useSoundEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 브라우저 오디오 컨텍스트 초기화 (사용자 인터랙션 필요)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
  }, []);

  const resumeContext = useCallback(() => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // [New] 데스크탑 오디오 정책 우회를 위한 초기화 함수
  const initAudio = useCallback(() => {
    resumeContext();
    // 무음 오실레이터를 한 번 재생하여 오디오 엔진을 'User Interacted' 상태로 만듦
    const ctx = audioCtxRef.current;
    if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0; // 소리 안 나게
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.1);
    }
  }, [resumeContext]);

  // 1. Water Drop (이슬): 맑고 투명한 사인파의 피치 하강
  const playWaterDrop = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    // Frequency: 1200Hz -> 400Hz (빠르게 떨어짐)
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    // Volume: Attack(0.01s) -> Decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }, [resumeContext]);

  // 2. Wind Chime (호흡): 배음이 풍부한 금속성 소리
  const playWindChime = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // 여러 개의 오실레이터로 화음 생성 (랜덤성 추가)
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

      // 긴 여운 (Decay 2~3초)
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05); // 볼륨은 작게
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2 + i * 0.5);

      // 공간감 (좌우 패닝)
      pan.pan.value = (Math.random() * 2 - 1) * 0.5;

      osc.start(now);
      osc.stop(now + 3);
    });
  }, [resumeContext]);

  // 3. Paper Rustle (저널): 화이트 노이즈 + 로우패스 필터
  const playPaperRustle = useCallback(() => {
    resumeContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.5; // 0.5초
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // 화이트 노이즈 생성
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // 종이의 먹먹한 소리

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

  // 4. Magic Dust (꽃): 고음역대 아르페지오 (반짝임)
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
        // 펜타토닉 스케일 랜덤 (높은 음)
        const notes = [880, 987, 1109, 1318, 1480]; 
        const freq = notes[Math.floor(Math.random() * notes.length)] * 2;
        
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      }, i * 50); // 50ms 간격으로 따다닥
    }
  }, [resumeContext]);

  return { initAudio, playWaterDrop, playWindChime, playPaperRustle, playMagicDust };
}