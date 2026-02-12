'use client';

import React, { useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Check, Crown, Sparkles, Zap, Coins, User, Calendar, BookOpen, Wind, FileText, Star, Mic, HeadsetIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserTier } from '../../types';

declare global {
    interface Window {
        IMP: any;
    }
}

// 🏷️ 상품 타입 정의
type ProductType = 'free' | 'subscription_standard' | 'subscription_premium' | 'refill';

// 👤 유저 등급 정의 (Props로 받을 타입)
//export type UserTier = 'free' | 'standard' | 'premium';

interface Product {
    id: string;
    type: ProductType;
    name: string;
    sub: string;
    price: number;
    coins: number;
    features: { text: string; icon?: any; highlight?: boolean }[];
    color: string;
    textColor: string;
    recommend?: boolean;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userTier?: UserTier; // 👈 [핵심 변경] boolean 대신 등급 문자열 사용 ('free' | 'standard' | 'premium')
    onSuccess?: (productType: ProductType, amount: number) => void;
}

export const PaymentModal = ({ isOpen, onClose, userName = "Traveler", userTier = 'free', onSuccess }: PaymentModalProps) => {
    
    useEffect(() => {
        if (typeof window !== 'undefined' && window.IMP) {
            window.IMP.init('imp14397622'); 
        }
    }, []);

    const handlePayment = (product: Product) => {
        if (product.type === 'free') return;
        
        // 이미 해당 등급(또는 상위 등급)을 구독 중이면 결제 방지 (Refill 제외)
        if (product.type === 'subscription_standard' && (userTier === 'standard' || userTier === 'premium')) return;
        if (product.type === 'subscription_premium' && userTier === 'premium') return;

        if (!window.IMP) return;
        const { IMP } = window;
        
        const data = {
            pg: 'html5_inicis', 
            pay_method: 'card', 
            merchant_uid: `mid_${new Date().getTime()}`, 
            name: product.name,   
            amount: 100, // ⚠️ 실제 운영 시 product.price로 변경
            buyer_email: 'test@soulforest.com',
            buyer_name: userName,
        };

        IMP.request_pay(data, (response: any) => {
            if (response.success) {
                alert(`'${product.name}' 구매가 완료되었습니다!`);
                if (onSuccess) onSuccess(product.type, product.coins);
                onClose();
            } else {
                alert(`결제 실패: ${response.error_msg}`);
            }
        });
    };

    if (!isOpen) return null;

    const products: Product[] = [
        {
            id: 'plan_free',
            type: 'free',
            name: "Traveler",
            sub: "Start. 만남은 그 자체로 설렘입니다.",
            price: 0,
            coins: 5,
            features: [
                { text: "매달, 당신의 안부를 묻는 소중한 5분", icon: User,highlight: true },
                { text: "만남의 시작, 맑고 투명한 정령의 음성", icon: Mic,highlight: true },
                { text: "가장 생생한, 최근 3일간의 기억", icon: BookOpen,highlight: true },
                { text: "지난 2주간의 감정 흐름을 담은 기록", icon: Calendar,highlight: true }
            ],
            color: "from-slate-500 to-gray-600",
            textColor: "text-gray-300",
            recommend: false
        },
        {
            id: 'sub_standard',
            type: 'subscription_standard',
            name: "Standard",
            sub: "Essential. 일상을 위로하기에, 충분합니다.",
            price: 9900,
            coins: 90,
            features: [
                { text: "매일 당신의 하루를 듣기에 충분한 90분", icon: Coins,highlight: true },
                { text: "마음을 편안하게 해주는 맑은 정령의 음성", icon: Mic,highlight: true }, 
                { text: "그날의 감정과 기억이 머무는 서재", icon: Calendar, highlight: true },
                { text: "한 달간의 당신을 깊이 이해하는 인사이트", icon: FileText,highlight: true }
            ],
            color: "from-teal-500 to-emerald-600",
            textColor: "text-emerald-100",
            recommend: false
        },
        {
            id: 'sub_premium',
            type: 'subscription_premium',
            name: "Premium",
            sub: "Emotional. 기술이 아니라, 당신의 위로가 되는 경험",
            price: 29900,
            coins: 90,
            features: [
                { text: "매월 90분, 당신만을 위한 가장 깊은 대화", icon: Coins, highlight: true },
                { text: "모든 페르소나. 상상하던 그 누군가와의 만남", icon: Crown, highlight: true }, 
                { text: "숨소리마저 생생한 초고화질 보이스", icon: Sparkles, highlight: true },
                { text: "완전한 휴식으로 안내하는 뇌파 테라피", icon: HeadsetIcon, highlight: true },
                { text: "기다림 없는 우선 답변, 영원히 간직될 기억", icon: Star, highlight: true  },
                { text: "물론, 스탠다드의 모든 경험을 포함합니다", icon: Check }
            ],
            color: "from-indigo-600 to-purple-700",
            textColor: "text-indigo-100",
            recommend: true // ⭐ Best Value
        },
        {
            id: 'refill_30',
            type: 'refill',
            name: "Refill",
            sub: "Freedom. 당신의 속도에 맞춰 대화하세요",
            price: 9900,
            coins: 30,
            features: [
                { text: "가장 깊은 대화로 이끄는 30분의 에너지", icon: Zap,highlight: true },
                { text: "유효기간 없이, 언제나 당신을 기다리는 시간", icon: Sparkles,highlight: true },
                { text: "새벽이든 한낮이든, 당신이 필요로 하는 그 순간에", icon: Check,highlight: true },
                { text: "구독의 부담 없이, 오직 대화만을 위한 선택", icon: User,highlight: true }
            ],
            color: "from-amber-500 to-orange-600",
            textColor: "text-amber-100",
            recommend: false
        }
    ];

    return (
        <ModalOverlay onClose={onClose} title="Spirit Shop" subtitle="당신의 여정에 맞는 공명을 선택하세요" maxWidth="max-w-7xl">
            <div className="flex flex-col h-full w-full overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 h-full items-stretch content-center">
                        {products.map((product) => (
                            <motion.div 
                                key={product.id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`
                                    relative flex flex-col p-1 rounded-3xl transition-all w-full
                                    ${product.recommend 
                                        ? 'ring-2 ring-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.3)] z-10 lg:-mt-2 lg:mb-4' 
                                        : 'border border-white/10 opacity-90 hover:opacity-100 hover:bg-white/5'}
                                `}
                            >
                                <div className="absolute inset-0 bg-[#15151a] rounded-3xl z-0" />
                                {product.recommend && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-[#15151a] to-transparent rounded-3xl z-0" />
                                )}

                                <div className="relative z-10 flex flex-col h-full p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${product.color} shadow-lg`}>
                                            {product.type === 'subscription_premium' ? <Crown size={20} className="text-white" /> : 
                                             product.type === 'refill' ? <Zap size={20} className="text-white" /> : 
                                             product.type === 'free' ? <User size={20} className="text-white" /> :
                                             <Wind size={20} className="text-white" />}
                                        </div>
                                        {product.recommend && (
                                            <div className="px-2 py-0.5 rounded-full bg-indigo-500/90 text-[9px] font-bold text-white uppercase tracking-widest shadow-lg border border-indigo-400/30">
                                                Best Value
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 font-serif tracking-wide">{product.name}</h3>
                                        <p className={`text-[10px] font-medium ${product.textColor} opacity-80 uppercase tracking-wider mb-3`}>{product.sub}</p>
                                        
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                                {product.price === 0 ? "Free" : `₩ ${product.price.toLocaleString()}`}
                                            </span>
                                            {product.type.includes('subscription') && (
                                                <span className="text-xs text-white/40 font-medium">/mo</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`h-px w-full mb-4 ${product.recommend ? 'bg-indigo-500/30' : 'bg-white/10'}`} />

                                    <ul className="space-y-3 mb-6 flex-1">
                                        {product.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <div className={`mt-0.5 shrink-0 ${feat.highlight ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-white/40'}`}>
                                                    {feat.icon ? <feat.icon size={14} /> : <Check size={14} />}
                                                </div>
                                                <span className={`text-xs leading-tight ${feat.highlight ? 'text-white font-medium' : 'text-white/70'}`}>
                                                    {feat.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        {/* 🔴 [핵심] userTier를 넘겨줌 */}
                                        <BuyButton product={product} userTier={userTier} onClick={() => handlePayment(product)} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                
                <div className="flex-shrink-0 text-center mt-2 pb-2">
                    <p className="text-[10px] text-white/20">
                        Secure payment via PortOne. Subscriptions auto-renew. Cancel anytime.
                    </p>
                </div>
            </div>
        </ModalOverlay>
    );
};

// 🔘 버튼 컴포넌트 (로직 수정됨)
const BuyButton = ({ product, userTier, onClick }: { product: Product, userTier: UserTier, onClick: () => void }) => {
    
    // 1. Refill (항상 구매 가능)
    if (product.type === 'refill') {
        return (
            <motion.button 
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
            >
                <Zap size={14} /> Charge
            </motion.button>
        );
    }

    // 2. Free 플랜 (항상 Disabled)
    if (product.type === 'free') {
        const isCurrent = userTier === 'free';
        return (
            <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 border border-white/5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default">
                {isCurrent ? 'Current Plan' : 'Included'}
            </button>
        );
    }

    // 3. Subscription (Standard)
    if (product.type === 'subscription_standard') {
        if (userTier === 'standard') {
            return <ActiveButton />;
        }
        if (userTier === 'premium') {
            // 프리미엄 유저는 스탠다드 기능이 포함되어 있음 (Included)
            return <IncludedButton />;
        }
        // Free 유저 -> 구매 가능
        return <SubscribeButton product={product} onClick={onClick} />;
    }

    // 4. Subscription (Premium)
    if (product.type === 'subscription_premium') {
        if (userTier === 'premium') {
            return <ActiveButton />;
        }
        // Free나 Standard 유저 -> 업그레이드 가능
        return <SubscribeButton product={product} onClick={onClick} isUpgrade={userTier === 'standard'} />;
    }

    return null;
};

// 👇 버튼 스타일 컴포넌트 분리 (가독성 향상)

const ActiveButton = () => (
    <button disabled className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default">
        <Check size={14} /> Active
    </button>
);

const IncludedButton = () => (
    <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 border border-white/5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default">
        <Check size={14} /> Included
    </button>
);

const SubscribeButton = ({ product, onClick, isUpgrade = false }: { product: Product, onClick: () => void, isUpgrade?: boolean }) => (
    <motion.button 
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg
            ${product.recommend 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/50 border border-indigo-500/50' 
                : 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30'}`}
    >
        {isUpgrade ? (
            <> <Sparkles size={14} /> Upgrade </>
        ) : (
            'Subscribe'
        )}
    </motion.button>
);