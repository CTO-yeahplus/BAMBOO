// app/utils/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// [Debug] 키가 잘 로드되는지 콘솔에 찍어봅니다. (배포 시엔 지우세요)
if (!supabaseUrl || !supabaseKey) {
    console.error("🚨 Supabase 환경변수가 누락되었습니다! .env.local을 확인하세요.");
} else {
    // console.log("✅ Supabase Key Loaded"); // 확인용 (너무 자주 뜨면 주석 처리)
}

export const supabase = createClient(supabaseUrl, supabaseKey);