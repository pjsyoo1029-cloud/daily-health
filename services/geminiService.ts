import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile } from "../types";

// Initialize the Gemini API client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// Schema for Food Analysis
const foodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fat"],
      },
    },
  },
  required: ["items"],
};

export const analyzeFoodInput = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following food input and estimate the nutritional values. If the quantity is not specified, assume a standard serving size. Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
      },
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.items || [];
  } catch (error) {
    console.error("Gemini Food Analysis Error:", error);
    alert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    return [];
  }
};

export const getSkinCareAdvice = async (skinType: string, concerns: string, weather: string, birthDate: string) => {
    const age = calculateAge(birthDate);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are a professional dermatologist and esthetician. Provide a brief, daily skincare tip.
            User Profile: Age ${age}, Skin Type: ${skinType}, Concerns: ${concerns}.
            Current Context: Weather is ${weather}.
            Consider the user's age group for specific anti-aging or maintenance advice.
            Keep it under 3 sentences and encouraging.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Skin Advice Error:", error);
        return "수분을 충분히 섭취하고 자외선 차단제를 잊지 마세요!";
    }
};

export const getExerciseSuggestions = async (userDescription: string, birthDate: string) => {
    const age = calculateAge(birthDate);
    
    // Schema for Exercises
    const exerciseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            exercises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        durationMinutes: { type: Type.NUMBER },
                        type: { type: Type.STRING, enum: ["cardio", "strength", "stretch", "other"] },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "durationMinutes", "type", "description"]
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 3 exercises based on this user request: "${userDescription}". 
            User is ${age} years old. 
            Focus on health, posture, or weight loss suitable for this age group.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema
            }
        });
        const text = response.text;
        if(!text) return [];
        return JSON.parse(text).exercises;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export const getDietSuggestion = async (profile: UserProfile, currentCalories: number) => {
    const age = calculateAge(profile.birthDate);
    const phaseText = profile.dietPhase === 'loss' ? "감량기 (Weight Loss Phase)" : "유지기 (Maintenance Phase)";
    const typeText = profile.dietType === 'strict' ? "철저한 식단 (Diet Meal)" : "일반식 (Regular Meal)";
    const context = `
        User Profile:
        - Age: ${age}
        - Goal: ${phaseText}
        - Meal Type Preference: ${typeText}
        - Target Weight: ${profile.targetWeight}kg
        - Calories eaten today so far: ${currentCalories}kcal
        
        Task: Suggest a specific meal menu for the next meal (e.g. Lunch or Dinner). 
        Include rough calories. Explain why this fits their current phase/type and age group (e.g. metabolism, digestion).
        If on Mounjaro medication, mention hydration or light protein if relevant.
        Keep it concise in Korean.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: context,
        });
        return response.text;
    } catch (error) {
        console.error(error);
        return "식단 추천을 불러올 수 없습니다.";
    }
};