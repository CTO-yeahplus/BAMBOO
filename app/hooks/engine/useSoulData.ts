// app/hooks/engine/useSoulData.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
// [Fixed] Import from shared types
import { Memory, Artifact, ARTIFACTS, ArtifactType } from '../../types'; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useSoulData(user: any, triggerSuccess: () => void) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [resonance, setResonance] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>(['aura_firefly']);
  
  // [Fixed] Explicit Type for State
  const [equippedItems, setEquippedItems] = useState<Record<ArtifactType, string | null>>({ 
      aura: 'aura_firefly', 
      head: null 
  });
  
  const [soulLevel, setSoulLevel] = useState(1);

  // ... (useEffect for Load Data & Soul Level - Same as before) ...
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
            if (data.equipment) setEquippedItems(data.equipment); // Ensure DB matches Record<ArtifactType, string>
        }
    };
    fetchProfile();
    fetchMemories();
  }, [user]); // fetchMemories는 아래 정의됨

  const fetchMemories = useCallback(async () => {
      if (!user) return;
      const { data } = await supabase.from('memories').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setMemories(data);
  }, [user]);

  const syncToCloud = async (updates: any) => {
      if (!user) return;
      await supabase.from('profiles').update(updates).eq('id', user.id);
  };

  const addResonance = (amount: number) => {
      setResonance(prev => {
          const next = prev + amount;
          localStorage.setItem('spirit_resonance', next.toString());
          syncToCloud({ resonance: next });
          return next;
      });
  };

  const unlockArtifact = (item: Artifact) => {
      if (ownedItems.includes(item.id)) return;
      if (resonance < item.cost) { alert("Not enough resonance"); return; }
      const newRes = resonance - item.cost;
      const newInv = [...ownedItems, item.id];
      setResonance(newRes);
      setOwnedItems(newInv);
      syncToCloud({ resonance: newRes, inventory: newInv });
      triggerSuccess();
  };

  const equipArtifact = (item: Artifact) => {
      if (!ownedItems.includes(item.id)) return;
      
      setEquippedItems(prev => {
          // [Fixed] Safe Type Access with Record<ArtifactType, string | null>
          const nextState = { ...prev };
          if (nextState[item.type] === item.id) {
              nextState[item.type] = null;
          } else {
              nextState[item.type] = item.id;
          }
          syncToCloud({ equipment: nextState });
          return nextState;
      });
  };

  return { 
      memories, fetchMemories, 
      resonance, addResonance, 
      ownedItems, equippedItems, 
      unlockArtifact, equipArtifact, 
      soulLevel, ARTIFACTS 
  };
}