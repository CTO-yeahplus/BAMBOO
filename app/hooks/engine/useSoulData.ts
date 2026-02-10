// app/hooks/engine/useSoulData.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase'; 
import { Memory, Artifact, ARTIFACTS, ORACLE_DECK, OracleCard, WhisperBottle, SANCTUARY_ITEMS } from '../../types';
import { SpiritFormType, SPIRIT_FORMS, DailyMood, EMOTION_COLORS } from '../../types'; 

export interface SoulLetter {
    id: number;
    month: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export function useSoulData(user: any, triggerSuccess: () => void, isPremium: boolean) {
  // --- [State Definition] ---
  const [resonance, setResonance] = useState(0);
  const [totalResonance, setTotalResonance] = useState(0); 
  const [soulLevel, setSoulLevel] = useState(1);
  const [oracleHistory, setOracleHistory] = useState<any[]>([]);
  
  // Inventory & Equipment
  const [ownedItems, setOwnedItems] = useState<string[]>(['form_wisp']);
  const [equippedItems, setEquippedItems] = useState<{
    atmosphere: string | null;   
    artifacts: string[];         
    spirit_form: string;         
  }>({
    atmosphere: null,
    artifacts: [],
    spirit_form: 'spirit' 
  });

  // Data States
  const [memories, setMemories] = useState<Memory[]>([]);
  const [letters, setLetters] = useState<SoulLetter[]>([]); 
  const [spiritCapsules, setSpiritCapsules] = useState<any[]>([]);
  const [monthlyMoods, setMonthlyMoods] = useState<DailyMood[]>([]);

  // Spirit Form & Gallery
  const [spiritForm, setSpiritForm] = useState<SpiritFormType>('wisp');
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Oracle State (복구됨)
  const [todaysCard, setTodaysCard] = useState<OracleCard | null>(null);
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [isOracleLoading, setIsOracleLoading] = useState(false); // [New] 로딩 상태

  // Bottle State
  const [foundBottle, setFoundBottle] = useState<WhisperBottle | null>(null);

  // --- [Data Fetching & Init] ---

  // 1. 프로필 및 인벤토리 로드 (안전 병합 로직 포함)
  useEffect(() => {
    if (!user) {
        const localRes = localStorage.getItem('spirit_resonance');
        if (localRes) setResonance(parseInt(localRes));
        return;
    }

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if (data) {
            setResonance(data.resonance || 0);
            
            // 인벤토리 로드
            if (data.inventory) {
                setOwnedItems(data.inventory);
            } else {
                setOwnedItems(['form_wisp']);
            }

            // 장비 데이터 안전 병합 (Migration Logic)
            const loaded = data.equipment || {}; 

            setEquippedItems({
                atmosphere: loaded.atmosphere || null,
                artifacts: Array.isArray(loaded.artifacts) ? loaded.artifacts : [], // 배열 보장
                spirit_form: loaded.spirit_form || 'spirit'
            });

            // 저장된 Spirit Form이 있으면 적용
            if (loaded.spirit_form) {
                // 타입 호환성 체크 (간단히)
                const validForms = SPIRIT_FORMS.map(f => f.id);
                if (validForms.includes(loaded.spirit_form)) {
                    setSpiritForm(loaded.spirit_form as SpiritFormType);
                }
            }
        }
    };

    fetchProfile();
    fetchMemories();
    fetchLetters();
    checkOracle(); // 오라클 기록 확인
  }, [user]); // 의존성 배열 간소화

  // 2. 기본 데이터 Fetch 함수들
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

  // 🌟 [New] 기억 생성 (Create)
  const createMemory = async (content: string, summary?: string, emotion: string = 'neutral') => {
      if (!user) return;
      try {
          const { error } = await supabase.from('memories').insert({
              user_id: user.id,
              content: content,
              summary: summary || content.slice(0, 50),
              emotion: emotion,
              is_capsule: false
          });
          
          if (error) throw error;
          
          console.log("✅ Memory Created");
          fetchMemories(); // 목록 갱신
          triggerSuccess(); // 햅틱 피드백
      } catch (e) {
          console.error("Failed to create memory:", e);
      }
  };

  // 🌟 [New] 기억 삭제 (Delete)
  const deleteMemory = async (id: number) => {
      try {
          const { error } = await supabase.from('memories').delete().eq('id', id);
          if (error) throw error;
          
          console.log("🗑️ Memory Deleted:", id);
          fetchMemories(); // 목록 갱신
      } catch (e) {
          console.error("Failed to delete memory:", e);
      }
  };

  // --- [Oracle Logic (Restored)] ---

  // A. 오늘 이미 뽑았는지 확인 (단순 체크)
  const checkOracle = useCallback(async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      // DB에서 오늘 날짜 기록 확인
      const { data } = await supabase
          .from('oracle_history')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();
      
      if (data) {
          // 이미 뽑았다면 해당 카드 세팅
          const card = ORACLE_DECK.find(c => c.id === data.card_id);
          if (card) setTodaysCard(card);
      }
  }, [user]);

  // B. 카드 뽑기 액션 (버튼 클릭 시 실행)
  const drawOracleCard = async () => {
      if (!user || todaysCard) return; // 이미 뽑았으면 중단
      
      setIsOracleLoading(true);

      // 1. 랜덤 카드 선택
      const randomCard = ORACLE_DECK[Math.floor(Math.random() * ORACLE_DECK.length)];
      
      // 2. 연출을 위한 딜레이 (2초)
      await new Promise(r => setTimeout(r, 2000));
      
      setTodaysCard(randomCard);
      setIsOracleLoading(false);

      // 3. DB 저장 (오늘 날짜로 기록)
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('oracle_history').insert({
          user_id: user.id,
          card_id: randomCard.id,
          date: today
      });
      
      // 4. 보상 (공명 +50)
      addResonance(50);
      triggerSuccess();
  };

  const confirmOracle = async () => {
      // 모달 닫기 용도
      setShowOracleModal(false);
  };


  // --- [Bottle Logic] ---

  // 1. 유리병 띄우기
  const castBottle = async (content: string) => {
    if (!user) return;
    try {
        const { error } = await supabase.from('whisper_bottles').insert({
            user_id: user.id,
            content: content,
            likes: 0
        });
        if (error) throw error;
        alert("유리병이 파도에 실려 먼 바다로 떠났습니다.");
        addResonance(30); // 소량 보상
    } catch (err) {
        console.error(err);
        alert("유리병을 띄우는데 실패했습니다.");
    }
  };

  // 2. 유리병 줍기
  const pickUpBottle = async () => {
    if (!user) return null;
    try {
        const { data, error } = await supabase.rpc('get_random_bottle');
        if (error) throw error;
        
        if (data && data.length > 0) {
            return data[0]; 
        } else {
            return null;
        }
    } catch (err) {
        console.error("Bottle Pickup Error:", err);
        return null;
    }
  };

  // 3. 온기 보내기 (좋아요)
  const sendWarmth = async (bottleId: number, currentLikes: number) => {
    try {
        await supabase.from('whisper_bottles').update({ likes: currentLikes + 1 }).eq('id', bottleId);
    } catch (err) {
        console.error("Warmth Error:", err);
    }
  };

  const sendBottle = async (content: string, isDistress: boolean = false) => {
    if (!user) return;
    const { error } = await supabase.from('whisper_bottles').insert({
        user_id: user.id,
        content: content,
        is_distress: isDistress,
        likes: 0
    });
    if (!error) {
        triggerSuccess();
        addResonance(50);
    } else {
        alert("유리병을 띄우지 못했습니다.");
    }
  };

  const findRandomBottle = async () => {
    if (!user) return;
    
    let query = supabase.from('whisper_bottles')
        .select('*')
        .neq('user_id', user.id)
        .is('reply_audio_url', null)
        .limit(10);

    if (isPremium) {
        query = query.order('is_distress', { ascending: false });
    }
    
    const { data } = await query.order('created_at', { ascending: false });

    if (data && data.length > 0) {
        const poolSize = Math.min(data.length, 5);
        const random = data[Math.floor(Math.random() * poolSize)];
        setFoundBottle(random);
    } else {
        const defaultMessages = ["이 숲에 도착한 유리병이 아직 없습니다.", "바람이 잠잠하네요."];
        const randomMsg = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        setFoundBottle({ id: 0, content: randomMsg, likes: 0, created_at: new Date().toISOString(), is_distress: false });
    }
  };

  const likeBottle = async (bottleId: number) => {
      if (!foundBottle) return;
      setFoundBottle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      
      const { error } = await supabase.rpc('increment_bottle_likes', { bottle_id: bottleId });
      if (error) {
          const { data } = await supabase.from('whisper_bottles').select('likes').eq('id', bottleId).single();
          if (data) await supabase.from('whisper_bottles').update({ likes: data.likes + 1 }).eq('id', bottleId);
      }
      triggerSuccess();
  };

  const replyToBottle = async (bottleId: number, audioBlob: Blob) => {
    if (!user) return;
    try {
        const fileName = `replies/${bottleId}_${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from('capsules').upload(fileName, audioBlob);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('capsules').getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('whisper_bottles').update({ reply_audio_url: publicUrl, reply_author_id: user.id }).eq('id', bottleId);
        if (dbError) throw dbError;

        triggerSuccess();
        addResonance(100);
    } catch (e) {
        console.error("Reply Failed:", e);
        alert("답장을 보내지 못했습니다.");
    }
  };


  // --- [Economy & Inventory Logic] ---

  const syncToCloud = async (updates: any) => { if (!user) return; await supabase.from('profiles').update(updates).eq('id', user.id); };
  
  const addResonance = (amount: number) => { 
      setResonance(prev => { 
          const next = prev + amount; 
          localStorage.setItem('spirit_resonance', next.toString()); 
          syncToCloud({ resonance: next }); 
          return next; 
      }); 
  };

  // 아이템 해금 (구매)
  const unlockArtifact = async (itemId: string) => {
      const item = SANCTUARY_ITEMS.find(i => i.id === itemId);
      if (!item) return;

      if (ownedItems.includes(itemId)) {
          alert("이미 영혼에 귀속된 물건입니다.");
          return;
      }

      if (resonance < item.cost) {
          alert("공명(Resonance)이 부족합니다.");
          return;
      }

      const newResonance = resonance - item.cost;
      const newOwned = [...ownedItems, itemId];

      setResonance(newResonance);
      setOwnedItems(newOwned);
      triggerSuccess();

      if (user) {
          await supabase.from('profiles').update({ 
              resonance: newResonance,
              inventory: newOwned 
          }).eq('id', user.id);
      }
  };

  // 아이템 장착/해제
  const equipArtifact = async (itemId: string, type: 'atmosphere' | 'artifact' | 'spirit_form') => {
      const newEquipped = { ...equippedItems };

      if (type === 'artifact') {
          if (newEquipped.artifacts.includes(itemId)) {
              newEquipped.artifacts = newEquipped.artifacts.filter(id => id !== itemId);
          } else {
              newEquipped.artifacts.push(itemId);
          }
      } else if (type === 'atmosphere') {
           newEquipped.atmosphere = newEquipped.atmosphere === itemId ? null : itemId;
      } else if (type === 'spirit_form') {
           newEquipped.spirit_form = itemId;
      }

      setEquippedItems(newEquipped);
      
      if (user) {
           await supabase.from('profiles').update({ 
              equipped: newEquipped 
          }).eq('id', user.id);
      }
  };

  // Spirit Form Logic
  const changeSpiritForm = (form: SpiritFormType) => {
    const target = SPIRIT_FORMS.find(f => f.id === form);
    if (target && resonance >= target.minResonance) {
        setSpiritForm(form);
        // 장착 상태도 업데이트
        equipArtifact(form, 'spirit_form');
        triggerSuccess();
    } else {
        alert("아직 영혼의 공명이 부족합니다.");
    }
  };


  // --- [Capsules & Reports Logic] ---

  // Load Spirit Capsules
  useEffect(() => {
      const saved = localStorage.getItem('spirit_capsules');
      if (saved) setSpiritCapsules(JSON.parse(saved));
  }, []);

  const keepSpiritVoice = (text: string) => {
      const newCap = { id: Date.now().toString(), text, created_at: new Date().toISOString() };
      const updated = [newCap, ...spiritCapsules];
      setSpiritCapsules(updated);
      localStorage.setItem('spirit_capsules', JSON.stringify(updated));
      alert("정령의 속삭임을 기억 조각으로 보관했습니다.");
  };

  const forgetSpiritVoice = (id: string) => {
      const updated = spiritCapsules.filter(c => c.id !== id);
      setSpiritCapsules(updated);
      localStorage.setItem('spirit_capsules', JSON.stringify(updated));
  };

  const saveVoiceCapsule = async (audioBlob: Blob, summary: string, unlockDate: string) => { 
      if (!user) return; 
      try { 
          const fileName = `${user.id}/${Date.now()}.webm`; 
          const { error: uploadError } = await supabase.storage.from('capsules').upload(fileName, audioBlob); 
          if (uploadError) throw uploadError; 
          const { data: { publicUrl } } = supabase.storage.from('capsules').getPublicUrl(fileName); 
          const { error: dbError } = await supabase.from('memories').insert({ user_id: user.id, summary: summary || "Voice from the past", emotion: 'neutral', audio_url: publicUrl, is_capsule: true, unlock_date: unlockDate }); 
          if (dbError) throw dbError; 
          triggerSuccess(); 
          fetchMemories(); 
      } catch (error) { 
          console.error("Capsule Save Failed:", error); 
          alert("캡슐을 묻는 도중 문제가 발생했습니다."); 
      } 
  };

  const generateWeeklyReport = async () => {
    if (!user) return;
    try {
        await fetch('/api/soul-report/weekly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
        fetchLetters();
    } catch (e) { console.error(e); }
  };

  const generateMonthlyLetter = async () => { 
      if (!user) return; 
      const today = new Date(); 
      const monthStr = `${today.getFullYear()}-${today.getMonth() + 1}`; 
      const existing = letters.find(l => l.month === monthStr); 
      if (existing) return; 
      try { 
          await fetch('/api/soul-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, month: monthStr }) }); 
          fetchLetters(); 
          triggerSuccess(); 
      } catch (e) { console.error(e); } 
  };

  // --- [Calendar Data Logic] ---
  const fetchMonthlyMoods = useCallback(async (year: number, month: number) => {
      if (!user) return;
      try {
        console.log(`📡 Fetching moods for ${year}-${month}...`); // [Log] 요청 시작
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0).toISOString();

        const { data, error } = await supabase // supabase 싱글톤 사용 확인!
            .from('memories')
            .select('created_at, emotion, summary')
            .eq('user_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) {
            console.error("❌ Fetch Error:", error); // [Log] 에러 확인
            return;
        }

        console.log("✅ Fetched Data:", data); // [Log] 데이터 확인 (여기에 데이터가 있어야 함)

        //const { data } = await supabase.from('memories').select('created_at, emotion, summary').eq('user_id', user.id).gte('created_at', startDate).lte('created_at', endDate);

        if (!data) return;

        const grouped: Record<string, { emotions: string[], summaries: string[] }> = {};
        data.forEach((m: any) => {
            const dateStr = new Date(m.created_at).toLocaleDateString('en-CA');
            if (!grouped[dateStr]) grouped[dateStr] = { emotions: [], summaries: [] };
            if (m.emotion) grouped[dateStr].emotions.push(m.emotion);
            if (m.summary) grouped[dateStr].summaries.push(m.summary);
        });

        const moods: DailyMood[] = Object.keys(grouped).map(date => {
            const dayData = grouped[date];
            const emotionCounts: Record<string, number> = {};
            dayData.emotions.forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
            
            let dominant = 'neutral';
            let max = 0;
            for (const [e, count] of Object.entries(emotionCounts)) {
                if (count > max) { max = count; dominant = e; }
            }
            return { date, dominantEmotion: dominant as any, intensity: Math.min(dayData.emotions.length, 3), summary: dayData.summaries[dayData.summaries.length - 1] || "기록된 대화가 없습니다.", count: dayData.emotions.length };
        });
        setMonthlyMoods(moods);
    } catch (err: any) {
        // 💡 [Fix] AbortError는 조용히 무시합니다.
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            console.log('Fetch aborted cleanly');
        } else {
            console.error("Fetch Error:", err);
        }
    }
  }, [user]);

  // 레벨 계산
  useEffect(() => {
      const level = Math.floor(Math.sqrt(totalResonance / 100)) + 1;
      setSoulLevel(level);
  }, [totalResonance]);

  return { 
      // Memories & Letters
      memories, fetchMemories, 
      createMemory, deleteMemory,
      letters, generateMonthlyLetter, generateWeeklyReport,
      
      // Economy & Items
      resonance, addResonance, 
      ownedItems, equippedItems, 
      unlockArtifact, equipArtifact, 
      soulLevel, ARTIFACTS,
      
      // Capsules
      saveVoiceCapsule,
      
      // Oracle (복구 & 수정됨)
      todaysCard, showOracleModal, confirmOracle, drawOracleCard, isOracleLoading,
      
      // Bottle
      sendBottle, findRandomBottle, likeBottle, foundBottle, setFoundBottle, replyToBottle, castBottle, pickUpBottle, sendWarmth,
      
      // Spirit Form & Gallery
      spiritForm, changeSpiritForm, SPIRIT_FORMS, showGalleryModal, setShowGalleryModal,
      spiritCapsules, keepSpiritVoice, forgetSpiritVoice,
      
      // Calendar
      monthlyMoods, fetchMonthlyMoods, oracleHistory
  };
}