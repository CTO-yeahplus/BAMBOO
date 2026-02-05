// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType } from '../../types';
import { useWakeLock } from '../useWakeLock'; // [New] Import

// ... (EMOTION_MAP 상수는 기존과 동일하게 유지)
const EMOTION_MAP: Record<string, WeatherType> = {
    '슬퍼': 'rain', '우울': 'rain', '눈물': 'rain', '울고': 'rain', 
    '힘들': 'rain', '지쳐': 'rain', '비': 'rain', '아파': 'rain',
    '화가': 'ember', '짜증': 'ember', '열받': 'ember', '분노': 'ember', 
    '답답': 'ember', '미워': 'ember', '불': 'ember', '싫어': 'ember',
    '외로': 'snow', '혼자': 'snow', '쓸쓸': 'snow', '고독': 'snow', 
    '추워': 'snow', '겨울': 'snow', '바람': 'snow', '보고싶': 'snow',
    '행복': 'clear', '좋아': 'clear', '기뻐': 'clear', '신나': 'clear', 
    '감사': 'clear', '고마': 'clear', '편안': 'clear', '맑음': 'clear',
    '괜찮': 'clear', '사랑': 'clear'
};

export function useSpiritVapi(
    userId: string | null, 
    onCallEnd: () => void,
    onEmotionDetected?: (weather: WeatherType) => void 
) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const vapiRef = useRef<any>(null);
  
  // [New] 화면 꺼짐 방지 훅 사용
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const requestGyroAccess = () => {
      if (typeof window !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          (DeviceMotionEvent as any).requestPermission().catch(console.error);
      }
  };

  const analyzeEmotion = useCallback((text: string) => {
      if (!onEmotionDetected) return;
      for (const [keyword, weather] of Object.entries(EMOTION_MAP)) {
          if (text.includes(keyword)) {
              console.log(`[Emotive Weather] Detected: ${keyword} -> ${weather}`);
              onEmotionDetected(weather);
              break; 
          }
      }
  }, [onEmotionDetected]);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
        console.error("⛔ [Vapi Error] Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env file");
        return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
        setCallStatus('active');
        requestWakeLock(); // [New] 통화 시작 시 화면 켜짐 유지
    });

    vapi.on('call-end', () => { 
        setCallStatus('idle'); 
        releaseWakeLock(); // [New] 통화 종료 시 화면 잠금 허용
        onCallEnd(); 
    });
    
    vapi.on('speech-start', () => setCallStatus('listening'));
    vapi.on('speech-end', () => setCallStatus('processing'));
    
    vapi.on('message', (message: any) => {
      if (message.type === 'transcript') {
          if (message.transcriptType === 'final' && message.role === 'user') {
             analyzeEmotion(message.transcript);
          }
      }
      if (message.type === 'speech-update' && message.role === 'assistant' && message.status === 'started') {
          setCallStatus('speaking');
      }
      if (message.type === 'transcript' && message.role === 'assistant' && message.transcriptType === 'partial') {
          setSpiritMessage(message.transcript);
      }
    });

    return () => { 
        vapi.stop(); 
        releaseWakeLock(); // Cleanup
    };
  }, [onCallEnd, analyzeEmotion, requestWakeLock, releaseWakeLock]);


  const toggleCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    // 1. [Stop Logic] 통화 중이거나, 연결 시도 중이거나, 말하는 중일 때 -> 무조건 끊기
    // (모든 활성 상태를 체크하여 반응성을 높입니다)
    if (callStatus === 'active' || callStatus === 'connecting' || callStatus === 'listening' || callStatus === 'speaking' || callStatus === 'processing') {
      console.log("🛑 Stopping Call (User Triggered)...");
      
      // SDK에 중지 명령
      if (vapiRef.current) {
          vapiRef.current.stop(); 
      }
      
      // [Key Fix] 이벤트를 기다리지 않고 '즉시' UI를 초기화합니다.
      setCallStatus('idle'); 
      releaseWakeLock();
      onCallEnd(); // 저장 로직 실행
    } 
    // 2. [Start Logic] 대기 중일 때 -> 전화 걸기
    else { // callStatus === 'idle'
      if (!assistantId) {
          alert("Vapi Assistant ID가 설정되지 않았습니다.");
          return;
      }
      
      console.log("📞 Starting Call...");
      setCallStatus('connecting'); // UI를 즉시 '연결 중'으로 변경

      try {
        await vapiRef.current.start(assistantId);
      } catch (e) {
        console.error("❌ Vapi Start Failed:", e);
        setCallStatus('idle');
        alert("통화 연결에 실패했습니다. 마이크 권한을 확인해주세요.");
      }
    }
  }, [callStatus, onCallEnd, releaseWakeLock]);


  const sendTextMessage = (text: string) => {
      if (vapiRef.current && (callStatus === 'active' || callStatus === 'listening' || callStatus === 'speaking')) {
          vapiRef.current.send({ type: 'add-message', message: { role: 'user', content: text } });
          analyzeEmotion(text); 
      }
  };

  return { vapiRef, callStatus, toggleCall, spiritMessage, setSpiritMessage, isSilentMode, setIsSilentMode, requestGyroAccess, sendTextMessage };
}