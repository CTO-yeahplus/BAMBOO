'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

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

    if (!isVisible) return null;

    return (
        <button 
            onClick={handleInstall}
            className="fixed top-4 left-4 z-[100] bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all animate-pulse"
        >
            <Download size={14} />
            앱 설치하기
        </button>
    );
};