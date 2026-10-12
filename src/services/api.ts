import { DetectedIngredient, Recipe, FridgeNutritionSummary } from '../types';

export interface AnalyzeFridgeResponse {
  detectedIngredients: DetectedIngredient[];
  fridgeSummary?: string;
  fridgeNutrition?: FridgeNutritionSummary;
  recipes: Recipe[];
}

export interface SuggestRecipesResponse {
  recipes: Recipe[];
}

export async function analyzeFridgeNutrition(
  ingredients: DetectedIngredient[]
): Promise<FridgeNutritionSummary> {
  const response = await fetch('/api/analyze-fridge-nutrition', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Failed to analyze fridge nutrition`);
  }

  const data = await response.json();
  return data.fridgeNutrition;
}

export async function analyzeFridgeImage(
  image: string,
  mimeType: string = 'image/jpeg',
  dietaryRestrictions: string[] = [],
  additionalIngredients: string[] = []
): Promise<AnalyzeFridgeResponse> {
  const response = await fetch('/api/analyze-fridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image,
      mimeType,
      dietaryRestrictions,
      additionalIngredients,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Failed to analyze fridge`);
  }

  return response.json();
}

export async function suggestRecipesFromIngredients(
  ingredients: string[],
  dietaryRestrictions: string[] = [],
  difficulty?: string | null,
  maxTime?: number | null
): Promise<Recipe[]> {
  const response = await fetch('/api/suggest-recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients,
      dietaryRestrictions,
      difficulty: difficulty || undefined,
      maxTime: maxTime || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Failed to generate recipes`);
  }

  const data = await response.json();
  return data.recipes || [];
}
