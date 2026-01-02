import React, { useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { AppState, DailyLog, UserProfile, DietPhase, DietType } from '../types';
import { Camera, Save, Activity, Ruler, Scale, Loader2, Syringe, Settings, Calendar, User } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  log: DailyLog;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onUpdateLog: (l: Partial<DailyLog>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, log, onUpdateProfile, onUpdateLog }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bmi = (log.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const bmiNumber = parseFloat(bmi);
  let bmiStatus = '정상';
  let bmiColor = 'text-green-500';

  if (bmiNumber < 18.5) { bmiStatus = '저체중'; bmiColor = 'text-blue-500'; }
  else if (bmiNumber >= 23 && bmiNumber < 25) { bmiStatus = '과체중'; bmiColor = 'text-orange-500'; }
  else if (bmiNumber >= 25) { bmiStatus = '비만'; bmiColor = 'text-red-500'; }

  // Compress Image to save space
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(file);
        onUpdateLog({ bodyCheckImage: compressedBase64 });
      } catch (error) {
        console.error("Image processing failed", error);
        alert("이미지 처리에 실패했습니다.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target?.result as string;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const maxWidth = 800; // Limit width for mobile storage
                  const scaleSize = maxWidth / img.width;
                  const width = Math.min(maxWidth, img.width);
                  const height = img.height * (width === maxWidth ? scaleSize : 1);
                  
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if(!ctx) { reject("Canvas error"); return; }
                  
                  ctx.drawImage(img, 0, 0, width, height);
                  // Compress to JPEG with 0.7 quality
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                  resolve(dataUrl);
              }
              img.onerror = (err) => reject(err);
          }
          reader.onerror = (err) => reject(err);
      });
  }

  return (
    <Layout title="내 정보 & 평가">
      <div className="space-y-6">

        {/* Basic Info Input */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <User size={32} />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">이름 (닉네임)</label>
                    <input 
                        type="text" 
                        value={profile.name} 
                        onChange={e => onUpdateProfile({name: e.target.value})}
                        className="w-full border-b border-slate-200 py-1 font-bold text-xl focus:outline-none focus:border-teal-500 text-slate-800"
                        placeholder="이름을 입력하세요"
                    />
                </div>
             </div>
        </section>
        
        {/* Diet & Phase Settings */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings size={20} className="text-teal-600"/> 다이어트 목표 설정
            </h2>
            <div className="space-y-4">
                <div>
                    <span className="text-sm font-medium text-slate-700 block mb-2">현재 단계</span>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button 
                            onClick={() => onUpdateProfile({ dietPhase: 'loss' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${profile.dietPhase === 'loss' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            🔥 감량기
                        </button>
                        <button 
                            onClick={() => onUpdateProfile({ dietPhase: 'maintenance' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${profile.dietPhase === 'maintenance' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            🧘 유지기
                        </button>
                    </div>
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-700 block mb-2">식단 유형</span>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button 
                            onClick={() => onUpdateProfile({ dietType: 'strict' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${profile.dietType === 'strict' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            🥗 식단관리
                        </button>
                        <button 
                            onClick={() => onUpdateProfile({ dietType: 'general' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${profile.dietType === 'general' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                        >
                            🍚 일반식
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Mounjaro Management */}
        <section className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <h2 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                <Syringe size={20} /> 마운자로(Mounjaro) 관리
            </h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <label className="text-sm font-medium text-purple-900">오늘 주사를 맞으셨나요?</label>
                     <input 
                        type="checkbox" 
                        checked={!!log.mounjaroDose}
                        onChange={(e) => onUpdateLog({ mounjaroDose: e.target.checked ? 2.5 : 0 })} 
                        className="w-5 h-5 accent-purple-600"
                     />
                </div>
                {!!log.mounjaroDose && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-sm text-purple-700">용량:</span>
                        <input 
                            type="number" 
                            value={log.mounjaroDose} 
                            onChange={(e) => onUpdateLog({ mounjaroDose: Number(e.target.value) })}
                            className="w-20 border border-purple-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                            step="0.5"
                        />
                        <span className="text-sm text-purple-700">mg</span>
                    </div>
                )}
                 <div className="pt-2 border-t border-purple-100">
                    <label className="text-xs text-purple-600 block mb-1">시작일 (2개월 관리용)</label>
                    <input 
                        type="date"
                        value={profile.mounjaroStartDate || ''}
                        onChange={(e) => onUpdateProfile({ mounjaroStartDate: e.target.value })}
                        className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-purple-900"
                    />
                    <p className="text-[10px] text-purple-500 mt-1">
                        * 마운자로는 2개월 동안 권장되며, 이후엔 식단과 운동으로 관리합니다.
                    </p>
                </div>
            </div>
        </section>

        {/* Profile Stats */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">신체 정보</h2>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1 col-span-2">
                    <label className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12}/> 생년월일</label>
                    <input 
                        type="date" 
                        value={profile.birthDate} 
                        onChange={e => onUpdateProfile({birthDate: e.target.value})}
                        className="w-full border-b border-slate-200 py-1 font-semibold text-lg focus:outline-none focus:border-teal-500"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1"><Ruler size={12}/> 키 (cm)</label>
                    <input 
                        type="number" 
                        value={profile.height} 
                        onChange={e => onUpdateProfile({height: Number(e.target.value)})}
                        className="w-full border-b border-slate-200 py-1 font-semibold text-lg focus:outline-none focus:border-teal-500"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1"><Scale size={12}/> 현재 체중 (kg)</label>
                    <input 
                        type="number" 
                        value={log.weight} 
                        onChange={e => onUpdateLog({weight: Number(e.target.value)})}
                        className="w-full border-b border-slate-200 py-1 font-semibold text-lg focus:outline-none focus:border-teal-500"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1"><Activity size={12}/> 목표 체중 (kg)</label>
                    <input 
                        type="number" 
                        value={profile.targetWeight} 
                        onChange={e => onUpdateProfile({targetWeight: Number(e.target.value)})}
                        className="w-full border-b border-slate-200 py-1 font-semibold text-lg focus:outline-none focus:border-teal-500"
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-500">수면 시간 (시간)</label>
                    <input 
                        type="number" 
                        value={log.sleepHours} 
                        onChange={e => onUpdateLog({sleepHours: Number(e.target.value)})}
                        className="w-full border-b border-slate-200 py-1 font-semibold text-lg focus:outline-none focus:border-teal-500"
                    />
                </div>
            </div>
        </section>

        {/* BMI Card */}
        <section className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-center">
                 <div>
                     <p className="text-slate-400 text-sm mb-1">나의 BMI 지수</p>
                     <p className="text-4xl font-bold">{bmi}</p>
                 </div>
                 <div className="text-right">
                     <p className={`text-2xl font-bold ${bmiColor}`}>{bmiStatus}</p>
                     <p className="text-slate-400 text-xs mt-1">건강한 생활 습관을 유지하세요!</p>
                 </div>
             </div>
             {/* Decorative circle */}
             <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </section>

        {/* Weekly Body Check */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={20} className="text-teal-600"/> 주간 눈바디
                </h3>
                <span className="text-xs text-slate-400">1주일에 한 번 기록하세요</span>
            </div>
            
            <div 
                className="w-full aspect-[4/3] bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" size={24}/>
                        <span className="text-xs">이미지 최적화 중...</span>
                    </div>
                ) : log.bodyCheckImage ? (
                    <>
                        <img src={log.bodyCheckImage} alt="Body Check" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white font-medium flex items-center gap-2"><Camera size={16}/> 사진 변경</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                         <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                            <Camera size={24}/>
                         </div>
                         <p className="text-slate-500 font-medium text-sm">사진을 탭하여 업로드</p>
                         <p className="text-xs text-slate-400 mt-1">저장 공간 절약을 위해 압축됩니다.</p>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
            </div>
        </section>
      </div>
    </Layout>
  );
};