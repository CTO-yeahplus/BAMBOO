// app/api/vapi/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // 1. [기억 주입] 통화 시작 전, 과거 기억을 꺼내와 정령에게 속삭임
    if (payload.message.type === 'assistant-request') {
      const userId = payload.message.call?.metadata?.userId;
      if (!userId) return NextResponse.json({ assistant: {} });

      // 최근 기억 3개 조회
      const { data: memories } = await supabase
        .from('memories')
        .select('summary')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      const pastMemories = memories?.map(m => `- ${m.summary}`).join('\n') || "아직 기억이 없습니다.";
      console.log(`🧠 Memory Injected for ${userId}:\n${pastMemories}`);

      // 시스템 프롬프트 앞에 '기억'을 추가하여 리턴
      return NextResponse.json({
        assistant: {
          model: {
            systemPrompt: `
              [System: Memory Access Active]
              Here is the summary of past conversations with this user:
              ${pastMemories}
              
              Use this context to show you remember them. If the memory is empty, treat them as a new friend.
              ---------------------------------------------------
              [Original Persona Starts Below]
              (기존 페르소나가 뒤에 이어집니다...)
            `
          }
        }
      });
    }

    // 2. [기억 저장] 통화 종료 후, 요약본을 DB에 기록
    if (payload.message.type === 'end-of-call-report') {
      const userId = payload.message.call?.metadata?.userId;
      const summary = payload.message.analysis?.summary;

      if (userId && summary) {
        console.log(`💾 Saving Memory: ${summary}`);
        await supabase.from('memories').insert({ user_id: userId, summary });
      }
      return NextResponse.json({});
    }

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}