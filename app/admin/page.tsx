'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../utils/supabase'; // 경로 확인 필요
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
import { Activity, Users, CloudRain, RefreshCcw, ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ADMIN_EMAIL = 'cto@yeahplus.co.kr';

// 스켈레톤 UI 컴포넌트
const DashboardSkeleton = () => {
    return (
        <div className="fixed inset-0 z-[100] w-full h-full overflow-y-auto bg-[#050505] text-[#e5e5e5] font-sans">
            <div className="p-6 md:p-12 max-w-7xl mx-auto animate-pulse">
                <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
                    <div className="space-y-3">
                        <div className="h-8 w-48 bg-white/10 rounded-lg" />
                        <div className="h-4 w-32 bg-white/5 rounded-lg" />
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-full" />
                        <div className="w-10 h-10 bg-white/5 rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#121212] border border-white/5 p-5 rounded-xl h-32 flex flex-col justify-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-white/5 rounded" />
                                <div className="h-6 w-16 bg-white/10 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px]" />
                    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl h-[400px] flex flex-col gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-16 bg-white/5 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    // 1. 하이드레이션 매칭용 마운트 체크
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { user, loading: authLoading, signOut } = useAuth();
    
    const [dataLoading, setDataLoading] = useState(false);
    const [totalMemories, setTotalMemories] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [emotionStats, setEmotionStats] = useState<any>({ rain: 0, ember: 0, snow: 0, clear: 0 });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    const fetchData = async () => {
        if (!user || user.email !== ADMIN_EMAIL) return;

        setDataLoading(true);
        try {
            const { count: memoryCount } = await supabase.from('memories').select('*', { count: 'exact', head: true });
            if (memoryCount) setTotalMemories(memoryCount);

            const { data: userData } = await supabase.from('memories').select('user_id');
            const uniqueUsers = new Set(userData?.map(d => d.user_id)).size;
            setTotalUsers(uniqueUsers);

            const { data: emotions } = await supabase.from('memories').select('emotion');
            const stats = { rain: 0, ember: 0, snow: 0, clear: 0, neutral: 0 };
            emotions?.forEach((row: any) => {
                const key = row.emotion as keyof typeof stats;
                if (stats[key] !== undefined) stats[key]++;
                else stats.neutral++;
            });
            setEmotionStats(stats);

            const { data: logs } = await supabase
                .from('memories')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (logs) setRecentLogs(logs);

        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted && !authLoading && user?.email === ADMIN_EMAIL) {
            fetchData();
        }
    }, [isMounted, authLoading, user]);

    // 차트 데이터 및 옵션 정의
    const barData = useMemo(() => ({
        labels: ['Rain (Sad)', 'Ember (Anger)', 'Snow (Lonely)', 'Clear (Happy)'],
        datasets: [{
            label: 'Emotion Distribution',
            data: [emotionStats.rain, emotionStats.ember, emotionStats.snow, emotionStats.clear],
            backgroundColor: ['#60A5FA', '#F87171', '#E5E7EB', '#FBBF24'],
            borderRadius: 5,
        }],
    }), [emotionStats]);

    const barOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Forest Weather Report', color: '#fff' }
        },
        scales: {
            y: { ticks: { color: '#888' }, grid: { color: '#333' } },
            x: { ticks: { color: '#888' }, grid: { display: false } }
        }
    }), []);

    // 2. 마운트 전에는 null 반환 (필수)
    if (!isMounted) return null;

    // --- 1. 로딩 화면 (스켈레톤 적용) ---
    if (authLoading) {
        return <DashboardSkeleton />;
    }

    // --- 2. 접근 차단 화면 (CTO가 아닐 때) ---
    if (!user || user.email !== ADMIN_EMAIL) {
        return (
            <div className="fixed inset-0 z-[100] w-full h-full bg-[#050505] flex flex-col items-center justify-center text-white p-6 overflow-hidden">
                <ShieldAlert size={64} className="text-red-500 mb-6 animate-pulse" />
                <h1 className="text-2xl font-serif text-red-200 mb-2">Access Denied</h1>
                <p className="text-white/50 text-sm mb-8 text-center max-w-md leading-relaxed">
                    현재 로그인된 계정<br/>
                    <span className="text-white font-bold">{user?.email || 'Guest'}</span><br/>
                    은(는) 관리자 권한이 없습니다.
                </p>
                {user ? (
                    <button onClick={signOut} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                        <LogOut size={16} /> 다른 계정으로 로그인
                    </button>
                ) : (
                    <a href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95">
                        홈으로 돌아가기
                    </a>
                )}
            </div>
        );
    }

    // --- 3. 대시보드 화면 ---
    return (
        <div className="fixed inset-0 z-[100] w-full h-full overflow-y-auto bg-[#050505] text-[#e5e5e5] font-sans">
            <div className="p-6 md:p-12 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-serif italic text-white/90 flex items-center gap-3">
                            <Activity className="text-purple-400" />
                            The Watchtower
                        </h1>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                            Logged in as: <span className="text-green-400">{user.email}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchData} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" title="Refresh">
                            <RefreshCcw size={18} className={dataLoading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={signOut} className="p-2 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-400 transition-colors" title="Sign Out">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatCard label="Total Memories" value={totalMemories} icon={<Users size={20} className="text-blue-400" />} />
                    <StatCard label="Active Travelers" value={totalUsers} icon={<Activity size={20} className="text-green-400" />} />
                    <StatCard label="Dominant Weather" value={getDominantEmotion(emotionStats)} icon={<CloudRain size={20} className="text-gray-400" />} />
                    <StatCard label="Server Status" value="Healthy" icon={<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6">User Emotion Analysis</h3>
                        <div className="h-64 flex items-center justify-center relative w-full">
                            <Bar data={barData} options={barOptions as any} />
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl flex flex-col h-[500px]">
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6">Recent Whispers (Live)</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/5 text-xs hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${getEmotionColor(log.emotion)} bg-black/30`}>
                                            {log.emotion || 'Neutral'}
                                        </span>
                                        <span className="text-white/30 text-[10px]">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-white/80 line-clamp-3 font-serif italic leading-relaxed">
                                        "{log.summary || log.content || '...'}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Helper Functions ---
const StatCard = ({ label, value, icon }: any) => (
    <div className="bg-[#121212] border border-white/10 p-5 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
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