// app/hooks/engine/useSpiritVapi.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType, SOUL_MASKS, PersonaType } from '../../types';
import { useWakeLock } from '../useWakeLock';

// Vapi 인스턴스 (싱글톤)
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
    onCallEnd: (history: {role: string, content: string}[]) => void, // 👈 [수정] 대화 기록을 받도록 타입 변경
    onEmotionDetected?: (weather: WeatherType) => void 
) {
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const vapiRef = useRef<any>(vapi);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('spirit');
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  
  const [preferredVoiceId, setPreferredVoiceId] = useState<string | null>(null);

  // 📝 [New] 대화 기록 저장소 (Ref로 관리하여 리렌더링 방지)
  const transcriptHistoryRef = useRef<{role: string, content: string}[]>([]);

  const analyzeEmotion = useCallback((text: string) => {
      if (!onEmotionDetected) return;
      for (const [keyword, weather] of Object.entries(EMOTION_MAP)) {
          if (text.includes(keyword)) {
              onEmotionDetected(weather);
              break; 
          }
      }
  }, [onEmotionDetected]);

  useEffect(() => {
    const onCallStart = () => {
        setCallStatus('active');
        requestWakeLock();
        transcriptHistoryRef.current = []; // 📝 통화 시작 시 기록 초기화
    };

    const onCallEndHandler = () => { 
        setCallStatus('idle'); 
        releaseWakeLock();
        // 📝 [핵심] 통화 종료 시, 모아둔 대화 기록을 상위로 전달
        onCallEnd(transcriptHistoryRef.current); 
    };

    const onSpeechStart = () => setCallStatus('listening');
    const onSpeechEnd = () => setCallStatus('processing');
    
    const onMessage = (message: any) => {
      // 📝 [핵심] Transcript(자막)가 오면 기록에 추가
      if (message.type === 'transcript' && message.transcriptType === 'final') {
          const entry = { role: message.role, content: message.transcript };
          transcriptHistoryRef.current.push(entry);

          // 유저 메시지인 경우 감정 분석
          if (message.role === 'user') {
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

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEndHandler);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);

    return () => { 
        vapi.off('call-start', onCallStart);
        vapi.off('call-end', onCallEndHandler);
        vapi.off('speech-start', onSpeechStart);
        vapi.off('speech-end', onSpeechEnd);
        vapi.off('message', onMessage);
        releaseWakeLock();
    };
  }, [onCallEnd, analyzeEmotion, requestWakeLock, releaseWakeLock]);

  const stopVapi = useCallback(() => {
    console.log("🛑 Force Stopping Vapi...");
    setCallStatus('idle');
    try { vapi.stop(); } catch (e) {}
    releaseWakeLock();
  }, [releaseWakeLock]);

  const toggleCall = useCallback(async () => {
    if (callStatus !== 'idle') {
        stopVapi();
        return;
    }

    const selectedMask = SOUL_MASKS.find(m => m.id === currentPersona);
    const assistantId = selectedMask?.assistantId;

    if (!assistantId) {
        alert(`Assistant ID not found for ${currentPersona}`);
        return;
    }

    setCallStatus('connecting');
    transcriptHistoryRef.current = []; // 시작 전 초기화

    // Vapi 기본 옵션
    const baseOptions = {
        metadata: { userId: userId || 'guest' }
    };

    try {
        try { vapi.stop(); } catch (e) {}
        await new Promise(resolve => setTimeout(resolve, 200));

        // 1차 시도: Voice Override
        if (preferredVoiceId) {
            console.log(`🎤 Try 1: Starting with Voice Override (${preferredVoiceId})...`);
            await vapi.start(assistantId, {
                ...baseOptions, // metadata 포함
                voice: {
                    provider: '11labs',
                    voiceId: preferredVoiceId,
                }
            });
        } else {
            console.log("🎤 Starting with Default Voice...");
            await vapi.start(assistantId, baseOptions);
        }

    } catch (e: any) {
        console.warn("⚠️ 1차 연결 실패, 기본값으로 재시도:", e);
        if (preferredVoiceId) {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await vapi.start(assistantId, baseOptions);
            } catch (retryError) {
                setCallStatus('idle');
                alert("통화 연결에 실패했습니다.");
            }
        } else {
            setCallStatus('idle');
        }
    }

  }, [callStatus, currentPersona, userId, stopVapi, preferredVoiceId]);

  const changePersona = useCallback(async (personaId: PersonaType) => {
    const selectedMask = SOUL_MASKS.find(m => m.id === personaId);
    if (!selectedMask) return;
    if (callStatus !== 'idle') {
        stopVapi();
        setTimeout(() => setCurrentPersona(personaId), 500);
    } else {
        setCurrentPersona(personaId);
    }
  }, [callStatus, stopVapi]);

  const sendTextMessage = useCallback((text: string) => {
      if (callStatus === 'active') {
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
      setVoiceId: setPreferredVoiceId 
  };
}