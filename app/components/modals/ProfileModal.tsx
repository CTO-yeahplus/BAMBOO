'use client';
import React from 'react';
import { ModalOverlay } from './ModalOverlay';
import { LogOut, User, Sparkles, Crown, BookOpen, Star, Leaf, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isPremium: boolean;
    signOut: () => void;
    getUserInitial: () => string;
}

export const ProfileModal = ({ isOpen, onClose, user, isPremium, signOut, getUserInitial }: ProfileModalProps) => {
    if (!isOpen || !user) return null;

    // 예시 통계 데이터 (실제 데이터와 연결 필요)
    const stats = {
        memories: 24,
        days: 12,
        level: 3
    };

    // 애니메이션 변수
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        // Title & Subtitle: 감성적인 언어로 변경
        <ModalOverlay onClose={onClose} title="Soul Mirror" subtitle="Reflecting your inner journey">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-6 flex flex-col items-center"
            >
                
                {/* 🔮 1. 아바타: 숨쉬는 빛의 구체 */}
                <motion.div variants={itemVariants} className="relative mb-6 group">
                    <div className={`absolute inset-0 rounded-full blur-[30px] animate-pulse-slow ${isPremium ? 'bg-yellow-500/40' : 'bg-blue-500/30'}`} />
                    <div className={`relative w-28 h-28 rounded-full flex items-center justify-center text-4xl font-serif font-bold text-white shadow-2xl ring-2 ring-offset-4 ring-offset-[#151518] transition-all duration-500 ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-600 ring-yellow-500/50 group-hover:ring-yellow-400' : 'bg-gradient-to-br from-blue-400 to-indigo-600 ring-blue-500/50 group-hover:ring-blue-400'}`}>
                        {getUserInitial()}
                        {isPremium && (
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg"
                            >
                                <Crown size={16} fill="currentColor" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* 사용자 이름 & 등급 */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h3 className="text-white text-xl font-medium tracking-wide">
                        {user.email?.split('@')[0] || 'Wanderer'}
                    </h3>
                    <p className={`text-sm mt-1 font-light tracking-widest uppercase flex items-center justify-center gap-2 ${isPremium ? 'text-yellow-300' : 'text-white/50'}`}>
                        {isPremium ? <><Sparkles size={12} className="animate-pulse" /> Awakened Soul</> : 'Seeking Soul'}
                    </p>
                </motion.div>

                {/* 📜 2. 통계: 고대 룬 문자 컨셉의 카드 */}
                <motion.div variants={itemVariants} className="w-full grid grid-cols-3 gap-3 mb-8">
                    {[
                        { icon: BookOpen, label: 'Memories', value: stats.memories, color: 'text-blue-400' },
                        { icon: Leaf, label: 'Days', value: stats.days, color: 'text-green-400' },
                        { icon: Star, label: 'Level', value: stats.level, color: 'text-purple-400' },
                    ].map((stat, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <div className={`absolute inset-0 bg-${stat.color.split('-')[1]}-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <stat.icon size={20} className={`${stat.color} mb-2 opacity-80`} />
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* 하단 액션 버튼들 */}
                <motion.div variants={itemVariants} className="w-full space-y-3">
                    {/* 🌟 3. 프리미엄: 황금빛 차원문 */}
                    {!isPremium && (
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600/80 to-orange-600/80 text-white font-bold tracking-wider uppercase relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,200,0,0.3)] transition-shadow">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="flex items-center justify-center gap-2 relative z-10">
                                <Crown size={16} /> Awaken Your Soul
                            </span>
                        </button>
                    )}
                    
                    {/* 로그아웃: 은은한 경계선 버튼 */}
                    <button 
                        onClick={signOut}
                        className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm tracking-widest uppercase group"
                    >
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        Leave Forest
                    </button>
                </motion.div>

            </motion.div>
        </ModalOverlay>
    );
};