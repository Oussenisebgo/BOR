import React, { useState, useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  Check,
  Plus,
  ShoppingCart,
  ArrowRight,
  Utensils,
  AlertTriangle,
  Play,
  PieChart,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Recipe, MissingIngredient } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onStartCooking: (recipe: Recipe) => void;
  onAddMissingToShoppingList: (items: MissingIngredient[], recipeTitle: string) => void;
  isItemInShoppingList: (name: string) => boolean;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'Easy': { label: 'Easy', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Medium': { label: 'Medium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Hard': { label: 'Gourmet', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

function parseMacroGrams(val: string | undefined, defaultGrams: number): number {
  if (!val) return defaultGrams;
  const match = val.match(/(\d+(\.\d+)?)/);
  return match ? Math.round(parseFloat(match[1])) : defaultGrams;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onStartCooking,
  onAddMissingToShoppingList,
  isItemInShoppingList,
}) => {
  const [justAddedMissing, setJustAddedMissing] = useState(false);
  const [chartType, setChartType] = useState<'donut' | 'radar'>('donut');
  const [showMacros, setShowMacros] = useState(true);

  const diff = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG['Easy'];

  const missingCount = recipe.missingIngredients?.length || 0;
  const inFridgeCount = recipe.ingredients.filter((i) => i.inFridge).length;
  const totalIngredients = recipe.ingredients.length;

  // Calculate macro breakdown
  const macroData = useMemo(() => {
    const totalCal = recipe.calories || 350;
    const proteinG = parseMacroGrams(recipe.nutritionSummary?.protein, Math.round((totalCal * 0.25) / 4));
    const carbsG = parseMacroGrams(recipe.nutritionSummary?.carbs, Math.round((totalCal * 0.45) / 4));
    const fatG = parseMacroGrams(recipe.nutritionSummary?.fat, Math.round((totalCal * 0.30) / 9));

    const proteinCals = proteinG * 4;
    const carbsCals = carbsG * 4;
    const fatCals = fatG * 9;
    const sumCals = proteinCals + carbsCals + fatCals || 1;

    return [
      {
        name: 'Protein',
        grams: proteinG,
        calories: proteinCals,
        color: '#10b981', // Emerald
        percentage: Math.round((proteinCals / sumCals) * 100),
      },
      {
        name: 'Carbs',
        grams: carbsG,
        calories: carbsCals,
        color: '#f59e0b', // Amber
        percentage: Math.round((carbsCals / sumCals) * 100),
      },
      {
        name: 'Fat',
        grams: fatG,
        calories: fatCals,
        color: '#f43f5e', // Rose
        percentage: Math.round((fatCals / sumCals) * 100),
      },
    ];
  }, [recipe.nutritionSummary, recipe.calories]);

  const handleAddAllMissing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
      onAddMissingToShoppingList(recipe.missingIngredients, recipe.title);
      setJustAddedMissing(true);
      setTimeout(() => setJustAddedMissing(false), 2500);
    }
  };

  const allMissingAlreadyInList = recipe.missingIngredients?.every((m) =>
    isItemInShoppingList(m.name)
  );

  return (
    <div className="bg-stone-900 border border-stone-800 hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-stone-950/60 flex flex-col justify-between group">
      <div>
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Match % */}
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{recipe.matchPercentage}% Fridge Match</span>
          </div>

          {/* Difficulty */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diff.bg} ${diff.text} ${diff.border}`}>
            {diff.label}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-stone-100 group-hover:text-emerald-300 transition-colors font-serif tracking-tight mb-2">
          {recipe.title.startsWith('[BOR]') ? recipe.title : `[BOR] ${recipe.title}`}
        </h3>
        <p className="text-stone-400 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
          {recipe.description}
        </p>

        {/* Vital Stats Bar: Time, Calories, Servings */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-stone-950/60 border border-stone-800/80 mb-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center text-xs text-stone-400 mb-0.5">
              <Clock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Time
            </span>
            <span className="font-bold text-stone-200 text-xs sm:text-sm">
              {recipe.totalTime || `${recipe.prepTimeMinutes + recipe.cookTimeMinutes}m`}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-stone-800/80">
            <span className="flex items-center text-xs text-stone-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Calories
            </span>
            <span className="font-bold text-stone-200 text-xs sm:text-sm">
              {recipe.calories} <span className="text-[10px] text-stone-500 font-normal">kcal</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="flex items-center text-xs text-stone-400 mb-0.5">
              <Utensils className="w-3.5 h-3.5 mr-1 text-teal-400" />
              Yield
            </span>
            <span className="font-bold text-stone-200 text-xs sm:text-sm">
              {recipe.servings} <span className="text-[10px] text-stone-500 font-normal">servings</span>
            </span>
          </div>
        </div>

        {/* Macronutrient Breakdown (Recharts Donut/Radar Chart) */}
        <div className="mb-4 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-stone-300">Macro Nutrition</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setChartType(chartType === 'donut' ? 'radar' : 'donut')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
                title={`Switch to ${chartType === 'donut' ? 'Radar' : 'Donut'} view`}
              >
                {chartType === 'donut' ? 'Radar' : 'Donut'}
              </button>
              <button
                type="button"
                onClick={() => setShowMacros(!showMacros)}
                className="p-1 text-stone-400 hover:text-stone-200 rounded"
              >
                {showMacros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showMacros && (
            <div className="grid grid-cols-12 items-center gap-2 pt-1">
              {/* Chart container */}
              <div className="col-span-5 h-28 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'donut' ? (
                    <RechartsPieChart>
                      <Pie
                        data={macroData}
                        dataKey="grams"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={44}
                        paddingAngle={3}
                        stroke="#1c1917"
                        strokeWidth={2}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-stone-900 border border-stone-700 px-2 py-1 rounded text-[11px] shadow-lg text-stone-100">
                                <span className="font-bold" style={{ color: data.color }}>
                                  {data.name}
                                </span>
                                : {data.grams}g ({data.percentage}%)
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RechartsPieChart>
                  ) : (
                    <RadarChart cx="50%" cy="50%" outerRadius={36} data={macroData}>
                      <PolarGrid stroke="#334155" strokeDasharray="2 2" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Radar
                        name="Macros"
                        dataKey="grams"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  )}
                </ResponsiveContainer>

                {/* Donut Center Calorie Label */}
                {chartType === 'donut' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-extrabold text-stone-200 leading-none">
                      {recipe.calories}
                    </span>
                    <span className="text-[8px] text-stone-400 leading-none mt-0.5">kcal</span>
                  </div>
                )}
              </div>

              {/* Macro Indicators List */}
              <div className="col-span-7 flex flex-col justify-center space-y-1.5 pl-1">
                {macroData.map((macro) => (
                  <div key={macro.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: macro.color }}
                      />
                      <span className="text-stone-300 text-[11px] font-medium">{macro.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-100 text-[11px]">{macro.grams}g</span>
                      <span className="text-[10px] text-stone-400 ml-1">({macro.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dietary Tags */}
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {recipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-800/80 text-stone-300 border border-stone-700/60"
              >
                {tag}
              </span>
            ))}
            {recipe.cuisine && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-800/80 text-teal-300 border border-teal-800/40">
                {recipe.cuisine}
              </span>
            )}
          </div>
        )}

        {/* Ingredients Inventory Summary */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span>Fridge Ingredients</span>
            <span className="font-medium text-stone-300">
              {inFridgeCount} / {totalIngredients} available
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (inFridgeCount / totalIngredients) * 100)}%` }}
            />
          </div>
        </div>

        {/* Missing Ingredients Section with 1-Click Shopping List Addition */}
        {missingCount > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Missing ({missingCount})</span>
              </span>

              <button
                type="button"
                onClick={handleAddAllMissing}
                disabled={justAddedMissing || allMissingAlreadyInList}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                  justAddedMissing || allMissingAlreadyInList
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-sm'
                }`}
              >
                {justAddedMissing || allMissingAlreadyInList ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Added to List</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add to List</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {recipe.missingIngredients.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-stone-900/80 text-amber-200 border border-amber-500/30"
                >
                  {item.name} {item.amount ? `(${item.amount})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA: Step-by-Step Cooking Mode */}
      <button
        onClick={() => onStartCooking(recipe)}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Start Step-by-Step Cooking</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

