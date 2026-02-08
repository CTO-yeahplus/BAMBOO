// app/components/modals/ProfileModal.tsx

'use client';
import React from 'react';
import { ModalOverlay } from './ModalOverlay';
import { User, Sparkles, History, LogOut, Crown } from 'lucide-react';
import { OracleCard } from '../../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    
    // 👇 [Fix] page.tsx에서 보내주는 값들을 받을 수 있게 추가합니다.
    isPremium?: boolean;            // 프리미엄 여부 (없을 수도 있으니 ?)
    signOut: () => void;            // 로그아웃 함수 이름 통일 (onLogout -> signOut)
    getUserInitial?: (name: string) => string; // 이니셜 함수
    
    oracleHistory?: { date: string; cardId: string }[]; 
    memories?: any[]; 
    cards?: OracleCard[]; 
}

export const ProfileModal = ({ 
    isOpen, 
    onClose, 
    user, 
    isPremium = false, // 기본값 false
    signOut, 
    oracleHistory = [],
    memories = [],
    cards = []
}: ProfileModalProps) => {
    if (!isOpen) return null;

    // 최근 오라클 카드 찾기
    const lastOracle = oracleHistory && oracleHistory.length > 0 && cards.length > 0
        ? cards.find(c => c.id === oracleHistory[0].cardId) 
        : null;

    // 유저 이름 추출
    const userName = user?.email?.split('@')[0] || 'Traveler';

    return (
        <ModalOverlay onClose={onClose} title="Traveler's Profile">
            <div className="p-6 space-y-6">
                
                {/* 1. 유저 정보 */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 relative overflow-hidden">
                    {/* 프리미엄 유저일 경우 배경 효과 */}
                    {isPremium && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 pointer-events-none"></div>}

                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${isPremium ? 'border-yellow-400 bg-yellow-400/10' : 'border-indigo-500/30 bg-indigo-500/10'}`}>
                        {isPremium ? <Crown size={28} className="text-yellow-400" /> : <User size={28} className="text-indigo-300" />}
                    </div>
                    
                    <div className="z-10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {userName}
                        </h2>
                        <p className="text-xs text-white/50">{user?.email}</p>
                        
                        {/* 레벨 뱃지 */}
                        <div className="mt-2 flex gap-2">
                             {isPremium ? (
                                 <span className="text-[10px] bg-yellow-400/20 border border-yellow-400/50 px-2 py-1 rounded-full text-yellow-200 flex items-center gap-1">
                                    <Sparkles size={10} /> Premium Soul
                                 </span>
                             ) : (
                                 <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-white/70">
                                    🌱 Lv.1 Seed
                                 </span>
                             )}
                        </div>
                    </div>
                </div>

                {/* 2. 통계 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                        <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Total Memories</div>
                        <div className="text-2xl font-bold text-white">{memories?.length || 0}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                        <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Oracle Readings</div>
                        <div className="text-2xl font-bold text-white">{oracleHistory?.length || 0}</div>
                    </div>
                </div>

                {/* 3. 최근 오라클 기록 */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-3 text-white/70">
                        <History size={16} />
                        <span className="text-sm font-bold">Recent Oracle</span>
                    </div>
                    
                    {lastOracle ? (
                        <div className="flex gap-4 items-center bg-black/20 p-3 rounded-lg">
                            <div className="w-12 h-16 bg-indigo-900/50 rounded border border-white/20 flex items-center justify-center min-w-[3rem]">
                                <Sparkles size={16} className="text-white/50" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm line-clamp-1">{lastOracle.name}</div>
                                <div className="text-white/50 text-xs line-clamp-1">{lastOracle.message}</div>
                                <div className="text-white/30 text-[10px] mt-1">
                                    {oracleHistory[0]?.date}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-white/30 text-xs py-4">
                            아직 숲의 조언을 듣지 못했습니다.
                        </div>
                    )}
                </div>

                {/* 4. 로그아웃 버튼 */}
                <button 
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors mt-4 cursor-pointer"
                >
                    <LogOut size={16} /> Leave the Forest
                </button>
            </div>
        </ModalOverlay>
    );
};