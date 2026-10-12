import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Share2,
  Copy,
  Sparkles,
  CheckSquare,
  Square,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { ShoppingItem } from '../types';

interface ShoppingListTabProps {
  items: ShoppingItem[];
  onToggleCheck: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (name: string, amount: string, category: string) => void;
  onClearCompleted: () => void;
  onGoToRecipes: () => void;
}

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({
  items,
  onToggleCheck,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onGoToRecipes,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Produce');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddItem(name.trim(), amount.trim() || '1 item', category);
      setName('');
      setAmount('');
    }
  };

  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = items
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.name} (${item.amount}) - ${item.category}`)
      .join('\n');
    navigator.clipboard.writeText(`🛒 [BOR] Smart Fridge Grocery List:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category || 'Pantry'))).sort();
  const completedCount = items.filter((i) => i.checked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold font-serif text-stone-100 flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <span>[BOR] Kitchen Shopping List</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {items.length === 0
              ? 'Your list is empty. Add missing recipe ingredients in one click!'
              : `${completedCount} of ${items.length} items collected`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyList}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy List'}</span>
            </button>

            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:text-rose-400 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Completed</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-2.5"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name (e.g., Olive Oil, Garlic...)"
          className="flex-2 px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
        />

        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Qty / Amount (e.g., 1 bottle)"
          className="flex-1 px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="Produce">Produce</option>
          <option value="Dairy & Eggs">Dairy & Eggs</option>
          <option value="Proteins">Proteins</option>
          <option value="Pantry">Pantry / Spices</option>
          <option value="Grains & Bakery">Bakery / Bread</option>
          <option value="Condiments & Sauces">Condiments</option>
        </select>

        <button
          type="submit"
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Shopping List Items */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-stone-900/50 border border-dashed border-stone-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-200">Your shopping list is clear!</h3>
          <p className="text-sm text-stone-400 max-w-sm mx-auto">
            When recipes suggest missing ingredients, tap "+ Add to List" on any recipe card to automatically collect them here.
          </p>
          <button
            onClick={onGoToRecipes}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg inline-flex items-center space-x-2 transition-all"
          >
            <span>Browse Fridge Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = items.filter((i) => (i.category || 'Pantry') === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-stone-800/80">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    {cat} ({catItems.length})
                  </h4>
                </div>

                <div className="divide-y divide-stone-800/40">
                  <AnimatePresence initial={false}>
                    {catItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          backgroundColor: item.checked ? 'rgba(24, 24, 27, 0.45)' : 'rgba(28, 25, 23, 0)',
                        }}
                        exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => onToggleCheck(item.id)}
                        className="py-3 px-2 flex items-center justify-between group cursor-pointer rounded-xl transition-colors"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          {/* Animated Checkbox Button */}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.85 }}
                            animate={{
                              backgroundColor: item.checked ? '#10b981' : 'rgba(12, 10, 9, 0.7)',
                              borderColor: item.checked ? '#10b981' : '#57534e',
                            }}
                            transition={{ duration: 0.2 }}
                            className="w-5.5 h-5.5 rounded-md flex items-center justify-center border shadow-sm shrink-0"
                          >
                            <AnimatePresence mode="wait">
                              {item.checked && (
                                <motion.div
                                  key="check-icon"
                                  initial={{ scale: 0, rotate: -25, opacity: 0 }}
                                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3] text-stone-950" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>

                          <div className="min-w-0">
                            {/* Animated Item Name with Strikethrough */}
                            <div className="flex items-center flex-wrap gap-1.5">
                              <div className="relative inline-block">
                                <motion.span
                                  animate={{
                                    color: item.checked ? '#78716c' : '#f5f5f4',
                                    opacity: item.checked ? 0.65 : 1,
                                  }}
                                  transition={{ duration: 0.22 }}
                                  className="text-sm font-medium select-none"
                                >
                                  {item.name}
                                </motion.span>

                                {/* Animated strikethrough line drawing from left to right */}
                                <motion.span
                                  initial={false}
                                  animate={{
                                    scaleX: item.checked ? 1 : 0,
                                    opacity: item.checked ? 1 : 0,
                                  }}
                                  transition={{
                                    duration: 0.26,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                  style={{ originX: 0 }}
                                  className="absolute left-0 top-[52%] -translate-y-1/2 w-full h-[2px] bg-emerald-400 rounded-full pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                />
                              </div>

                              <motion.span
                                animate={{ opacity: item.checked ? 0.45 : 0.8 }}
                                className="text-xs text-stone-400 select-none"
                              >
                                ({item.amount})
                              </motion.span>

                              {/* Tactile Checked Tag */}
                              <AnimatePresence>
                                {item.checked && (
                                  <motion.span
                                    initial={{ scale: 0.7, opacity: 0, x: -4 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  >
                                    Done
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>

                            {item.recipeOrigin && (
                              <motion.span
                                animate={{ opacity: item.checked ? 0.35 : 0.75 }}
                                className="block text-[11px] text-emerald-400 mt-0.5 truncate"
                              >
                                For: {item.recipeOrigin}
                              </motion.span>
                            )}
                          </div>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15, color: '#f87171' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          title="Remove Item"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-500 rounded-lg transition-opacity ml-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
