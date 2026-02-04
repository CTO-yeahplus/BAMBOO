// app/types.ts

export type WeatherType = 'clear' | 'rain' | 'snow' | 'ember';
export type CallStatus = 'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'processing';

// [Fix] SeasonType 추가
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

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
  unlock_date?: string; // For Time Capsule
}

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

// Artifact Types & Constants
export type ArtifactType = 'aura' | 'head';

export interface Artifact {
    id: string;
    type: ArtifactType;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

export const ARTIFACTS: Artifact[] = [
    { id: 'aura_firefly', type: 'aura', name: "Forest Whispers", description: "작은 숲의 정령들이 주위를 맴돕니다.", cost: 0, icon: "✨" }, 
    { id: 'aura_moonlight', type: 'aura', name: "Lunar Veil", description: "달빛의 가호가 깃듭니다.", cost: 150, icon: "🌙" },
    { id: 'aura_ember', type: 'aura', name: "Warmth of Hearth", description: "따뜻한 온기가 감돕니다.", cost: 300, icon: "🔥" },
    { id: 'head_flower', type: 'head', name: "Bloom Crown", description: "봄에 핀 첫 꽃으로 만든 화관.", cost: 100, icon: "🌸" },
    { id: 'head_fox', type: 'head', name: "Mystic Mask", description: "오래된 여우 가면.", cost: 500, icon: "🦊" },
];