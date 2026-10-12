import { DetectedIngredient, FridgeNutritionSummary } from '../types';

export interface SampleFridge {
  id: string;
  name: string;
  description: string;
  thumbnailSvg: string;
  imageDataUri: string;
  presetIngredients: DetectedIngredient[];
  presetNutrition?: FridgeNutritionSummary;
}

// Generate stylized realistic fridge SVG data URI
function createFridgeSvg(theme: 'veggie' | 'protein' | 'balanced' | 'quick'): string {
  let shelf1 = '';
  let shelf2 = '';
  let shelf3 = '';
  let drawer = '';

  if (theme === 'balanced') {
    // Eggs, milk, bell peppers, spinach, cheddar cheese, mustard
    shelf1 = `
      <!-- Top Shelf: Dairy & Condiments -->
      <rect x="70" y="90" width="35" height="70" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
      <rect x="75" y="115" width="25" height="30" fill="#38BDF8"/>
      <text x="87" y="135" font-size="8" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">MILK</text>
      
      <rect x="120" y="110" width="28" height="50" rx="3" fill="#FEF08A" stroke="#EAB308" stroke-width="2"/>
      <rect x="124" y="125" width="20" height="20" fill="#FACC15"/>
      <text x="134" y="139" font-size="7" font-family="sans-serif" font-weight="bold" fill="#713F12" text-anchor="middle">DIJON</text>

      <rect x="160" y="120" width="45" height="40" rx="6" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
      <circle cx="175" cy="135" r="4" fill="#EAB308"/>
      <circle cx="190" cy="145" r="3" fill="#EAB308"/>
      <text x="182" y="156" font-size="7" font-family="sans-serif" font-weight="bold" fill="#713F12" text-anchor="middle">CHEDDAR</text>

      <rect x="220" y="105" width="30" height="55" rx="5" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
      <text x="235" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#0369A1" text-anchor="middle">YOGURT</text>
    `;
    shelf2 = `
      <!-- Middle Shelf: Eggs & Proteins -->
      <rect x="70" y="195" width="85" height="35" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse cx="85" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="102" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="119" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="136" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <text x="112" y="226" font-size="7" font-family="sans-serif" font-weight="bold" fill="#64748B" text-anchor="middle">FARM FRESH EGGS</text>

      <rect x="175" y="190" width="65" height="40" rx="5" fill="#FCE7F3" stroke="#F43F5E" stroke-width="2"/>
      <path d="M 185 210 Q 205 195 230 215" stroke="#BE123C" stroke-width="4" fill="none"/>
      <text x="207" y="224" font-size="8" font-family="sans-serif" font-weight="bold" fill="#9F1239" text-anchor="middle">CHICKEN</text>
    `;
    shelf3 = `
      <!-- Lower Shelf: Fresh Veggies -->
      <path d="M 75 295 C 75 270, 105 270, 105 295 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
      <path d="M 87 270 L 92 262" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>

      <path d="M 115 295 C 115 270, 145 270, 145 295 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      <path d="M 127 270 L 132 262" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>

      <rect x="160" y="270" width="55" height="30" rx="6" fill="#DCFCE7" stroke="#22C55E" stroke-width="2"/>
      <text x="187" y="289" font-size="7" font-family="sans-serif" font-weight="bold" fill="#15803D" text-anchor="middle">SPINACH</text>

      <circle cx="235" cy="285" r="14" fill="#84CC16" stroke="#4D7C0F" stroke-width="2"/>
    `;
    drawer = `
      <!-- Crisper Drawers -->
      <rect x="65" y="325" width="100" height="55" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" opacity="0.9"/>
      <text x="115" y="355" font-size="9" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CRISPER • GREENS</text>
      <circle cx="95" cy="365" r="5" fill="#22C55E"/>
      <circle cx="115" cy="365" r="6" fill="#16A34A"/>
      <circle cx="135" cy="365" r="5" fill="#15803D"/>

      <rect x="175" y="325" width="100" height="55" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" opacity="0.9"/>
      <text x="225" y="355" font-size="9" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CRISPER • FRUITS</text>
      <circle cx="205" cy="365" r="6" fill="#EF4444"/>
      <circle cx="225" cy="365" r="7" fill="#F59E0B"/>
      <circle cx="245" cy="365" r="6" fill="#84CC16"/>
    `;
  } else if (theme === 'protein') {
    // Chicken, eggs, avocados, heavy cream, feta, lime, spinach
    shelf1 = `
      <rect x="75" y="90" width="35" height="70" rx="4" fill="#FDF2F8" stroke="#DB2777" stroke-width="2"/>
      <text x="92" y="130" font-size="7" font-family="sans-serif" font-weight="bold" fill="#BE185D" text-anchor="middle">HEAVY</text>
      <text x="92" y="140" font-size="7" font-family="sans-serif" font-weight="bold" fill="#BE185D" text-anchor="middle">CREAM</text>

      <rect x="130" y="115" width="45" height="45" rx="4" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
      <text x="152" y="142" font-size="8" font-family="sans-serif" font-weight="bold" fill="#1D4ED8" text-anchor="middle">FETA</text>

      <rect x="195" y="110" width="30" height="50" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
      <text x="210" y="138" font-size="7" font-family="sans-serif" font-weight="bold" fill="#92400E" text-anchor="middle">MAYO</text>
    `;
    shelf2 = `
      <rect x="70" y="185" width="90" height="45" rx="6" fill="#FFE4E6" stroke="#E11D48" stroke-width="2"/>
      <text x="115" y="212" font-size="8" font-family="sans-serif" font-weight="bold" fill="#9F1239" text-anchor="middle">CHICKEN BREAST</text>

      <rect x="175" y="195" width="85" height="35" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <ellipse cx="190" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="207" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="224" cy="212" rx="6" ry="8" fill="#FCD34D"/>
      <ellipse cx="241" cy="212" rx="6" ry="8" fill="#FCD34D"/>
    `;
    shelf3 = `
      <ellipse cx="95" cy="285" rx="14" ry="18" fill="#365314" stroke="#1A2E05" stroke-width="2"/>
      <ellipse cx="130" cy="285" rx="14" ry="18" fill="#365314" stroke="#1A2E05" stroke-width="2"/>
      <text x="112" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#ECFCCB" text-anchor="middle">AVOCADOS</text>

      <circle cx="175" cy="285" r="10" fill="#84CC16" stroke="#4D7C0F" stroke-width="2"/>
      <circle cx="200" cy="285" r="10" fill="#84CC16" stroke="#4D7C0F" stroke-width="2"/>
      <text x="187" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#14532D" text-anchor="middle">LIMES</text>

      <rect x="225" y="265" width="40" height="35" rx="5" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
      <text x="245" y="285" font-size="7" font-family="sans-serif" font-weight="bold" fill="#15803D" text-anchor="middle">ZUCCHINI</text>
    `;
    drawer = `
      <rect x="65" y="325" width="210" height="55" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" opacity="0.9"/>
      <text x="170" y="355" font-size="10" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CRISPER • LEAFY GREENS & HERBS</text>
    `;
  } else if (theme === 'veggie') {
    // Tofu, broccoli, bell peppers, carrots, soy sauce, mushrooms, ginger
    shelf1 = `
      <rect x="75" y="100" width="30" height="60" rx="3" fill="#451A03" stroke="#78350F" stroke-width="2"/>
      <text x="90" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SOY SAUCE</text>

      <rect x="120" y="105" width="28" height="55" rx="3" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
      <text x="134" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#92400E" text-anchor="middle">SESAME</text>

      <rect x="165" y="115" width="45" height="45" rx="5" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
      <text x="187" y="140" font-size="7" font-family="sans-serif" font-weight="bold" fill="#713F12" text-anchor="middle">GINGER</text>

      <rect x="225" y="105" width="35" height="55" rx="5" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="2"/>
      <text x="242" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#374151" text-anchor="middle">OAT MILK</text>
    `;
    shelf2 = `
      <rect x="70" y="190" width="60" height="40" rx="4" fill="#F5F5F4" stroke="#A8A29E" stroke-width="2"/>
      <text x="100" y="213" font-size="8" font-family="sans-serif" font-weight="bold" fill="#44403C" text-anchor="middle">ORGANIC TOFU</text>

      <rect x="145" y="190" width="60" height="40" rx="5" fill="#E7E5E4" stroke="#78716C" stroke-width="2"/>
      <text x="175" y="213" font-size="8" font-family="sans-serif" font-weight="bold" fill="#44403C" text-anchor="middle">MUSHROOMS</text>

      <rect x="220" y="195" width="45" height="35" rx="4" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
      <text x="242" y="215" font-size="7" font-family="sans-serif" font-weight="bold" fill="#B45309" text-anchor="middle">HUMMUS</text>
    `;
    shelf3 = `
      <circle cx="90" cy="285" r="16" fill="#15803D" stroke="#14532D" stroke-width="2"/>
      <circle cx="85" cy="275" r="8" fill="#16A34A"/>
      <circle cx="95" cy="275" r="8" fill="#16A34A"/>
      <text x="90" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">BROCCOLI</text>

      <path d="M 125 295 C 125 270, 150 270, 150 295 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
      <path d="M 135 270 L 138 262" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>

      <polygon points="175,295 195,295 185,265" fill="#F97316" stroke="#C2410C" stroke-width="2"/>
      <polygon points="195,295 215,295 205,265" fill="#F97316" stroke="#C2410C" stroke-width="2"/>
      <text x="195" y="292" font-size="7" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">CARROTS</text>

      <circle cx="240" cy="285" r="12" fill="#E11D48" stroke="#9F1239" stroke-width="2"/>
      <text x="240" y="288" font-size="6" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">TOMATO</text>
    `;
    drawer = `
      <rect x="65" y="325" width="210" height="55" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" opacity="0.9"/>
      <text x="170" y="355" font-size="10" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CRISPER • KALE, HERBS & SPROUTS</text>
    `;
  } else {
    // Quick weeknight: Ground turkey, mozzarella, pasta sauce, parmesan, garlic
    shelf1 = `
      <rect x="75" y="95" width="32" height="65" rx="4" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
      <text x="91" y="130" font-size="7" font-family="sans-serif" font-weight="bold" fill="#B91C1C" text-anchor="middle">MARINARA</text>

      <rect x="125" y="105" width="30" height="55" rx="3" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <text x="140" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#047857" text-anchor="middle">PESTO</text>

      <rect x="175" y="110" width="40" height="50" rx="4" fill="#FEF9C3" stroke="#EAB308" stroke-width="2"/>
      <text x="195" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#854D0E" text-anchor="middle">PARMESAN</text>

      <rect x="230" y="100" width="28" height="60" rx="3" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
      <text x="244" y="135" font-size="7" font-family="sans-serif" font-weight="bold" fill="#334155" text-anchor="middle">CREAM</text>
    `;
    shelf2 = `
      <rect x="70" y="190" width="85" height="42" rx="5" fill="#FFE4E6" stroke="#F43F5E" stroke-width="2"/>
      <text x="112" y="214" font-size="8" font-family="sans-serif" font-weight="bold" fill="#9F1239" text-anchor="middle">GROUND TURKEY</text>

      <rect x="170" y="190" width="55" height="42" rx="6" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
      <text x="197" y="214" font-size="8" font-family="sans-serif" font-weight="bold" fill="#334155" text-anchor="middle">MOZZARELLA</text>

      <rect x="235" y="195" width="30" height="35" rx="3" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
      <text x="250" y="215" font-size="7" font-family="sans-serif" font-weight="bold" fill="#713F12" text-anchor="middle">BUTTER</text>
    `;
    shelf3 = `
      <circle cx="85" cy="285" r="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <text x="85" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">GARLIC</text>

      <circle cx="120" cy="285" r="14" fill="#FCD34D" stroke="#D97706" stroke-width="2"/>
      <text x="120" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#78350F" text-anchor="middle">ONION</text>

      <circle cx="160" cy="285" r="14" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
      <text x="160" y="288" font-size="6" font-family="sans-serif" font-weight="bold" fill="#fff" text-anchor="middle">TOMATO</text>

      <rect x="195" y="270" width="50" height="30" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
      <text x="220" y="288" font-size="7" font-family="sans-serif" font-weight="bold" fill="#15803D" text-anchor="middle">BASIL</text>
    `;
    drawer = `
      <rect x="65" y="325" width="210" height="55" rx="6" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" opacity="0.9"/>
      <text x="170" y="355" font-size="10" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CRISPER • SALAD GREENS & LEMONS</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="100%" height="100%">
    <defs>
      <linearGradient id="fridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <linearGradient id="interiorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#E2E8F0" />
      </linearGradient>
      <linearGradient id="glassLight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#818CF8" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
    <!-- Outer Fridge Body -->
    <rect x="20" y="20" width="360" height="380" rx="16" fill="url(#fridgeGrad)" stroke="#334155" stroke-width="4"/>
    
    <!-- Left Open Door -->
    <path d="M 20 30 L 50 45 L 50 375 L 20 390 Z" fill="#334155" opacity="0.6"/>
    <!-- Right Open Door -->
    <path d="M 380 30 L 350 45 L 350 375 L 380 390 Z" fill="#334155" opacity="0.6"/>

    <!-- Refrigerator Interior Compartment -->
    <rect x="52" y="42" width="236" height="348" rx="8" fill="url(#interiorGrad)" stroke="#94A3B8" stroke-width="3"/>

    <!-- LED Lighting strip -->
    <rect x="54" y="44" width="232" height="12" rx="4" fill="#E0F2FE" opacity="0.8"/>
    <circle cx="170" cy="50" r="3" fill="#38BDF8"/>
    <circle cx="110" cy="50" r="3" fill="#38BDF8"/>
    <circle cx="230" cy="50" r="3" fill="#38BDF8"/>

    <!-- Door Shelf Racks on the Right Door -->
    <rect x="296" y="65" width="46" height="28" rx="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="319" y="82" font-size="6" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">SAUCES</text>

    <rect x="296" y="115" width="46" height="30" rx="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="319" y="133" font-size="6" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">JARS</text>

    <rect x="296" y="170" width="46" height="35" rx="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="319" y="190" font-size="6" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">JUICE</text>

    <rect x="296" y="240" width="46" height="40" rx="4" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="319" y="262" font-size="6" font-family="sans-serif" font-weight="bold" fill="#475569" text-anchor="middle">CONDIMENTS</text>

    <!-- Glass Shelves with illuminated edge -->
    <rect x="52" y="160" width="236" height="8" rx="2" fill="url(#glassLight)" stroke="#38BDF8" stroke-width="1.5"/>
    <rect x="52" y="235" width="236" height="8" rx="2" fill="url(#glassLight)" stroke="#38BDF8" stroke-width="1.5"/>
    <rect x="52" y="315" width="236" height="8" rx="2" fill="url(#glassLight)" stroke="#38BDF8" stroke-width="1.5"/>

    <!-- Ingredients on Shelves -->
    ${shelf1}
    ${shelf2}
    ${shelf3}
    ${drawer}

    <!-- Smart Digital Temperature Display -->
    <rect x="65" y="60" width="60" height="20" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/>
    <text x="95" y="74" font-size="10" font-family="monospace" font-weight="bold" fill="#38BDF8" text-anchor="middle">37°F • 3°C</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_FRIDGES: SampleFridge[] = [
  {
    id: 'fridge-balanced',
    name: '[BOR] Farm Fresh & Dairy',
    description: 'Crisp bell peppers, fresh eggs, cheddar, whole milk, baby spinach, and Dijon mustard.',
    thumbnailSvg: createFridgeSvg('balanced'),
    imageDataUri: createFridgeSvg('balanced'),
    presetNutrition: {
      totalCalories: 1980,
      totalProtein: '94g',
      totalCarbs: '54g',
      totalFat: '146g',
      nutritionInsight: 'Abundant in high-biological-value protein from farm eggs and Greek yogurt, complemented by high-antioxidant greens and sweet bell peppers.',
      macroDistribution: {
        proteinPercent: 20,
        carbsPercent: 12,
        fatPercent: 68,
      },
      topNutrientHighlights: ['Vitamin C & A', 'Complete Protein', 'Calcium', 'Dietary Lutein'],
    },
    presetIngredients: [
      { name: 'Eggs', category: 'Dairy & Eggs', estimatedQuantity: '6 large', confidence: 'High' },
      { name: 'Bell Pepper', category: 'Produce', estimatedQuantity: '2 medium (red & yellow)', confidence: 'High' },
      { name: 'Cheddar Cheese', category: 'Dairy & Eggs', estimatedQuantity: '1 block (~200g)', confidence: 'High' },
      { name: 'Fresh Spinach', category: 'Produce', estimatedQuantity: '1 bag', confidence: 'High' },
      { name: 'Whole Milk', category: 'Dairy & Eggs', estimatedQuantity: '1 carton', confidence: 'High' },
      { name: 'Dijon Mustard', category: 'Condiments & Sauces', estimatedQuantity: '1 jar', confidence: 'Medium' },
      { name: 'Greek Yogurt', category: 'Dairy & Eggs', estimatedQuantity: '1 tub', confidence: 'High' },
      { name: 'Chicken Breast', category: 'Proteins', estimatedQuantity: '2 fillets', confidence: 'Medium' },
    ],
  },
  {
    id: 'fridge-protein',
    name: '[BOR] Keto & High Protein',
    description: 'Chicken breast, pasture eggs, ripe avocados, heavy cream, feta block, limes, and zucchini.',
    thumbnailSvg: createFridgeSvg('protein'),
    imageDataUri: createFridgeSvg('protein'),
    presetNutrition: {
      totalCalories: 2650,
      totalProtein: '145g',
      totalCarbs: '38g',
      totalFat: '210g',
      nutritionInsight: 'High-density ketogenic inventory rich in lean poultry protein, potassium-dense avocados, and essential fatty acids for sustained energy.',
      macroDistribution: {
        proteinPercent: 23,
        carbsPercent: 6,
        fatPercent: 71,
      },
      topNutrientHighlights: ['Lean Animal Protein', 'Potassium', 'Monounsaturated Fats', 'Vitamin B6'],
    },
    presetIngredients: [
      { name: 'Chicken Breast', category: 'Proteins', estimatedQuantity: '3 fillets (~500g)', confidence: 'High' },
      { name: 'Eggs', category: 'Dairy & Eggs', estimatedQuantity: '8 eggs', confidence: 'High' },
      { name: 'Avocados', category: 'Produce', estimatedQuantity: '2 ripe', confidence: 'High' },
      { name: 'Heavy Cream', category: 'Dairy & Eggs', estimatedQuantity: '1 pint', confidence: 'High' },
      { name: 'Feta Cheese', category: 'Dairy & Eggs', estimatedQuantity: '1 block', confidence: 'High' },
      { name: 'Limes', category: 'Produce', estimatedQuantity: '3 whole', confidence: 'High' },
      { name: 'Zucchini', category: 'Produce', estimatedQuantity: '2 medium', confidence: 'Medium' },
      { name: 'Mayonnaise', category: 'Condiments & Sauces', estimatedQuantity: '1 jar', confidence: 'High' },
    ],
  },
  {
    id: 'fridge-veggie',
    name: '[BOR] Vegetarian Harvest',
    description: 'Organic firm tofu, broccoli florets, carrots, mushrooms, tamari soy sauce, ginger, and oat milk.',
    thumbnailSvg: createFridgeSvg('veggie'),
    imageDataUri: createFridgeSvg('veggie'),
    presetNutrition: {
      totalCalories: 1420,
      totalProtein: '72g',
      totalCarbs: '128g',
      totalFat: '62g',
      nutritionInsight: 'Plant-forward nutrient profile packed with isoflavones from organic tofu, beta-carotene from carrots, and prebiotic dietary fiber.',
      macroDistribution: {
        proteinPercent: 21,
        carbsPercent: 38,
        fatPercent: 41,
      },
      topNutrientHighlights: ['Plant Isoflavones', 'Beta-Carotene', 'Dietary Fiber', 'Gingerols'],
    },
    presetIngredients: [
      { name: 'Firm Tofu', category: 'Proteins', estimatedQuantity: '1 block (14 oz)', confidence: 'High' },
      { name: 'Broccoli', category: 'Produce', estimatedQuantity: '1 large crown', confidence: 'High' },
      { name: 'Carrots', category: 'Produce', estimatedQuantity: '3 whole', confidence: 'High' },
      { name: 'Cremini Mushrooms', category: 'Produce', estimatedQuantity: '1 carton', confidence: 'High' },
      { name: 'Soy Sauce', category: 'Condiments & Sauces', estimatedQuantity: '1 bottle', confidence: 'High' },
      { name: 'Fresh Ginger', category: 'Produce', estimatedQuantity: '1 root', confidence: 'High' },
      { name: 'Hummus', category: 'Condiments & Sauces', estimatedQuantity: '1 tub', confidence: 'Medium' },
      { name: 'Oat Milk', category: 'Dairy & Eggs', estimatedQuantity: '1 carton', confidence: 'High' },
    ],
  },
  {
    id: 'fridge-quick',
    name: '[BOR] Quick Italian Skillet',
    description: 'Ground turkey, fresh mozzarella, marinara sauce, shaved parmesan, garlic, onions, and fresh basil.',
    thumbnailSvg: createFridgeSvg('quick'),
    imageDataUri: createFridgeSvg('quick'),
    presetNutrition: {
      totalCalories: 2150,
      totalProtein: '128g',
      totalCarbs: '68g',
      totalFat: '144g',
      nutritionInsight: 'Mediterranean skillet profile providing abundant lean poultry protein, bioavailable calcium from aged parmesan, and lycopene from marinara.',
      macroDistribution: {
        proteinPercent: 25,
        carbsPercent: 14,
        fatPercent: 61,
      },
      topNutrientHighlights: ['High Protein', 'Lycopene Antioxidant', 'Calcium', 'Allium Allicin'],
    },
    presetIngredients: [
      { name: 'Ground Turkey', category: 'Proteins', estimatedQuantity: '1 lb', confidence: 'High' },
      { name: 'Fresh Mozzarella', category: 'Dairy & Eggs', estimatedQuantity: '1 ball', confidence: 'High' },
      { name: 'Marinara Sauce', category: 'Condiments & Sauces', estimatedQuantity: '1 jar', confidence: 'High' },
      { name: 'Parmesan Cheese', category: 'Dairy & Eggs', estimatedQuantity: '1 wedge', confidence: 'High' },
      { name: 'Garlic', category: 'Produce', estimatedQuantity: '1 bulb', confidence: 'High' },
      { name: 'Yellow Onion', category: 'Produce', estimatedQuantity: '1 large', confidence: 'High' },
      { name: 'Fresh Basil', category: 'Produce', estimatedQuantity: '1 bunch', confidence: 'Medium' },
      { name: 'Heavy Cream', category: 'Dairy & Eggs', estimatedQuantity: '1 cup', confidence: 'Medium' },
    ],
  },
];
