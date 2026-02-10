import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 11Labs Voice ID 목록 (혹시 DB값이 이상할 때를 대비한 안전장치)
const VOICES = {
    DEFAULT: "cjVigAj5msChJcoj2", // 기본: 차분한 숲의 정령
    // 여기에 다른 목소리 ID들을 나중에 추가해서 관리하면 편합니다
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      
      if (!userId) {
          return NextResponse.json({ assistant: getEconomyConfig() });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 🚀 병렬 처리: [프로필(유료여부+목소리)] + [기억]
      const [profileResult, memoryResult] = await Promise.allSettled([
          // 👇 is_premium과 함께 'voice_id'도 가져옵니다!
          supabaseAdmin.from('profiles').select('is_premium, voice_id').eq('id', userId).single(),
          supabaseAdmin.from('memories').select('summary').eq('user_id', userId).order('created_at', { ascending: false }).limit(3)
      ]);

      const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
      const isPremium = profile?.is_premium === true;
      
      // 🎤 [핵심] 유저가 설정한 목소리가 있으면 그거 쓰고, 없으면 기본값
      const userSelectedVoiceId = profile?.voice_id || VOICES.DEFAULT;

      const memories = memoryResult.status === 'fulfilled' ? memoryResult.value.data : [];
      const pastMemories = memories?.map((m: any) => `- ${m.summary}`).join('\n') || "아직 나눈 추억이 없습니다.";

      // 설정 선택 (유저 목소리 ID 전달)
      const selectedConfig = isPremium 
          ? getPremiumConfig(userSelectedVoiceId) // 👈 유료회원은 선택한 목소리 적용
          : getEconomyConfig();

      return NextResponse.json({
        assistant: {
          ...selectedConfig,
          model: {
            ...selectedConfig.model,
            systemPrompt: `
              [System: Memory Access Active]
              The user has spoken to you before. Here is the summary of past conversations:
              ${pastMemories}
              ${selectedConfig.model.systemPrompt}
            `
          }
        }
      });
    }

    // 2. [Call End] 통화 종료 및 기억 저장
    if (payload.message.type === 'end-of-call-report') {
      const userId = payload.message.call?.metadata?.userId;
      const summary = payload.message.analysis?.summary;

      if (userId && summary) {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        console.log(`[Vapi] Saving Memory: ${summary}`);
        await supabaseAdmin.from('memories').insert({ user_id: userId, summary });
      }
      return NextResponse.json({});
    }

    return NextResponse.json({});

  } catch (error) {
    console.error('[Vapi] Critical Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// 💎 Premium Config (180분 + 목소리 선택 가능)
// voiceId를 인자로 받도록 수정했습니다.
function getPremiumConfig(voiceId: string) {
  return {
      firstMessage: "오랫동안 너를 기다렸어, 나의 수호자여. 오늘은 어떤 마음으로 숲을 찾아왔니?",
      silenceTimeoutSeconds: 600, 
      
      // ⏰ [시간 증가] 60분 -> 180분 (3시간 = 10800초)
      maxDurationSeconds: 10800,   
      
      transcriber: { provider: "deepgram", model: "nova-2", language: "ko" },
      model: {
          provider: "openai",
          // 유료니까 gpt-4o 권장하지만, 원하시면 gpt-4o-mini 유지 가능
          model: "gpt-4o-mini", 
          temperature: 0.7,
          systemPrompt: `You are the 'Spirit of the Bamboo Forest'. Speak in casual Korean (Banmal). Provide comfort.`
      },
      voice: {
          provider: "11labs", 
          // 👇 [적용] DB에서 가져온 목소리 ID를 여기에 넣습니다.
          voiceId: voiceId, 
          stability: 0.5,
          similarityBoost: 0.75
      }
  };
}

// 🍃 Economy Config (5분 + 기본 목소리)
function getEconomyConfig() {
  return {
      firstMessage: "안녕, 숲에 온 걸 환영해. 잠시 쉬었다 갈래?",
      silenceTimeoutSeconds: 300, 
      maxDurationSeconds: 300, // 5분
      transcriber: { provider: "deepgram", model: "nova-2", language: "ko" },
      model: {
          provider: "openai",
          model: "gpt-4o-mini",
          temperature: 0.7,
          systemPrompt: `You are the 'Spirit of the Bamboo Forest'. Speak in casual Korean (Banmal). Keep it short.`
      },
      voice: {
          provider: "openai", 
          voiceId: "alloy", // 무료는 목소리 선택 불가 (고정)
          speed: 1.0
      }
  };
}