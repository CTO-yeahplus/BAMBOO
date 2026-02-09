// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType, SOUL_MASKS, PersonaType } from '../../types'; // 경로 확인
import { useWakeLock } from '../useWakeLock';

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
  const vapiRef = useRef<any>(null);
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

  // Vapi 초기화 및 이벤트 리스너
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
        console.error("⛔ [Vapi Error] Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
        return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
        setCallStatus('active');
        requestWakeLock();
    });

    vapi.on('call-end', () => { 
        setCallStatus('idle'); 
        releaseWakeLock();
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
        releaseWakeLock();
    };
  }, [onCallEnd, analyzeEmotion, requestWakeLock, releaseWakeLock]);

  // 👇 [추가] 명시적인 연결 종료 함수 (useVapiLimit에서 사용)
  const stopVapi = useCallback(() => {
    if (callStatus !== 'idle') {
        console.log("🛑 Force Stopping Vapi (Limit Reached or User Action)...");
        vapiRef.current?.stop();
        setCallStatus('idle');
        releaseWakeLock();
    }
  }, [callStatus, releaseWakeLock]);

  // [Core Logic] 통화 시작/종료 토글 (페르소나 반영)
  const toggleCall = useCallback(async () => {
    // 1. 통화 중이면 종료
    if (callStatus !== 'idle') {
        stopVapi();
        return;
    }

    // 2. 통화 시작 (현재 선택된 페르소나로)
    const selectedMask = SOUL_MASKS.find(m => m.id === currentPersona);
    const assistantId = selectedMask?.assistantId; // Vapi Assistant ID 사용

    if (!assistantId) {
        alert(`Assistant ID for ${currentPersona} not found.`);
        return;
    }

    console.log(`📞 Starting Call with Persona: ${currentPersona} (ID: ${assistantId})`);
    setCallStatus('connecting');
    
    try {
        await vapiRef.current?.start(assistantId);
    } catch (e) {
        console.error("❌ Vapi Start Failed:", e);
        setCallStatus('idle');
        alert("Connection Failed. Check console.");
    }

  }, [callStatus, currentPersona, releaseWakeLock, stopVapi]);

  // [New] 페르소나 변경 (의식)
  const changePersona = useCallback(async (personaId: PersonaType) => {
    const selectedMask = SOUL_MASKS.find(m => m.id === personaId);
    if (!selectedMask) return;

    console.log(`[Ritual] Persona Changing to ${selectedMask.name}...`);

    // 1. 현재 연결 종료
    if (callStatus !== 'idle') {
        vapiRef.current?.stop();
        setCallStatus('idle');
        
        // 2. 잠시 후 재연결 (자연스러운 전환을 위해 딜레이)
        setTimeout(() => {
            setCurrentPersona(personaId);
            // 상태 업데이트가 반영된 후 재연결을 위해 다시 toggleCall 호출보다는 직접 start 호출 권장
            // 하지만 여기서는 state update cycle을 고려해 useEffect 트리거를 유도하거나
            // 단순하게 상태만 바꾸고 사용자가 다시 누르게 할 수도 있음.
            // * UX 제안: 가면을 바꾸면 통화가 끊기고, 사용자가 다시 빛을 터치해 깨우는 것이 더 '의식' 같음.
        }, 500);
    } else {
        setCurrentPersona(personaId);
    }
    
  }, [callStatus]);

  // 텍스트 메시지 전송 (Whisper)
  const sendTextMessage = useCallback((text: string) => {
      if (vapiRef.current && callStatus === 'active') {
          vapiRef.current.send({ type: 'add-message', message: { role: 'user', content: text } });
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
      setCurrentPersona, // 직접 설정 필요 시
      currentPersona,
      changePersona,     // 의식용 함수
  };
}