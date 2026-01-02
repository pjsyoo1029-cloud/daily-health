import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Diet } from './pages/Diet';
import { Exercise } from './pages/Exercise';
import { SkinCare } from './pages/SkinCare';
import { Profile } from './pages/Profile';
import { useHealthStore } from './hooks/useHealthStore';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { 
    state, 
    selectedDate,
    changeDate,
    getDayLog, 
    updateDayLog, 
    updateProfile, 
    addFood, 
    removeFood, 
    addExercise, 
    toggleExercise 
  } = useHealthStore();

  const currentLog = getDayLog(selectedDate);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
                  log={currentLog} 
                  profile={state.profile} 
                  allLogs={state.logs}
                  onNavigate={setCurrentPage} 
                  onUpdateLog={(updates) => updateDayLog(selectedDate, updates)}
                />;
      case 'diet':
        return <Diet 
                  log={currentLog} 
                  onAddFood={(foods) => addFood(selectedDate, foods)}
                  onRemoveFood={(id) => removeFood(selectedDate, id)}
                />;
      case 'exercise':
        return <Exercise 
                  log={currentLog} 
                  profile={state.profile}
                  onAddExercise={(ex) => addExercise(selectedDate, ex)}
                  onToggleExercise={(id) => toggleExercise(selectedDate, id)}
                />;
      case 'skin':
        return <SkinCare 
                  log={currentLog}
                  profile={state.profile}
                  onUpdateLog={(updates) => updateDayLog(selectedDate, updates)}
                />;
      case 'profile':
        return <Profile 
                  profile={state.profile}
                  log={currentLog}
                  onUpdateProfile={updateProfile}
                  onUpdateLog={(updates) => updateDayLog(selectedDate, updates)}
                />;
      default:
        return <Dashboard 
                  log={currentLog} 
                  profile={state.profile} 
                  allLogs={state.logs}
                  onNavigate={setCurrentPage}
                  onUpdateLog={(updates) => updateDayLog(selectedDate, updates)}
               />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default App;