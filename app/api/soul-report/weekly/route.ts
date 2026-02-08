// app/api/soul-report/weekly/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '../../../utils/supabase'; // 경로 확인 필요

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. 지난 7일간의 기억 조회
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: memories } = await supabase
      .from('memories')
      .select('summary, emotion, created_at')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!memories || memories.length < 3) {
        return NextResponse.json({ message: "Not enough data for analysis" });
    }

    // 2. AI 분석 프롬프트 (데이터 기반 칭찬 유도)
    const context = memories.map(m => `[${m.created_at.split('T')[0]}] 감정:${m.emotion} / 내용:${m.summary}`).join('\n');
    
    const prompt = `
      당신은 '숲의 정령'이자 '심리 분석가'입니다. 
      지난 일주일 동안 사용자의 대화 기록을 분석하여 [주간 마음 보고서]를 작성해주세요.
      
      [기록]
      ${context}

      [작성 규칙]
      1. '키워드 분석': 가장 많이 사용된 감정 단어나 주제를 언급하세요. (예: "이번 주는 '불안'이 자주 보였지만...")
      2. '변화 감지': 주 초반과 후반의 정서적 변화를 찾아 칭찬하세요. (예: "끝으로 갈수록 '다짐'하는 모습이 늘어났어.")
      3. '톤앤매너': 신비롭지만, 데이터에 근거하여 구체적이고 논리적인 위로를 건네세요.
      4. 반말(친근한 어조)을 사용하세요.
      5. 길이는 400자 이내.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const reportContent = completion.choices[0].message.content;

    // 3. DB 저장 (기존 soul_letters 테이블 재사용, month 컬럼에 'WEEKLY-YYYY-WW' 형식으로 저장하거나 구분)
    // 여기서는 편의상 '2023-W42' 같은 포맷으로 저장한다고 가정
    const weekNumber = getWeekNumber(new Date());
    const weekId = `${new Date().getFullYear()}-W${weekNumber}`;

    const { data: savedReport, error } = await supabase
      .from('soul_letters')
      .insert({ 
          user_id: userId, 
          month: weekId, // 주간 리포트 ID로 활용
          content: reportContent,
          is_read: false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ report: savedReport });

  } catch (error) {
    console.error('Weekly Report Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 주차 계산 헬퍼
function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}