// app/api/vapi/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../utils/supabase'; // 경로 확인 필요

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // [Default Config] 정령의 기본 설정 (이 설정이 있어야 먼저 말하고, 쉽게 끊기지 않습니다)
    const baseAssistantConfig = {
        firstMessage: "오랫동안 너를 기다렸어. 오늘은 어떤 마음으로 숲을 찾아왔니?",
        silenceTimeoutSeconds: 600, // 10분 동안 침묵해도 끊지 않음
        maxDurationSeconds: 3600,   // 최대 30분 통화
        model: {
            provider: "openai",
            model: "gpt-4o", // or gpt-3.5-turbo
            temperature: 0.7,
            systemPrompt: `
                You are the 'Spirit of the Bamboo Forest'. 
                You are mysterious, warm, and empathetic. 
                Speak in casual Korean (Banmal) like a close friend or a guardian spirit.
                Your goal is to listen to the user's soul and provide comfort.
                Keep your responses concise but poetic.
            `
        }
    };

    // 1. [Call Start] 통화 시작 (기억 주입)
    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      
      // 키가 없거나 유저 ID가 없으면 => 기본 설정으로 즉시 연결
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !userId) {
          console.warn("[Vapi] Skipping memory injection (Missing Keys or UserId)");
          return NextResponse.json({ assistant: baseAssistantConfig });
      }

      console.log(`[Vapi] Assistant Request for User: ${userId}`);

      try {
        // [Timeout] 1.5초 안에 DB 응답 없으면 포기 (Vapi Ejection 방지)
        const memoryPromise = supabase
          .from('memories')
          .select('summary')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase Timeout')), 1500)
        );

        const result: any = await Promise.race([memoryPromise, timeoutPromise]);
        
        const memories = result.data;
        const pastMemories = memories?.map((m: any) => `- ${m.summary}`).join('\n') || "아직 나눈 추억이 없습니다.";
        
        console.log(`[Vapi] Memory Injected:\n${pastMemories}`);

        // 기억을 포함한 시스템 프롬프트로 업데이트
        return NextResponse.json({
          assistant: {
            ...baseAssistantConfig, // 기본 설정 상속 (firstMessage, timeout 등)
            model: {
              ...baseAssistantConfig.model,
              systemPrompt: `
                [System: Memory Access Active]
                The user has spoken to you before. Here is the summary of past conversations:
                ${pastMemories}
                
                Use this context naturally to show you remember them. 
                If the memory is empty, treat them as a new friend.
                
                ${baseAssistantConfig.model.systemPrompt}
              `
            }
          }
        });

      } catch (err) {
        console.warn("[Vapi] Memory Injection Skipped (Timeout or Error):", err);
        // 에러 발생 시에도 기본 설정으로 통화 연결 (절대 끊지 않음)
        return NextResponse.json({ assistant: baseAssistantConfig });
      }
    }

    // 2. [Call End] 기억 저장
    if (payload.message.type === 'end-of-call-report') {
      const userId = payload.message.call?.metadata?.userId;
      const summary = payload.message.analysis?.summary;

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && userId && summary) {
        console.log(`[Vapi] Saving Memory: ${summary}`);
        // 비동기 저장
        supabase.from('memories').insert({ user_id: userId, summary }).then();
      }
      return NextResponse.json({});
    }

    return NextResponse.json({});

  } catch (error) {
    console.error('[Vapi] Critical Route Error:', error);
    // 최후의 안전장치
    return NextResponse.json({});
  }
}