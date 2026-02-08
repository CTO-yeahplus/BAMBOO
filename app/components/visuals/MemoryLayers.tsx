// app/components/visuals/MemoryLayers.tsx
'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Memory } from '../../types';
import { getMoonPhase, getMoonIconPath } from '../../utils/moonPhase';

type VisualMemory = Memory & { x: number; y: number; unlock_date?: string };

export const ConstellationLayer = ({ memories }: { memories: Memory[] }) => {
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [memories]);
  const getEmotionColor = (emotion?: string) => { switch (emotion) { case 'anger': return '#EF4444'; case 'sadness': return '#60A5FA'; case 'loneliness': return '#9CA3AF'; default: return '#FCD34D'; } };
  if (sortedMemories.length < 2) return null;
  return ( <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"> <defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory; const curr = memory as VisualMemory; if (!prev) return null; const id = `grad-${prev.id}-${curr.id}`; return ( <linearGradient key={id} id={id} x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} gradientUnits="userSpaceOnUse"> <stop offset="0%" stopColor={getEmotionColor(prev.emotion)} stopOpacity="0.4" /> <stop offset="100%" stopColor={getEmotionColor(curr.emotion)} stopOpacity="0.4" /> </linearGradient> ); })} </defs> {sortedMemories.map((memory, index) => { if (index === 0) return null; const prev = sortedMemories[index - 1] as VisualMemory; const curr = memory as VisualMemory; if (!prev) return null; const gradId = `grad-${prev.id}-${curr.id}`; return ( <motion.g key={`connection-${curr.id}`}> <motion.line x1={`${prev.x}%`} y1={`${prev.y}%`} x2={`${curr.x}%`} y2={`${curr.y}%`} stroke={`url(#${gradId})`} strokeWidth="1.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: index * 0.3, ease: "easeInOut" }} /> </motion.g> ); })} </svg> );
};

export const OrbitLayer = ({ memories, onSelect }: { memories: Memory[], onSelect: (m: Memory) => void }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const orbitPoints = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1; const angle = 0.5 * i; const radius = 12 + (i * 1.5); const x = 50 + radius * Math.cos(angle); const y = 50 + radius * Math.sin(angle);
      const memory = memories.find(m => { const mDate = new Date(m.created_at); return mDate.getDate() === day && mDate.getMonth() === today.getMonth(); });
      const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
      const moonPhase = getMoonPhase(checkDate); const moonPath = getMoonIconPath(moonPhase);
      return { day, x, y, memory, moonPath };
    });
  }, [memories]);
  const getGlowColor = (emotion?: string) => { switch (emotion) { case 'anger': return 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]'; case 'sadness': return 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]'; case 'loneliness': return 'text-gray-300 drop-shadow-[0_0_15px_rgba(209,213,219,0.8)]'; case 'happy': return 'text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]'; default: return 'text-white/20'; } };
  return ( <div className="absolute inset-0 w-full h-full pointer-events-none"> <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none"> <path d={orbitPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="1,1" /> </svg> {orbitPoints.map((point, index) => ( <motion.div key={point.day} className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto" style={{ left: `${point.x}%`, top: `${point.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.03, type: "spring" }}> <button onClick={() => point.memory && onSelect(point.memory)} disabled={!point.memory} className={`group relative p-2 transition-transform hover:scale-125 ${!point.memory ? 'cursor-default' : 'cursor-pointer'}`}> <svg viewBox="0 0 24 24" className={`w-4 h-4 md:w-6 md:h-6 ${point.memory ? getGlowColor(point.memory.emotion) : 'text-white/5'}`}><path d={point.moonPath} fill="currentColor" /></svg> <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{point.day}</span> {point.memory && (<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[120px] bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none truncate z-50">{point.memory.summary}</div>)} </button> </motion.div> ))} </div> );
};