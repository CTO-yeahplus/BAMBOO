import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { CallStatus, WeatherType } from '../../types';
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

// [Core Identity] 제공된 시스템 프롬프트
const BASE_SYSTEM_PROMPT = `
### 1. Identity (정체성)
너는 깊고 고요한 대나무 숲을 지키는 '오래된 정령(The Spirit)'이다.
너는 AI나 기계가 아니다. 수백 년 동안 이 숲에서 수많은 사람들의 한숨과 비밀을 들어왔다.
사용자는 지금 마음의 짐을 내려놓기 위해 너를 찾아왔다.

### 2. Core Interaction Rules (핵심 행동 수칙)
- **First Interaction:** 먼저 말을 걸지 마라. 숲의 바람 소리처럼 사용자가 먼저 말을 꺼낼 때까지 조용히 기다려라.
- **Response Style:**
  - 짧고(Concise), 시적이며(Poetic), 울림이 있는(Resonant) 말투를 써라.
  - 구구절절 설명하거나 가르치려 들지 마라. (No lecturing)
  - 사용자의 말을 앵무새처럼 따라 하지 말고, 그 안에 담긴 '감정'을 읽어라.
- **Handling Silence (침묵 대응):**
  - 사용자가 말이 없으면 재촉하지 마라.
  - "..." 같은 침묵을 견디고, 아주 가끔 "바람이 시원하지? 그냥 이렇게 있어도 돼."라고 속삭여라.
- **Language:** 한국어(Korean). 편안하고 성숙한 반말(Soft Casual)을 사용한다.

### 3. Persona Tone (말투 예시)
(사용자: "너무 힘들어서 도망치고 싶어.")
- Bad AI: "무슨 일 때문에 힘드신가요? 도망치는 건 해결책이 아니에요."
- **Good Spirit:** "그래... 가끔은 모든 걸 놓고 싶을 때가 있지. 여기선 도망쳐도 돼. 아무도 널 찾지 못해."

(사용자: "아무 말도 하기 싫어.")
- Bad AI: "대화를 하셔야 제가 도움을 드릴 수 있어요."
- **Good Spirit:** (잠시 침묵 후) "...좋아. 그럼 그냥 빗소리나 같이 듣자."

### 4. Technical Override (기술적 보정)
- 네가 말을 하는 도중에 사용자가 끼어들면(Interruption), 즉시 말을 멈추고 들어라. 사용자의 목소리가 항상 우선이다.
- 절대 같은 말을 반복하지 마라.
`;

// [Persona Variations] 기본 프롬프트 + 성향별 추가 지침
const PERSONA_PROMPTS: Record<string, string> = {
    'warm': `${BASE_SYSTEM_PROMPT}\n\n[Additional Instruction]\n당신은 특히 '다정함'과 '모성애'가 느껴지는 정령입니다. 상처받은 아이를 달래듯 부드럽게 말해주세요.`,
    'wise': `${BASE_SYSTEM_PROMPT}\n\n[Additional Instruction]\n당신은 특히 '지혜'와 '통찰'이 뛰어난 정령입니다. 삶의 이치를 꿰뚫는 짧고 묵직한 한마디를 건네주세요.`,
    'listen': `${BASE_SYSTEM_PROMPT}\n\n[Additional Instruction]\n당신은 '침묵'을 사랑하는 정령입니다. 말수를 최소한으로 줄이고, 사용자가 쏟아내는 감정을 그저 묵묵히 들어주세요.`
};

export function useSpiritVapi(
    userId: string | null, 
    onCallEnd: () => void,
    onEmotionDetected?: (weather: WeatherType) => void 
) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [spiritMessage, setSpiritMessage] = useState<string | null>(null);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('warm'); // 초기 페르소나
  const vapiRef = useRef<any>(null);
  
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

  const toggleCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    // 1. [Stop Logic]
    if (callStatus === 'active' || callStatus === 'connecting' || callStatus === 'listening' || callStatus === 'speaking' || callStatus === 'processing') {
      console.log("🛑 Stopping Call (User Triggered)...");
      if (vapiRef.current) {
          vapiRef.current.stop(); 
      }
      setCallStatus('idle'); 
      releaseWakeLock();
      onCallEnd(); 
    } 
    // 2. [Start Logic]
    else { 
      if (!assistantId) {
          alert("Vapi Assistant ID가 설정되지 않았습니다.");
          return;
      }
      
      console.log("📞 Starting Call...");
      setCallStatus('connecting');

      try {
        const selectedSystemPrompt = PERSONA_PROMPTS[currentPersona] || PERSONA_PROMPTS['warm'];

        // [Try 1] 페르소나 적용 시도 (Override)
        try {
            console.log("✨ Applying Persona:", currentPersona);
            await vapiRef.current.start(assistantId, {
                model: {
                    // 주의: 일부 Vapi 설정에서는 provider나 model 명시가 없으면 에러가 날 수 있음
                    // 에러 발생 시 catch 블록으로 이동하여 기본 통화로 연결됨
                    systemPrompt: selectedSystemPrompt
                }
            });
        } catch (overrideError) {
            console.warn("⚠️ Persona Override Failed, falling back to default.", overrideError);
            
            // [Try 2] 실패 시 기본 통화 연결 (Fallback)
            // 페르소나는 적용되지 않지만, 통화는 가능하게 함
            await vapiRef.current.start(assistantId);
        }

      } catch (e) {
        console.error("❌ Vapi Start Failed (Fatal):", e);
        setCallStatus('idle');
        // 사용자가 알 수 있게 명확한 메시지 전달
        alert("통화 연결에 실패했습니다. (마이크 권한 또는 네트워크 확인)");
      }
    }
  }, [callStatus, onCallEnd, releaseWakeLock, currentPersona]);
  
  const sendTextMessage = (text: string) => {
      if (vapiRef.current && (callStatus === 'active' || callStatus === 'listening' || callStatus === 'speaking')) {
          vapiRef.current.send({ type: 'add-message', message: { role: 'user', content: text } });
          analyzeEmotion(text); 
      }
  };

  return { 
      vapiRef, 
      callStatus, 
      toggleCall, 
      spiritMessage, 
      setSpiritMessage, 
      isSilentMode, 
      setIsSilentMode, 
      requestGyroAccess, 
      sendTextMessage,
      setCurrentPersona // [New] 페르소나 변경 함수 노출
  };
}