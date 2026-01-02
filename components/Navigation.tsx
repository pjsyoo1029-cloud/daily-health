import React from 'react';
import { Home, Utensils, Activity, Sparkles, User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: '홈', icon: Home },
    { id: 'diet', label: '식단', icon: Utensils },
    { id: 'exercise', label: '운동', icon: Activity },
    { id: 'skin', label: '관리', icon: Sparkles },
    { id: 'profile', label: '내 정보', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 pb-safe md:relative md:border-t-0 md:border-r md:w-20 md:flex-col md:h-screen md:py-8 z-50">
      <div className="flex justify-between md:flex-col md:gap-8 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};