// app/types.ts

export type WeatherType = 'clear' | 'rain' | 'snow' | 'ember';
export type CallStatus = 'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type ThemeId = 'bamboo' | 'aurora' | 'sakura' | 'cyberpunk';

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

// [New] Oracle Card Definition
export interface OracleCard {
    id: string;
    message: string;
    name: string;
    icon: string; 
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
    { id: '1', name: '쉼', message: "가끔은 멈춰 서야 비로소 보이는 것들이 있어.", icon: "Coffee" },
    { id: '2', name: '용기', message: "네가 내딛는 그 작은 한 걸음이 곧 길이야.", icon: "Footprints" },
    { id: '3', name: '위로', message: "괜찮아, 그림자가 있다는 건 빛이 있다는 증거니까.", icon: "Sun" },
    { id: '4', name: '기억', message: "가장 행복했던 순간을 떠올려볼까?", icon: "Sparkles" },
    { id: '5', name: '놓아줌', message: "꽉 쥔 손을 펴야 새로운 것을 잡을 수 있어.", icon: "Wind" },
    { id: '6', name: '시작', message: "늦지 않았어. 바로 지금이 가장 빠른 때야.", icon: "Sunrise" },
    { id: '7', name: '자존감', message: "너는 존재만으로도 충분히 사랑받을 가치가 있어.", icon: "Heart" },
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

export type ArtifactType = 'aura' | 'head';

export interface Artifact {
    id: string;
    type: ArtifactType;
    name: string;
    description: string;
    cost: number;
    icon: string;
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