'use client';
import { useCallback, useRef, useEffect } from 'react';

// 애플 스타일의 미니멀한 효과음 신디사이저
export const useUISound = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    // 오디오 컨텍스트 초기화 (사용자 인터랙션 시 시작)
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    // 1. Tick (버튼 클릭음 - 짧고 명료한 고주파 클릭)
    const playTick = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }, [initAudio]);

    // 2. Swoosh (모달 열림 - 부드러운 바람 소리)
    const playSwoosh = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const bufferSize = ctx.sampleRate * 0.5; // 0.5초
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // 화이트 노이즈 생성
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2); // 필터가 열리며 슝~

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }, [initAudio]);

    // 3. Chime (성공/완료 - 맑고 영롱한 화음)
    const playChime = useCallback(() => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major (도, 미, 솔, 높은 도)
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const now = ctx.currentTime + (i * 0.05); // 아르페지오 (띠-리-링)
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // 긴 여운

            osc.start(now);
            osc.stop(now + 1.5);
        });
    }, [initAudio]);

    return { playTick, playSwoosh, playChime };
};