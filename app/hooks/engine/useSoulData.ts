// app/hooks/engine/useSoulData.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Memory, Artifact, ARTIFACTS, ArtifactType, ORACLE_DECK, OracleCard, WhisperBottle } from '../../types';
import { SpiritFormType, SPIRIT_FORMS, DailyMood, EMOTION_COLORS } from '../../types'; // Import 추가

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// [New] 유리병 줍기 함수
const pickUpBottle = async () => {
    try {
        // 방금 만든 DB 함수(rpc) 호출
        const { data, error } = await supabase.rpc('get_random_bottle');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            // 성공: 1개의 유리병을 건짐
            const bottle = data[0];
            console.log("🌊 Found a bottle:", bottle);
            return bottle; // 모달을 띄우기 위해 반환
        } else {
            // 실패: 조건에 맞는 유리병이 없음
            alert("파도에 떠밀려온 유리병이 없습니다. 잠시 후 다시 시도해보세요.");
            return null;
        }
    } catch (err) {
        console.error("Bottle Pickup Error:", err);
        return null;
    }
};

export interface SoulLetter {
    id: number;
    month: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export function useSoulData(user: any, triggerSuccess: () => void, isPremium: boolean) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [letters, setLetters] = useState<SoulLetter[]>([]); 
  const [resonance, setResonance] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>(['aura_firefly']);
  const [equippedItems, setEquippedItems] = useState<Record<ArtifactType, string | null>>({ 
      aura: 'aura_firefly', 
      head: null 
  });
  const [soulLevel, setSoulLevel] = useState(1);
  // [New] Spirit Form State
  const [spiritForm, setSpiritForm] = useState<SpiritFormType>('wisp');
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Oracle State
  const [todaysCard, setTodaysCard] = useState<OracleCard | null>(null);
  const [showOracleModal, setShowOracleModal] = useState(false);

  // Bottle State
  const [foundBottle, setFoundBottle] = useState<WhisperBottle | null>(null);

  const fetchMemories = useCallback(async () => {
      if (!user) return;
      const { data } = await supabase.from('memories').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setMemories(data);
  }, [user]);

  const fetchLetters = useCallback(async () => {
      if (!user) return;
      const { data } = await supabase.from('soul_letters').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setLetters(data);
  }, [user]);

  const checkOracle = useCallback(async () => {
      if (!user) return;
      if (todaysCard || showOracleModal) return;
      const randomCard = ORACLE_DECK[Math.floor(Math.random() * ORACLE_DECK.length)];
      setTodaysCard(randomCard);
      setShowOracleModal(true);
  }, [user, todaysCard, showOracleModal]);

  const confirmOracle = async () => {
      if (!user) return;
      const todayStr = new Date().toDateString();
      await supabase.from('profiles').update({ last_oracle_date: todayStr }).eq('id', user.id);
      setShowOracleModal(false);
      triggerSuccess(); 
      addResonance(30); 
  };

  // [New] 1. 유리병 띄우기 (Write)
  const castBottle = async (content: string) => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('whisper_bottles')
            .insert({
                user_id: user.id,
                content: content,
                likes: 0
            });
        if (error) throw error;
        alert("유리병이 파도에 실려 먼 바다로 떠났습니다.");
    } catch (err) {
        console.error(err);
        alert("유리병을 띄우는데 실패했습니다.");
    }
  };

  // [New] 2. 유리병 줍기 (Read)
  const pickUpBottle = async () => {
    if (!user) return null;
    try {
        // 아까 만든 DB 함수(RPC) 호출
        const { data, error } = await supabase.rpc('get_random_bottle');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            return data[0]; // 찾은 유리병 데이터 반환
        } else {
            return null; // 바다가 고요함
        }
    } catch (err) {
        console.error("Bottle Pickup Error:", err);
        return null;
    }
  };

  // [New] 3. 온기 보내기 (Like)
  const sendWarmth = async (bottleId: number, currentLikes: number) => {
    try {
        const { error } = await supabase
            .from('whisper_bottles')
            .update({ likes: currentLikes + 1 })
            .eq('id', bottleId);
        if (error) throw error;
    } catch (err) {
        console.error("Warmth Error:", err);
    }
  };

  // [New] Spirit Capsules State (정령의 목소리 보관함)
  const [spiritCapsules, setSpiritCapsules] = useState<any[]>([]);

  // Load Spirit Capsules (Local Storage)
  useEffect(() => {
      const saved = localStorage.getItem('spirit_capsules'); // 키 이름 변경
      if (saved) setSpiritCapsules(JSON.parse(saved));
  }, []);

  // [New Function] 정령의 말 저장하기 (기존 saveVoiceCapsule과 이름 구분)
  const keepSpiritVoice = (text: string) => {
      const newCap = {
          id: Date.now().toString(),
          text, // 정령의 멘트 (TTS용)
          created_at: new Date().toISOString(),
      };
      
      const updated = [newCap, ...spiritCapsules];
      setSpiritCapsules(updated);
      localStorage.setItem('spirit_capsules', JSON.stringify(updated));
      
      // 알림 메시지도 구분
      alert("정령의 속삭임을 기억 조각으로 보관했습니다.");
  };

  // [New Function] 정령의 말 삭제하기
  const forgetSpiritVoice = (id: string) => {
      const updated = spiritCapsules.filter(c => c.id !== id);
      setSpiritCapsules(updated);
      localStorage.setItem('spirit_capsules', JSON.stringify(updated));
  };

  // [Modified] Send Bottle (구조 신호 옵션 추가)
  const sendBottle = async (content: string, isDistress: boolean = false) => {
    if (!user) return;
    const { error } = await supabase.from('whisper_bottles').insert({
        user_id: user.id,
        content: content,
        is_distress: isDistress, // [New]
        likes: 0
    });
    if (!error) {
        triggerSuccess();
        addResonance(50);
    } else {
        alert("유리병을 띄우지 못했습니다.");
    }
};

  // [Modified] Find Random Bottle (수호자 우선 배정 로직)
  const findRandomBottle = async () => {
    if (!user) return;
    
    let query = supabase.from('whisper_bottles')
        .select('*')
        .neq('user_id', user.id) // 내 거 제외
        .is('reply_audio_url', null) // 아직 답장이 없는 병만 (수호자 기회)
        .limit(10);

    // [Key Logic] 프리미엄(수호자)이면 '구조 신호(is_distress)'를 우선적으로 찾음
    if (isPremium) {
        query = query.order('is_distress', { ascending: false }); // true(구조신호) 먼저
    }
    
    const { data } = await query.order('created_at', { ascending: false }); // 그 다음 최신순

    if (data && data.length > 0) {
        // 상위 5개 중 랜덤 선택 (너무 최신만 나오지 않게)
        const poolSize = Math.min(data.length, 5);
        const random = data[Math.floor(Math.random() * poolSize)];
        setFoundBottle(random);
    } else {
        const defaultMessages = [
            "이 숲에 도착한 유리병이 아직 없습니다.",
            "바람이 잠잠하네요. 당신의 이야기를 먼저 들려주세요.",
            "누군가의 목소리를 기다리고 있습니다."
        ];
        const randomMsg = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

        setFoundBottle({
            id: 0,
            content: randomMsg,
            likes: 0,
            created_at: new Date().toISOString(),
            is_distress: false
        });
    }
  };

  // [New] Reply with Voice (수호자의 답장)
  const replyToBottle = async (bottleId: number, audioBlob: Blob) => {
    if (!user) return;
    try {
        const fileName = `replies/${bottleId}_${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from('capsules').upload(fileName, audioBlob);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('capsules').getPublicUrl(fileName);
        
        // 병 정보 업데이트
        const { error: dbError } = await supabase.from('whisper_bottles')
            .update({ 
                reply_audio_url: publicUrl,
                reply_author_id: user.id 
            })
            .eq('id', bottleId);

        if (dbError) throw dbError;

        triggerSuccess();
        addResonance(100); // 답장 보상 (대폭 상승)
    } catch (e) {
        console.error("Reply Failed:", e);
        alert("답장을 보내지 못했습니다.");
    }
  };

  const generateWeeklyReport = async () => {
    if (!user) return;
    // 이번 주 리포트가 있는지 확인 로직 (클라이언트 단에서 간단히 체크)
    // 실제로는 API에서 중복 체크를 하는 것이 더 안전함
    
    try {
        // 로딩 표시 등 필요
        await fetch('/api/soul-report/weekly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        fetchLetters(); // 목록 갱신
    } catch (e) {
        console.error(e);
    }
  };

  // [Fix] catch 블록 제거 및 error 객체 확인 패턴으로 변경
  const likeBottle = async (bottleId: number) => {
      if (!foundBottle) return;
      // Optimistic update
      setFoundBottle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      
      // 1. Try RPC call
      const { error } = await supabase.rpc('increment_bottle_likes', { bottle_id: bottleId });

      // 2. If RPC fails (e.g. function not found), use standard update
      if (error) {
          console.warn("RPC Failed, trying fallback update:", error.message);
          const { data } = await supabase.from('whisper_bottles').select('likes').eq('id', bottleId).single();
          if (data) {
              await supabase.from('whisper_bottles').update({ likes: data.likes + 1 }).eq('id', bottleId);
          }
      }
      triggerSuccess();
  };

  // [New] Calendar Data State
  const [monthlyMoods, setMonthlyMoods] = useState<DailyMood[]>([]);

  // [New] Fetch Monthly Moods
  const fetchMonthlyMoods = useCallback(async (year: number, month: number) => {
      if (!user) return;

      // 해당 월의 시작일과 종료일 계산
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      const { data } = await supabase
          .from('memories')
          .select('created_at, emotion, summary')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

      if (!data) return;

      // 날짜별로 그룹화 및 감정 집계
      const grouped: Record<string, { emotions: string[], summaries: string[] }> = {};

      data.forEach((m: any) => {
          const dateStr = new Date(m.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
          if (!grouped[dateStr]) grouped[dateStr] = { emotions: [], summaries: [] };
          if (m.emotion) grouped[dateStr].emotions.push(m.emotion);
          if (m.summary) grouped[dateStr].summaries.push(m.summary);
      });

      // DailyMood 형식으로 변환
      const moods: DailyMood[] = Object.keys(grouped).map(date => {
          const dayData = grouped[date];
          
          // 가장 많이 등장한 감정 찾기
          const emotionCounts: Record<string, number> = {};
          dayData.emotions.forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
          
          let dominant = 'neutral';
          let max = 0;
          for (const [e, count] of Object.entries(emotionCounts)) {
              if (count > max) { max = count; dominant = e; }
          }

          return {
              date,
              dominantEmotion: dominant as any,
              intensity: Math.min(dayData.emotions.length, 3), // 대화가 많을수록 진하게 (최대 3단계)
              summary: dayData.summaries[dayData.summaries.length - 1] || "기록된 대화가 없습니다.", // 마지막 요약 사용
              count: dayData.emotions.length
          };
      });

      setMonthlyMoods(moods);
  }, [user]);

  useEffect(() => {
    if (!user) {
        const localRes = localStorage.getItem('spirit_resonance');
        if (localRes) setResonance(parseInt(localRes));
        return;
    }
    const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setResonance(data.resonance || 0);
            if (data.inventory) setOwnedItems(data.inventory);
            if (data.equipment) setEquippedItems(data.equipment);
        }
    };
    fetchProfile();
    fetchMemories();
    fetchLetters();
    checkOracle(); 
  }, [user, fetchMemories, fetchLetters, checkOracle]);

  const syncToCloud = async (updates: any) => { if (!user) return; await supabase.from('profiles').update(updates).eq('id', user.id); };
  const addResonance = (amount: number) => { setResonance(prev => { const next = prev + amount; localStorage.setItem('spirit_resonance', next.toString()); syncToCloud({ resonance: next }); return next; }); };
  const unlockArtifact = (item: Artifact) => { if (ownedItems.includes(item.id)) return; if (resonance < item.cost) { alert("Not enough resonance"); return; } const newRes = resonance - item.cost; const newInv = [...ownedItems, item.id]; setResonance(newRes); setOwnedItems(newInv); syncToCloud({ resonance: newRes, inventory: newInv }); triggerSuccess(); };
  const equipArtifact = (item: Artifact) => { if (!ownedItems.includes(item.id)) return; setEquippedItems(prev => { const nextState = { ...prev }; if (nextState[item.type] === item.id) { nextState[item.type] = null; } else { nextState[item.type] = item.id; } syncToCloud({ equipment: nextState }); return nextState; }); };
  const generateMonthlyLetter = async () => { if (!user) return; const today = new Date(); const monthStr = `${today.getFullYear()}-${today.getMonth() + 1}`; const existing = letters.find(l => l.month === monthStr); if (existing) return; try { await fetch('/api/soul-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, month: monthStr }) }); fetchLetters(); triggerSuccess(); } catch (e) { console.error(e); } };
  const saveVoiceCapsule = async (audioBlob: Blob, summary: string, unlockDate: string) => { if (!user) return; try { const fileName = `${user.id}/${Date.now()}.webm`; const { error: uploadError } = await supabase.storage.from('capsules').upload(fileName, audioBlob); if (uploadError) throw uploadError; const { data: { publicUrl } } = supabase.storage.from('capsules').getPublicUrl(fileName); const { error: dbError } = await supabase.from('memories').insert({ user_id: user.id, summary: summary || "Voice from the past", emotion: 'neutral', audio_url: publicUrl, is_capsule: true, unlock_date: unlockDate }); if (dbError) throw dbError; triggerSuccess(); fetchMemories(); } catch (error) { console.error("Capsule Save Failed:", error); alert("캡슐을 묻는 도중 문제가 발생했습니다."); } };

  // [New] Resonance 변경 시 자동 진화 로직 (원하면 활성화, 지금은 수동 변경만)
  useEffect(() => {
    // 초기 로드 시 resonance에 맞춰서 자동 설정 (사용자 설정이 없을 경우)
    if (resonance >= 300 && spiritForm === 'wisp') setSpiritForm('guardian');
    else if (resonance >= 100 && resonance < 300 && spiritForm === 'wisp') setSpiritForm('fox');
    }, [resonance]); // *주의: 너무 자주 바뀌지 않게 로직 조절 필요. 여기서는 심플하게 둠.

    // [New] Change Form Function
    const changeSpiritForm = (form: SpiritFormType) => {
        const target = SPIRIT_FORMS.find(f => f.id === form);
        if (target && resonance >= target.minResonance) {
            setSpiritForm(form);
            triggerSuccess();
            // Save to local storage or DB if needed
            localStorage.setItem('spirit_form', form);
        } else {
            alert("아직 영혼의 공명이 부족합니다.");
        }
    };

    // Load saved form on mount
    useEffect(() => {
        const savedForm = localStorage.getItem('spirit_form') as SpiritFormType;
        if (savedForm) setSpiritForm(savedForm);
    }, []);

  return { 
      memories, fetchMemories, 
      letters, generateMonthlyLetter, generateWeeklyReport,
      resonance, addResonance, 
      ownedItems, equippedItems, 
      unlockArtifact, equipArtifact, 
      soulLevel, ARTIFACTS,
      saveVoiceCapsule,
      todaysCard, showOracleModal, confirmOracle,
      sendBottle, findRandomBottle, likeBottle, foundBottle, setFoundBottle, replyToBottle, 
      // 4. [Missing Fix] 여기가 빠져서 에러가 났습니다! (필수 복구)
      spiritForm, changeSpiritForm, SPIRIT_FORMS,showGalleryModal, setShowGalleryModal,
      monthlyMoods, fetchMonthlyMoods, spiritCapsules,      // 정령 보관함 데이터
      keepSpiritVoice,     // 정령 저장 함수
      forgetSpiritVoice, castBottle, pickUpBottle, sendWarmth,
  };
}