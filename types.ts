export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType; // Added field
  timestamp: string; // ISO String
}

export interface ExerciseItem {
  id: string;
  name: string;
  durationMinutes: number;
  reps?: number;
  completed: boolean;
  type: 'cardio' | 'strength' | 'stretch' | 'other';
  timestamp: string;
}

export interface SkinCareRoutine {
  morningWash: boolean;
  morningHair: boolean;
  eveningShower: boolean;
  eveningWash: boolean;
  eveningHair: boolean;
  notes: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weight: number;
  sleepHours: number;
  foods: FoodItem[];
  exercises: ExerciseItem[];
  skinCare: SkinCareRoutine;
  bodyCheckImage?: string; // Base64 or URL
  mounjaroDose?: number; // mg, if > 0 injection taken
}

export type DietPhase = 'loss' | 'maintenance'; // 감량기 | 유지기
export type DietType = 'strict' | 'general'; // 식단조절 | 일반식

export interface UserProfile {
  name: string;
  height: number; // cm
  targetWeight: number;
  gender: Gender;
  birthDate: string;
  dietPhase: DietPhase;
  dietType: DietType;
  mounjaroStartDate?: string; // YYYY-MM-DD
}

export interface AppState {
  profile: UserProfile;
  logs: Record<string, DailyLog>; // Keyed by YYYY-MM-DD
}
