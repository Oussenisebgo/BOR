import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FridgeScanner } from './components/FridgeScanner';
import { IngredientTagger } from './components/IngredientTagger';
import { DietaryFilters } from './components/DietaryFilters';
import { RecipeCard } from './components/RecipeCard';
import { CookingModeModal } from './components/CookingModeModal';
import { ShoppingListTab } from './components/ShoppingListTab';
import { AdminConnectModal } from './components/AdminConnectModal';
import { InstallAppModal } from './components/InstallAppModal';
import { NutritionalGoalsTracker } from './components/NutritionalGoalsTracker';
import { auth, syncUserProfile, AdminProfile } from './services/firebase';
import { SAMPLE_FRIDGES, SampleFridge } from './data/sampleFridges';
import {
  DetectedIngredient,
  Recipe,
  ShoppingItem,
  FilterState,
  MissingIngredient,
  FridgeNutritionSummary,
} from './types';
import {
  analyzeFridgeImage,
  suggestRecipesFromIngredients,
  analyzeFridgeNutrition,
} from './services/api';
import { ensureRasterImageDataUri } from './utils/imageUtils';
import {
  ChefHat,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  AlertCircle,
  UtensilsCrossed,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fridge' | 'recipes' | 'shopping'>('fridge');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdatingRecipes, setIsUpdatingRecipes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Core state
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [fridgeSummary, setFridgeSummary] = useState<string>('');
  const [fridgeNutrition, setFridgeNutrition] = useState<FridgeNutritionSummary | null>(null);
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_shopping_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dietary: [],
    difficulty: null,
    maxPrepTime: null,
    maxCalories: null,
    searchQuery: '',
  });

  // Active cooking modal
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);

  // Administrator authentication state
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_admin_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Sync profile state and save to local storage
  const handleProfileChange = (profile: AdminProfile | null) => {
    setAdminProfile(profile);
    try {
      if (profile) {
        localStorage.setItem('smart_fridge_admin_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('smart_fridge_admin_profile');
      }
    } catch {
      // Ignore storage errors
    }
  };

  // Listen for Firebase authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          handleProfileChange(profile);
        } catch {
          // Keep current profile if sync fails
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save shopping list to local storage
  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_shopping_list', JSON.stringify(shoppingList));
    } catch {
      // Local storage quota or restricted
    }
  }, [shoppingList]);

  // Initial load: preload sample fridge 1 if none loaded yet
  useEffect(() => {
    if (detectedIngredients.length === 0 && !currentImage) {
      const defaultSample = SAMPLE_FRIDGES[0];
      setCurrentImage(defaultSample.thumbnailSvg);
      setDetectedIngredients(defaultSample.presetIngredients);
      setFridgeSummary('Farm fresh produce, pasture eggs, whole milk, and sharp cheddar ready for wholesome meals.');
      if (defaultSample.presetNutrition) {
        setFridgeNutrition(defaultSample.presetNutrition);
      }
      
      // Initial analyze trigger with default sample
      handleAnalyzeFridge(defaultSample.imageDataUri, 'image/svg+xml', defaultSample.presetIngredients);
    }
  }, []);

  // Analyze Fridge Photo
  const handleAnalyzeFridge = async (
    imageData: string,
    mimeType: string = 'image/jpeg',
    presetIngredients?: DetectedIngredient[]
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Ensure image is genuine raster PNG/JPEG base64 for Gemini vision
      const { dataUri: rasterUri, mimeType: resolvedMime } = await ensureRasterImageDataUri(imageData);
      setCurrentImage(rasterUri);

      const result = await analyzeFridgeImage(
        rasterUri,
        resolvedMime,
        filters.dietary,
        presetIngredients?.map((i) => i.name) || []
      );

      if (result.detectedIngredients && result.detectedIngredients.length > 0) {
        setDetectedIngredients(result.detectedIngredients);
      } else if (presetIngredients) {
        setDetectedIngredients(presetIngredients);
      }

      if (result.fridgeSummary) {
        setFridgeSummary(result.fridgeSummary);
      }

      if (result.fridgeNutrition) {
        setFridgeNutrition(result.fridgeNutrition);
      }

      if (result.recipes && result.recipes.length > 0) {
        setRecipes(result.recipes);
      }
    } catch (err: any) {
      console.warn('Analysis note:', err.message);
      // Fallback recipes are handled on server, but if any error persists:
      if (presetIngredients) {
        setDetectedIngredients(presetIngredients);
      }
      setErrorMessage(err.message || 'Could not analyze image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-analyze total fridge macronutrients & calories with Gemini
  const handleRefreshNutrition = async () => {
    if (detectedIngredients.length === 0) return;
    setIsAnalyzingNutrition(true);
    try {
      const nutrition = await analyzeFridgeNutrition(detectedIngredients);
      setFridgeNutrition(nutrition);
    } catch (err: any) {
      console.warn('Failed to refresh fridge nutrition:', err);
    } finally {
      setIsAnalyzingNutrition(false);
    }
  };

  // Select Sample Fridge
  const handleSelectSample = (sample: SampleFridge) => {
    setCurrentImage(sample.thumbnailSvg);
    setDetectedIngredients(sample.presetIngredients);
    setFridgeSummary(sample.description);
    if (sample.presetNutrition) {
      setFridgeNutrition(sample.presetNutrition);
    }
    handleAnalyzeFridge(sample.imageDataUri, 'image/svg+xml', sample.presetIngredients);
  };

  // Add / Remove ingredient
  const handleAddIngredient = (name: string, category: string) => {
    setDetectedIngredients((prev) => [
      ...prev,
      { name, category, estimatedQuantity: '1 item', confidence: 'High' },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setDetectedIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Re-generate recipes based on current ingredients & dietary filters
  const handleApplyFiltersAndRegenerate = async () => {
    if (detectedIngredients.length === 0) {
      setErrorMessage('Please scan your fridge or add ingredients first.');
      return;
    }

    setIsUpdatingRecipes(true);
    setErrorMessage(null);

    try {
      const ingredientNames = detectedIngredients.map((i) => i.name);
      const newRecipes = await suggestRecipesFromIngredients(
        ingredientNames,
        filters.dietary,
        filters.difficulty,
        filters.maxPrepTime
      );

      if (newRecipes.length > 0) {
        setRecipes(newRecipes);
        setActiveTab('recipes');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update recipes.');
    } finally {
      setIsUpdatingRecipes(false);
    }
  };

  // Shopping List Handlers
  const handleAddMissingToShoppingList = (missingItems: MissingIngredient[], recipeTitle: string) => {
    const newItems: ShoppingItem[] = missingItems.map((item) => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      amount: item.amount || '1 item',
      category: item.category || 'Pantry',
      checked: false,
      recipeOrigin: recipeTitle,
      addedAt: Date.now(),
    }));

    setShoppingList((prev) => {
      // Avoid exact duplicates
      const filteredNew = newItems.filter(
        (n) => !prev.some((p) => p.name.toLowerCase() === n.name.toLowerCase())
      );
      return [...prev, ...filteredNew];
    });
  };

  const handleToggleShoppingCheck = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomShoppingItem = (name: string, amount: string, category: string) => {
    const item: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name,
      amount,
      category,
      checked: false,
      addedAt: Date.now(),
    };
    setShoppingList((prev) => [item, ...prev]);
  };

  const handleClearCompletedShopping = () => {
    setShoppingList((prev) => prev.filter((item) => !item.checked));
  };

  const isItemInShoppingList = (name: string) => {
    return shoppingList.some((item) => item.name.toLowerCase() === name.toLowerCase());
  };

  const handleResetFridge = () => {
    setCurrentImage(null);
    setDetectedIngredients([]);
    setFridgeSummary('');
    setFridgeNutrition(null);
    setRecipes([]);
    setActiveTab('fridge');
  };

  // Filtered recipe list on client
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);
        const matchesDesc = recipe.description.toLowerCase().includes(query);
        const matchesIng = recipe.ingredients.some((i) => i.name.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesIng) return false;
      }

      // Dietary filter
      if (filters.dietary.length > 0) {
        const hasAllSelectedDiets = filters.dietary.every((diet) =>
          recipe.dietaryTags?.some((tag) => tag.toLowerCase() === diet.toLowerCase())
        );
        if (!hasAllSelectedDiets) return false;
      }

      // Difficulty
      if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
        return false;
      }

      // Max Prep Time
      if (filters.maxPrepTime) {
        const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
        if (totalMinutes > filters.maxPrepTime) return false;
      }

      // Max Calories
      if (filters.maxCalories) {
        if (recipe.calories > filters.maxCalories) return false;
      }

      return true;
    });
  }, [recipes, filters]);

  const unboughtCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recipesCount={filteredRecipes.length}
        shoppingCount={unboughtCount}
        ingredientsCount={detectedIngredients.length}
        onReset={handleResetFridge}
        adminProfile={adminProfile}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 text-rose-300 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-stone-400 hover:text-stone-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Fridge Scanner & Inventory */}
        {activeTab === 'fridge' && (
          <div className="space-y-8">
            <FridgeScanner
              onAnalyze={(img, mime) => handleAnalyzeFridge(img, mime)}
              isAnalyzing={isAnalyzing}
              detectedIngredients={detectedIngredients}
              fridgeSummary={fridgeSummary}
              fridgeNutrition={fridgeNutrition}
              onRefreshNutrition={handleRefreshNutrition}
              isAnalyzingNutrition={isAnalyzingNutrition}
              currentImage={currentImage}
              onClearImage={handleResetFridge}
              onSelectSample={handleSelectSample}
            />

            {detectedIngredients.length > 0 && (
              <div className="space-y-6">
                <NutritionalGoalsTracker
                  fridgeNutrition={fridgeNutrition}
                  detectedIngredients={detectedIngredients}
                  onAddShoppingItem={handleAddCustomShoppingItem}
                  isItemInShoppingList={isItemInShoppingList}
                />

                <IngredientTagger
                  ingredients={detectedIngredients}
                  onAddIngredient={handleAddIngredient}
                  onRemoveIngredient={handleRemoveIngredient}
                  onRefreshRecipes={handleApplyFiltersAndRegenerate}
                  isUpdating={isUpdatingRecipes}
                />

                {/* Banner CTA to switch to recipes */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-emerald-300">
                    <ChefHat className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-stone-100">
                        {recipes.length} [BOR] Gourmet Recipes Ready
                      </h4>
                      <p className="text-xs text-stone-300">
                        Suggested based on your fridge ingredients. Explore with dietary filters or start hands-free cooking!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('recipes')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>View [BOR] Recipe Cards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recipes with Dietary Filter Sidebar */}
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Sidebar Filter for Dietary Restrictions */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <DietaryFilters
                filters={filters}
                onChangeFilters={setFilters}
                onApplyFilters={handleApplyFiltersAndRegenerate}
                isUpdating={isUpdatingRecipes}
              />
            </div>

            {/* Scrollable Recipe Cards Grid */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-stone-100 flex items-center space-x-2">
                    <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
                    <span>[BOR] Suggested Recipes ({filteredRecipes.length})</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                    Select a recipe to enter the hands-free step-by-step cooking mode with voice guidance.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('fridge')}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
                  >
                    Scan / Edit Fridge
                  </button>
                  <button
                    onClick={handleApplyFiltersAndRegenerate}
                    disabled={isUpdatingRecipes}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRecipes ? 'animate-spin' : ''}`} />
                    <span>New Recipes</span>
                  </button>
                </div>
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="text-center py-16 bg-stone-900 border border-dashed border-stone-800 rounded-3xl p-8 space-y-4">
                  <ChefHat className="w-12 h-12 text-stone-600 mx-auto" />
                  <h3 className="text-lg font-bold text-stone-200">No matching recipes found</h3>
                  <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto">
                    Try relaxing your dietary filters (e.g. Vegetarian, Keto) or prep time constraints in the sidebar.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        dietary: [],
                        difficulty: null,
                        maxPrepTime: null,
                        maxCalories: null,
                        searchQuery: '',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onStartCooking={(r) => setActiveCookingRecipe(r)}
                      onAddMissingToShoppingList={handleAddMissingToShoppingList}
                      isItemInShoppingList={isItemInShoppingList}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Shopping List */}
        {activeTab === 'shopping' && (
          <ShoppingListTab
            items={shoppingList}
            onToggleCheck={handleToggleShoppingCheck}
            onDeleteItem={handleDeleteShoppingItem}
            onAddItem={handleAddCustomShoppingItem}
            onClearCompleted={handleClearCompletedShopping}
            onGoToRecipes={() => setActiveTab('recipes')}
          />
        )}
      </div>

      {/* Step-by-Step Hands-Free Cooking Mode Modal */}
      {activeCookingRecipe && (
        <CookingModeModal
          recipe={activeCookingRecipe}
          onClose={() => setActiveCookingRecipe(null)}
        />
      )}

      {/* Administrator Connect & Management Modal */}
      <AdminConnectModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminProfile={adminProfile}
        onProfileChange={handleProfileChange}
      />

      {/* Download & Install Application Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Footer with App Download / Installation Info */}
      <footer className="mt-16 border-t border-stone-800 bg-stone-950/60 py-8 px-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              [BOR]
            </span>
            <span className="text-stone-300 font-semibold">Smart Fridge & Culinary Assistant</span>
            <span>•</span>
            <span className="text-stone-400">PWA Ready & Offline Capable</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Download & Install App</span>
            </button>
            <span>•</span>
            <span className="text-stone-400">Hands-Free Cooking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
