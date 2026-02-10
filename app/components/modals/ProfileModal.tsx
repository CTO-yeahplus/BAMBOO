'use client';

import React, { useEffect, useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { LogOut, Sparkles, Crown, BookOpen, Star, Leaf, Wind, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (컴포넌트 외부에서 생성)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isPremium: boolean; // 👈 [수정] Boolean -> boolean (표준 타입)
    signOut: () => void;
    getUserInitial: () => string;
}

export const ProfileModal = ({ isOpen, onClose, user, isPremium, signOut, getUserInitial }: ProfileModalProps) => {    
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        memories: 0,
        days: 1,
        level: 1
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            // 💡 isPremium은 이미 props로 받았으므로, 여기서는 '통계'와 '가입일' 위주로 가져옵니다.
            
            try {
                // 1. 프로필 정보 (등급 이름 등)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('subscription_tier, created_at')
                    .eq('id', user.id)
                    .single();

                // 2. 활동량 카운트 (DB 부하를 줄이는 count: exact 옵션)
                const { count: memoryCount } = await supabase
                    .from('memories')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // 3. 통계 계산
                const joinDate = new Date(profileData?.created_at || user.created_at || new Date());
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - joinDate.getTime());
                const daysWithUs = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                const currentMemories = memoryCount || 0;
                const calculatedLevel = Math.floor(currentMemories / 5) + 1;

                setProfile(profileData);
                setStats({
                    memories: currentMemories,
                    days: daysWithUs,
                    level: calculatedLevel
                });

            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (isOpen) {
            fetchStats();
        }
    }, [isOpen, user]); // supabase는 외부 변수라 의존성 제거

    if (!isOpen || !user) return null;

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

    // 💎 [동기화 완료] 이제 부모가 준 isPremium을 100% 신뢰합니다.
    const isPremiumUser = isPremium; 
    const tierName = profile?.subscription_tier || (isPremium ? 'Moonlight' : 'Traveler');

    return (
        <ModalOverlay onClose={onClose} title="Soul Mirror" subtitle="Reflecting your inner journey">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 flex flex-col items-center">
                
                {/* 1. 프로필 이미지 & 레벨 */}
                <motion.div variants={itemVariants} className="relative mb-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-serif text-white shadow-2xl border-2 ${isPremiumUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300' : 'bg-white/10 border-white/20'}`}>
                        {getUserInitial()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-[#1a1a20] border border-white/20 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                        <Sparkles size={10} className="text-amber-400" />
                        <span>Lv.{stats.level}</span>
                    </div>
                </motion.div>

                {/* 2. 이름 & 등급 */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-white mb-1">{user.email?.split('@')[0]}</h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest flex items-center justify-center gap-2">
                        {isPremiumUser ? <Crown size={12} className="text-yellow-500" /> : <Leaf size={12} />}
                        {tierName} Class
                    </p>
                </motion.div>

                {/* 3. 통계 그리드 */}
                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 w-full mb-8">
                    <StatBox icon={BookOpen} label="Memories" value={stats.memories} />
                    <StatBox icon={Wind} label="Days with Us" value={stats.days} />
                    <StatBox icon={Star} label="Soul Level" value={stats.level} />
                </motion.div>

                {/* 4. 하단 액션 버튼 */}
                <motion.div variants={itemVariants} className="w-full space-y-3">
                    {/* (A) 무료 회원일 때만 결제 버튼 표시 */}
                    {!isPremiumUser && (
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600/80 to-orange-600/80 text-white font-bold tracking-wider uppercase relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,200,0,0.3)] transition-shadow">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                <Crown size={16} /> Awaken Your Soul
                            </span>
                        </button>
                    )}
                    
                    {/* (B) 유료 회원일 때 활성 상태 표시 */}
                    {isPremiumUser && (
                        <div className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-default">
                            <ShieldCheck size={16} className="text-indigo-400" />
                            <span>Pass Active</span>
                        </div>
                    )}

                    <button onClick={signOut} className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm tracking-widest uppercase group">
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        Leave Forest
                    </button>
                </motion.div>

            </motion.div>
        </ModalOverlay>
    );
};

const StatBox = ({ icon: Icon, label, value }: any) => (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5">
        <Icon size={16} className="text-white/40 mb-2" />
        <span className="text-xl font-bold text-white font-serif">{value}</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wider">{label}</span>
    </div>
);