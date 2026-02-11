'use client';

import React, { useEffect, useState } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { LogOut, Sparkles, Crown, BookOpen, Star, Leaf, Wind, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { UserTier } from '../../types';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    tier?: UserTier; // 👈 [New] 등급 정보 (useAuth에서 전달)
    signOut: () => void;
    getUserInitial: () => string;
    onOpenShop: () => void;
}

export const ProfileModal = ({ isOpen, onClose, user, tier = 'free', signOut, getUserInitial, onOpenShop }: ProfileModalProps) => {    
    const [stats, setStats] = useState({
        memories: 0,
        days: 1,
        level: 1
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            
            try {
                // 1. 가입일 확인 (프로필 or 메타데이터)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // 2. 활동량 카운트
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
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

    // 🏷️ 등급 표시 이름 매핑
    const getTierDisplay = (t: UserTier) => {
        switch(t) {
            case 'premium': return { name: 'Premium Class', icon: Crown, color: 'text-yellow-400' };
            case 'standard': return { name: 'Standard Class', icon: ShieldCheck, color: 'text-emerald-400' };
            default: return { name: 'Traveler Class', icon: Leaf, color: 'text-white/60' };
        }
    };

    const tierInfo = getTierDisplay(tier);
    const TierIcon = tierInfo.icon;

    return (
        <ModalOverlay onClose={onClose} title="Soul Mirror" subtitle="Reflecting your inner journey">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 flex flex-col items-center">
                
                {/* 1. 프로필 이미지 & 레벨 */}
                <motion.div variants={itemVariants} className="relative mb-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-serif text-white shadow-2xl border-2 ${tier === 'premium' ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-300' : tier === 'standard' ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-300' : 'bg-white/10 border-white/20'}`}>
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
                        <TierIcon size={12} className={tierInfo.color} />
                        {tierInfo.name}
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
                    
                    {/* Free 유저: 업그레이드 유도 */}
                    {tier === 'free' && (
                        <button onClick={onOpenShop} className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600/80 to-orange-600/80 text-white font-bold tracking-wider uppercase relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,200,0,0.3)] transition-shadow">
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                <Crown size={16} /> Awaken Your Soul
                            </span>
                        </button>
                    )}

                    {/* Standard 유저: Premium 업그레이드 유도 */}
                    {tier === 'standard' && (
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white font-bold tracking-wider uppercase relative overflow-hidden group hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-shadow">
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                <Sparkles size={16} /> Upgrade to Premium
                            </span>
                        </button>
                    )}
                    
                    {/* Premium 유저: 활성 상태 */}
                    {tier === 'premium' && (
                        <div className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-default">
                            <ShieldCheck size={16} className="text-indigo-400" />
                            <span>Premium Active</span>
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