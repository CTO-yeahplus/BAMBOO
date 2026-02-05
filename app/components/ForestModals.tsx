'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Zap, Sparkles, User, LogOut, Download, Share2, Settings2, Volume2, Mic, Heart, Send, Flame } from 'lucide-react';
import Image from 'next/image';
import { Artifact, ARTIFACTS, OracleCard, WhisperBottle } from '../types';
import { toPng } from 'html-to-image'; // [Fix] 교체된 라이브러리
import QRCode from 'react-qr-code';
import { BurningPaperEffect } from './ForestVisuals'; 

// --- Helper Components ---
const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
            {children}
        </motion.div>
    </motion.div>
);

// --- 1. Oracle Modal (Updated for html-to-image) ---
export const OracleModal = ({ isOpen, card, onConfirm }: { isOpen: boolean; card: OracleCard | null; onConfirm: () => void }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    if (!isOpen || !card) return null;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsCapturing(true); 
        
        try {
            // 폰트 로딩 등 렌더링 확보를 위한 미세 딜레이
            await new Promise(resolve => setTimeout(resolve, 100));

            // [Fix] html-to-image 사용 (oklab 에러 해결)
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#0a0a0a', // 배경색 명시
                pixelRatio: 2, // 고화질 설정
            });

            const link = document.createElement('a');
            link.download = `bamboo-oracle-${new Date().toISOString().slice(0,10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Image generation failed:", err);
            alert("이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <ModalOverlay onClose={() => {}}>
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                <button 
                    onClick={onConfirm} 
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Capture Area */}
                <div ref={cardRef} className="relative p-8 flex flex-col items-center text-center bg-gradient-to-b from-[#1a1a1a] to-black min-h-[550px] justify-between">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl" />

                    <div className="relative z-10 mt-4">
                        <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                            <Sparkles size={14} className="text-yellow-200" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-100">Daily Oracle</span>
                            <Sparkles size={14} className="text-yellow-200" />
                        </div>
                        <h2 className="text-2xl font-serif text-white/90 mb-1">{card.name}</h2>
                        <p className="text-xs text-white/40 font-mono">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="relative z-10 w-48 h-72 my-6 rounded-lg border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center bg-white/5 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-blue-500/20 opacity-50" />
                        <div className="text-center p-4">
                            <p className="text-4xl mb-4 opacity-80">{card.icon === 'Coffee' ? '☕' : card.icon === 'Footprints' ? '👣' : card.icon === 'Sun' ? '☀️' : card.icon === 'Sparkles' ? '✨' : card.icon === 'Wind' ? '🍃' : card.icon === 'Sunrise' ? '🌅' : '💖'}</p>
                            <p className="text-white/80 font-serif italic text-sm leading-relaxed word-keep-all">
                                "{card.message}"
                            </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                    </div>

                    <div className="relative z-10 w-full flex items-end justify-between border-t border-white/10 pt-4 mt-2">
                        <div className="text-left">
                            <p className="text-xs text-white/60 font-bold tracking-wider">Bamboo Forest</p>
                            <p className="text-[9px] text-white/30 mt-1">Listen to your soul.</p>
                        </div>
                        <div className="bg-white p-1 rounded-sm">
                            <QRCode 
                                value={typeof window !== 'undefined' ? window.location.origin : 'https://bamboo-forest.vercel.app'} 
                                size={48} 
                                fgColor="#000000" 
                                bgColor="#ffffff" 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex gap-3">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        disabled={isCapturing}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isCapturing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
                        Save Image
                    </motion.button>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={onConfirm}
                        className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-gray-200 transition-colors"
                    >
                        Accept
                    </motion.button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 2. Settings Modal ---
export const SettingsModal = ({ isOpen, onClose, bgVolume, setBgVolume, voiceVolume, setVoiceVolume }: any) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-6"><h2 className="text-white text-lg font-medium flex items-center gap-2"><Settings2 size={18} /> Settings</h2><button onClick={onClose}><X className="text-white/50 hover:text-white" /></button></div>
                <div className="space-y-6">
                    <div><label className="flex items-center gap-2 text-white/60 text-sm mb-3"><Volume2 size={14} /> Ambience Volume</label><input type="range" min="0" max="1" step="0.01" value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))} className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" /></div>
                    <div><label className="flex items-center gap-2 text-white/60 text-sm mb-3"><Mic size={14} /> Voice Volume</label><input type="range" min="0" max="2" step="0.1" value={voiceVolume} onChange={(e) => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" /></div>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 text-center"><p className="text-[10px] text-white/20 uppercase tracking-widest">Bamboo Forest v1.0</p></div>
            </div>
        </ModalOverlay>
    );
};

// --- 3. Altar Modal ---
export const AltarModal = ({ isOpen, onClose, resonance, artifacts, ownedItems, equippedItems, onUnlock, onEquip }: any) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl overflow-hidden shadow-2xl h-[70vh] flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20"><div className="flex items-center gap-3"><h2 className="text-white/90 font-serif italic text-xl">Spirit Altar</h2><span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-xs font-mono">Resonance: {resonance}</span></div><button onClick={onClose}><X className="text-white/50 hover:text-white" /></button></div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
                    {artifacts.map((item: Artifact) => {
                        const isOwned = ownedItems.includes(item.id);
                        const isEquipped = equippedItems[item.type] === item.id;
                        return (
                            <div key={item.id} className={`relative p-4 rounded-xl border transition-all flex flex-col gap-2 ${isOwned ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                <div className="flex justify-between items-start"><span className="text-2xl">{item.icon}</span>{isEquipped && <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">EQUIPPED</span>}</div>
                                <div><h3 className="text-white/90 text-sm font-medium">{item.name}</h3><p className="text-white/40 text-[10px] mt-1 line-clamp-2">{item.description}</p></div>
                                <div className="mt-auto pt-3">
                                    {isOwned ? (
                                        <button onClick={() => onEquip(item)} className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors ${isEquipped ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}>{isEquipped ? 'Unequip' : 'Equip'}</button>
                                    ) : (
                                        <button onClick={() => onUnlock(item)} disabled={resonance < item.cost} className={`w-full py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${resonance >= item.cost ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 hover:bg-yellow-600/30' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}><Zap size={10} /> {item.cost}</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 4. Profile Modal ---
export const ProfileModal = ({ isOpen, onClose, user, isPremium, signOut, getUserInitial }: any) => {
    if (!isOpen || !user) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6">
                <div className="relative"><div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isPremium ? 'bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/50 text-yellow-100' : 'bg-white/5 border-white/10 text-white'}`}>{getUserInitial()}</div>{isPremium && <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-300 shadow-lg">PREMIUM</div>}</div>
                <div className="text-center"><h2 className="text-white text-xl font-medium mb-1">{user.email?.split('@')[0]}</h2><p className="text-white/40 text-xs">{user.email}</p></div>
                <div className="w-full h-px bg-white/10 my-2" />
                <button onClick={() => { signOut(); onClose(); }} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-200 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"><LogOut size={16} /> Sign Out</button>
            </div>
        </ModalOverlay>
    );
};

// --- 5. Bottle Write Modal ---
export const BottleWriteModal = ({ isOpen, onClose, onSend }: any) => {
    const [text, setText] = useState("");
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-white/90 text-lg font-serif italic">Whisper to the Universe</h2><button onClick={onClose}><X className="text-white/30 hover:text-white" /></button></div>
                <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="누군가에게 닿을 마음을 적어주세요..." 
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-white/30 resize-none mb-4"
                    maxLength={100}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={() => { if(text.trim()) { onSend(text); setText(""); onClose(); } }}
                        disabled={!text.trim()}
                        className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Send size={14} /> Float Bottle
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

// --- 6. Bottle Read Modal ---
export const BottleReadModal = ({ bottle, onClose, onLike }: { bottle: WhisperBottle | null, onClose: () => void, onLike: (id: number) => void }) => {
    if (!bottle) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <div className="relative bg-[#0c0c0c] border border-[#222] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10" />
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <span className="text-2xl">🍾</span>
                    </div>
                    
                    <p className="text-white/80 font-serif italic text-lg leading-relaxed mb-8 break-keep">
                        "{bottle.content}"
                    </p>
                    
                    <div className="flex justify-center gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-full border border-white/10 text-white/40 hover:bg-white/5 text-xs transition-colors">닫기</button>
                        <button 
                            onClick={() => { onLike(bottle.id); onClose(); }} 
                            className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-full text-xs flex items-center gap-2 transition-all group"
                        >
                            <Heart size={12} className="group-hover:fill-red-300 transition-all" /> 
                            따뜻해요 {bottle.likes}
                        </button>
                    </div>
                    
                    <p className="mt-6 text-[9px] text-white/20 uppercase tracking-widest">Someone's Whisper • {new Date(bottle.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </ModalOverlay>
    );
};

// [New] Fire Ritual Modal (번제 의식)
export const FireRitualModal = ({ isOpen, onClose, onBurn }: any) => {
    const [text, setText] = useState("");
    const [isBurning, setIsBurning] = useState(false);

    if (!isOpen) return null;

    const handleBurn = () => {
        if (!text.trim()) return;
        setIsBurning(true);
        onBurn(); // 소리 및 햅틱 트리거
        // 애니메이션이 끝난 후 모달 닫기 (BurningPaperEffect 시간과 동기화)
        setTimeout(() => {
            setIsBurning(false);
            setText("");
            onClose();
        }, 3500);
    };

    return (
        <ModalOverlay onClose={isBurning ? () => {} : onClose}>
            <div className="relative bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                
                {/* Burning Effect Layer */}
                {isBurning && <BurningPaperEffect isBurning={isBurning} onComplete={() => {}} />}

                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-red-200/90 text-lg font-serif italic flex items-center gap-2">
                        <Flame size={18} className={isBurning ? "animate-bounce text-orange-500" : "text-red-500/50"} />
                        Ritual of Fire
                    </h2>
                    {!isBurning && <button onClick={onClose}><X className="text-white/30 hover:text-white" /></button>}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col relative z-10 transition-opacity duration-1000" style={{ opacity: isBurning ? 0 : 1 }}>
                    <p className="text-white/40 text-xs mb-4 leading-relaxed">
                        당신을 괴롭히는 기억, 걱정, 두려움을 이곳에 적으세요.<br/>
                        이 종이는 태워질 것이며, 기록은 어디에도 남지 않습니다.
                    </p>
                    
                    <textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="여기에 버리고 싶은 마음을 적으세요..." 
                        className="w-full flex-1 bg-black/30 border border-white/5 rounded-xl p-4 text-white/80 text-sm focus:outline-none focus:border-red-500/30 resize-none mb-6 placeholder-white/20 font-serif"
                    />
                    
                    <button 
                        onClick={handleBurn}
                        disabled={!text.trim()}
                        className="w-full py-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/20 hover:border-red-500/50 rounded-xl text-red-200 text-xs uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <span className="group-hover:text-red-100 transition-colors">Burn Away</span>
                    </button>
                </div>

                {/* Text to be burnt (Visible only during burning) */}
                {isBurning && (
                    <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
                        <p className="text-white/80 font-serif text-lg text-center leading-relaxed break-keep animate-pulse">
                            {text}
                        </p>
                    </div>
                )}
            </div>
        </ModalOverlay>
    );
};