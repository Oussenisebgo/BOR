import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Dna,
  Wheat,
  Droplet,
  SlidersHorizontal,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RotateCcw,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Info,
  Calendar,
} from 'lucide-react';
import {
  DailyNutritionalGoals,
  FridgeNutritionSummary,
  DetectedIngredient,
  ShoppingItem,
} from '../types';

export const NUTRITION_PRESETS: Record<
  string,
  { label: string; desc: string; goals: DailyNutritionalGoals }
> = {
  balanced: {
    label: 'Balanced Healthy',
    desc: 'Moderate protein, wholesome carbs & balanced fats',
    goals: {
      calories: 2000,
      protein: 130,
      carbs: 220,
      fat: 65,
      fiber: 28,
      presetId: 'balanced',
    },
  },
  high_protein: {
    label: 'High Protein / Fitness',
    desc: 'Muscle repair, athletic recovery & lean mass',
    goals: {
      calories: 2300,
      protein: 175,
      carbs: 210,
      fat: 70,
      fiber: 30,
      presetId: 'high_protein',
    },
  },
  keto: {
    label: 'Keto / Low-Carb',
    desc: 'High healthy fats, moderate protein & minimal carbs',
    goals: {
      calories: 1800,
      protein: 115,
      carbs: 35,
      fat: 130,
      fiber: 25,
      presetId: 'keto',
    },
  },
  weight_loss: {
    label: 'Calorie Deficit / Lean',
    desc: 'Controlled energy with high protein & fiber satiety',
    goals: {
      calories: 1600,
      protein: 135,
      carbs: 140,
      fat: 45,
      fiber: 32,
      presetId: 'weight_loss',
    },
  },
};

interface NutritionalGoalsTrackerProps {
  fridgeNutrition?: FridgeNutritionSummary | null;
  detectedIngredients: DetectedIngredient[];
  onAddShoppingItem?: (name: string, amount: string, category: string) => void;
  isItemInShoppingList?: (name: string) => boolean;
}

// Helper to parse gram values from strings like "145g", "145 g", "145"
function parseGrams(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Fallback nutrition estimator if API has not yet completed
function estimateNutritionFromIngredients(ingredients: DetectedIngredient[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let cal = 0;
  let p = 0;
  let c = 0;
  let f = 0;

  for (const item of ingredients) {
    const cat = item.category?.toLowerCase() || '';
    const name = item.name.toLowerCase();

    if (cat.includes('protein') || name.includes('chicken') || name.includes('beef') || name.includes('salmon') || name.includes('tofu') || name.includes('fish')) {
      cal += 260;
      p += 32;
      c += 2;
      f += 14;
    } else if (cat.includes('dairy') || name.includes('egg') || name.includes('cheese') || name.includes('milk') || name.includes('yogurt')) {
      cal += 150;
      p += 11;
      c += 6;
      f += 9;
    } else if (cat.includes('grain') || name.includes('rice') || name.includes('bread') || name.includes('pasta') || name.includes('oat')) {
      cal += 190;
      p += 6;
      c += 36;
      f += 3;
    } else if (cat.includes('produce') || cat.includes('vegetable') || name.includes('spinach') || name.includes('tomato') || name.includes('pepper') || name.includes('onion')) {
      cal += 35;
      p += 2;
      c += 7;
      f += 0.5;
    } else if (name.includes('avocado') || name.includes('oil') || name.includes('butter') || name.includes('nut')) {
      cal += 180;
      p += 2;
      c += 4;
      f += 18;
    } else {
      cal += 75;
      p += 3;
      c += 10;
      f += 2;
    }
  }

  return { calories: Math.round(cal), protein: Math.round(p), carbs: Math.round(c), fat: Math.round(f) };
}

export const NutritionalGoalsTracker: React.FC<NutritionalGoalsTrackerProps> = ({
  fridgeNutrition,
  detectedIngredients,
  onAddShoppingItem,
  isItemInShoppingList,
}) => {
  // Saved daily targets state
  const [goals, setGoals] = useState<DailyNutritionalGoals>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_nutritional_goals');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return NUTRITION_PRESETS.balanced.goals;
  });

  // Timeframe multiplier: 1 day, 2 days, 3 days
  const [daysMultiplier, setDaysMultiplier] = useState<number>(1);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [showRestockHelp, setShowRestockHelp] = useState(false);

  // Persist goals to local storage
  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_nutritional_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  // Determine current inventory numbers
  const inventory = useMemo(() => {
    if (fridgeNutrition && (fridgeNutrition.totalCalories > 0 || fridgeNutrition.totalProtein)) {
      return {
        calories: fridgeNutrition.totalCalories || 0,
        protein: parseGrams(fridgeNutrition.totalProtein),
        carbs: parseGrams(fridgeNutrition.totalCarbs),
        fat: parseGrams(fridgeNutrition.totalFat),
        source: 'Gemini Vision AI Analysis',
      };
    }
    const est = estimateNutritionFromIngredients(detectedIngredients);
    return {
      ...est,
      source: 'Ingredient Estimate',
    };
  }, [fridgeNutrition, detectedIngredients]);

  // Target values scaled by daysMultiplier
  const scaledTargets = useMemo(() => {
    return {
      calories: goals.calories * daysMultiplier,
      protein: goals.protein * daysMultiplier,
      carbs: goals.carbs * daysMultiplier,
      fat: goals.fat * daysMultiplier,
    };
  }, [goals, daysMultiplier]);

  // Calculate percentages and differences
  const stats = useMemo(() => {
    const calPct = scaledTargets.calories > 0 ? Math.round((inventory.calories / scaledTargets.calories) * 100) : 0;
    const proteinPct = scaledTargets.protein > 0 ? Math.round((inventory.protein / scaledTargets.protein) * 100) : 0;
    const carbsPct = scaledTargets.carbs > 0 ? Math.round((inventory.carbs / scaledTargets.carbs) * 100) : 0;
    const fatPct = scaledTargets.fat > 0 ? Math.round((inventory.fat / scaledTargets.fat) * 100) : 0;

    return {
      cal: {
        current: inventory.calories,
        target: scaledTargets.calories,
        pct: calPct,
        diff: inventory.calories - scaledTargets.calories,
      },
      protein: {
        current: inventory.protein,
        target: scaledTargets.protein,
        pct: proteinPct,
        diff: inventory.protein - scaledTargets.protein,
      },
      carbs: {
        current: inventory.carbs,
        target: scaledTargets.carbs,
        pct: carbsPct,
        diff: inventory.carbs - scaledTargets.carbs,
      },
      fat: {
        current: inventory.fat,
        target: scaledTargets.fat,
        pct: fatPct,
        diff: inventory.fat - scaledTargets.fat,
      },
    };
  }, [inventory, scaledTargets]);

  const handleSelectPreset = (key: string) => {
    if (NUTRITION_PRESETS[key]) {
      setGoals(NUTRITION_PRESETS[key].goals);
    }
  };

  const handleGoalChange = (field: keyof DailyNutritionalGoals, value: number) => {
    setGoals((prev) => ({
      ...prev,
      [field]: Math.max(1, value),
      presetId: 'custom',
    }));
  };

  // Restock suggestions based on deficits
  const restockSuggestions = useMemo(() => {
    const list: { name: string; amount: string; category: string; benefit: string }[] = [];

    if (stats.protein.pct < 90) {
      list.push(
        { name: 'Organic Eggs', amount: '1 dozen', category: 'Dairy & Eggs', benefit: '+72g Protein' },
        { name: 'Chicken Breast / Tofu', amount: '500g', category: 'Proteins', benefit: '+110g Protein' },
        { name: 'Greek Yogurt 0%', amount: '500g', category: 'Dairy & Eggs', benefit: '+50g Protein' }
      );
    }
    if (stats.carbs.pct < 80) {
      list.push(
        { name: 'Rolled Oats', amount: '1 kg', category: 'Grains & Bakery', benefit: '+350g Wholesome Carbs' },
        { name: 'Sweet Potatoes', amount: '1 kg', category: 'Produce', benefit: '+180g Low-GI Carbs' },
        { name: 'Quinoa / Brown Rice', amount: '500g', category: 'Grains & Bakery', benefit: '+320g Complex Carbs' }
      );
    }
    if (stats.fat.pct < 75) {
      list.push(
        { name: 'Avocados', amount: '3 pack', category: 'Produce', benefit: '+45g Monounsaturated Fats' },
        { name: 'Extra Virgin Olive Oil', amount: '1 bottle', category: 'Condiments & Sauces', benefit: 'Healthy Culinary Lipids' }
      );
    }
    if (stats.cal.pct < 70 && list.length === 0) {
      list.push(
        { name: 'Mixed Nuts & Seeds', amount: '250g', category: 'Pantry', benefit: '+1,500 kcal Energy' }
      );
    }

    return list;
  }, [stats]);

  return (
    <div id="nutritional-goals-tracker" className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 scroll-mt-24">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div className="flex items-start space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-100 flex items-center gap-1.5">
                <span>Daily Nutritional Goals vs. Fridge Contents</span>
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                [BOR] Tracker
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Compare your current fridge inventory against your personal caloric & macronutrient targets
            </p>
          </div>
        </div>

        {/* Action Controls: Days Switcher & Goal Editor */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Days Timeframe Pill Selector */}
          <div className="flex items-center p-1 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
            <button
              onClick={() => setDaysMultiplier(1)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                daysMultiplier === 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              1 Day
            </button>
            <button
              onClick={() => setDaysMultiplier(2)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                daysMultiplier === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              2 Days
            </button>
            <button
              onClick={() => setDaysMultiplier(3)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                daysMultiplier === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              3 Days
            </button>
          </div>

          {/* Edit Goals Toggle */}
          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isEditingGoals
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 hover:border-emerald-500/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isEditingGoals ? 'Close Goals' : 'Set Goals'}</span>
          </button>
        </div>
      </div>

      {/* Goal Customization Panel (Accordion / Expandable) */}
      {isEditingGoals && (
        <div className="p-5 rounded-2xl bg-stone-950/90 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-stone-100 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Customize Your Daily Nutritional Targets</span>
              </h4>
              <p className="text-xs text-stone-400">
                Choose a pre-calculated dietary blueprint or fine-tune macros manually
              </p>
            </div>

            {/* Reset to preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(NUTRITION_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    goals.presetId === key
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Steppers & Sliders for each goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Calories Goal */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400 flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Daily Calories</span>
                </span>
                <span className="font-mono text-stone-100 font-bold">{goals.calories} kcal</span>
              </div>
              <input
                type="range"
                min="1200"
                max="4000"
                step="50"
                value={goals.calories}
                onChange={(e) => handleGoalChange('calories', parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <button
                  onClick={() => handleGoalChange('calories', goals.calories - 100)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  -100
                </button>
                <span>1,200 - 4,000</span>
                <button
                  onClick={() => handleGoalChange('calories', goals.calories + 100)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  +100
                </button>
              </div>
            </div>

            {/* Protein Goal */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                  <Dna className="w-3.5 h-3.5" />
                  <span>Daily Protein</span>
                </span>
                <span className="font-mono text-stone-100 font-bold">{goals.protein}g</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={goals.protein}
                onChange={(e) => handleGoalChange('protein', parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <button
                  onClick={() => handleGoalChange('protein', goals.protein - 10)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  -10g
                </button>
                <span>50g - 300g</span>
                <button
                  onClick={() => handleGoalChange('protein', goals.protein + 10)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  +10g
                </button>
              </div>
            </div>

            {/* Carbs Goal */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center space-x-1">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Daily Carbs</span>
                </span>
                <span className="font-mono text-stone-100 font-bold">{goals.carbs}g</span>
              </div>
              <input
                type="range"
                min="20"
                max="450"
                step="5"
                value={goals.carbs}
                onChange={(e) => handleGoalChange('carbs', parseInt(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <button
                  onClick={() => handleGoalChange('carbs', goals.carbs - 15)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  -15g
                </button>
                <span>20g - 450g</span>
                <button
                  onClick={() => handleGoalChange('carbs', goals.carbs + 15)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  +15g
                </button>
              </div>
            </div>

            {/* Fat Goal */}
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400 flex items-center space-x-1">
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Daily Fat</span>
                </span>
                <span className="font-mono text-stone-100 font-bold">{goals.fat}g</span>
              </div>
              <input
                type="range"
                min="20"
                max="180"
                step="5"
                value={goals.fat}
                onChange={(e) => handleGoalChange('fat', parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <button
                  onClick={() => handleGoalChange('fat', goals.fat - 5)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  -5g
                </button>
                <span>20g - 180g</span>
                <button
                  onClick={() => handleGoalChange('fat', goals.fat + 5)}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  +5g
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-stone-400 border-t border-stone-800">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Calculated Macro Total: {goals.protein * 4 + goals.carbs * 4 + goals.fat * 9} kcal (Target: {goals.calories} kcal)
              </span>
            </span>
            <button
              onClick={() => setIsEditingGoals(false)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* THE PROGRESS BARS GRID (Visual Inventory vs Target Comparison) */}
      <div className="space-y-4">
        {/* CALORIES PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2 hover:border-amber-500/30 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-100 text-sm">Calories</span>
                <span className="text-stone-400 text-xs ml-1.5">
                  ({daysMultiplier} {daysMultiplier === 1 ? 'Day' : 'Days'} Target: {scaledTargets.calories.toLocaleString()} kcal)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-extrabold text-stone-100">
                {stats.cal.current.toLocaleString()}{' '}
                <span className="text-xs text-stone-400 font-normal">/ {stats.cal.target.toLocaleString()} kcal</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  stats.cal.pct >= 100
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : stats.cal.pct >= 70
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {stats.cal.pct}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3 rounded-full bg-stone-800 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.cal.pct)}%` }}
              className={`h-full rounded-full transition-all duration-700 ${
                stats.cal.pct >= 100
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {stats.cal.pct >= 100 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target covered! +{Math.abs(stats.cal.diff).toLocaleString()} kcal surplus in fridge
                </span>
              ) : (
                <span className="text-amber-400/90">
                  Short by {Math.abs(stats.cal.diff).toLocaleString()} kcal to cover {daysMultiplier}-day target
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500">{stats.cal.pct}% of target in stock</span>
          </div>
        </div>

        {/* PROTEIN PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2 hover:border-emerald-500/30 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-100 text-sm">Protein</span>
                <span className="text-stone-400 text-xs ml-1.5">
                  ({daysMultiplier} {daysMultiplier === 1 ? 'Day' : 'Days'} Target: {scaledTargets.protein}g)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-extrabold text-emerald-300">
                {stats.protein.current}g{' '}
                <span className="text-xs text-stone-400 font-normal">/ {stats.protein.target}g</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  stats.protein.pct >= 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : stats.protein.pct >= 70
                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {stats.protein.pct}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3 rounded-full bg-stone-800 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.protein.pct)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30 transition-all duration-700"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {stats.protein.pct >= 100 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target met! +{stats.protein.diff}g muscle synthesis protein surplus
                </span>
              ) : (
                <span className="text-amber-400/90">
                  Deficit: need {Math.abs(stats.protein.diff)}g more protein in fridge
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500">{stats.protein.pct}% of target in stock</span>
          </div>
        </div>

        {/* CARBS PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2 hover:border-sky-500/30 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Wheat className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-100 text-sm">Carbohydrates</span>
                <span className="text-stone-400 text-xs ml-1.5">
                  ({daysMultiplier} {daysMultiplier === 1 ? 'Day' : 'Days'} Target: {scaledTargets.carbs}g)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-extrabold text-sky-300">
                {stats.carbs.current}g{' '}
                <span className="text-xs text-stone-400 font-normal">/ {stats.carbs.target}g</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  stats.carbs.pct >= 100
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : stats.carbs.pct >= 70
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {stats.carbs.pct}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3 rounded-full bg-stone-800 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.carbs.pct)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-sky-600 to-blue-400 shadow-md shadow-sky-500/20 transition-all duration-700"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {stats.carbs.pct >= 100 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target met! +{stats.carbs.diff}g energy carbs in fridge
                </span>
              ) : (
                <span className="text-stone-400">
                  {Math.abs(stats.carbs.diff)}g more needed to reach {daysMultiplier}-day target
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500">{stats.carbs.pct}% of target in stock</span>
          </div>
        </div>

        {/* FAT PROGRESS BAR */}
        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2 hover:border-rose-500/30 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-100 text-sm">Healthy Fats</span>
                <span className="text-stone-400 text-xs ml-1.5">
                  ({daysMultiplier} {daysMultiplier === 1 ? 'Day' : 'Days'} Target: {scaledTargets.fat}g)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-extrabold text-rose-300">
                {stats.fat.current}g{' '}
                <span className="text-xs text-stone-400 font-normal">/ {stats.fat.target}g</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  stats.fat.pct >= 100
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : stats.fat.pct >= 70
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {stats.fat.pct}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3 rounded-full bg-stone-800 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.fat.pct)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-rose-600 to-pink-400 shadow-md shadow-rose-500/20 transition-all duration-700"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {stats.fat.pct >= 100 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target met! +{stats.fat.diff}g essential fatty acids in fridge
                </span>
              ) : (
                <span className="text-stone-400">
                  {Math.abs(stats.fat.diff)}g more needed to reach {daysMultiplier}-day target
                </span>
              )}
            </span>
            <span className="font-mono text-stone-500">{stats.fat.pct}% of target in stock</span>
          </div>
        </div>
      </div>

      {/* RESTOCK DEFICIT ACTION CARD (If any macros are below 85%) */}
      {restockSuggestions.length > 0 && onAddShoppingItem && (
        <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-200">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Smart Restock Suggestions to Hit Your Goals</span>
            </div>
            <button
              onClick={() => setShowRestockHelp(!showRestockHelp)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              {showRestockHelp ? 'Hide' : `View ${restockSuggestions.length} Suggested Items`}
            </button>
          </div>

          {showRestockHelp && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 animate-in fade-in duration-150">
              {restockSuggestions.map((item, idx) => {
                const alreadyAdded = isItemInShoppingList ? isItemInShoppingList(item.name) : false;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-200">{item.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{item.benefit}</div>
                    </div>
                    <button
                      onClick={() => onAddShoppingItem(item.name, item.amount, item.category)}
                      disabled={alreadyAdded}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                        alreadyAdded
                          ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                      title={alreadyAdded ? 'Already in shopping list' : 'Add to shopping list'}
                    >
                      {alreadyAdded ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary Footer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-stone-400 border-t border-stone-800/60">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {stats.protein.pct >= 100 && stats.cal.pct >= 90
              ? 'Excellent balance! Your fridge inventory fully supports your daily nutritional objectives.'
              : 'Inventory snapshot: Consider restocking high-density staples to bridge your target deficit.'}
          </span>
        </div>
        <div className="text-[11px] text-stone-500 font-mono">
          Data source: {inventory.source}
        </div>
      </div>
    </div>
  );
};
