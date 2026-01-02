import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  selectedDate?: string;
  onDateChange?: (offset: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, action, selectedDate, onDateChange }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-50 relative">
      <header className="flex-none sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 pt-safe">
        {/* Date Navigator */}
        {selectedDate && onDateChange && (
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <button 
                    onClick={() => onDateChange(-1)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar size={14} className="text-teal-600"/>
                    <span>{formatDate(selectedDate)}</span>
                    {isToday && <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded-full">오늘</span>}
                </div>
                <button 
                    onClick={() => onDateChange(1)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}

        {/* Page Title Bar */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {action && <div>{action}</div>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};