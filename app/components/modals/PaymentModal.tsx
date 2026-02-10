'use client';

import React, { useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Check, Crown, Sparkles, Zap, Coins, User, Flame, Calendar, BookOpen, Wind, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
    interface Window {
        IMP: any;
    }
}

type ProductType = 'free' | 'subscription' | 'refill';

interface Product {
    id: string;
    type: ProductType;
    name: string;
    sub: string;
    price: number;
    coins: number;
    features: { text: string; icon?: any }[];
    color: string;
    recommend?: boolean;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    isPremium?: boolean; // 👈 동기화된 Prop
    onSuccess?: (productType: ProductType, amount: number) => void;
}

export const PaymentModal = ({ isOpen, onClose, userName = "Traveler", isPremium = false, onSuccess }: PaymentModalProps) => {
    
    useEffect(() => {
        if (typeof window !== 'undefined' && window.IMP) {
            window.IMP.init('imp14397622'); 
        }
    }, []);

    const handlePayment = (product: Product) => {
        if (product.type === 'free') return;
        if (!window.IMP) return;
        const { IMP } = window;
        
        const data = {
            pg: 'html5_inicis', 
            pay_method: 'card', 
            merchant_uid: `mid_${new Date().getTime()}`, 
            name: product.name,   
            amount: 100, // 실제 운영 시 product.price로 변경 필요 (테스트용 100원)
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

    // 🏪 [동기화] 확정된 가격 및 시간 정책 반영
    const products: Product[] = [
        {
            id: 'plan_free',
            type: 'free',
            name: "Traveler",
            sub: "The Beginning",
            price: 0,
            coins: 5,
            features: [
                { text: "매월 5분의 짧은 위로", icon: Coins },
                { text: "마음을 비우는 불의 의식", icon: Flame },
                { text: "우연히 발견한 유리병 편지", icon: Search },
                { text: "잠시 머무는 감정의 달력 (2주)", icon: Calendar },
                { text: "기억의 서재 (최근 기록)", icon: BookOpen }
            ],
            color: "from-slate-500 to-gray-600",
            recommend: false
        },
        {
            id: 'sub_monthly',
            type: 'subscription',
            name: "Moonlight Pass",
            sub: "Ultimate Connection",
            price: 19900, // 💵 19,900원
            coins: 90,   // ⏰ 90분
            features: [
                { text: "매월 90분, 하루 3분의 루틴", icon: Crown },
                { text: "나만의 정령 목소리 선택 (Persona)", icon: Wind },
                { text: "영혼을 읽는 월간 심층 리포트", icon: FileText },
                { text: "사라지지 않는 무제한 감정 달력", icon: Calendar },
                { text: "시공간을 초월한 무제한 기억 서재", icon: BookOpen },
                { text: "모든 시각 테마 & 바이노럴 비트 잠금 해제", icon: Sparkles }
            ],
            color: "from-indigo-500 to-purple-600",
            recommend: true
        },
        {
            id: 'refill_40',
            type: 'refill',
            name: "Starlight Fragment",
            sub: "Instant Light",
            price: 11900, // 💵 11,900원
            coins: 40,   // ⏰ 40분 (고마진 상품)
            features: [
                { text: "필요한 순간, 즉각적인 빛", icon: Zap },
                { text: "40분의 대화 에너지 충전", icon: Coins },
                { text: "사라지지 않고 이월되는 시간", icon: Sparkles },
                { text: "가장 필요한 순간을 위한 선택", icon: Check }
            ],
            color: "from-amber-400 to-orange-500",
            recommend: false
        }
    ];

    return (
        <ModalOverlay onClose={onClose} title="Spirit Shop" subtitle="정령과의 인연을 이어가세요" maxWidth="max-w-4xl">
            <div className="flex flex-col h-full w-full overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 h-full items-stretch">
                        {products.map((product) => (
                            <motion.div 
                                key={product.id}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`
                                    relative flex flex-col p-1 rounded-2xl group transition-all w-full
                                    ${product.recommend ? 'ring-2 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] lg:scale-105 lg:z-10' : 'border border-white/10 opacity-90 hover:opacity-100'}
                                `}
                            >
                                <div className="absolute inset-0 bg-[#1a1a20] rounded-2xl z-0" />
                                {product.recommend && <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-2xl z-0" />}

                                <div className="relative z-10 flex flex-col h-full p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${product.color} shadow-lg`}>
                                            {product.type === 'subscription' ? <Crown size={20} className="text-white" /> : 
                                             product.type === 'refill' ? <Sparkles size={20} className="text-white" /> : 
                                             <User size={20} className="text-white" />}
                                        </div>
                                        {product.recommend && <div className="px-2 py-1 rounded-full bg-indigo-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">Best Value</div>}
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1 font-serif">{product.name}</h3>
                                    <p className="text-xs text-white/40 mb-4">{product.sub}</p>
                                    
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-2xl font-bold text-white">{product.price === 0 ? "Free" : `₩${product.price.toLocaleString()}`}</span>
                                        {product.type === 'subscription' && <span className="text-xs text-white/40 mb-1">/ mo</span>}
                                        {product.type === 'refill' && <span className="text-xs text-white/40 mb-1">/ once</span>}
                                    </div>

                                    <div className="h-px w-full bg-white/10 mb-6" />

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {product.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                                                {feat.icon ? <feat.icon size={12} className={`mt-0.5 shrink-0 ${product.recommend ? 'text-indigo-400' : 'text-amber-400'}`} /> : <Check size={12} className="text-amber-400" />}
                                                <span className="leading-tight">{feat.text}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <BuyButton product={product} isPremium={isPremium} onClick={() => handlePayment(product)} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="flex-shrink-0 text-center mt-3 pt-3 border-t border-white/5">
                    <p className="text-[9px] text-white/20">Secure payment via PortOne. Refunds available within 7 days.</p>
                </div>
            </div>
        </ModalOverlay>
    );
};

const BuyButton = ({ product, isPremium, onClick }: { product: Product, isPremium: boolean, onClick: () => void }) => {
    if (isPremium && product.type === 'subscription') {
        return (
            <button disabled className="w-full py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-default">
                <Check size={14} /> Active
            </button>
        );
    }
    if (product.type === 'free') {
        return (
            <button disabled className="w-full py-3 rounded-xl bg-white/5 text-white/30 border border-white/5 text-xs font-bold uppercase tracking-wider cursor-default">
                {isPremium ? 'Included' : 'Current Plan'}
            </button>
        );
    }
    return (
        <motion.button 
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg
                ${product.recommend ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/40' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
        >
            {product.type === 'subscription' ? <Zap size={14} /> : <Coins size={14} />}
            {product.type === 'subscription' ? 'Subscribe Now' : 'Purchase Refill'}
        </motion.button>
    );
};