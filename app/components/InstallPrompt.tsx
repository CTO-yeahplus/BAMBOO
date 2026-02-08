'use client';
import { useEffect, useState } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    // 👇 [변경] 위에서 아래로 내려오는 애니메이션
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    // 👇 [변경] 위치를 상단(top-6)으로 이동
                    className="fixed top-6 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none"
                >
                    <div className="pointer-events-auto bg-[#0f1014]/90 backdrop-blur-xl border border-white/10 rounded-full py-3 px-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex items-center gap-4 max-w-sm w-full relative overflow-hidden group">
                        
                        {/* Decorative Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Icon */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 flex-1">
                            <h3 className="text-white font-serif text-xs font-bold tracking-wide">Install Soul Forest</h3>
                            <p className="text-[9px] text-white/50 mt-0.5">
                                Keep the forest close.
                            </p>
                        </div>

                        {/* Install Button (Compact) */}
                        <button 
                            onClick={handleInstall}
                            className="relative z-10 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-lg flex items-center gap-1.5 shrink-0"
                        >
                            <Download size={10} />
                            Get App
                        </button>

                        {/* Close Button */}
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="relative z-10 text-white/20 hover:text-white transition-colors ml-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};