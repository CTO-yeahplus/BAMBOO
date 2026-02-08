'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Download, Share2, X, Sparkles, Receipt, Activity, Heart, Zap, Smartphone } from 'lucide-react';
import { toPng } from 'html-to-image';

interface SoulographyModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'calendar' | 'letter';
    data: any; 
    userName: string;
}

type Theme = 'tarot' | 'receipt' | 'modern';

export const SoulographyModal = ({ isOpen, onClose, data, type, userName }: SoulographyModalProps) => {
    const [theme, setTheme] = useState<Theme>('tarot');
    
    // 👇 [수정 1] Ref 하나로 통일 (cardRef 삭제, captureRef만 사용)
    const captureRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 🧹 [청소부] 컴포넌트 마운트/언마운트 시 유령 요소 제거
    useEffect(() => {
        const cleanup = () => {
            document.querySelectorAll('.html-to-image-cloned-node').forEach(el => el.remove());
        };
        cleanup();
        return cleanup;
    }, []);

    if (!isOpen) return null;

    const stats = data?.stats || { happy: 0, sadness: 0, anger: 0, loneliness: 0, total: 0 };
    const dominant = data?.dominant || 'neutral';

    // 📸 저장 로직
    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 전파 즉시 중단

        // 👇 [수정 2] captureRef가 연결되었는지 확인
        if (!captureRef.current || isSaving) return;
        
        setIsSaving(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            // 👇 [수정 3] captureRef 사용 및 옵션 최적화
            const dataUrl = await toPng(captureRef.current, {
                cacheBust: false,   // 👈 유령 창 방지 (True -> False)
                pixelRatio: 2,
                skipAutoScale: true,
                backgroundColor: '#000000', // 투명 배경 방지
                fontEmbedCSS: '',   // 폰트 로딩 멈춤 방지
            });

            if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
                // 모바일: 공유하기 시도
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'soulography.png', { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'My Soulography',
                    text: 'From the Bamboo Forest.',
                });
            } else {
                // PC: 다운로드
                const link = document.createElement('a');
                link.download = `soulography-${theme}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Capture failed:", err);
            alert("이미지 저장 중 문제가 발생했습니다.");
        } finally {
            setIsSaving(false);
            // 🧹 [강제 청소] 작업 후 찌꺼기 제거
            setTimeout(() => {
                document.querySelectorAll('.html-to-image-cloned-node').forEach(el => el.remove());
            }, 500);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Soul Forest',
                    text: `${userName}님의 숲 기록`,
                    url: window.location.href,
                });
            } catch (err) { console.log('Share canceled'); }
        } else {
            // 클립보드 복사
            navigator.clipboard.writeText(window.location.href);
            alert("URL이 복사되었습니다.");
        }
    };

    // --- 🎨 테마별 컴포넌트 ---
    const TarotCard = () => {
        const cardTitles: Record<string, string> = { happy: "THE SUN", sadness: "THE MOON", anger: "THE TOWER", loneliness: "THE HERMIT", neutral: "THE WORLD" };
        const title = cardTitles[dominant] || "THE FOOL";
        return (
            <div className="w-full h-full bg-[#1a1625] border-[6px] border-[#d4af37] p-5 flex flex-col items-center justify-between relative overflow-hidden font-serif text-[#d4af37]">
                <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-[#d4af37]"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-[#d4af37]"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3px] border-l-[3px] border-[#d4af37]"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-[#d4af37]"></div>
                <div className="text-center w-full">
                    <div className="flex justify-between text-[10px] opacity-60 uppercase tracking-widest mb-1 px-2"><span>No. {data?.month}</span><span>{data?.year}</span></div>
                    <h2 className="text-3xl font-bold tracking-widest border-b border-[#d4af37]/30 pb-2 mx-4">{title}</h2>
                </div>
                <div className="flex-1 w-full flex flex-col items-center justify-center py-4">
                    <div className="w-40 h-56 border border-[#d4af37]/30 rounded-full flex flex-col items-center justify-center bg-[#d4af37]/5 relative mb-4">
                        <Sparkles size={64} className="animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-dashed border-[#d4af37]/20 animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    <p className="text-center text-xs italic opacity-80 px-4">"The stars align in your favor."</p>
                </div>
                <div className="text-center w-full px-4">
                    <div className="flex justify-center gap-4 text-[10px] uppercase opacity-70 mb-2"><span>Joy: {stats.happy}</span><span>Tears: {stats.sadness}</span><span>Fire: {stats.anger}</span></div>
                    <div className="h-px bg-[#d4af37]/50 w-full mb-2"></div>
                    <div className="font-handwriting text-lg">Signed, {userName}</div>
                </div>
            </div>
        );
    };

    const ReceiptCard = () => {
        const items = [{ name: "Happy Moments", qty: stats.happy }, { name: "Melancholy", qty: stats.sadness }, { name: "Fiery Passion", qty: stats.anger }, { name: "Quiet Time", qty: stats.loneliness }].filter(i => i.qty > 0);
        const totalQty = items.reduce((acc, cur) => acc + cur.qty, 0);
        return (
            <div className="w-full h-full bg-[#fdfbf7] text-black font-mono p-6 flex flex-col relative shadow-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-[linear-gradient(45deg,transparent_33.333%,#fdfbf7_33.333%,#fdfbf7_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#fdfbf7_33.333%,#fdfbf7_66.667%,transparent_66.667%)] bg-[length:10px_20px]"></div>
                <div className="text-center border-b-2 border-dashed border-black/20 pb-4 mb-4 mt-2">
                    <div className="flex justify-center mb-2"><Receipt size={32} /></div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter">SOUL STORE</h2>
                    <p className="text-xs text-gray-500">BRANCH: BAMBOO FOREST</p>
                    <p className="text-xs text-gray-500">DATE: {new Date().toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">CUST: {userName.toUpperCase()}</p>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between text-xs font-bold border-b border-black mb-2 pb-1"><span>ITEM DESCRIPTION</span><span>QTY</span></div>
                    <div className="space-y-2 text-xs">{items.map((item, idx) => (<div key={idx} className="flex justify-between"><span>{item.name}</span><span>{item.qty}</span></div>))}{items.length === 0 && <div className="text-center opacity-50 py-4">* NO RECORDS FOUND *</div>}</div>
                    <div className="border-t border-dashed border-black/30 my-4"></div>
                    <div className="flex justify-between font-bold text-sm"><span>TOTAL EMOTIONS</span><span>{totalQty} EA</span></div>
                    <div className="flex justify-between text-xs mt-1"><span>TAX (SOUL TAX)</span><span>0.00</span></div>
                </div>
                <div className="mt-auto pt-4 border-t-2 border-black">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold font-barcode opacity-80">||| |||| || | |||</h3>
                        <p className="text-[10px] mt-1 uppercase">Order No. {data?.year}{data?.month}</p>
                        <p className="text-xs font-bold mt-2">THANK YOU</p>
                    </div>
                </div>
            </div>
        );
    };

    const AppleCard = () => {
        const total = stats.total || 1;
        const happyPercent = (stats.happy / total) * 100;
        const sadPercent = (stats.sadness / total) * 100;
        return (
            <div className="w-full h-full bg-black text-white p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.3)_0%,transparent_50%)] animate-pulse"></div>
                <div className="z-10 flex justify-between items-start">
                    <div><h2 className="text-sm font-semibold text-gray-400 uppercase">Summary</h2><h1 className="text-4xl font-bold">{String(data?.month).padStart(2,'0')}월</h1></div>
                    <div className="bg-[#1c1c1e] p-2 rounded-full"><Activity size={20} className="text-green-500" /></div>
                </div>
                <div className="z-10 flex-1 flex flex-col items-center justify-center relative">
                    <div className="w-48 h-48 rounded-full flex items-center justify-center relative" style={{ background: `conic-gradient(#fa2d48 ${happyPercent}%, #2c2c2e ${happyPercent}% 100%)` }}>
                        <div className="w-40 h-40 bg-black rounded-full absolute"></div>
                        <div className="w-32 h-32 rounded-full flex items-center justify-center relative z-10" style={{ background: `conic-gradient(#a3e635 ${sadPercent}%, #2c2c2e ${sadPercent}% 100%)` }}>
                            <div className="w-24 h-24 bg-black rounded-full absolute"></div>
                            <div className="z-20 text-center"><span className="text-3xl font-bold">{total}</span><p className="text-[10px] text-gray-400 uppercase">Records</p></div>
                        </div>
                    </div>
                </div>
                <div className="z-10 grid grid-cols-2 gap-3">
                    <div className="bg-[#1c1c1e] rounded-xl p-3 flex flex-col justify-between h-24"><div className="flex items-center gap-1 text-[#fa2d48] text-xs font-bold"><Heart size={12} fill="currentColor"/> HAPPY</div><span className="text-2xl font-bold">{stats.happy}</span><span className="text-[10px] text-gray-500">High Intensity</span></div>
                    <div className="bg-[#1c1c1e] rounded-xl p-3 flex flex-col justify-between h-24"><div className="flex items-center gap-1 text-[#a3e635] text-xs font-bold"><Zap size={12} fill="currentColor"/> ENERGY</div><span className="text-2xl font-bold">{Math.round(total * 1.5)}</span><span className="text-[10px] text-gray-500">Soul kcal</span></div>
                </div>
            </div>
        );
    };

    return (
        <ModalOverlay onClose={onClose} title="">
            <div className="relative w-full max-w-[320px] mx-auto p-2 z-50 max-h-[90vh] flex flex-col">                <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-red-500 rounded-full text-white z-[9999] cursor-pointer"
            >
                <X size={24} />
                </button>

                <div className="flex justify-center gap-2 mb-4 pointer-events-auto">
                    {[{ id: 'tarot', icon: Sparkles, label: 'Tarot' }, { id: 'receipt', icon: Receipt, label: 'Receipt' }, { id: 'modern', icon: Smartphone, label: 'Modern' }].map((t) => (
                        <button key={t.id} onClick={(e) => { e.stopPropagation(); setTheme(t.id as Theme); }}
                            className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all ${theme === t.id ? 'bg-white text-black scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                            <t.icon size={12} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* 👇 [중요] ref={captureRef} 확인 
                   이제 handleSave에서 captureRef.current를 사용하므로 정상 작동합니다.
                */}
                <div ref={captureRef} className="aspect-[4/5] w-full shadow-2xl mb-6 bg-black overflow-hidden rounded-lg">
                    {theme === 'tarot' && <TarotCard />}
                    {theme === 'receipt' && <ReceiptCard />}
                    {theme === 'modern' && <AppleCard />}
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 z-50 cursor-pointer">
                        {isSaving ? "Saving..." : <><Download size={18} /> Save</>}
                    </button>
                    <button onClick={handleShare} className="flex-1 bg-white/10 text-white border border-white/20 py-3 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2 z-50 cursor-pointer">
                        <Share2 size={18} /> Share
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};