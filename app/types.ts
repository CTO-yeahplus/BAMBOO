// app/types.ts

export type WeatherType = 'clear' | 'rain' | 'snow' | 'ember';
export type CallStatus = 'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type ThemeId = 'bamboo' | 'aurora' | 'sakura' | 'cyberpunk';
export type PersonaType = 'spirit' | 'shadow' | 'light';
export type ItemType = 'atmosphere' | 'artifact' | 'spirit_form' | 'aura' | 'head';


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
  id: string;
  name: string;
  message: string;
  advice: string;
  theme: string;
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

// 2. [Fix] ORACLE_DECK 데이터에 'id' 값 채워넣기
export const ORACLE_DECK: OracleCard[] = [
  { 
      id: 'card_moon', // 👈 ID 추가
      name: "The Moon (달)", 
      theme: "Reflection", 
      message: "보이지 않는 것을 두려워하지 마세요. 어둠은 휴식을 위한 시간입니다.", 
      advice: "지금은 행동할 때가 아니라, 내면을 들여다볼 때입니다." 
  },
  { 
      id: 'card_sun', 
      name: "The Sun (태양)", 
      theme: "Clarity", 
      message: "구름 뒤에는 항상 빛이 있습니다. 당신의 진심은 결국 빛날 것입니다.", 
      advice: "자신감을 가지고 당신의 온기를 세상에 나누세요." 
  },
  { 
      id: 'card_forest', 
      name: "The Forest (숲)", 
      theme: "Growth", 
      message: "나무는 하루아침에 자라지 않습니다. 당신의 속도는 틀리지 않았습니다.", 
      advice: "조급함을 버리고, 지금 딛고 있는 땅의 단단함을 느끼세요." 
  },
  { 
      id: 'card_river', 
      name: "The River (강)", 
      theme: "Flow", 
      message: "흐르는 물은 바위를 뚫지 않고 돌아갑니다. 유연함이 가장 큰 힘입니다.", 
      advice: "저항하지 말고 상황의 흐름에 몸을 맡겨보세요." 
  },
  { 
      id: 'card_wind', 
      name: "The Wind (바람)", 
      theme: "Change", 
      message: "변화는 예고 없이 찾아오지만, 새로운 씨앗을 데려옵니다.", 
      advice: "떠나보내야 할 것이 있다면 가볍게 놓아주세요." 
  },
  { 
      id: 'card_star', 
      name: "The Star (별)", 
      theme: "Hope", 
      message: "가장 어두운 밤에 별은 가장 밝게 빛납니다. 당신은 길을 잃지 않았습니다.", 
      advice: "멀리 있는 목표보다는, 당장 눈앞의 작은 불빛을 따라가세요." 
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


export const SOUL_MASKS = [
  {
    id: 'spirit',
    name: 'The Spirit (정령)',
    desc: "무판단, 경청, 고요한 위로.\n당신의 이야기를 있는 그대로 비추는 거울입니다.",
    // 👇 환경변수에서 로드 (없으면 빈 문자열이나 에러 방지용 값)
    assistantId: process.env.NEXT_PUBLIC_VAPI_ID_SPIRIT || "", 
    baseColor: "#fbbf24",
    visualStyle: "ethereal",
    icon: "✨"
  },
  {
      id: 'shadow',
      name: 'The Shadow (그림자)',
      desc: "단단한 바위, 묵묵한 수용.\n당신의 분노와 고통을 바위처럼 받아냅니다.",
      // 👇 환경변수에서 로드
      assistantId: process.env.NEXT_PUBLIC_VAPI_ID_SHADOW || "", 
      baseColor: "#ef4444",
      visualStyle: "magma",
      icon: "🌑"
  },
  {
      id: 'light',
      name: 'The Light (빛)',
      desc: "따뜻한 햇살, 무조건적인 애정.\n언제나 당신 편이 되어주는 다정한 존재입니다.",
      // 👇 환경변수에서 로드
      assistantId: process.env.NEXT_PUBLIC_VAPI_ID_LIGHT || "", 
      baseColor: "#f472b6",
      visualStyle: "cloud",
      icon: "💖"
  }
];


// 2. [Fix] Artifact 인터페이스 통합: description으로 통일
export interface Artifact {
    id: string;
    type: ItemType;
    name: string;
    description: string; // desc -> description으로 변경 (기존 코드와 호환)
    cost: number;
    icon: string;
    effect?: string;        // (New) 효과 식별자
    requiredLevel?: number; // (New) 해금 레벨
}

// 3. 기존 ARTIFACTS (그대로 유지)
export const ARTIFACTS: Artifact[] = [
    { id: 'aura_firefly', type: 'aura', name: "Forest Whispers", description: "작은 숲의 정령들이 주위를 맴돕니다.", cost: 0, icon: "✨" }, 
    { id: 'aura_moonlight', type: 'aura', name: "Lunar Veil", description: "달빛의 가호가 깃듭니다.", cost: 150, icon: "🌙" },
    { id: 'aura_ember', type: 'aura', name: "Warmth of Hearth", description: "따뜻한 온기가 감돕니다.", cost: 300, icon: "🔥" },
    { id: 'head_flower', type: 'head', name: "Bloom Crown", description: "봄에 핀 첫 꽃으로 만든 화관.", cost: 100, icon: "🌸" },
    { id: 'head_fox', type: 'head', name: "Mystic Mask", description: "오래된 여우 가면.", cost: 500, icon: "🦊" },
];

// 4. [New] 상점 전용 아이템 (SANCTUARY_ITEMS)
// 기존 ARTIFACTS와 합쳐서 보여줘도 되고, 별도로 관리해도 됩니다.
export const SANCTUARY_ITEMS: Artifact[] = [
    // 1. Atmosphere (환경 변화)
    {
        id: 'theme_dawn',
        type: 'atmosphere',
        name: 'Eternal Dawn',
        description: "숲의 시간을 희망찬 새벽으로 고정합니다.",
        cost: 300,
        icon: "🌅",
        effect: "theme_dawn"
    },
    {
        id: 'theme_purple_rain',
        type: 'atmosphere',
        name: 'Mystic Rain',
        description: "신비로운 치유의 비가 내리는 날씨를 부릅니다.",
        cost: 500,
        icon: "☔",
        effect: "theme_rain_purple"
    },
    
    // 2. Artifacts (오브제)
    {
        id: 'artifact_lantern',
        type: 'artifact',
        name: 'Memory Lantern',
        description: "과거의 소중한 대화를 담아 숲에 띄웁니다.",
        cost: 150,
        icon: "🏮",
        effect: "spawn_lantern"
    },
    
    // 3. Spirit Evolution (정령 진화)
    {
        id: 'form_fox',
        type: 'spirit_form',
        name: 'Spirit Fox',
        description: "정령이 지혜로운 여우의 형상을 취합니다.",
        cost: 0, 
        requiredLevel: 5,
        icon: "🦊",
        effect: "form_fox"
    },
    {
        id: 'form_guardian',
        type: 'spirit_form',
        name: 'The Guardian',
        description: "완전한 공명에 도달한 정령의 진정한 모습입니다.",
        cost: 0,
        requiredLevel: 10,
        icon: "🦌",
        effect: "form_guardian"
    }
];

export interface Soul {
  id: string;
  soulResonance: number;      // 현재 공명도 (재화)
  unlockedItems: string[];    // 해금된 아이템 ID 목록
  level: number;
  exp: number;
  // 필요한 경우 추가 필드
}

// 기존 UserProfile 인터페이스 수정
export type UserTier = 'free' | 'standard' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: UserTier; // 👈 [New] 등급 필드
  credits: number;
  resonance: number;
  created_at: string;
}