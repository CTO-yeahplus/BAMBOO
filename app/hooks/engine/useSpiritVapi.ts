// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType, SOUL_MASKS, PersonaType } from '../../types';
import { useWakeLock } from '../useWakeLock';

// 🚀 [핵심 1] Vapi 인스턴스를 컴포넌트 '밖'으로 뺐습니다. (싱글톤 패턴)
// 이제 리렌더링되어도 인스턴스가 계속 새로 생기지 않아 'KrispSDK 중복' 에러가 사라집니다.
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');

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
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const vapiRef = useRef<any>(vapi); // 외부 인스턴스 참조
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('spirit');
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // 감정 분석 로직
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

  // 이벤트 리스너 등록 (Mount 시 1회)
  useEffect(() => {
    const onCallStart = () => {
        console.log('📞 Vapi Call Started');
        setCallStatus('active');
        requestWakeLock();
    };

    const onCallEndHandler = () => { 
        console.log('🛑 Vapi Call Ended');
        setCallStatus('idle'); 
        releaseWakeLock();
        onCallEnd(); 
    };

    const onSpeechStart = () => setCallStatus('listening');
    const onSpeechEnd = () => setCallStatus('processing');
    
    const onMessage = (message: any) => {
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
    };

    const onError = (err: any) => {
        console.error('🔴 Vapi Error:', err);
        setCallStatus('idle');
        releaseWakeLock();
    };

    // 리스너 부착
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEndHandler);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    return () => { 
        // 언마운트 시 리스너만 깔끔하게 제거 (인스턴스는 살려둠)
        vapi.off('call-start', onCallStart);
        vapi.off('call-end', onCallEndHandler);
        vapi.off('speech-start', onSpeechStart);
        vapi.off('speech-end', onSpeechEnd);
        vapi.off('message', onMessage);
        vapi.off('error', onError);
        releaseWakeLock();
    };
  }, [onCallEnd, analyzeEmotion, requestWakeLock, releaseWakeLock]);

  // 🛑 [핵심 2] 확실한 사살 (Force Stop)
  const stopVapi = useCallback(() => {
    console.log("🛑 Force Stopping Vapi...");
    setCallStatus('idle'); // UI 즉시 반영
    
    try {
        vapi.stop(); // SDK 강제 종료
    } catch (e) {
        console.warn("Stop failed (already stopped?)", e);
    }
    
    releaseWakeLock();
  }, [releaseWakeLock]);

  // 📞 [핵심 3] 시작 전 청소 (Clean Start)
  const toggleCall = useCallback(async () => {
    // 1. 통화 중이면 -> 확실히 끊기
    if (callStatus !== 'idle') {
        stopVapi();
        return;
    }

    // 2. 통화 시작 로직
    const selectedMask = SOUL_MASKS.find(m => m.id === currentPersona);
    const assistantId = selectedMask?.assistantId;

    if (!assistantId) {
        alert(`Assistant ID for ${currentPersona} not found.`);
        return;
    }

    console.log(`🧹 Cleaning up before start...`);
    setCallStatus('connecting');
    
    try {
        // (A) 시작 전에 무조건 한 번 끊어줍니다. (좀비 세션 방지)
        try { vapi.stop(); } catch (e) {}

        // (B) 200ms 대기: 브라우저가 오디오 장치를 뱉어낼 시간을 줍니다.
        await new Promise(resolve => setTimeout(resolve, 200));

        // (C) 이제 깨끗한 상태에서 시작
        console.log(`📞 Starting Call with Persona: ${currentPersona}`);
        
        // 메타데이터에 userId 심기 (서버에서 확인용)
        await vapi.start(assistantId, {
            metadata: { userId: userId || 'guest' }
        });

    } catch (e) {
        console.error("❌ Vapi Start Failed:", e);
        setCallStatus('idle');
        // 실패 시에도 한 번 더 확실히 죽임
        try { vapi.stop(); } catch(e) {}
        alert("통화 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

  }, [callStatus, currentPersona, userId, stopVapi]);

  // [New] 페르소나 변경 (의식)
  const changePersona = useCallback(async (personaId: PersonaType) => {
    const selectedMask = SOUL_MASKS.find(m => m.id === personaId);
    if (!selectedMask) return;

    console.log(`[Ritual] Persona Changing to ${selectedMask.name}...`);

    // 변경 시에는 무조건 통화를 끊습니다. (자연스러운 UX)
    if (callStatus !== 'idle') {
        stopVapi();
        // 0.5초 뒤에 페르소나만 변경해둠 (사용자가 다시 터치해서 시작하도록 유도)
        setTimeout(() => setCurrentPersona(personaId), 500);
    } else {
        setCurrentPersona(personaId);
    }
    
  }, [callStatus, stopVapi]);

  // 텍스트 메시지 전송 (Whisper)
  const sendTextMessage = useCallback((text: string) => {
      if (callStatus === 'active' || callStatus === 'listening' || callStatus === 'speaking') {
          vapi.send({ type: 'add-message', message: { role: 'user', content: text } });
          analyzeEmotion(text); 
      }
  }, [callStatus, analyzeEmotion]);

  return { 
      vapiRef, 
      callStatus, 
      toggleCall,
      stopVapi, 
      spiritMessage, 
      setSpiritMessage, 
      isSilentMode, 
      setIsSilentMode, 
      sendTextMessage,
      setCurrentPersona,
      currentPersona,
      changePersona,
  };
}