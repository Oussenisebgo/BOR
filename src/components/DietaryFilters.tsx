import React from 'react';
import {
  SlidersHorizontal,
  Check,
  RotateCcw,
  Clock,
  Flame,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FilterState } from '../types';

interface DietaryFiltersProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onApplyFilters: () => void;
  isUpdating: boolean;
}

const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: 'Vegetarian', badge: '🌱' },
  { id: 'Keto', label: 'Keto', badge: '🥑' },
  { id: 'Vegan', label: 'Vegan', badge: '🌿' },
  { id: 'Gluten-Free', label: 'Gluten-Free', badge: '🌾' },
  { id: 'Low-Carb', label: 'Low-Carb', badge: '🥦' },
  { id: 'High-Protein', label: 'High-Protein', badge: '🍗' },
  { id: 'Dairy-Free', label: 'Dairy-Free', badge: '🥛' },
  { id: 'Pescatarian', label: 'Pescatarian', badge: '🐟' },
];

const DIFFICULTY_OPTIONS = [
  { id: null, label: 'All Levels' },
  { id: 'Easy', label: 'Easy (< 20m)' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Hard', label: 'Gourmet / Hard' },
];

export const DietaryFilters: React.FC<DietaryFiltersProps> = ({
  filters,
  onChangeFilters,
  onApplyFilters,
  isUpdating,
}) => {
  const toggleDietary = (diet: string) => {
    const exists = filters.dietary.includes(diet);
    const newDietary = exists
      ? filters.dietary.filter((d) => d !== diet)
      : [...filters.dietary, diet];
    onChangeFilters({ ...filters, dietary: newDietary });
  };

  const handleDifficultyChange = (diff: string | null) => {
    onChangeFilters({ ...filters, difficulty: diff });
  };

  const handleReset = () => {
    onChangeFilters({
      dietary: [],
      difficulty: null,
      maxPrepTime: null,
      maxCalories: null,
      searchQuery: '',
    });
  };

  const activeFiltersCount =
    filters.dietary.length +
    (filters.difficulty ? 1 : 0) +
    (filters.maxPrepTime ? 1 : 0) +
    (filters.maxCalories ? 1 : 0);

  return (
    <aside className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-stone-100 text-sm tracking-wide uppercase">
            [BOR] Filters & Dietary
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-stone-400 hover:text-stone-200 flex items-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="text-xs font-semibold text-stone-300 block mb-1.5">
          Search Recipes
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="e.g. Frittata, Stir Fry..."
            className="w-full pl-9 pr-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Dietary Restrictions Multi-Select */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span>Dietary Restrictions</span>
          <span className="text-[11px] text-stone-400">Select any</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((item) => {
            const isSelected = filters.dietary.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleDietary(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/20'
                    : 'bg-stone-950/40 hover:bg-stone-800/60 text-stone-400 hover:text-stone-200 border-stone-800'
                }`}
              >
                <span className="flex items-center space-x-1.5 truncate">
                  <span className="text-sm">{item.badge}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 block">
          Cooking Difficulty
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {DIFFICULTY_OPTIONS.map((diff) => {
            const isSelected = filters.difficulty === diff.id;
            return (
              <button
                key={diff.id || 'all'}
                type="button"
                onClick={() => handleDifficultyChange(diff.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm'
                    : 'bg-stone-950/40 text-stone-400 hover:text-stone-200 border-stone-800 hover:bg-stone-800'
                }`}
              >
                {diff.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Maximum Prep & Cook Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-stone-300 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Max Time</span>
          </label>
          <span className="text-stone-400 font-mono text-[11px]">
            {filters.maxPrepTime ? `${filters.maxPrepTime} mins` : 'Any time'}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[15, 30, 45, null].map((timeVal) => (
            <button
              key={timeVal ?? 'any'}
              type="button"
              onClick={() => onChangeFilters({ ...filters, maxPrepTime: timeVal })}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium border text-center transition-all ${
                filters.maxPrepTime === timeVal
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-semibold'
                  : 'bg-stone-950/40 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              {timeVal ? `${timeVal}m` : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie Limit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-stone-300 flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Calorie Ceiling</span>
          </label>
          <span className="text-stone-400 font-mono text-[11px]">
            {filters.maxCalories ? `< ${filters.maxCalories} kcal` : 'Any calories'}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[400, 550, 750, null].map((calVal) => (
            <button
              key={calVal ?? 'any'}
              type="button"
              onClick={() => onChangeFilters({ ...filters, maxCalories: calVal })}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium border text-center transition-all ${
                filters.maxCalories === calVal
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-semibold'
                  : 'bg-stone-950/40 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              {calVal ? `<${calVal}` : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* AI Re-generate Button with active filters */}
      <div className="pt-2">
        <button
          onClick={onApplyFilters}
          disabled={isUpdating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isUpdating ? 'Crafting Recipes...' : 'Apply Filters with AI'}</span>
        </button>
      </div>
    </aside>
  );
};
