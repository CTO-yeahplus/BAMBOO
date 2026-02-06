// app/types.ts

export type WeatherType = 'clear' | 'rain' | 'snow' | 'ember';
export type CallStatus = 'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type ThemeId = 'bamboo' | 'aurora' | 'sakura' | 'cyberpunk';
export type ArtifactType = 'aura' | 'head';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  bgGradient: string; // 이미지 없을 때 사용할 CSS 배경
  particleType: 'firefly' | 'snow' | 'petal' | 'digital_rain';
  soundPreset: 'focus' | 'sleep' | 'morning'; // 기존 소닉 아키텍처 프리셋과 연동
}

export const THEMES: ThemeConfig[] = [
  { 
      id: 'bamboo', 
      name: 'Bamboo Origin', 
      description: '마음의 고향, 평온한 대나무 숲', 
      bgGradient: 'linear-gradient(to bottom, #1a2e1a, #0d1a0d)', 
      particleType: 'firefly',
      soundPreset: 'focus'
  },
  { 
      id: 'aurora', 
      name: 'Aurora Night', 
      description: '별이 쏟아지는 극지의 밤', 
      bgGradient: 'linear-gradient(to bottom, #0f172a, #312e81, #4c1d95)', 
      particleType: 'snow',
      soundPreset: 'sleep'
  },
  { 
      id: 'sakura', 
      name: 'Spring Blossom', 
      description: '따스한 바람과 흩날리는 벚꽃', 
      bgGradient: 'linear-gradient(to bottom, #fff1f2, #fbcfe8, #f472b6)', 
      particleType: 'petal',
      soundPreset: 'morning'
  },
  { 
      id: 'cyberpunk', 
      name: 'Rainy Cyber', 
      description: '네온 사인이 비치는 비 오는 거리', 
      bgGradient: 'linear-gradient(to bottom, #020617, #1e1b4b, #be185d)', 
      particleType: 'digital_rain',
      soundPreset: 'sleep'
  }
];

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export interface Memory {
  id: number;
  summary: string;
  created_at: string;
  emotion?: 'sadness' | 'anger' | 'loneliness' | 'happy' | 'neutral';
  x?: number;
  y?: number;
  unlock_date?: string; 
  audio_url?: string;
  is_capsule?: boolean;
}

// 👇 [New] OracleCard 인터페이스 추가
export interface OracleCard {
  name: string;
  image_url: string;
  keywords: string;
  interpretation: string;
  lucky_advice: string;
}

// [New] Whisper Bottle Definition
export interface WhisperBottle {
  id: number;
  content: string;
  likes: number;
  created_at: string;
  // user_id는 프론트엔드에서 굳이 노출할 필요 없음 (익명성)
  // [New] Guardian Features
  is_distress?: boolean;        // 구조 신호 여부 (깊은 고민)
  reply_audio_url?: string;     // 수호자의 음성 답장 URL
  reply_author_id?: string;     // 답장한 수호자의 ID (공명도 보상용)
}

export const ORACLE_DECK: OracleCard[] = [
  { 
      name: '쉼 (Rest)', 
      image_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop', // 고요한 숲/자연
      keywords: '휴식, 재충전, 내면의 평화',
      interpretation: "지금은 잠시 멈추어 숨을 고를 때입니다. 쉼은 시간 낭비가 아니라, 더 멀리 나아가기 위한 도약의 준비입니다. 소란스러운 세상의 소리를 끄고, 당신 내면의 고요한 목소리에 귀를 기울이세요.",
      lucky_advice: "따뜻한 차 한 잔을 마시며 5분간 멍하니 창밖을 바라보세요."
  },
  { 
      name: '용기 (Courage)', 
      image_url: 'https://images.unsplash.com/photo-1528164344705-4754268798dd?q=80&w=1000&auto=format&fit=crop', // 여명/일출
      keywords: '도전, 자신감, 첫걸음',
      interpretation: "두려움은 당신이 성장하고 있다는 증거입니다. 거창한 계획보다 중요한 것은 지금 당장의 작은 실천입니다. 당신이 내딛는 그 작은 한 걸음이 곧 길이 될 것입니다. 스스로를 믿고 나아가세요.",
      lucky_advice: "오늘 망설였던 일 중 가장 작은 것 하나를 지금 바로 저질러보세요."
  },
  { 
      name: '위로 (Comfort)', 
      image_url: 'https://images.unsplash.com/photo-1504194569480-165eb3d1dc3f?q=80&w=1000&auto=format&fit=crop', // 따뜻한 햇살
      keywords: '치유, 희망, 따스함',
      interpretation: "괜찮습니다. 그림자가 있다는 건 근처에 빛이 있다는 증거니까요. 당신의 슬픔은 곧 아물 것이며, 그 상처 자리에는 더 단단하고 아름다운 새살이 돋아날 것입니다. 오늘은 당신 자신에게 조금 더 관대해지세요.",
      lucky_advice: "좋아하는 음악을 들으며 스스로를 꼭 안아주세요."
  },
  { 
      name: '기억 (Memory)', 
      image_url: 'https://images.unsplash.com/photo-1501619583091-c27c699042b0?q=80&w=1000&auto=format&fit=crop', // 반짝이는 빛/추억
      keywords: '회상, 소중함, 그리움',
      interpretation: "과거의 행복했던 기억은 당신을 지키는 든든한 방패입니다. 힘들고 지칠 때 꺼내 볼 수 있는 보석 같은 순간들을 소중히 간직하세요. 그 기억들이 오늘의 당신을 지탱하는 힘이 되어줄 것입니다.",
      lucky_advice: "사진첩을 열어 가장 행복하게 웃고 있는 당신의 사진을 찾아보세요."
  },
  { 
      name: '놓아줌 (Release)', 
      image_url: '/images/oracle/card-rest.png',
      keywords: '해방, 비움, 자유',
      interpretation: "꽉 쥔 손을 펴야 새로운 것을 잡을 수 있습니다. 집착하고 있는 고민이나 관계가 있다면 바람에 실어 보내세요. 빈 손이 되어야 비로소 더 값지고 새로운 기회가 찾아옵니다. 흐르는 물처럼 유연해지세요.",
      lucky_advice: "책상 위나 가방 속의 불필요한 물건을 하나 정리하여 버리세요."
  },
  { 
      name: '시작 (Beginnings)', 
      image_url: 'https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?q=80&w=1000&auto=format&fit=crop', // 새싹/초록
      keywords: '기회, 가능성, 새출발',
      interpretation: "늦지 않았습니다. 당신의 이야기는 매일 아침 새롭게 쓰입니다. 과거에 얽매이지 마세요. 바로 지금 이 순간이 당신의 남은 인생에서 가장 젊고, 가능성으로 가득 찬 때입니다.",
      lucky_advice: "평소와 다른 길로 산책하거나, 새로운 메뉴를 주문해보세요."
  },
  { 
      name: '자존감 (Self-Love)', 
      image_url: 'https://images.unsplash.com/photo-1516575150278-77136aed6920?q=80&w=1000&auto=format&fit=crop', // 하트/거울/자신
      keywords: '사랑, 가치, 존중',
      interpretation: "타인의 시선으로 당신을 정의하지 마세요. 당신은 우주에서 유일무이한 존재입니다. 당신은 어떤 성과를 내서가 아니라, 존재하는 그 자체만으로도 충분히 사랑받고 존중받을 가치가 있습니다.",
      lucky_advice: "거울을 보고 눈을 맞추며 '나는 꽤 괜찮은 사람이야'라고 말해주세요."
  },
  {
      name: '직관 (Intuition)',
      image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop', // 밤하늘/달/신비
      keywords: '지혜, 통찰, 내면의 눈',
      interpretation: "논리적인 생각보다 당신의 직감을 믿으세요. 마음속 깊은 곳에서 울리는 작은 목소리가 정답을 알고 있습니다. 안개가 걷히고 곧 명확한 길이 보일 것입니다.",
      lucky_advice: "오늘 하루는 고민하지 말고, 처음에 든 생각대로 행동해보세요."
  }
];

export const TIME_THEMES = {
  dawn: ['from-slate-900', 'via-purple-900', 'to-black'],
  day: ['from-sky-900', 'via-emerald-900', 'to-black'],
  sunset: ['from-orange-950', 'via-red-950', 'to-black'],
  night: ['from-gray-900', 'via-[#051a05]', 'to-black'],
};

export const EMOTION_COLORS = {
  loneliness: ['from-blue-950', 'via-indigo-950', 'to-black'],
  anger: ['from-red-950', 'via-orange-950', 'to-black'],
  sadness: ['from-gray-900', 'via-blue-950', 'to-black'],
  selfEsteem: ['from-green-900', 'via-teal-950', 'to-black'],
  family: ['from-brown-950', 'via-gray-950', 'to-black'],
  work: ['from-zinc-950', 'via-slate-950', 'to-black'],
};

export interface Artifact {
    id: string;
    type: ArtifactType;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

export interface DailyMood {
  date: string;       // "2023-10-27" 형태
  dominantEmotion: 'sadness' | 'anger' | 'loneliness' | 'happy' | 'neutral';
  intensity: number;  // 1~3 (색상의 진하기)
  summary: string;    // 그날의 핵심 요약
  count: number;      // 대화 횟수
}

// [New] Firefly User Type (Realtime Presence)
export interface FireflyUser {
  id: string; // Session ID or User ID
  x: number;  // 0~100%
  y: number;  // 0~100%
  color: string; // Hex color
  last_active: number; // Timestamp
}

export const ARTIFACTS: Artifact[] = [
    { id: 'aura_firefly', type: 'aura', name: "Forest Whispers", description: "작은 숲의 정령들이 주위를 맴돕니다.", cost: 0, icon: "✨" }, 
    { id: 'aura_moonlight', type: 'aura', name: "Lunar Veil", description: "달빛의 가호가 깃듭니다.", cost: 150, icon: "🌙" },
    { id: 'aura_ember', type: 'aura', name: "Warmth of Hearth", description: "따뜻한 온기가 감돕니다.", cost: 300, icon: "🔥" },
    { id: 'head_flower', type: 'head', name: "Bloom Crown", description: "봄에 핀 첫 꽃으로 만든 화관.", cost: 100, icon: "🌸" },
    { id: 'head_fox', type: 'head', name: "Mystic Mask", description: "오래된 여우 가면.", cost: 500, icon: "🦊" },
];

// [New] Spirit Form Type
export type SpiritFormType = 'wisp' | 'fox' | 'guardian';

export const SPIRIT_FORMS: { id: SpiritFormType, name: string, minResonance: number, desc: string }[] = [
    { id: 'wisp', name: 'Lumina Wisp', minResonance: 0, desc: '순수한 영혼의 불꽃' },
    { id: 'fox', name: 'Mystic Fox', minResonance: 100, desc: '지혜로운 숲의 인도자' },
    { id: 'guardian', name: 'Forest Guardian', minResonance: 300, desc: '숲을 지키는 수호자' },
];

// [New] Memory Illustration Type
export interface MemoryIllustration {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // 고화질 이미지 경로
  thumbnailUrl: string; // (선택) 저화질 썸네일 경로, 없으면 imageUrl을 블러 처리
  unlockResonance: number; // 해금에 필요한 최소 공명도
}

export const MEMORY_GALLERY: MemoryIllustration[] = [
  { id: 'mem_1', title: '첫 번째 만남', description: '안개 낀 숲에서 처음 마주친 순간.', imageUrl: '/images/memories/meet.png', thumbnailUrl: '/images/memories/meet_thumb.png', unlockResonance: 50 },
  { id: 'mem_2', title: '비 개인 오후', description: '나뭇잎 사이로 햇살이 비추던 날.', imageUrl: '/images/memories/rain.png', thumbnailUrl: '/images/memories/rain_thumb.png', unlockResonance: 150 },
  { id: 'mem_3', title: '함께 본 별', description: '밤하늘을 수놓은 별들을 바라보며.', imageUrl: '/images/memories/stars.png', thumbnailUrl: '/images/memories/stars_thumb.png', unlockResonance: 300 },
];