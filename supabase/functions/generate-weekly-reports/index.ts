// supabase/functions/generate-weekly-reports/index.ts
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3'
import { supabase } from './utils/supabase'; // 경로 확인 필요

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})
const openai = new OpenAIApi(configuration)

Deno.serve(async (req) => {
  // 1. 전체 유저 조회 (배치 처리 권장, 여기선 단순화)
  const { data: users, error } = await supabase.from('profiles').select('id');
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  const results = [];

  for (const user of users) {
    // 2. 지난 주 기억 조회
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: memories } = await supabase
      .from('memories')
      .select('summary, emotion, created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString());

    if (!memories || memories.length < 3) continue; // 데이터 부족 시 스킵

    // 3. GPT 분석
    const context = memories.map(m => `[${m.emotion}] ${m.summary}`).join('\n');
    const prompt = `
        사용자의 지난 주 기억들이다:
        ${context}
        
        이 내용을 바탕으로 '주간 마음 리포트'를 작성하라.
        말투: 신비롭고 다정한 숲의 정령. 반말.
        내용: 감정의 흐름을 분석하고, 위로와 칭찬을 건넬 것. 300자 이내.
    `;

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
        });
        const reportContent = completion.data.choices[0].message?.content;

        // 4. DB 저장
        const weekId = `${new Date().getFullYear()}-W${getWeekNumber(new Date())}`;
        await supabase.from('soul_letters').insert({
            user_id: user.id,
            month: weekId, // 주간 리포트 ID로 사용
            content: reportContent,
            is_read: false
        });

        // 5. 푸시 알림 발송 (FCM)
        // (여기에 FCM HTTP v1 API 호출 로직 추가 필요)
        
        results.push({ userId: user.id, status: 'success' });

    } catch (e) {
        console.error(`Failed for user ${user.id}:`, e);
    }
  }

  return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } })
})

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}