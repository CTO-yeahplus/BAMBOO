'use client';

import React, { useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Check, X, Crown, Sparkles, Palette, History, BrainCircuit, Mic, Zap, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
    interface Window {
        IMP: any;
    }
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    isPremium?: boolean;
    onSuccess?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, userName = "Traveler", isPremium = false, onSuccess }: PaymentModalProps) => {
    
    useEffect(() => {
        if (typeof window !== 'undefined' && window.IMP) {
            // ⚠️ [Check] 포트원 관리자 콘솔에서 'imp'로 시작하는 식별코드를 확인하세요.
            // 예: window.IMP.init('imp12345678');
            window.IMP.init('MOI0704643'); 
        }
    }, []);

    const handlePayment = () => {
        if (!window.IMP) return;
        const { IMP } = window;
        
        const data = {
            pg: 'html5_inicis', 
            pay_method: 'card', 
            merchant_uid: `mid_${new Date().getTime()}`, 
            name: 'Moonlight Pass (Monthly)',   
            amount: 100, // 테스트용 100원
            buyer_email: 'test@soulforest.com',
            buyer_name: userName,
            buyer_tel: '010-1234-5678',
            m_redirect_url: window.location.origin, 
        };

        IMP.request_pay(data, (response: any) => {
            const { success, error_msg } = response;
            if (success) {
                alert('Moonlight Pass가 활성화되었습니다! 숲이 당신을 축복합니다.');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert(`결제 실패: ${error_msg}`);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose} title="Choose Your Journey" subtitle="Expand your soul's horizon">
            {/* 👇 [Layout Fix] 전체 높이를 사용하며, 상하단 패딩을 넉넉히 줌 */}
            <div className="flex flex-col h-full w-full overflow-hidden pt-1 pb-1">
                
                {/* 📜 1. Scrollable Content Area (Flex-1로 남은 공간 모두 차지) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1"> 
                    
                    {/* 카드 컨테이너: 모바일에서는 세로, 데스크탑에서는 가로 배치 */}
                    <div className="flex pt-3 flex-col md:flex-row gap-4 pb-4">
                        
                        {/* 🌿 Free Tier: Traveler */}
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col relative group hover:border-white/20 transition-all min-h-[420px]">
                            {/* Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#252525] px-4 py-1 rounded-full border border-white/10 text-[10px] text-white/50 uppercase tracking-widest z-10 shadow-lg">
                                Basic
                            </div>
                            
                            <div className="text-center mb-6 mt-4">
                                <h3 className="text-white font-serif text-xl mb-1">Traveler</h3>
                                <p className="text-white/40 text-xs">For casual wanderers</p>
                                <div className="mt-4 text-2xl font-bold text-white/80">Free</div>
                            </div>

                            <ul className="flex-1 space-y-3.5 mb-6">
                                <FeatureItem icon={Palette} text="Bamboo Forest" sub="기본 대나무 숲 테마" active={true} />
                                <FeatureItem icon={History} text="14-Day History" sub="최근 14일 기록 열람" active={true} />
                                <FeatureItem icon={Sparkles} text="Basic Spirit Form" sub="기본 빛의 정령" active={true} />
                                <FeatureItem icon={Mic} text="Daily 3 Mins Talk" sub="하루 3분 정령 대화" active={true} />
                            </ul>

                            <button 
                                disabled 
                                className="w-full py-3 rounded-xl bg-white/5 text-white/30 text-xs font-bold uppercase tracking-wider cursor-default border border-white/5 mt-auto"
                            >
                                Current Plan
                            </button>
                        </div>


                        {/* 🌕 Paid Tier: Guardian */}
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex-1 bg-gradient-to-b from-[#2a2a35] to-[#1a1a20] border border-indigo-500/30 rounded-2xl p-5 flex flex-col relative overflow-visible shadow-[0_0_40px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20 min-h-[420px]"
                        >
                            {/* Premium Decoration */}
                            <div className="absolute -top-[1px] inset-x-[1px] h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-2xl opacity-50" />
                            
                            {/* Floating Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5 z-20 whitespace-nowrap border border-white/10">
                                <Crown size={11} fill="currentColor" /> Recommended
                            </div>
                            
                            {/* Inner Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[60px] pointer-events-none" />

                            <div className="text-center mb-6 mt-4 relative z-10">
                                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-purple-200 font-serif text-xl mb-1 drop-shadow-sm">Guardian</h3>
                                <p className="text-indigo-200/40 text-xs">Moonlight Pass</p>
                                <div className="mt-4 flex items-end justify-center gap-1">
                                    <span className="text-2xl font-bold text-white">₩5,900</span>
                                    <span className="text-xs text-white/40 mb-1">/ mo</span>
                                </div>
                            </div>

                            <ul className="flex-1 space-y-3.5 mb-6 relative z-10">
                                <FeatureItem icon={Palette} text="All Season Themes" sub="모든 계절/테마 변경" active={true} highlight />
                                <FeatureItem icon={InfinityIcon} text="Unlimited History" sub="모든 과거 기록 열람" active={true} highlight />
                                <FeatureItem icon={BrainCircuit} text="AI Soul Analytics" sub="심층 감정 분석 리포트" active={true} highlight />
                                <FeatureItem icon={Mic} text="Daily 60 Mins Talk" sub="하루 60분 깊은 대화" active={true} highlight />
                                <FeatureItem icon={Sparkles} text="Spirit Customization" sub="정령 커스터마이징" active={true} highlight />
                            </ul>

                            <div className="mt-auto relative z-10">
                                {isPremium ? (
                                    <button 
                                        disabled
                                        className="w-full py-3 rounded-xl bg-green-500/20 text-green-200 border border-green-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default"
                                    >
                                        <Check size={14} /> Active
                                    </button>
                                ) : (
                                    <motion.button 
                                        onClick={handlePayment}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap size={14} className="fill-black" /> Subscribe Now
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
                
                {/* 🛑 2. Fixed Footer Area */}
                <div className="flex-shrink-0 text-center mt-auto pt-3 border-t border-white/5">
                    <p className="text-[9px] text-white/20">
                        Cancel anytime. Secure payment via PortOne.
                    </p>
                </div>

            </div>
        </ModalOverlay>
    );
};

const FeatureItem = ({ icon: Icon, text, sub, active, highlight = false }: any) => (
    <li className={`flex items-start gap-3 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
        <div className={`mt-0.5 p-1 rounded-full ${highlight ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/50'} flex-shrink-0`}>
            {active ? <Check size={10} /> : <X size={10} />}
        </div>
        <div>
            <div className={`text-xs font-bold flex items-center gap-1.5 ${highlight ? 'text-indigo-100' : 'text-white/80'}`}>
                {Icon && <Icon size={12} className={highlight ? 'text-indigo-400' : 'text-white/40'} />}
                {text}
            </div>
            <div className={`text-[10px] ${highlight ? 'text-indigo-200/50' : 'text-white/30'}`}>{sub}</div>
        </div>
    </li>
);