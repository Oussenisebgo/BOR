export interface DetectedIngredient {
  name: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Proteins' | 'Condiments & Sauces' | 'Grains & Bakery' | 'Beverages' | 'Pantry' | string;
  estimatedQuantity?: string;
  confidence?: 'High' | 'Medium' | 'Low' | string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  inFridge: boolean;
  isEssential: boolean;
}

export interface MissingIngredient {
  name: string;
  amount: string;
  category: string;
}

export interface RecipeStep {
  stepNumber: number;
  shortSummary: string;
  instruction: string;
  timerSeconds?: number | null;
  chefTip?: string | null;
}

export interface NutritionSummary {
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  servings: number;
  dietaryTags: string[];
  matchPercentage: number;
  cuisine?: string;
  nutritionSummary?: NutritionSummary;
  ingredients: RecipeIngredient[];
  missingIngredients: MissingIngredient[];
  steps: RecipeStep[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
  recipeOrigin?: string;
  addedAt: number;
}

export interface FridgeNutritionSummary {
  totalCalories: number;
  totalProtein: string;
  totalCarbs: string;
  totalFat: string;
  nutritionInsight: string;
  macroDistribution?: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  topNutrientHighlights?: string[];
}

export interface DailyNutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  presetId?: 'balanced' | 'high_protein' | 'keto' | 'weight_loss' | 'custom';
}

export interface FilterState {
  dietary: string[];
  difficulty: string | null;
  maxPrepTime: number | null;
  maxCalories: number | null;
  searchQuery: string;
}
