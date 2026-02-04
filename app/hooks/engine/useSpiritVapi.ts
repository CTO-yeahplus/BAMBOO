// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType } from '../../types'; 

// [New] 감정 키워드 매핑
const EMOTION_MAP: Record<string, WeatherType> = {
    // Rain (Sadness, Depression)
    '슬퍼': 'rain', '우울': 'rain', '눈물': 'rain', '울고': 'rain', 
    '힘들': 'rain', '지쳐': 'rain', '비': 'rain', '아파': 'rain',
    
    // Ember (Anger, Frustration)
    '화가': 'ember', '짜증': 'ember', '열받': 'ember', '분노': 'ember', 
    '답답': 'ember', '미워': 'ember', '불': 'ember', '싫어': 'ember',

    // Snow (Loneliness, Cold)
    '외로': 'snow', '혼자': 'snow', '쓸쓸': 'snow', '고독': 'snow', 
    '추워': 'snow', '겨울': 'snow', '바람': 'snow', '보고싶': 'snow',

    // Clear (Happiness, Calm)
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

    vapi.on('call-start', () => setCallStatus('active'));
    vapi.on('call-end', () => { setCallStatus('idle'); onCallEnd(); });
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

    return () => { vapi.stop(); };
  }, [onCallEnd, analyzeEmotion]);

  const toggleCall = async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (callStatus === 'idle') {
      // [Fix] Assistant ID 체크 로직 추가
      if (!assistantId) {
          alert("Vapi Assistant ID가 설정되지 않았습니다. .env 파일을 확인해주세요.");
          console.error("⛔ [Vapi Error] Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID");
          return;
      }

      setCallStatus('connecting');
      try {
        await vapiRef.current.start(assistantId);
      } catch (e) {
        console.error("❌ Vapi Start Failed:", e);
        setCallStatus('idle');
        alert("통화 연결에 실패했습니다. 마이크 권한을 확인해주세요.");
      }
    } else {
      vapiRef.current.stop();
    }
  };

  const sendTextMessage = (text: string) => {
      if (vapiRef.current && (callStatus === 'active' || callStatus === 'listening' || callStatus === 'speaking')) {
          vapiRef.current.send({ type: 'add-message', message: { role: 'user', content: text } });
          analyzeEmotion(text); 
      }
  };

  return { vapiRef, callStatus, toggleCall, spiritMessage, setSpiritMessage, isSilentMode, setIsSilentMode, requestGyroAccess, sendTextMessage };
}