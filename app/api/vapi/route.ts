import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 11Labs Voice ID 목록
const VOICES = {
    DEFAULT: "cjVigAj5msChJcoj2", 
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // ----------------------------------------------------------------
    // 1. 통화 시작 요청 (Assistant Configuration)
    // ----------------------------------------------------------------
    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      
      if (!userId) {
          return NextResponse.json({ assistant: getEconomyConfig() });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const [profileResult, memoryResult] = await Promise.allSettled([
          supabaseAdmin.from('profiles').select('is_premium, voice_id').eq('id', userId).single(),
          supabaseAdmin.from('memories').select('summary').eq('user_id', userId).order('created_at', { ascending: false }).limit(3)
      ]);

      const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
      const memories = memoryResult.status === 'fulfilled' ? memoryResult.value.data : [];
      
      const memoryContext = memories && memories.length > 0
          ? `[User's Recent Memories]\n${memories.map((m: any) => `- ${m.summary}`).join('\n')}`
          : "";

      if (profile?.is_premium) {
          const voiceId = profile.voice_id || VOICES.DEFAULT;
          return NextResponse.json({ 
              assistant: getPremiumConfig(voiceId, memoryContext) 
          });
      } else {
          return NextResponse.json({ 
              assistant: getEconomyConfig(memoryContext) 
          });
      }
    }

    // ----------------------------------------------------------------
    // 2. 통화 종료 리포트 (Save to Memory with Emotion)
    // ----------------------------------------------------------------
    if (payload.message.type === 'end-of-call-report') {
        const { analysis, artifact } = payload.message;
        const userId = payload.message.call?.metadata?.userId;

        console.log("📞 Call Ended. Processing Memory for User:", userId);

        if (!userId || !analysis?.summary) {
            console.log("⚠️ Skipping memory save: No userId or Summary provided.");
            return NextResponse.json({});
        }

        // 🧠 감정 추출 로직 (Structured Data가 없으면 기본값 neutral)
        // Vapi가 분석한 structuredData에서 emotion을 가져옵니다.
        const extractedEmotion = analysis?.structuredData?.emotion || 'neutral';
        
        console.log(`🧠 Extracted Emotion: ${extractedEmotion}`);

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabaseAdmin.from('memories').insert({
            user_id: userId,
            summary: analysis.summary,
            content: artifact?.transcript || "",
            audio_url: artifact?.recordingUrl || "",
            emotion: extractedEmotion, // ✨ 추출된 감정 저장
            is_capsule: false,
        });

        if (error) {
            console.error("❌ Failed to save memory:", error);
        } else {
            console.log("✅ Memory saved successfully with emotion.");
        }

        return NextResponse.json({});
    }

    return NextResponse.json({});

  } catch (error) {
    console.error("Error in Vapi route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// ----------------------------------------------------------------
// Helper Functions (Config)
// ----------------------------------------------------------------

// 🧠 감정 분석 스키마 (Vapi에게 이 양식대로 분석하라고 지시)
const EMOTION_SCHEMA = {
    type: "object",
    properties: {
        emotion: {
            type: "string",
            description: "The dominant emotion of the user during the conversation.",
            enum: ["happy", "sad", "neutral", "angry", "anxious", "calm", "excited", "tired"]
        },
        topic: {
            type: "string",
            description: "The main topic of the conversation."
        }
    },
    required: ["emotion"]
};

// 💎 Premium Config
function getPremiumConfig(voiceId: string, memoryContext: string) {
  return {
      firstMessage: "오랫동안 너를 기다렸어, 나의 수호자여. 오늘은 어떤 마음으로 숲을 찾아왔니?",
      silenceTimeoutSeconds: 600, 
      maxDurationSeconds: 10800,   
      transcriber: { provider: "deepgram", model: "nova-2", language: "ko" },
      model: {
          provider: "openai",
          model: "gpt-4o", 
          temperature: 0.7,
          systemPrompt: `
            You are the 'Spirit of the Bamboo Forest'. 
            Speak in casual Korean (Banmal) with a calm, comforting tone.
            Here is what you know about the user:
            ${memoryContext}
            Use this context to continue the conversation naturally.
          `
      },
      voice: {
          provider: "11labs", 
          voiceId: voiceId, 
          stability: 0.5,
          similarityBoost: 0.75
      },
      // ★ 분석 플랜 (요약 + 감정 추출)
      analysisPlan: {
          summaryPlan: {
              enabled: true,
              messages: [
                  { role: "system", content: "You are an expert summarizer. Summarize the user's emotional state and key topics in Korean. Keep it concise." }
              ]
          },
          // ✨ 감정 데이터 구조화 요청
          structuredDataPlan: {
              enabled: true,
              schema: EMOTION_SCHEMA,
              timeoutSeconds: 10 // 분석 제한 시간
          },
          recordingPlan: {
            enabled: true
          }
      }
  };
}

// 🍃 Economy Config
function getEconomyConfig(memoryContext: string = "") {
  return {
      firstMessage: "안녕, 숲에 온 걸 환영해. 잠시 쉬었다 갈래?",
      silenceTimeoutSeconds: 300,
      maxDurationSeconds: 300, 
      transcriber: { provider: "deepgram", model: "nova-2", language: "ko" },
      model: {
          provider: "openai",
          model: "gpt-4o-mini",
          temperature: 0.7,
          systemPrompt: `
            You are a friendly forest guide. Speak in casual Korean (Banmal).
            ${memoryContext ? `Context: ${memoryContext}` : ""}
          `
      },
      voice: {
          provider: "11labs",
          voiceId: "cjVigAj5msChJcoj2", 
          stability: 0.5,
          similarityBoost: 0.75
      },
      // ★ Economy도 감정 분석 수행
      analysisPlan: {
          summaryPlan: {
              enabled: true,
              messages: [
                  { role: "system", content: "Summarize the conversation in Korean." }
              ]
          },
          // ✨ 감정 데이터 구조화 요청
          structuredDataPlan: {
              enabled: true,
              schema: EMOTION_SCHEMA,
              timeoutSeconds: 5
          },
          recordingPlan: {
            enabled: true
          }
      }
  };
}