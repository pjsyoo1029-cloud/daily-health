import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { DailyLog, UserProfile, AppState } from '../types';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Scatter } from 'recharts';
import { Droplets, Flame, Target, Syringe, Scale } from 'lucide-react';
import { useHealthStore } from '../hooks/useHealthStore';

interface DashboardProps {
  log: DailyLog;
  profile: UserProfile;
  allLogs: AppState['logs'];
  onNavigate: (page: string) => void;
  onUpdateLog: (l: Partial<DailyLog>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ log, profile, allLogs, onNavigate, onUpdateLog }) => {
  const { selectedDate, changeDate } = useHealthStore();
  const [chartRange, setChartRange] = useState<'2w' | '4w'>('2w');

  // Safety checks for arrays
  const foods = log.foods || [];
  const exercises = log.exercises || [];

  const totalCalories = foods.reduce((acc, curr) => acc + curr.calories, 0);
  const totalExerciseMins = exercises.filter(e => e.completed).reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Prepare graph data
  const daysToShow = chartRange === '2w' ? 14 : 28;
  const graphData = Object.entries(allLogs)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-daysToShow)
    .map(([date, dayLog]) => ({
      name: date.slice(5), // MM-DD
      weight: (dayLog as DailyLog).weight || null,
      mounjaro: (dayLog as DailyLog).mounjaroDose ? (dayLog as DailyLog).weight : null, // Only has value if injected
    }));

  return (
    <Layout title="오늘의 요약" selectedDate={selectedDate} onDateChange={changeDate}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">안녕하세요, {profile.name}님!</h2>
              <div className="flex gap-2 text-sm opacity-90">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">
                      {profile.dietPhase === 'loss' ? '🔥 감량기' : '🧘 유지기'}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">
                      {profile.dietType === 'strict' ? '🥗 식단조절' : '🍚 일반식'}
                  </span>
              </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
               <Target size={120} />
          </div>
        </div>

        {/* Morning Weight Check */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <Scale size={18} className="text-teal-600"/> 모닝 체중 체크
                </h3>
                <p className="text-xs text-slate-500">
                    아침 공복에 측정하셨나요?
                </p>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={log.weight || ''}
                    onChange={(e) => onUpdateLog({ weight: Number(e.target.value) })}
                    className="text-2xl font-bold text-slate-800 w-20 border-b-2 border-slate-200 focus:border-teal-500 focus:outline-none text-right"
                    placeholder="0.0"
                    step="0.1"
                />
                <span className="text-sm font-medium text-slate-600">kg</span>
            </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => onNavigate('diet')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-teal-300 transition">
            <div className="flex items-center gap-2 mb-2 text-orange-500">
              <Flame size={20} />
              <span className="font-semibold text-sm">칼로리</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{Math.round(totalCalories)} <span className="text-sm font-normal text-slate-500">kcal</span></p>
          </div>

          <div onClick={() => onNavigate('exercise')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-teal-300 transition">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
              <ActivityIcon />
              <span className="font-semibold text-sm">운동 시간</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalExerciseMins} <span className="text-sm font-normal text-slate-500">분</span></p>
          </div>

          <div onClick={() => onNavigate('profile')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-teal-300 transition relative overflow-hidden">
             {/* Highlight if Mounjaro injected today */}
             {!!log.mounjaroDose && (
                 <div className="absolute top-0 right-0 p-2 text-purple-200">
                     <Syringe size={32} className="opacity-20" />
                 </div>
             )}
            <div className="flex items-center gap-2 mb-2 text-purple-500">
              <Syringe size={20} />
              <span className="font-semibold text-sm">마운자로</span>
            </div>
            <p className="text-md font-medium text-slate-800">
                {log.mounjaroDose ? `${log.mounjaroDose}mg 투여` : "오늘 투여 안함"}
            </p>
          </div>

           <div onClick={() => onNavigate('skin')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-teal-300 transition">
            <div className="flex items-center gap-2 mb-2 text-pink-500">
              <Droplets size={20} />
              <span className="font-semibold text-sm">피부 관리</span>
            </div>
            <p className="text-md font-medium text-slate-800">
               {log.skinCare.morningWash && log.skinCare.eveningWash ? "완벽해요! ✨" : "진행중..."}
            </p>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target size={20} className="text-teal-600" />
              체중 변화
            </h3>
            
            {/* 2w/4w Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-medium">
                <button 
                    onClick={() => setChartRange('2w')}
                    className={`px-3 py-1 rounded-md transition-all ${chartRange === '2w' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    2주
                </button>
                <button 
                    onClick={() => setChartRange('4w')}
                    className={`px-3 py-1 rounded-md transition-all ${chartRange === '4w' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    4주
                </button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {graphData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={graphData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  <Scatter dataKey="mounjaro" fill="#9333ea" r={4} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-400">
                  데이터를 더 입력하면 그래프가 표시됩니다.
               </div>
            )}
             <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-600"></div> 체중</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-600"></div> 마운자로 투여</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);