import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType, SOUL_MASKS, PersonaType, UserTier } from '../../types';
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

// 🛠️ [Fix] 기본 음성 매핑 (Azure -> Deepgram 변경)
// Azure 연결 오류 해결을 위해 안정적인 Deepgram으로 변경
const BASIC_VOICE_CONFIG: Record<string, { provider: string, voiceId: string }> = {
    'basic_male_01': { provider: 'deepgram', voiceId: 'orion' },
    'basic_female_01': { provider: 'deepgram', voiceId: 'asteria' },
};

export function useSpiritVapi(
    userId: string | null, 
    userTier: UserTier, 
    onCallEnd: (history: {role: string, content: string}[]) => void,
    onEmotionDetected?: (weather: WeatherType) => void 
) {
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('spirit');
  const [preferredVoiceId, setPreferredVoiceId] = useState<string | null>(null);
  
  const vapiRef = useRef<any>(vapi);
  const transcriptHistoryRef = useRef<{role: string, content: string}[]>([]);
  const isConnectingRef = useRef(false);
  const [weather, setWeather] = useState<WeatherType>('clear');
  
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // 🔇 [New] 콘솔 노이즈 필터링 (setSinkId 에러 무시)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
        // SDK 내부의 setSinkId 오류는 기능상 문제없으므로 로그에서 숨김
        if (typeof args[0] === 'string' && args[0].includes('setSinkId failed')) return;
        if (args[0] && args[0].message && args[0].message.includes('setSinkId failed')) return;
        // 2) [NEW] 추가 필터: Chrome 동기 XHR 경고 무시
        // Daily.js 내부에서 발생하는 deprecation 경고를 숨깁니다.
        if (typeof args[0] === 'string' && args[0].includes('XMLHttpRequestSynchronousInNonWorkerOutsideBeforeUnload')) return;
        if (args[0]?.message?.includes('XMLHttpRequestSynchronousInNonWorkerOutsideBeforeUnload')) return;
        
        originalError.apply(console, args);
    };
    return () => {
        console.error = originalError;
    };
  }, []);

  const analyzeEmotion = useCallback((text: string) => {
    let detectedWeather: WeatherType = 'clear';
    for (const [keyword, w] of Object.entries(EMOTION_MAP)) {
        if (text.includes(keyword)) {
            detectedWeather = w;
            break; 
        }
    }
    setWeather(detectedWeather);
  }, []);

  useEffect(() => {
    const onCallStart = () => {
        console.log("📞 Call Started");
        setCallStatus('active');
        isConnectingRef.current = false; 
        requestWakeLock();
        transcriptHistoryRef.current = []; 
    };

    const onCallEndHandler = () => { 
        console.log("📞 Call Ended");
        setCallStatus('idle'); 
        setSpiritMessage("");
        isConnectingRef.current = false; 
        releaseWakeLock();
        if (onCallEnd) onCallEnd(transcriptHistoryRef.current);        
    };

    const onSpeechStart = () => setCallStatus('listening');
    const onSpeechEnd = () => setCallStatus('processing');
    
    const onMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
          const entry = { role: message.role, content: message.transcript };
          transcriptHistoryRef.current.push(entry);
          if (message.role === 'user') analyzeEmotion(message.transcript);
      }
      if (message.type === 'speech-update' && message.role === 'assistant' && message.status === 'started') {
          setCallStatus('speaking');
      }
      if (message.type === 'transcript' && message.role === 'assistant' && message.transcriptType === 'partial') {
          setSpiritMessage(message.transcript);
      }
    };

    const onError = (e: any) => {
        const errMsg = e?.message || JSON.stringify(e);
        if (errMsg.includes('setSinkId')) return;

        console.error("Vapi Error:", e);
        setCallStatus('idle');
        isConnectingRef.current = false;
        releaseWakeLock();
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEndHandler);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    
    vapi.on('error', onError);

    return () => { 
        vapi.off('call-start', onCallStart);
        vapi.off('call-end', onCallEndHandler);
        vapi.off('speech-start', onSpeechStart);
        vapi.off('speech-end', onSpeechEnd);
        vapi.off('message', onMessage);
        vapi.off('error', () => {});
        releaseWakeLock();
    };
  }, [onCallEnd, analyzeEmotion, requestWakeLock]);

  const stopVapi = useCallback(() => {
    console.log("🛑 Force Stopping Vapi...");
    setCallStatus('idle');
    isConnectingRef.current = false;
    try { vapi.stop(); } catch (e) {}
    releaseWakeLock();
  }, [releaseWakeLock]);

  const toggleCall = useCallback(async () => {
    if (isConnectingRef.current) return;

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

    isConnectingRef.current = true;
    setCallStatus('connecting');
    transcriptHistoryRef.current = []; 

    const isPremium = userTier === 'premium';
    
    const modelConfig = {
        provider: 'openai',
        model: isPremium ? 'gpt-4o' : 'gpt-4o-mini',
        temperature: isPremium ? 0.7 : 0.5, 
    };

    let voiceConfig = {};
    if (preferredVoiceId) {
        if (BASIC_VOICE_CONFIG[preferredVoiceId]) {
             const config = BASIC_VOICE_CONFIG[preferredVoiceId];
             voiceConfig = { provider: config.provider, voiceId: config.voiceId };
             console.log("☁️ Basic Voice Selected:", config.voiceId);
        } else if (isPremium) {
            voiceConfig = { provider: '11labs', voiceId: preferredVoiceId };
            console.log("💎 Premium Voice Selected:", preferredVoiceId);
        } else {
             // Fallback (Deepgram Orion)
             voiceConfig = { provider: 'deepgram', voiceId: 'orion' };
        }
    }

    const vapiOptions = {
        name: `Soul Forest Call (${userTier})`,
        metadata: { userId: userId || 'guest', tier: userTier },
        model: modelConfig,
        voice: Object.keys(voiceConfig).length > 0 ? voiceConfig : undefined
    };

    try {
        try { vapi.stop(); } catch (e) {}
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기

        console.log("🚀 Starting Vapi...");
        await vapi.start(assistantId, vapiOptions);

    } catch (e: any) {
        console.warn("⚠️ 연결 실패 (1차):", e);
        try {
            console.log("🔄 재시도 중...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            await vapi.start(assistantId, vapiOptions);
        } catch (retryError) {
            console.error("❌ 연결 최종 실패:", retryError);
            setCallStatus('idle');
            isConnectingRef.current = false;
            alert("연결에 실패했습니다.");
        }
    }
  }, [callStatus, currentPersona, userId, stopVapi, preferredVoiceId, userTier]);

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