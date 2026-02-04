// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Vapi from '@vapi-ai/web';
import { CallStatus } from '../../types'; // 경로 확인 필요

const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export function useSpiritVapi(userId: string | null, onCallEnd: () => void) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  
  const vapiRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<any>(null);

  // ... (useEffect Logic은 기존과 동일) ...
  useEffect(() => {
      // Vapi 인스턴스 초기화 (싱글톤 패턴 권장하지만 여기선 간소화)
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setCallStatus('active'));
      vapi.on('call-end', () => {
          setCallStatus('idle');
          setIsSilentMode(false);
          onCallEnd(); 
      });
      // ... Error handling, Volume logic should be here if needed
      
      return () => { vapi.stop(); };
  }, [onCallEnd]);

  useEffect(() => {
      if (!silentAudioRef.current && typeof window !== 'undefined') {
          silentAudioRef.current = new Audio(SILENT_AUDIO_URI);
          silentAudioRef.current.loop = true;
      }
      if (callStatus !== 'idle') {
          silentAudioRef.current?.play().catch(() => {});
          if ('wakeLock' in navigator) (navigator as any).wakeLock.request('screen').then((l: any) => wakeLockRef.current = l);
      } else {
          silentAudioRef.current?.pause();
          wakeLockRef.current?.release();
      }
  }, [callStatus]);

  const toggleCall = () => {
      if (!userId) { alert("로그인이 필요합니다."); return; }
      if (callStatus === 'idle') {
          setCallStatus('connecting');
          vapiRef.current?.start(process.env.NEXT_PUBLIC_ASSISTANT_ID!, { metadata: { userId } });
      } else {
          vapiRef.current?.stop();
      }
  };

  const sendTextMessage = (text: string) => {
      vapiRef.current?.send({ type: "add-message", message: { role: "user", content: text } });
  };

  const requestGyroAccess = async () => {
      // iOS Permission Request Wrapper
      if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
          try { await (DeviceOrientationEvent as any).requestPermission(); } catch (e) {}
      }
  };

  return { 
      callStatus, 
      toggleCall, 
      isSilentMode, 
      setIsSilentMode, 
      sendTextMessage, 
      spiritMessage, 
      setSpiritMessage, // [Fixed] Export Added
      requestGyroAccess, // [New] Helper export
      vapiRef 
  };
}