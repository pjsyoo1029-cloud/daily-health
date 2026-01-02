import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { DailyLog, ExerciseItem, UserProfile } from '../types';
import { getExerciseSuggestions } from '../services/geminiService';
import { Check, Plus, Clock, Dumbbell, Sparkles, Loader2 } from 'lucide-react';
import { useHealthStore } from '../hooks/useHealthStore';

interface ExerciseProps {
  log: DailyLog;
  profile: UserProfile;
  onAddExercise: (ex: ExerciseItem) => void;
  onToggleExercise: (id: string) => void;
}

const DEFAULT_ROUTINES: ExerciseItem[] = [
    { id: 'morning-stretch', name: '아침 기상 스트레칭', durationMinutes: 10, completed: false, type: 'stretch', timestamp: '' },
    { id: 'evening-stretch', name: '취침 전 릴렉스 스트레칭', durationMinutes: 15, completed: false, type: 'stretch', timestamp: '' },
    { id: 'back-health', name: '허리 강화 운동 (맥켄지)', durationMinutes: 10, completed: false, type: 'strength', timestamp: '' },
];

export const Exercise: React.FC<ExerciseProps> = ({ log, profile, onAddExercise, onToggleExercise }) => {
  const { selectedDate, changeDate } = useHealthStore();
  const [customName, setCustomName] = useState('');
  const [customDuration, setCustomDuration] = useState(30);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize default routines if not present for the day
  useEffect(() => {
     if(log.exercises.length === 0) {
         DEFAULT_ROUTINES.forEach(r => {
             // Create unique ID for this day instance
             onAddExercise({...r, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString()});
         });
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.date]); // Depend on log.date to re-init on day change

  const handleAddCustom = () => {
      if(!customName) return;
      onAddExercise({
          id: Math.random().toString(36).substr(2, 9),
          name: customName,
          durationMinutes: customDuration,
          completed: false,
          type: 'other',
          timestamp: new Date().toISOString()
      });
      setCustomName('');
  };

  const handleAiSuggest = async () => {
      if(!aiPrompt) return;
      setIsAiLoading(true);
      try {
          const suggestions = await getExerciseSuggestions(aiPrompt, profile.birthDate);
          suggestions.forEach((s: any) => {
               onAddExercise({
                  id: Math.random().toString(36).substr(2, 9),
                  name: s.name,
                  durationMinutes: s.durationMinutes,
                  completed: false,
                  type: s.type as any,
                  timestamp: new Date().toISOString()
              });
          });
          setAiPrompt('');
      } catch (e) {
          console.error(e);
      } finally {
          setIsAiLoading(false);
      }
  }

  return (
    <Layout title="운동 체크" selectedDate={selectedDate} onDateChange={changeDate}>
      <div className="space-y-8">
        
        {/* Daily Checklist */}
        <section>
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Check className="text-teal-600" /> 오늘의 루틴
          </h3>
          <div className="space-y-3">
            {log.exercises.map(ex => (
              <div 
                key={ex.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  ex.completed 
                  ? 'bg-teal-50 border-teal-200' 
                  : 'bg-white border-slate-100 hover:border-teal-300'
                }`}
                onClick={() => onToggleExercise(ex.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      ex.completed ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                  }`}>
                      {ex.completed && <Check size={14} className="text-white" />}
                  </div>
                  <div>
                      <p className={`font-medium ${ex.completed ? 'text-teal-800' : 'text-slate-800'}`}>{ex.name}</p>
                      <div className="flex gap-3 text-xs text-slate-500">
                           <span className="flex items-center gap-1"><Clock size={10}/> {ex.durationMinutes}분</span>
                           <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100">{ex.type}</span>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Manual Add */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Dumbbell size={18} /> 직접 추가
            </h3>
            <div className="flex gap-2 mb-2">
                <input 
                    type="text" 
                    placeholder="운동 이름 (예: 스쿼트 100회)" 
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="분" 
                    className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={customDuration}
                    onChange={e => setCustomDuration(Number(e.target.value))}
                />
            </div>
            <button 
                onClick={handleAddCustom}
                className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition"
            >
                추가하기
            </button>
        </section>

        {/* AI Recommendation */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" /> AI 운동 추천
            </h3>
            <p className="text-xs text-indigo-700 mb-3">
                현재 컨디션이나 필요한 운동 부위를 알려주세요.
            </p>
            <div className="flex gap-2">
                 <input 
                    type="text" 
                    placeholder="예: 허리가 뻐근해, 뱃살 빼고 싶어" 
                    className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    disabled={isAiLoading}
                />
                <button 
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center"
                >
                    {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : "추천"}
                </button>
            </div>
        </section>

      </div>
    </Layout>
  );
};