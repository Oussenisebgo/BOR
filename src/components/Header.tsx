import React from 'react';
import { Sparkles, Utensils, Refrigerator, ShoppingCart, RefreshCw, ChefHat, Shield, ShieldCheck } from 'lucide-react';
import { AdminProfile } from '../services/firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'fridge' | 'recipes' | 'shopping';
  setActiveTab: (tab: 'fridge' | 'recipes' | 'shopping') => void;
  recipesCount: number;
  shoppingCount: number;
  ingredientsCount: number;
  onReset: () => void;
  adminProfile: AdminProfile | null;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recipesCount,
  shoppingCount,
  ingredientsCount,
  onReset,
  adminProfile,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('fridge')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/30">
              <Refrigerator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-100 flex items-center">
                  <span className="text-emerald-400 font-sans text-lg font-black mr-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">[BOR]</span>
                  Smart<span className="text-emerald-400">Fridge</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                  [BOR] Chef
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">[BOR] Culinary Assistant & Hands-Free Kitchen</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-stone-950/60 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('fridge')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'fridge'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span className="hidden xs:inline">Fridge</span>
              {ingredientsCount > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'fridge' ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-emerald-400'
                }`}>
                  {ingredientsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Recipes</span>
              {recipesCount > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'recipes' ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-emerald-400'
                }`}>
                  {recipesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Shopping List</span>
              <span className="sm:hidden">List</span>
              {shoppingCount > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'shopping' ? 'bg-emerald-700 text-white' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {shoppingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Install / Download Application Button */}
            <PWAInstallButton />

            {/* Admin Connect Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                adminProfile?.isAdmin
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 shadow-sm shadow-emerald-950/40'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border-stone-700'
              }`}
              title={adminProfile?.isAdmin ? 'Espace [BOR] Administrateur connecté' : 'Connexion [BOR] Admin'}
            >
              {adminProfile?.isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">[BOR] Admin</span>
                  <span className="sm:hidden">[BOR]</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">Connect [BOR] Admin</span>
                  <span className="sm:hidden">[BOR] Admin</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              title="Reset Fridge & Start Fresh"
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors border border-transparent hover:border-stone-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
