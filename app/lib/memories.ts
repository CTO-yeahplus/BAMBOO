import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (이미 있는 경우 import 해서 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SaveMemoryParams {
    userId: string;       // 필수 (UUID)
    summary: string;      // 필수 (대화 요약)
    content?: string;     // 선택 (전체 대화 내용)
    emotion?: string;     // 선택 (감정 분석 결과, 기본값 neutral)
    bgMusic?: string;     // 선택 (배경음악)
}

export const saveConversationToMemory = async ({
    userId,
    summary,
    content = 'story',
    emotion = 'neutral',
    bgMusic = 'clear'
}: SaveMemoryParams) => {
    
    console.log("💾 Saving memory for user:", userId);

    const { data, error } = await supabase
        .from('memories')
        .insert([
            {
                user_id: userId,
                summary: summary,  // Schema: NOT NULL
                content: content,
                emotion: emotion,
                bg_music: bgMusic,
                // created_at, is_capsule 등은 default 값이 있으므로 생략 가능
            }
        ])
        .select();

    if (error) {
        console.error("❌ Failed to save memory:", error.message, error.details);
        return null;
    }

    console.log("✅ Memory saved successfully:", data);
    return data;
};