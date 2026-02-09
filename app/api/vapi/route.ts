import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // 1. [Call Start] 통화 시작 요청
    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      
      // 유저 정보가 없으면 기본값(무료)으로 진행
      if (!userId) {
          console.warn("[Vapi] No UserId found, defaulting to Economy.");
          return NextResponse.json({ assistant: getEconomyConfig() });
      }

      console.log(`[Vapi] Assistant Request for User: ${userId}`);

      try {
        // 🚀 [Parallel Fetch] 유료 여부와 기억을 동시에 가져옵니다 (속도 최적화)
        const [userResult, memoryResult] = await Promise.allSettled([
            // 1. 유료 회원 여부 체크 (users 테이블의 is_premium 컬럼 확인)
            supabase.from('users').select('is_premium').eq('id', userId).single(),
            // 2. 과거 기억 3개 로딩
            supabase.from('memories').select('summary').eq('user_id', userId).order('created_at', { ascending: false }).limit(3)
        ]);

        // 💎 유료 회원 판별
        const isPremium = userResult.status === 'fulfilled' && userResult.value.data?.is_premium === true;
        
        // 🧠 기억 데이터 가공
        const memories = memoryResult.status === 'fulfilled' ? memoryResult.value.data : [];
        const pastMemories = memories?.map((m: any) => `- ${m.summary}`).join('\n') || "아직 나눈 추억이 없습니다.";

        console.log(`[Vapi] User: ${userId} | Tier: ${isPremium ? 'PREMIUM 💎' : 'ECONOMY 🍃'} | Memories Loaded.`);

        // ⚙️ 등급별 설정 가져오기
        const selectedConfig = isPremium ? getPremiumConfig() : getEconomyConfig();

        // 최종 설정 반환
        return NextResponse.json({
          assistant: {
            ...selectedConfig, // 모델/보이스 설정 적용
            model: {
              ...selectedConfig.model,
              // 기억을 주입한 시스템 프롬프트 적용
              systemPrompt: `
                [System: Memory Access Active]
                The user has spoken to you before. Here is the summary of past conversations:
                ${pastMemories}
                
                Use this context naturally to show you remember them. 
                If the memory is empty, treat them as a new friend.
                
                ${selectedConfig.model.systemPrompt}
              `
            }
          }
        });

      } catch (err) {
        console.error("[Vapi] Error during setup:", err);
        // 에러 발생 시 안전하게 가성비 모드로 연결
        return NextResponse.json({ assistant: getEconomyConfig() });
      }
    }

    // 2. [Call End] 통화 종료 및 기억 저장 (기존 유지)
    if (payload.message.type === 'end-of-call-report') {
      const userId = payload.message.call?.metadata?.userId;
      const summary = payload.message.analysis?.summary;

      if (userId && summary) {
        console.log(`[Vapi] Saving Memory: ${summary}`);
        await supabase.from('memories').insert({ user_id: userId, summary });
      }
      return NextResponse.json({});
    }

    return NextResponse.json({});

  } catch (error) {
    console.error('[Vapi] Critical Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ==========================================
// 💎 Premium Config (유료 회원용)
// ==========================================
// 특징: 똑똑한 뇌(GPT-4o) + 감미로운 목소리(11Labs) + 긴 대화 시간
function getPremiumConfig() {
    return {
        firstMessage: "오랫동안 너를 기다렸어, 오늘은 어떤 이야기를 들려줄래?",
        silenceTimeoutSeconds: 60, // 1분 침묵 허용
        maxDurationSeconds: 3600,   // 최대 60분 통화
        backgroundSound: "calm-forest-ambience", // (선택사항) 배경음
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "ko"
        },
        model: {
            provider: "openai",
            model: "gpt-4o-mini", // 🔥 최고 성능 모델
            temperature: 0.7,
            systemPrompt: `
                You are the 'Spirit of the Bamboo Forest'. 
                You are mysterious, warm, and empathetic. 
                Speak in casual Korean (Banmal) like a close friend or a guardian spirit.
                Your goal is to listen to the user's soul and provide comfort.
                Keep your responses concise but poetic.
            `
        },
        voice: {
            provider: "11labs", 
            voiceId: "QPFsEL6IBxlT15xfiD6C", // 11Labs의 고품질 한국어 보이스 ID (예시)
            stability: 0.5,
            similarityBoost: 0.75
        }
    };
}

// ==========================================
// 🍃 Economy Config (무료 회원용)
// ==========================================
// 특징: 가성비 뇌(GPT-4o-mini) + 빠른 목소리(Deepgram/OpenAI) + 짧은 대화 시간
function getEconomyConfig() {
    return {
        firstMessage: "안녕, 숲에 온 걸 환영해. 잠시 쉬었다 갈래?",
        silenceTimeoutSeconds: 30, // 30초 침묵 시 종료
        maxDurationSeconds: 300,    // 최대 5분 통화 (안전장치)
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "ko"
        },
        model: {
            provider: "openai",
            model: "gpt-4o-mini", // 💸 가성비 모델 (가격 1/20)
            temperature: 0.7,
            systemPrompt: `
                You are the 'Spirit of the Bamboo Forest'. 
                You are mysterious, warm, and empathetic. 
                Speak in casual Korean (Banmal).
                Keep your responses short and simple.
            `
        },
        voice: {
            // Deepgram Aura는 한국어 지원이 제한적일 수 있으므로,
            // 가성비가 좋고 한국어가 자연스러운 OpenAI 'alloy'를 추천합니다.
            provider: "openai", 
            voiceId: "alloy", // 💸 저렴하고 빠른 목소리
            speed: 1.0
        }
    };
}