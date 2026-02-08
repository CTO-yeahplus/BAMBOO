'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Download, Share2, X, Sparkles, Receipt, Smartphone, Activity, Heart, Zap, Ghost, Moon, CloudRain, Flame, Quote, Fingerprint } from 'lucide-react';
import { toPng } from 'html-to-image';

interface SoulographyModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'calendar' | 'letter' | 'memory'; // 'memory' 타입 추가
    data: any; 
    userName: string;
}

type Theme = 'tarot' | 'receipt' | 'modern';

export const SoulographyModal = ({ isOpen, onClose, data, type, userName }: SoulographyModalProps) => {
    const [theme, setTheme] = useState<Theme>('tarot');
    const captureRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const cleanup = () => document.querySelectorAll('.html-to-image-cloned-node').forEach(el => el.remove());
        cleanup();
        return cleanup;
    }, []);

    if (!isOpen) return null;

    // --- 데이터 처리 ---
    // 1. 캘린더 모드일 때
    const stats = data?.stats || { happy: 0, sadness: 0, anger: 0, loneliness: 0, neutral: 0, total: 0 };
    const dominant = data?.dominant || 'neutral';
    const totalCount = stats.total || 0;
    
    // 2. 단일 기억(Memory) 모드일 때
    const isMemoryMode = type === 'memory';
    const memoryDate = isMemoryMode ? new Date(data.created_at).toLocaleDateString() : '';
    const memoryEmotion = isMemoryMode ? (data.emotion || 'neutral') : dominant;
    const memoryText = isMemoryMode ? data.summary : '';

    // --- 저장 로직 ---
    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!captureRef.current || isSaving) return;
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            const dataUrl = await toPng(captureRef.current, { cacheBust: true, pixelRatio: 2, skipAutoScale: true });
            const fileName = `soulography-${theme}-${isMemoryMode ? 'memory' : data?.month || 'log'}.png`;
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Capture failed:", err);
            alert("저장 실패");
        } finally {
            setIsSaving(false);
            setTimeout(() => document.querySelectorAll('.html-to-image-cloned-node').forEach(el => el.remove()), 500);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try { await navigator.share({ title: 'My Soul Forest', text: '숲에서 온 기록', url: window.location.href }); } catch (err) { }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("URL 복사됨");
        }
    };

    // --- 🎨 테마별 컴포넌트 ---

    // 1. 🔮 타로 카드
    const TarotCard = () => {
        const tarotMap: Record<string, { title: string, quote: string, icon: any }> = {
            happy: { title: "THE SUN", quote: "Joy illuminates your path.", icon: Sparkles },
            sadness: { title: "THE MOON", quote: "Tears water the seeds of soul.", icon: CloudRain },
            anger: { title: "THE TOWER", quote: "Change comes with fire.", icon: Flame },
            loneliness: { title: "THE HERMIT", quote: "Wisdom grows in silence.", icon: Moon },
            neutral: { title: "THE WORLD", quote: "Everything is in balance.", icon: Ghost }
        };
        const currentTarot = tarotMap[memoryEmotion] || tarotMap.neutral;
        const Icon = currentTarot.icon;

        return (
            <div className="w-full h-full bg-[#151518] border-[6px] border-[#d4af37] p-5 flex flex-col items-center justify-between relative overflow-hidden font-serif text-[#d4af37]">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#d4af37_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                {/* Borders */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-[#d4af37]"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-[#d4af37]"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3px] border-l-[3px] border-[#d4af37]"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-[#d4af37]"></div>
                
                <div className="text-center w-full z-10">
                    <div className="flex justify-between text-[10px] opacity-60 uppercase tracking-widest mb-1 px-2">
                        <span>{isMemoryMode ? 'FRAGMENT' : `No. ${data?.month}`}</span>
                        <span>{isMemoryMode ? 'Of Soul' : data?.year}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-widest border-b border-[#d4af37]/30 pb-2 mx-4">{currentTarot.title}</h2>
                </div>

                <div className="flex-1 w-full flex flex-col items-center justify-center py-4 z-10 relative">
                    <div className="w-40 h-56 border border-[#d4af37]/30 rounded-full flex flex-col items-center justify-center bg-[#d4af37]/5 relative mb-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                        <Icon size={64} className="animate-pulse drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <div className="absolute inset-0 rounded-full border border-dashed border-[#d4af37]/20 animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    {/* 메모리 모드일 땐 실제 내용을 보여줌 */}
                    <p className="text-center text-xs italic opacity-80 px-4 font-serif leading-relaxed line-clamp-4">
                        "{isMemoryMode ? memoryText : currentTarot.quote}"
                    </p>
                </div>

                <div className="text-center w-full px-4 z-10">
                    {isMemoryMode ? (
                        <div className="text-[10px] uppercase opacity-70 mb-2 font-sans tracking-widest">{memoryDate}</div>
                    ) : (
                         <div className="flex justify-center gap-4 text-[10px] uppercase opacity-70 mb-2 font-sans">
                            <span>Joy: {stats.happy}</span><span>Tears: {stats.sadness}</span><span>Fire: {stats.anger}</span>
                        </div>
                    )}
                    <div className="h-px bg-[#d4af37]/50 w-full mb-2"></div>
                    <div className="font-handwriting text-lg">Signed, {userName}</div>
                </div>
            </div>
        );
    };

    // 2. 🧾 영수증
    const ReceiptCard = () => {
        const receiptItems = isMemoryMode 
            ? [{ name: memoryEmotion.toUpperCase(), date: memoryDate, qty: 1, price: "PRICELESS" }]
            : (data?.memories || []).slice(0, 15).map((m: any) => ({
                name: (m.emotion || 'neutral').toUpperCase(),
                date: new Date(m.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
                qty: 1, price: "1.00"
            }));

        return (
            <div className="w-full h-full bg-[#fdfbf7] text-black font-mono p-5 flex flex-col relative shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[linear-gradient(45deg,transparent_33.333%,#fdfbf7_33.333%,#fdfbf7_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#fdfbf7_33.333%,#fdfbf7_66.667%,transparent_66.667%)] bg-[length:10px_20px]"></div>
                <div className="text-center border-b-2 border-dashed border-black/20 pb-3 mb-3 mt-1">
                    <div className="flex justify-center mb-1"><Receipt size={28} /></div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter">SOUL STORE</h2>
                    <p className="text-[9px] text-gray-500">DATE: {isMemoryMode ? memoryDate : `${data?.year}.${String(data?.month).padStart(2,'0')}`}</p>
                    <p className="text-[9px] text-gray-500">GUEST: {userName.toUpperCase()}</p>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex justify-between text-[10px] font-bold border-b border-black mb-2 pb-1"><span>ITEM</span><span>QTY</span></div>
                    
                    {isMemoryMode ? (
                        // 단일 기억 모드
                        <div className="flex-1 flex flex-col gap-4 py-4">
                            <div className="flex justify-between font-bold text-lg">
                                <span>1x {memoryEmotion.toUpperCase()}</span>
                                <span>1</span>
                            </div>
                            <div className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 leading-relaxed">
                                "{memoryText}"
                            </div>
                        </div>
                    ) : (
                        // 리스트 모드
                        <div className="flex-1 space-y-1 text-[10px] overflow-hidden">
                            {receiptItems.length > 0 ? receiptItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-end">
                                    <div><span className="text-[9px] text-gray-400 mr-2">{item.date}</span><span className="font-bold">{item.name}</span></div>
                                    <span>{item.qty}</span>
                                </div>
                            )) : <div className="text-center py-6 text-gray-400 italic">No records found...</div>}
                        </div>
                    )}
                    
                    <div className="border-t border-dashed border-black/30 my-3"></div>
                    <div className="flex justify-between font-bold text-xs"><span>TOTAL ITEM COUNT</span><span>{isMemoryMode ? 1 : totalCount}</span></div>
                    <div className="flex justify-between text-xl font-bold mt-2 border-t-2 border-black pt-2"><span>AMOUNT DUE</span><span>$0.00</span></div>
                </div>
                <div className="mt-auto pt-3 text-center">
                    <h3 className="text-3xl font-barcode opacity-80 transform scale-y-150">||| |||| || | |||</h3>
                    <p className="text-[9px] font-bold mt-2">THANK YOU</p>
                </div>
            </div>
        );
    };

    // 3. 🍎 Modern (Calendar: Ring Chart / Memory: Aura Card)
    const AppleCard = () => {
        // [Aura Card] for Single Memory
        if (isMemoryMode) {
            const colorMap: any = {
                happy: { bg: 'bg-yellow-500', text: 'text-yellow-500', hex: '#eab308' },
                sadness: { bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3b82f6' },
                anger: { bg: 'bg-red-500', text: 'text-red-500', hex: '#ef4444' },
                loneliness: { bg: 'bg-purple-500', text: 'text-purple-500', hex: '#a855f7' },
                neutral: { bg: 'bg-gray-400', text: 'text-gray-500', hex: '#9ca3af' },
            };
            const themeColor = colorMap[memoryEmotion] || colorMap.neutral;

            return (
                <div className="w-full h-full bg-black text-white p-6 flex flex-col justify-between relative overflow-hidden font-sans">
                     {/* Background Gradient */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br from-black via-black to-${themeColor.text.split('-')[1]}-900`} />
                    <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] ${themeColor.bg} opacity-10 blur-[100px] animate-pulse-slow pointer-events-none`} />

                    {/* Header */}
                    <div className="z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Memory Fragment</h2>
                            <h1 className="text-2xl font-bold text-white leading-tight">{memoryDate}</h1>
                        </div>
                        <Fingerprint size={24} className={`${themeColor.text} opacity-80`} />
                    </div>

                    {/* Main Visual: Glowing Orb */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <div className={`relative w-40 h-40 rounded-full ${themeColor.bg} flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.1)] animate-float`}>
                            <div className="absolute inset-0 rounded-full border border-white/20 scale-125 opacity-30" />
                            <div className="absolute inset-0 rounded-full border border-white/10 scale-150 opacity-20" />
                            <div className="text-center">
                                <Activity size={32} className="text-white mx-auto mb-2" />
                                <p className="text-lg font-black tracking-widest uppercase">{memoryEmotion}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Text */}
                    <div className="z-10 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <Quote size={12} className="text-white/40 mb-2" />
                        <p className="text-sm font-light leading-relaxed italic text-white/90 line-clamp-4">
                            "{memoryText}"
                        </p>
                    </div>
                </div>
            );
        }

        // [Ring Chart] for Calendar (기존 코드 유지)
        const safeTotal = totalCount || 1;
        const monthName = "Statistics"; // 간단화
        const getPercent = (val: number) => Math.round((val / safeTotal) * 100);
        
        const chartData = [
            { label: 'HAPPY', value: stats.happy, percent: getPercent(stats.happy), color: 'text-yellow-600', bgColor: 'bg-yellow-500', hex: '#eab308' },
            { label: 'SADNESS', value: stats.sadness, percent: getPercent(stats.sadness), color: 'text-blue-500', bgColor: 'bg-blue-500', hex: '#3b82f6' },
            { label: 'ANGER', value: stats.anger, percent: getPercent(stats.anger), color: 'text-red-500', bgColor: 'bg-red-500', hex: '#ef4444' },
            { label: 'LONELY', value: stats.loneliness, percent: getPercent(stats.loneliness), color: 'text-purple-600', bgColor: 'bg-purple-500', hex: '#a855f7' },
            { label: 'NEUTRAL', value: stats.neutral, percent: getPercent(stats.neutral), color: 'text-gray-500', bgColor: 'bg-gray-400', hex: '#9ca3af' },
        ].filter(d => d.value > 0);

        const conicGradient = `conic-gradient(${chartData.map((d, i) => {
            const prevSum = chartData.slice(0, i).reduce((acc, cur) => acc + cur.percent, 0);
            return `${d.hex} ${prevSum}% ${prevSum + d.percent}%`;
        }).join(', ')})`;

        return (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-100 to-purple-200 text-gray-900 p-6 flex flex-col justify-between relative overflow-hidden font-sans">
                <div className="z-10 flex justify-between items-start border-b border-black/5 pb-3">
                    <div><h2 className="text-[9px] font-bold text-purple-900/50 uppercase tracking-widest">Energy Ratio</h2><h1 className="text-2xl font-bold text-gray-900 leading-none">Monthly<br/>Analysis</h1></div>
                    <div className="bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm"><Activity size={16} className="text-purple-600" /></div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative py-4">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full shadow-2xl" style={{ background: conicGradient }} />
                        <div className="absolute inset-4 bg-white/90 backdrop-blur-sm rounded-full flex flex-col items-center justify-center shadow-inner z-10">
                            <span className="text-4xl font-black text-gray-800 tracking-tighter">{totalCount}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Memories</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-2 mt-6 z-20">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-lg px-3 py-2 shadow-sm border border-white/40">
                                <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${d.bgColor} shadow-sm`} /><span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">{d.label}</span></div>
                                <span className={`text-xs font-black ${d.color}`}>{d.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ModalOverlay onClose={onClose} title="">
            <div className="relative w-full max-w-[320px] mx-auto p-2 z-50 max-h-[90vh] flex flex-col items-center">
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-red-500 rounded-full text-white z-[9999] cursor-pointer"><X size={20} /></button>
                <div className="flex justify-center gap-2 mb-3 pointer-events-auto flex-shrink-0 w-full">
                    {[{ id: 'tarot', icon: Sparkles, label: 'Tarot' }, { id: 'receipt', icon: Receipt, label: 'Receipt' }, { id: 'modern', icon: Smartphone, label: 'Modern' }].map((t) => (
                        <button key={t.id} onClick={(e) => { e.stopPropagation(); setTheme(t.id as Theme); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${theme === t.id ? 'bg-white text-black scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}><t.icon size={10} /> {t.label}</button>
                    ))}
                </div>
                <div className="flex-1 min-h-0 mb-4 flex justify-center w-full">
                    <div ref={captureRef} className="aspect-[4/5] w-full shadow-2xl bg-black overflow-hidden rounded-lg">
                        {theme === 'tarot' && <TarotCard />}
                        {theme === 'receipt' && <ReceiptCard />}
                        {theme === 'modern' && <AppleCard />}
                    </div>
                </div>
                <div className="flex gap-2 pointer-events-auto flex-shrink-0 w-full">
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 z-50 cursor-pointer text-xs">{isSaving ? "Creating..." : <><Download size={14} /> Save Image</>}</button>
                    <button onClick={handleShare} className="flex-1 bg-white/10 text-white border border-white/20 py-2.5 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2 z-50 cursor-pointer text-xs"><Share2 size={14} /> Copy Link</button>
                </div>
            </div>
        </ModalOverlay>
    );
};