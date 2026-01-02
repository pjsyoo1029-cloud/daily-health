import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { DailyLog, FoodItem, MealType } from '../types';
import { analyzeFoodInput, getDietSuggestion } from '../services/geminiService';
import { Plus, Trash2, Loader2, Info, ChefHat, Sparkles, Sun, Moon, Coffee, Sunrise } from 'lucide-react';
import { useHealthStore } from '../hooks/useHealthStore';

interface DietProps {
  log: DailyLog;
  onAddFood: (foods: FoodItem[]) => void;
  onRemoveFood: (id: string) => void;
}

const MEAL_TYPES: { id: MealType; label: string; icon: React.FC<any> }[] = [
    { id: 'breakfast', label: '아침', icon: Sunrise },
    { id: 'lunch', label: '점심', icon: Sun },
    { id: 'dinner', label: '저녁', icon: Moon },
    { id: 'snack', label: '간식', icon: Coffee },
];

export const Diet: React.FC<DietProps> = ({ log, onAddFood, onRemoveFood }) => {
  const { selectedDate, changeDate, state } = useHealthStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  
  // Suggestion State
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const foods = log.foods || [];

  const handleAddFood = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeFoodInput(input);
      if (result.length > 0) {
        const newFoods: FoodItem[] = result.map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          mealType: selectedMeal, // Assign selected category
          timestamp: new Date().toISOString()
        }));
        onAddFood(newFoods);
        setInput('');
      } else {
        alert("음식 정보를 찾을 수 없습니다. 다시 시도해주세요.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestion = async () => {
      setIsSuggesting(true);
      const totalCals = foods.reduce((acc, f) => acc + f.calories, 0);
      const result = await getDietSuggestion(state.profile, totalCals);
      setSuggestion(result || "추천을 가져오지 못했습니다.");
      setIsSuggesting(false);
  };

  const totalCals = foods.reduce((acc, f) => acc + f.calories, 0);

  // Group foods by meal type
  const foodsByMeal = MEAL_TYPES.map(type => {
      const filteredFoods = foods.filter(f => (f.mealType || 'breakfast') === type.id); // Default to breakfast for legacy data
      const cals = filteredFoods.reduce((acc, f) => acc + f.calories, 0);
      return { ...type, foods: filteredFoods, cals };
  });

  return (
    <Layout title="식단 기록" selectedDate={selectedDate} onDateChange={changeDate}>
      <div className="space-y-6">
        
        {/* Total Calories Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-teal-600 animate-pulse-slow">{Math.round(totalCals)}</h2>
            <p className="text-slate-500 text-sm">오늘 총 섭취 칼로리</p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          
          {/* Meal Type Selector */}
          <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">언제 드셨나요?</label>
              <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedMeal === type.id;
                      return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedMeal(type.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
                                isSelected 
                                ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm transform scale-105' 
                                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                              <Icon size={20} className="mb-1" strokeWidth={isSelected ? 2.5 : 2}/>
                              <span className="text-xs font-medium">{type.label}</span>
                          </button>
                      )
                  })}
              </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">메뉴 입력</label>
            <div className="flex gap-2">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFood()}
                placeholder={`${MEAL_TYPES.find(t => t.id === selectedMeal)?.label} 메뉴를 입력하세요 (예: 사과 1개)`}
                className="flex-1 rounded-lg border-slate-200 border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-slate-50"
                disabled={isLoading}
                />
                <button
                onClick={handleAddFood}
                disabled={isLoading}
                className="bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center shadow-md shadow-teal-200"
                >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <Info size={10}/> AI가 자동으로 영양성분을 분석합니다.
            </p>
          </div>
        </div>

        {/* AI Suggestion Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                    <ChefHat size={20} /> AI 식단 추천
                </h3>
                <span className="text-xs text-emerald-600 bg-white/50 px-2 py-1 rounded-full border border-emerald-100">
                    {state.profile.dietPhase === 'loss' ? '감량기' : '유지기'}
                </span>
            </div>
            
            {!suggestion ? (
                <div className="text-center py-2">
                    <button 
                        onClick={handleGetSuggestion}
                        disabled={isSuggesting}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2 mx-auto shadow-sm"
                    >
                        {isSuggesting ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                        다음 끼니 추천받기
                    </button>
                </div>
            ) : (
                <div className="bg-white/80 p-4 rounded-xl text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap shadow-sm">
                    {suggestion}
                    <button 
                        onClick={() => setSuggestion('')}
                        className="block w-full mt-3 text-xs text-emerald-500 hover:text-emerald-700 text-center font-medium"
                    >
                        닫기
                    </button>
                </div>
            )}
        </div>

        {/* Food List by Meal Type */}
        <div className="space-y-4">
            {foodsByMeal.map((section) => (
                <div key={section.id} className="animate-fadeIn">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            {React.createElement(section.icon, { size: 18, className: "text-slate-400" })}
                            {section.label}
                        </h3>
                        {section.cals > 0 && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {Math.round(section.cals)} kcal
                            </span>
                        )}
                    </div>
                    
                    {section.foods.length === 0 ? (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                            기록된 {section.label} 식사가 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {section.foods.map((food) => (
                                <div key={food.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group transition-transform active:scale-[0.99]">
                                    <div>
                                        <h4 className="font-medium text-slate-800 text-sm">{food.name}</h4>
                                        <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                                            <span className="font-semibold text-teal-600">{food.calories} kcal</span>
                                            <span className="w-px h-3 bg-slate-200"></span>
                                            <span>탄 {food.carbs}g</span>
                                            <span>단 {food.protein}g</span>
                                            <span>지 {food.fat}g</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveFood(food.id)}
                                        className="text-slate-300 hover:text-red-500 transition p-2 bg-slate-50 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};