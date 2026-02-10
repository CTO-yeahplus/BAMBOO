'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeId } from '../../types';
import { useRipple } from '../../hooks/useRipple'; // 👈 Hook import

export const ForestBackground = ({ themeId, themeConfig, children }: { themeId: ThemeId, themeConfig: any, children: React.ReactNode }) => {
    
    // 1. 물결 훅 사용 (배경 자체적으로 관리)
    const { ripples, addRipple } = useRipple();

    // 테마 설정 (기존 로직 유지 + 안전 장치)
    const activeGradient = themeConfig?.bgGradient || `radial-gradient(circle at center, ${themeConfig?.primaryColor || '#059669'} 0%, #000000 70%)`;

    return (
        <div 
            className="relative w-full h-full overflow-hidden bg-black touch-none"
            // 2. 터치/클릭 시 물결 추가 (PointerEvent는 마우스/터치 모두 대응)
            onPointerDown={addRipple}
        >
            {/* 배경 그라데이션 */}
            <div 
                className="absolute inset-0 opacity-40 transition-all duration-1000 ease-in-out"
                style={{ background: activeGradient }} 
            />

            {/* 노이즈 텍스처 */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* 중앙의 숨 쉬는 빛 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] rounded-full bg-white/10 blur-[100px] animate-pulse" />
            </div>

            {/* 3. 🌊 물결(Ripple) 렌더링 레이어 */}
            {/* z-index를 0으로 두어 UI(children)보다는 뒤에, 배경보다는 앞에 표시합니다. */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }} // 1.5초 동안 부드럽게 퍼짐
                            className="absolute border border-white/20 rounded-full bg-white/5 backdrop-blur-[1px]"
                            style={{
                                left: ripple.x,
                                top: ripple.y,
                                width: 100,
                                height: 100,
                                x: "-50%", // 정확한 터치 지점이 중심이 되도록 보정
                                y: "-50%"
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
            
            {/* 콘텐츠 영역 (z-10으로 물결 위에 표시됨) */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {/* 자식 요소들의 클릭은 허용하되, 레이아웃 자체는 터치를 방해하지 않음 */}
                <div className="pointer-events-auto w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};