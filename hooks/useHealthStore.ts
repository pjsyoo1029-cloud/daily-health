import { useState, useEffect, useCallback } from 'react';
import { AppState, DailyLog, UserProfile, Gender, FoodItem, ExerciseItem } from '../types';

const STORAGE_KEY = 'daily_health_glow_v1';

const initialProfile: UserProfile = {
  name: '사용자',
  height: 170,
  targetWeight: 60,
  gender: Gender.Other,
  birthDate: '1990-01-01',
  dietPhase: 'loss',
  dietType: 'strict',
};

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    // Merge with initialProfile to handle new fields for existing users
    const parsed = JSON.parse(stored);
    return {
        ...parsed,
        profile: { ...initialProfile, ...parsed.profile }
    };
  }
  return {
    profile: initialProfile,
    logs: {},
  };
};

export const useHealthStore = () => {
  const [state, setState] = useState<AppState>(getInitialState);
  // Default to today
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const changeDate = (offset: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const getDayLog = useCallback((date: string): DailyLog => {
    if (state.logs[date]) {
      return state.logs[date];
    }
    // Return empty template if not exists
    return {
      date,
      weight: 0,
      sleepHours: 0,
      foods: [],
      exercises: [],
      skinCare: {
        morningWash: false,
        morningHair: false,
        eveningShower: false,
        eveningWash: false,
        eveningHair: false,
        notes: ''
      },
      mounjaroDose: 0,
    };
  }, [state.logs]);

  const updateDayLog = useCallback((date: string, updates: Partial<DailyLog>) => {
    setState((prev) => {
      // Find the most recent weight if current day weight is 0
      let lastWeight = prev.profile.targetWeight;
      
      // If we are initializing a new log, try to find the last recorded weight
      if (!prev.logs[date]) {
         const sortedDates = Object.keys(prev.logs).sort();
         if (sortedDates.length > 0) {
             const lastDate = sortedDates[sortedDates.length - 1];
             lastWeight = prev.logs[lastDate].weight || prev.profile.targetWeight;
         }
      }

      const currentLog = prev.logs[date] || {
        date,
        weight: lastWeight, 
        sleepHours: 0,
        foods: [],
        exercises: [],
        skinCare: {
           morningWash: false, morningHair: false, eveningShower: false, eveningWash: false, eveningHair: false, notes: ''
        },
        mounjaroDose: 0,
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [date]: { ...currentLog, ...updates },
        },
      };
    });
  }, []);

  const addFood = useCallback((date: string, foods: FoodItem[]) => {
    setState((prev) => {
        const log = prev.logs[date] || getDayLog(date);
        return {
            ...prev,
            logs: {
                ...prev.logs,
                [date]: {
                    ...log,
                    foods: [...(log.foods || []), ...foods]
                }
            }
        }
    })
  }, [getDayLog]);

  const removeFood = useCallback((date: string, foodId: string) => {
      setState(prev => {
          const log = prev.logs[date];
          if(!log) return prev;
          return {
              ...prev,
              logs: {
                  ...prev.logs,
                  [date]: {
                      ...log,
                      foods: log.foods.filter(f => f.id !== foodId)
                  }
              }
          }
      })
  }, []);

  const addExercise = useCallback((date: string, exercise: ExerciseItem) => {
      setState(prev => {
          const log = prev.logs[date] || getDayLog(date);
          return {
              ...prev,
              logs: {
                  ...prev.logs,
                  [date]: {
                      ...log,
                      exercises: [...(log.exercises || []), exercise]
                  }
              }
          }
      })
  }, [getDayLog]);

  const toggleExercise = useCallback((date: string, exerciseId: string) => {
    setState(prev => {
        const log = prev.logs[date];
        if(!log) return prev;
        return {
            ...prev,
            logs: {
                ...prev.logs,
                [date]: {
                    ...log,
                    exercises: log.exercises.map(e => e.id === exerciseId ? {...e, completed: !e.completed} : e)
                }
            }
        }
    })
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  return {
    state,
    selectedDate,
    setSelectedDate,
    changeDate,
    getDayLog,
    updateDayLog,
    updateProfile,
    addFood,
    removeFood,
    addExercise,
    toggleExercise
  };
};
