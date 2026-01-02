import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { DailyLog, UserProfile } from '../types';
import { getSkinCareAdvice } from '../services/geminiService';
import { Sun, Moon, Sparkles, MessageSquare } from 'lucide-react';
import { useHealthStore } from '../hooks/useHealthStore';

interface SkinCareProps {
  log: DailyLog;
  profile: UserProfile;
  onUpdateLog: (updates: Partial<DailyLog>) => void;
}

export const SkinCare: React.FC<SkinCareProps> = ({ log, profile, onUpdateLog }) => {
  const { selectedDate, changeDate } = useHealthStore();
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const toggleRoutine = (key: keyof typeof log.skinCare) => {
    onUpdateLog({
      skinCare: {
        ...log.skinCare,
        [key]: !log.skinCare[key]
      }
    });
  };

  const getAdvice = async () => {
      setLoading(true);
      const tip = await getSkinCareAdvice("복합성", "건조함, 트러블", "맑음", profile.birthDate); 
      setAdvice(tip);
      setLoading(false);
  };

  return (
    <Layout title="피부 관리" selectedDate={selectedDate} onDateChange={changeDate}>
      <div className="space-y-6">
        
        {/* Morning Routine */}
        <section className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
            <h3 className="font-bold text-orange-600 text-lg mb-4 flex items-center gap-2">
                <Sun size={20} /> 아침 루틴
            </h3>
            <div className="space-y-3">
                 <ToggleItem 
                    label="물 세안 & 폼 클렌징" 
                    sub="밤사이 쌓인 노폐물 제거"
                    checked={log.skinCare.morningWash} 
                    onChange={() => toggleRoutine('morningWash')} 
                 />
                 <ToggleItem 
                    label="머리 감기" 
                    sub="두피 쿨링 및 스타일링"
                    checked={log.skinCare.morningHair} 
                    onChange={() => toggleRoutine('morningHair')} 
                 />
            </div>
        </section>

        {/* Evening Routine */}
        <section className="bg-slate-800 p-5 rounded-2xl shadow-sm text-white">
            <h3 className="font-bold text-blue-200 text-lg mb-4 flex items-center gap-2">
                <Moon size={20} /> 저녁 루틴
            </h3>
            <div className="space-y-3">
                 <ToggleItem 
                    dark
                    label="샤워 & 바디 케어" 
                    sub="하루의 피로 씻어내기"
                    checked={log.skinCare.eveningShower} 
                    onChange={() => toggleRoutine('eveningShower')} 
                 />
                 <ToggleItem 
                    dark
                    label="꼼꼼한 이중 세안" 
                    sub="선크림, 메이크업 잔여물 제거"
                    checked={log.skinCare.eveningWash} 
                    onChange={() => toggleRoutine('eveningWash')} 
                 />
                 <ToggleItem 
                    dark
                    label="머리 감기 (선택)" 
                    sub="먼지가 많은 날엔 필수"
                    checked={log.skinCare.eveningHair} 
                    onChange={() => toggleRoutine('eveningHair')} 
                 />
            </div>
        </section>

        {/* AI Coach */}
        <section className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-pink-700 flex items-center gap-2">
                    <Sparkles size={18} /> 뷰티 코치
                </h3>
                <button 
                    onClick={getAdvice}
                    disabled={loading}
                    className="text-xs bg-pink-200 text-pink-800 px-3 py-1 rounded-full font-medium hover:bg-pink-300 transition"
                >
                    {loading ? '생각중...' : '오늘의 팁 받기'}
                </button>
             </div>
             
             <div className="bg-white/60 p-4 rounded-xl text-pink-900 text-sm leading-relaxed min-h-[80px] flex items-center">
                {advice ? (
                    <div className="flex gap-3">
                        <MessageSquare className="shrink-0 text-pink-400" size={20} />
                        {advice}
                    </div>
                ) : (
                    <span className="text-pink-400 italic">버튼을 눌러서 피부 상태, 나이, 날씨에 맞는 조언을 받아보세요.</span>
                )}
             </div>
        </section>
      </div>
    </Layout>
  );
};

const ToggleItem = ({ label, sub, checked, onChange, dark }: { label: string, sub: string, checked: boolean, onChange: () => void, dark?: boolean }) => (
    <div 
        onClick={onChange}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
            dark 
             ? (checked ? 'bg-blue-900/50 border border-blue-500' : 'bg-slate-700/50 border border-transparent hover:bg-slate-700')
             : (checked ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 border border-transparent hover:bg-slate-100')
        }`}
    >
        <div>
            <p className={`font-medium ${dark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
             checked 
              ? (dark ? 'bg-blue-500 border-blue-500' : 'bg-orange-500 border-orange-500')
              : (dark ? 'border-slate-500' : 'border-slate-300')
        }`}>
            {checked && <CheckIcon />}
        </div>
    </div>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);