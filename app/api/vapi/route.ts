// app/api/vapi/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 보안상 Service Role Key를 사용하여 모든 권한을 가진 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // 1. 통화 시작 전: 기억 주입 (Assistant Request)
    if (payload.message.type === 'assistant-request') {
      // 클라이언트에서 보낸 userId 추출
      const userId = payload.message.call?.metadata?.userId;
      
      if (!userId) return NextResponse.json({ assistant: {} }); // ID 없으면 패스

      // DB에서 가장 최근 기억 3개 조회
      const { data: memories } = await supabase
        .from('memories')
        .select('summary')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      const pastMemories = memories?.map(m => m.summary).join('\n') || "없음";

      console.log(`🧠 Injecting memory for ${userId}:`, pastMemories);

      // 시스템 프롬프트에 기억을 주입하여 리턴
      return NextResponse.json({
        assistant: {
          model: {
            // 기존 프롬프트 앞에 '기억' 섹션을 추가
            systemPrompt: `
              [System: Long-term Memory Access]
              The following is a summary of past conversations with this user. 
              Use this context to gently ask about their well-being or follow up on previous topics.
              
              <Past Memories>
              ${pastMemories}
              </Past Memories>
              
              [Original Persona Instructions]
              (여기에 기존 페르소나 내용은 Vapi가 알아서 합칩니다, 혹은 아래에 전체 프롬프트를 다시 써줄 수도 있습니다.)
              너는 깊고 고요한 대나무 숲의 정령이다... (기존 내용 유지)
            `
          }
        }
      });
    }

    // 2. 통화 종료 후: 기억 저장 (End of Call Report)
    if (payload.message.type === 'end-of-call-report') {
      const userId = payload.message.call?.metadata?.userId;
      const summary = payload.message.analysis?.summary; // Vapi가 분석한 요약본

      if (userId && summary) {
        console.log(`💾 Saving memory for ${userId}:`, summary);
        await supabase.from('memories').insert({ user_id: userId, summary });
      }
      return NextResponse.json({});
    }

    return NextResponse.json({});
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}