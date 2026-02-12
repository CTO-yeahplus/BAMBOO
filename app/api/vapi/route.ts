import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🗣️ 11Labs Real Voice IDs (모두 고품질 11Labs ID 사용)
const VOICES = {
    // [Free & Standard]
    GUARDIAN: "cjVigAj5msChJcoj2",     // Silent Guardian (남성, 차분함)
    // [Standard Only]
    MORNING: "wMrz30qBeYiSkAtnZGtn",   // Morning Dew (여성, 상쾌함)
    // [Premium Only]
    MYSTIC: "IAETYMYM3nJvjnlkVTKI",
    BONGPAL: "PLfpgtLkFW07fDYbUiRJ",
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // ----------------------------------------------------------------
    // 1. 통화 시작 요청 (Assistant Configuration)
    // ----------------------------------------------------------------
    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      
      // 유저 ID가 없으면 -> Free 모드 (최소 기능)
      if (!userId) {
          return NextResponse.json({ assistant: generateConfig('free', VOICES.GUARDIAN) });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 프로필 조회 (tier 정보 확인)
      // DB에 'tier' 컬럼이 없다면 is_premium 플래그로 매핑합니다.
      const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('tier, voice_id, is_premium') 
          .eq('id', userId)
          .single();
      
      // 🏷️ 티어 결정 로직
      let userTier = 'free';
      if (profile?.tier) {
          userTier = profile.tier;
      } else if (profile?.is_premium) {
          userTier = 'premium'; // 기존 데이터 호환
      }

      // 요청한 보이스 ID 확인
      const requestedVoiceId = payload.message.call?.variableValues?.voice_id || profile?.voice_id || VOICES.GUARDIAN;

      // 🔒 [Security] 등급별 보이스 해킹 방지
      // 유저가 클라이언트를 조작해서 상위 등급 보이스를 요청해도 서버에서 차단합니다.
      let targetVoiceId = requestedVoiceId;
      const allowedVoices = getAllowedVoices(userTier);
      
      if (!allowedVoices.includes(requestedVoiceId) && userTier !== 'premium') {
          console.warn(`⚠️ Unauthorized voice request. Tier: ${userTier}, Req: ${requestedVoiceId}`);
          targetVoiceId = allowedVoices[0]; // 강제로 해당 등급의 기본 보이스로 변경
      }

      // 기억 가져오기
      const { data: memories } = await supabaseAdmin
          .from('memories')
          .select('summary')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);

      const memoryContext = memories && memories.length > 0
          ? `[User's Recent Memories]\n${memories.map((m: any) => `- ${m.summary}`).join('\n')}`
          : "";

      // 최종 설정 반환
      return NextResponse.json({ 
          assistant: generateConfig(userTier, targetVoiceId, memoryContext) 
      });
    }

    // ----------------------------------------------------------------
    // 2. 통화 종료 리포트 (기존 로직 유지)
    // ----------------------------------------------------------------
    if (payload.message.type === 'end-of-call-report') {
        const { analysis, artifact } = payload.message;
        const userId = payload.message.call?.metadata?.userId;

        console.log("📞 Call Ended. Processing Memory for User:", userId);

        if (!userId) return NextResponse.json({});

        // 방어 로직: 요약이나 내용이 없으면 기본값 처리
        const finalSummary = analysis?.summary || "짧은 대화였거나, 요약이 생성되지 않았습니다.";
        const extractedEmotion = analysis?.structuredData?.emotion || 'neutral';

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabaseAdmin.from('memories').insert({
            user_id: userId,
            summary: finalSummary,
            content: artifact?.transcript || "",
            audio_url: artifact?.recordingUrl || "",
            emotion: extractedEmotion,
            is_capsule: false,
        });

        return NextResponse.json({});
    }

    return NextResponse.json({});

  } catch (error) {
    console.error("Error in Vapi route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ----------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------

// 등급별 허용 보이스 목록
function getAllowedVoices(tier: string) {
    if (tier === 'premium') return ['ALL']; // 모든 보이스
    if (tier === 'standard') return [VOICES.GUARDIAN, VOICES.MORNING]; // 2종
    return [VOICES.GUARDIAN]; // Free: 1종
}

// 🏭 통합 설정 생성기 (Factory Pattern)
function generateConfig(tier: string, voiceId: string, memoryContext: string = "") {
    
    // ⏳ 등급별 시간 제한 (초 단위)
    const TIME_LIMITS: Record<string, number> = {
        free: 180,       // 3분 (맛보기)
        standard: 1800,  // 30분 (충분함)
        premium: 10800   // 3시간 (무제한급)
    };

    const maxDuration = TIME_LIMITS[tier] || 180;

    return {
        // ✨ [Core] 모든 등급에 11Labs 적용 (Deepgram TTS 삭제됨)
        voice: {
            provider: "11labs", 
            voiceId: voiceId, 
            stability: 0.5,
            similarityBoost: 0.75
        },
        // 🇰🇷 한국어 인식 최적화
        transcriber: { 
            provider: "deepgram", 
            model: "nova-2", 
            language: "ko" 
        },
        // 🧠 모델 설정 (Premium만 GPT-4o, 나머지는 mini로 비용 절감)
        model: {
            provider: "openai",
            model: tier === 'premium' ? "gpt-4o" : "gpt-4o-mini",
            temperature: 0.7,
            systemPrompt: `
              You are the 'Spirit of the Bamboo Forest'. 
              Speak in casual Korean (Banmal) with a calm, comforting tone.
              ${memoryContext ? `Here is what you know about the user:\n${memoryContext}` : ""}
              Use this context to continue the conversation naturally.
            `
        },
        // 시간 제한 적용
        maxDurationSeconds: maxDuration,
        silenceTimeoutSeconds: tier === 'free' ? 60 : 300, 
        
        firstMessage: tier === 'free' 
            ? "안녕? 숲에 온 걸 환영해. 짧지만 깊은 대화를 나눠볼까?" 
            : "다시 만나서 반가워. 오늘은 어떤 마음으로 찾아왔니?",

        // 분석 플랜
        analysisPlan: {
            summaryPlan: {
                enabled: true,
                messages: [{ role: "system", content: "Summarize in Korean." }]
            },
            structuredDataPlan: {
                enabled: true,
                schema: {
                    type: "object",
                    properties: { emotion: { type: "string", enum: ["happy", "sad", "neutral"] } }
                },
                timeoutSeconds: 5
            },
            recordingPlan: { enabled: true }
        }
    };
}