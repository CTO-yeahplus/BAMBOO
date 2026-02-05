// app/hooks/engine/useSoulData.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Memory, Artifact, ARTIFACTS, ArtifactType, ORACLE_DECK, OracleCard, WhisperBottle } from '../../types';
import { SpiritFormType, SPIRIT_FORMS } from '../../types'; // Import 추가

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SoulLetter {
    id: number;
    month: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export function useSoulData(user: any, triggerSuccess: () => void) {
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

  const sendBottle = async (content: string) => {
      if (!user) return;
      const { error } = await supabase.from('whisper_bottles').insert({
          user_id: user.id,
          content: content
      });
      if (!error) {
          triggerSuccess();
          addResonance(50);
      } else {
          console.error(error);
          alert("유리병을 띄우지 못했습니다.");
      }
  };

  const findRandomBottle = async () => {
      if (!user) return;
      const { data } = await supabase.from('whisper_bottles')
          .select('*')
          .neq('user_id', user.id)
          .limit(10)
          .order('created_at', { ascending: false });

      if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          setFoundBottle(random);
      } else {
          setFoundBottle({
              id: 0, content: "이 숲에 첫 번째 방문자가 되신 걸 환영합니다.", likes: 0, created_at: new Date().toISOString()
          });
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
      letters, generateMonthlyLetter, 
      resonance, addResonance, 
      ownedItems, equippedItems, 
      unlockArtifact, equipArtifact, 
      soulLevel, ARTIFACTS,
      saveVoiceCapsule,
      todaysCard, showOracleModal, confirmOracle,
      sendBottle, findRandomBottle, likeBottle, foundBottle, setFoundBottle,
      spiritForm, changeSpiritForm, SPIRIT_FORMS,showGalleryModal, setShowGalleryModal,
  };
}