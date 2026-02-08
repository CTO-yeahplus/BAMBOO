'use client';
import React, { useState, useEffect } from 'react';
import { ModalOverlay } from './ModalOverlay';
import { Send, Heart, MessageCircle, Waves } from 'lucide-react';

// ------------------------------------------------------------------
// 1. Bottle Menu (메뉴 선택)
// ------------------------------------------------------------------
export const BottleMenuModal = ({ isOpen, onClose, onWrite, onFind }: any) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose} title="The Driftwood Beach">
            <div className="p-8 flex flex-col gap-4">
                <button onClick={onWrite} className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all group text-left">
                    <h3 className="text-blue-200 font-serif text-lg mb-1 group-hover:translate-x-1 transition-transform">Cast a Bottle</h3>
                    <p className="text-xs text-blue-200/50">누군가에게 닿을 이야기를 띄워 보내세요.</p>
                </button>
                <button onClick={onFind} className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all group text-left">
                    <h3 className="text-emerald-200 font-serif text-lg mb-1 group-hover:translate-x-1 transition-transform">Walk the Beach</h3>
                    <p className="text-xs text-emerald-200/50">해변에 떠밀려온 다른 여행자의 이야기를 줍습니다.</p>
                </button>
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 2. Write Bottle (편지 쓰기 - 부드러운 퇴장 적용)
// ------------------------------------------------------------------
export const BottleWriteModal = ({ isOpen, onClose, sendBottle }: any) => {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    // ✨ [NEW] 사라지는 애니메이션을 위한 상태 추가
    const [isClosing, setIsClosing] = useState(false);

    // 부드럽게 닫는 함수 (자동 또는 터치 시 실행)
    const triggerSmoothClose = () => {
        if (isClosing) return; // 이미 닫히는 중이면 중복 실행 방지

        setIsClosing(true); // 1. 사라지는 애니메이션 시작 (fade-out)

        // 2. 애니메이션 시간(500ms)만큼 기다렸다가 실제로 모달 닫기
        setTimeout(() => {
            onClose(); 
            
            // 3. 다음번을 위해 상태 초기화 (약간의 딜레이 후)
            setTimeout(() => {
                setIsSent(false);
                setIsClosing(false);
                setContent('');
            }, 200);
        }, 500); // duration-500과 시간 맞춤
    };

    const handleSend = async () => {
        if (!content.trim()) return;
        if (typeof sendBottle !== 'function') {
            alert("시스템 오류: 우체부가 없습니다.");
            return;
        }

        setIsSending(true);
        try {
            await sendBottle(content);
            
            // ✅ 전송 성공! 성공 화면 보여주기
            setIsSent(true); 
            
            // ✅ 2초 대기 후 부드럽게 닫기 시작
            setTimeout(() => {
                triggerSmoothClose();
            }, 2000);

        } catch (error) {
            console.error(error);
            alert("편지 전송에 실패했습니다.");
            setIsSending(false); // 실패 시에만 로딩 끄기 (성공 시엔 화면 전환됨)
        }
    };

    if (!isOpen) return null;

    return (
        // 성공 화면일 때는 타이틀을 비워서 깔끔하게 보여줍니다.
        <ModalOverlay onClose={isSent ? triggerSmoothClose : onClose} title={isSent ? "" : "Write a Message"}>
            <div className="p-6">
                {/* 🌟 전송 완료 화면 */}
                {isSent ? (
                    <div 
                        // ✨ 터치하면 즉시 부드럽게 닫기
                        onClick={triggerSmoothClose}
                        // ✨ isClosing 상태에 따라 나타나거나(fade-in) 사라짐(fade-out)
                        className={`flex flex-col items-center justify-center py-10 space-y-6 cursor-pointer transition-all ${isClosing ? 'animate-out fade-out duration-500 fill-mode-forwards' : 'animate-in fade-in duration-500'}`}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                            {/* 파도가 넘실거리는 애니메이션 추가 */}
                            <Waves size={64} className="text-blue-300 relative z-10 animate-[bounce_3s_ease-in-out_infinite]" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-serif text-white font-bold drop-shadow-md">유리병이 바다로 떠났습니다</h3>
                            <p className="text-sm text-white/60">(화면을 터치하면 닫힙니다)</p>
                        </div>
                    </div>
                ) : (
                    /* 📝 작성 화면 (기존 동일) */
                    <>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="이곳에 이야기를 적어주세요..."
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 focus:outline-none resize-none mb-6 placeholder:text-white/20 font-serif leading-relaxed"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isSending || !content.trim()}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isSending ? (
                                <span className="animate-pulse flex items-center gap-2">
                                    <Waves size={16} className="animate-spin" /> Casting...
                                </span>
                            ) : (
                                <><Send size={16} /> Cast into the Sea</>
                            )}
                        </button>
                    </>
                )}
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 3. Read Bottle (편지 읽기)
// ------------------------------------------------------------------
export const BottleReadModal = ({ isOpen, onClose, bottle }: any) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose} title="Message found">
            <div className="p-6 text-center text-white/50">
                (아직 도착한 편지가 없습니다)
            </div>
        </ModalOverlay>
    );
};

// ------------------------------------------------------------------
// 🌟 4. [NEW] Main Manager (통합 관리자)
// 이 컴포넌트가 위 3가지를 조립해서 보여줍니다.
// ------------------------------------------------------------------
export const BottleModals = ({ isOpen, onClose, sendBottle }: any) => {
    const [view, setView] = useState<'menu' | 'write' | 'read'>('menu');

    // 모달 열릴 때마다 메뉴로 초기화
    useEffect(() => {
        if (isOpen) setView('menu');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* 1. 메뉴 */}
            {view === 'menu' && (
                <BottleMenuModal 
                    isOpen={true} 
                    onClose={onClose} 
                    onWrite={() => setView('write')} 
                    onFind={() => setView('read')} 
                />
            )}

            {/* 2. 쓰기 (여기서 sendBottle을 전달!) */}
            {view === 'write' && (
                <BottleWriteModal 
                    isOpen={true} 
                    onClose={onClose} 
                    sendBottle={sendBottle} 
                />
            )}

            {/* 3. 읽기 */}
            {view === 'read' && (
                <BottleReadModal 
                    isOpen={true} 
                    onClose={onClose} 
                    bottle={null} 
                />
            )}
        </>
    );
};