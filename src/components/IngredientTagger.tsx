import React, { useState } from 'react';
import { Plus, X, Tag, Sparkles, Check, RefreshCw } from 'lucide-react';
import { DetectedIngredient } from '../types';

interface IngredientTaggerProps {
  ingredients: DetectedIngredient[];
  onAddIngredient: (name: string, category: string) => void;
  onRemoveIngredient: (index: number) => void;
  onRefreshRecipes: () => void;
  isUpdating: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Produce': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
  'Dairy & Eggs': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
  'Proteins': { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-700/50' },
  'Condiments & Sauces': { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
  'Grains & Bakery': { bg: 'bg-yellow-950/60', text: 'text-yellow-300', border: 'border-yellow-700/50' },
  'Pantry': { bg: 'bg-stone-800/80', text: 'text-stone-300', border: 'border-stone-700' },
  'Beverages': { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-700/50' },
};

const COMMON_PANTRY_STAPLES = [
  'Olive Oil',
  'Garlic',
  'Salt & Pepper',
  'Butter',
  'Onion',
  'Soy Sauce',
  'Flour',
  'Rice',
  'Pasta',
];

export const IngredientTagger: React.FC<IngredientTaggerProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onRefreshRecipes,
  isUpdating,
}) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Pantry');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim(), selectedCategory);
      setNewIngredient('');
    }
  };

  const handleQuickAddStaple = (stapleName: string) => {
    if (!ingredients.some((i) => i.name.toLowerCase() === stapleName.toLowerCase())) {
      onAddIngredient(stapleName, 'Pantry');
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-stone-100 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>[BOR] Detected Fridge Inventory ({ingredients.length})</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Refine detected items or add pantry staples to customize recipe generation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Item</span>
          </button>

          <button
            onClick={onRefreshRecipes}
            disabled={isUpdating}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Regenerating...' : 'Update Recipes'}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Custom Item Form */}
      {isAddingOpen && (
        <form onSubmit={handleSubmit} className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="e.g. Sourdough Bread, Avocado, Garlic..."
              className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Produce">Produce</option>
              <option value="Dairy & Eggs">Dairy & Eggs</option>
              <option value="Proteins">Proteins</option>
              <option value="Condiments & Sauces">Condiments</option>
              <option value="Grains & Bakery">Bakery / Grains</option>
              <option value="Pantry">Pantry</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Ingredient Badges List */}
      <div className="flex flex-wrap gap-2">
        {ingredients.map((item, idx) => {
          const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Pantry'];
          return (
            <div
              key={`${item.name}-${idx}`}
              className={`group inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${color.bg} ${color.border} text-xs font-medium transition-all shadow-sm`}
            >
              <span className={`font-semibold ${color.text}`}>{item.name}</span>
              {item.estimatedQuantity && (
                <span className="text-[11px] text-stone-400 group-hover:text-stone-300">
                  ({item.estimatedQuantity})
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveIngredient(idx)}
                title={`Remove ${item.name}`}
                className="text-stone-400 hover:text-rose-400 p-0.5 rounded transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Add Pantry Staples */}
      <div className="pt-2 border-t border-stone-800/60">
        <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold mr-2">
          Quick add staples:
        </span>
        <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
          {COMMON_PANTRY_STAPLES.map((staple) => {
            const hasStaple = ingredients.some((i) => i.name.toLowerCase() === staple.toLowerCase());
            return (
              <button
                key={staple}
                type="button"
                onClick={() => handleQuickAddStaple(staple)}
                disabled={hasStaple}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                  hasStaple
                    ? 'bg-stone-800/40 text-stone-500 border-stone-800 line-through cursor-default'
                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700 hover:border-emerald-500/50 hover:text-emerald-300'
                }`}
              >
                + {staple}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
