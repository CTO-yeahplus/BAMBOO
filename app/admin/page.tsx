'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Lock, Activity, Users, CloudRain, Sun, Flame, Wind, RefreshCcw } from 'lucide-react';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Supabase Client (Admin 페이지용 단독 생성)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Data States
    const [totalMemories, setTotalMemories] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0); // Approximate
    const [emotionStats, setEmotionStats] = useState<any>({ rain: 0, ember: 0, snow: 0, clear: 0 });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    // 1. 보안 체크
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert("접근 권한이 없습니다.");
        }
    };

    // 2. 데이터 가져오기
    const fetchData = async () => {
        setLoading(true);
        try {
            // A. 전체 대화(Memories) 수
            const { count: memoryCount, error: countError } = await supabase
                .from('memories')
                .select('*', { count: 'exact', head: true });
            
            if (memoryCount) setTotalMemories(memoryCount);

            // B. 추정 사용자 수 (Unique User IDs in memories)
            // (Note: 실제로는 Profiles 테이블 카운트가 정확하지만, 여기선 memories로 추정)
            const { data: userData } = await supabase.from('memories').select('user_id');
            const uniqueUsers = new Set(userData?.map(d => d.user_id)).size;
            setTotalUsers(uniqueUsers);

            // C. 감정 날씨 통계 (Emotion Distribution)
            // emotion 컬럼이 'rain', 'ember', 'snow', 'clear'로 저장되어 있다고 가정
            // 만약 감정이 'sadness', 'happy' 등이라면 매핑 로직 필요
            const { data: emotions } = await supabase.from('memories').select('emotion');
            
            const stats = { rain: 0, ember: 0, snow: 0, clear: 0, neutral: 0 };
            emotions?.forEach((row: any) => {
                // 기존 앱 로직의 매핑을 따름 (예: sadness -> rain)
                // DB에 저장된 값이 raw emotion('sadness')인지 weather('rain')인지에 따라 조정 필요
                // 여기서는 weather type으로 저장되어 있다고 가정
                const key = row.emotion as keyof typeof stats;
                if (stats[key] !== undefined) stats[key]++;
                else stats.neutral++;
            });
            setEmotionStats(stats);

            // D. 최근 대화 로그 (최신 10개)
            const { data: logs } = await supabase
                .from('memories')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (logs) setRecentLogs(logs);

        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Charts Configuration ---
    const barData = {
        labels: ['Rain (Sad)', 'Ember (Anger)', 'Snow (Lonely)', 'Clear (Happy)'],
        datasets: [{
            label: 'Emotion Distribution',
            data: [emotionStats.rain, emotionStats.ember, emotionStats.snow, emotionStats.clear],
            backgroundColor: ['#60A5FA', '#F87171', '#E5E7EB', '#FBBF24'],
            borderRadius: 5,
        }],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Forest Weather Report', color: '#fff' }
        },
        scales: {
            y: { ticks: { color: '#888' }, grid: { color: '#333' } },
            x: { ticks: { color: '#888' }, grid: { display: false } }
        }
    };

    // --- Render: Login Screen ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 border border-white/10 rounded-2xl bg-[#121212] w-full max-w-sm">
                    <div className="flex justify-center mb-4"><Lock className="text-white/50" /></div>
                    <h1 className="text-center font-serif text-xl mb-2">The Watchtower</h1>
                    <input 
                        type="password" 
                        placeholder="Admin Secret Key" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/50 border border-white/20 p-3 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button type="submit" className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg font-bold transition-all">
                        Enter
                    </button>
                </form>
            </div>
        );
    }

    // --- Render: Dashboard ---
    return (
        <div className="min-h-screen bg-[#050505] text-[#e5e5e5] p-6 md:p-12 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-serif italic text-white/90 flex items-center gap-3">
                        <Activity className="text-purple-400" />
                        The Watchtower
                    </h1>
                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Bamboo Forest Admin Console</p>
                </div>
                <button onClick={fetchData} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Refresh Data">
                    <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </header>

            {/* 1. Key Metrics (KPI) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <StatCard label="Total Memories" value={totalMemories} icon={<Users size={20} className="text-blue-400" />} />
                <StatCard label="Active Travelers" value={totalUsers} icon={<Activity size={20} className="text-green-400" />} />
                <StatCard label="Dominant Weather" value={getDominantEmotion(emotionStats)} icon={<CloudRain size={20} className="text-gray-400" />} />
                <StatCard label="Server Status" value="Healthy" icon={<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />} />
            </div>

            {/* 2. Charts & Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* A. Weather Chart */}
                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6">User Emotion Analysis</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* B. Live Logs */}
                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl flex flex-col h-[400px]">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6">Recent Whispers (Anonymized)</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs hover:border-white/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${getEmotionColor(log.emotion)} bg-black/30`}>
                                        {log.emotion || 'Unknown'}
                                    </span>
                                    <span className="text-white/30">{new Date(log.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-white/80 line-clamp-2 font-serif italic">
                                    "{log.summary || log.content || '...No Content...'}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components & Functions ---

const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-[#121212] border border-white/10 p-5 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-lg">{icon}</div>
        <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-white/90 mt-1">{value}</p>
        </div>
    </div>
);

const getDominantEmotion = (stats: any) => {
    const max = Math.max(stats.rain, stats.ember, stats.snow, stats.clear);
    if (max === 0) return '-';
    if (max === stats.rain) return 'Rainy';
    if (max === stats.ember) return 'Fiery';
    if (max === stats.snow) return 'Snowy';
    return 'Clear';
};

const getEmotionColor = (emotion: string) => {
    if (emotion === 'rain' || emotion === 'sadness') return 'text-blue-400';
    if (emotion === 'ember' || emotion === 'anger') return 'text-red-400';
    if (emotion === 'snow' || emotion === 'loneliness') return 'text-gray-400';
    return 'text-yellow-400';
};