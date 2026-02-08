// app/api/soul-letter/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '../../utils/supabase'; // 경로 확인 필요

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId, month } = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. 해당 유저의 기억 조회
    const { data: memories } = await supabase
      .from('memories')
      .select('summary, emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // 기억이 너무 없으면 생성하지 않음 (또는 기본 메시지)
    if (!memories || memories.length === 0) {
      return NextResponse.json({ message: "Not enough memories" });
    }

    const memoryContext = memories.map(m => 
      `[${new Date(m.created_at).toLocaleDateString()}] 감정:${m.emotion} - ${m.summary}`
    ).join('\n');

    // 2. AI 작문 (페르소나: 숲의 정령)
    const prompt = `
      당신은 '신비로운 숲의 정령'입니다. 사용자가 지난 시간 동안 숲에 남긴 기억들을 바탕으로, 
      다정하고 시적인 위로의 편지를 작성해주세요.
      
      [사용자의 기억들]
      ${memoryContext}

      [가이드라인]
      - 말투: 신비롭고, 따뜻하며, 반말(친근하게)을 사용하세요. ("~했어", "~인 것 같아")
      - 내용: 사용자가 느꼈던 주요 감정의 흐름을 읽어주고, 그들의 성장을 칭찬하거나 위로해주세요.
      - 길이: 300자 내외로 간결하지만 울림 있게.
      - 형식: 시작 인사 없이 바로 본론으로 들어가고, 마지막은 줄바꿈 후 "- 숲에서, 너의 정령이"로 끝맺으세요.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 또는 gpt-3.5-turbo
      messages: [{ role: "system", content: prompt }],
    });

    const letterContent = completion.choices[0].message.content || "편지를 쓰다가 잠이 들었나 봐...";

    // 3. DB 저장
    const { data: savedLetter, error } = await supabase
      .from('soul_letters')
      .insert({ user_id: userId, month, content: letterContent })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ letter: savedLetter });

  } catch (error) {
    console.error('Soul Letter Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}