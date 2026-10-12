import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Video,
  X,
  Scan,
  Zap,
  Activity,
  Flame,
  Dna,
  Wheat,
  Droplet,
  HeartPulse,
  Target,
} from 'lucide-react';
import { SAMPLE_FRIDGES, SampleFridge } from '../data/sampleFridges';
import { DetectedIngredient, FridgeNutritionSummary } from '../types';

interface FridgeScannerProps {
  onAnalyze: (imageData: string, mimeType?: string) => Promise<void>;
  isAnalyzing: boolean;
  detectedIngredients: DetectedIngredient[];
  fridgeSummary?: string;
  fridgeNutrition?: FridgeNutritionSummary | null;
  onRefreshNutrition?: () => void;
  isAnalyzingNutrition?: boolean;
  currentImage: string | null;
  onClearImage: () => void;
  onSelectSample: (sample: SampleFridge) => void;
}

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  onAnalyze,
  isAnalyzing,
  detectedIngredients,
  fridgeSummary,
  fridgeNutrition,
  onRefreshNutrition,
  isAnalyzingNutrition,
  currentImage,
  onClearImage,
  onSelectSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated analysis progress steps
  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      setAnalysisStep(1);
      timer = setInterval(() => {
        setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1600);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCountdown(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable. You can upload a photo or use one of our instant sample fridges.');
      setIsCameraActive(false);
    }
  };

  // Capture snapshot from webcam
  const captureSnapshot = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          performCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 800);
  };

  const performCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      onAnalyze(dataUrl, 'image/jpeg');
    }
  };

  // Handle file drop & selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onAnalyze(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5" />
          <span>[BOR] Multimodal Vision • Gemini 3.1 Pro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-100 font-serif">
          [BOR] Smart Fridge & Culinary Assistant
        </h1>
        <p className="text-stone-400 text-sm sm:text-base">
          Snap a photo of your open fridge. [BOR] AI detects visible ingredients, calculates nutrition,
          and suggests tailor-made recipes with hands-free voice cooking guidance.
        </p>
      </div>

      {/* Main Scanner Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Camera View */}
        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto border-2 border-emerald-500 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-8xl font-extrabold text-emerald-400 animate-ping">
                  {countdown}
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={stopCamera}
                className="p-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-full backdrop-blur-sm border border-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute bottom-6 inset-x-0 flex justify-center items-center space-x-4">
              <button
                onClick={captureSnapshot}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-full shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-stone-800/80 hover:bg-stone-700 text-stone-200 font-medium rounded-full backdrop-blur-sm text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Image Preview & Scanning Overlay */}
        {!isCameraActive && currentImage && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-700 bg-stone-950 aspect-video max-h-96 flex items-center justify-center">
              <img
                src={currentImage}
                alt="Captured Fridge"
                className="w-full h-full object-contain"
              />

              {/* Scanning Radar Laser Line */}
              {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-pulse absolute top-0 left-0 transition-all duration-1000 ease-in-out"
                       style={{ animation: 'scanLine 2.5s infinite alternate ease-in-out' }} />
                  <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px]" />
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <div className="bg-stone-900/90 border border-emerald-500/40 px-4 py-2 rounded-full shadow-xl flex items-center space-x-3 text-emerald-400 text-xs sm:text-sm font-medium">
                      <Scan className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>
                        {analysisStep === 1 && 'Scanning shelves & inventory...'}
                        {analysisStep === 2 && 'Identifying visible produce, proteins & sauces (Gemini 3.1 Pro)...'}
                        {analysisStep === 3 && 'Tailoring gourmet recipes & cook times...'}
                        {analysisStep === 0 && 'Analyzing fridge image...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Image control buttons */}
              {!isAnalyzing && (
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <button
                    onClick={onClearImage}
                    title="Remove Photo"
                    className="p-2 bg-stone-900/80 hover:bg-rose-950/80 hover:text-rose-400 text-stone-300 rounded-lg backdrop-blur-sm border border-stone-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Post-Scan Status Banner */}
            {!isAnalyzing && detectedIngredients.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-200">
                    Identified {detectedIngredients.length} ingredients from your fridge!
                  </p>
                  {fridgeSummary && (
                    <p className="text-stone-300 text-xs mt-1">{fridgeSummary}</p>
                  )}
                </div>
              </div>
            )}

            {/* Gemini Macro-Nutrients & Estimated Calories Summary Section */}
            {!isAnalyzing && detectedIngredients.length > 0 && fridgeNutrition && (
              <div className="bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center space-x-2">
                        <span>[BOR] Fridge Nutrition & Macro Inventory</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                          [BOR] Gemini AI
                        </span>
                      </h3>
                      <p className="text-xs text-stone-400">Total estimated energy and macronutrients in your open fridge</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('nutritional-goals-tracker');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center space-x-1.5 cursor-pointer"
                      title="Jump to daily nutritional goals comparison"
                    >
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Daily Target Goals</span>
                    </button>

                    {onRefreshNutrition && (
                      <button
                        type="button"
                        onClick={onRefreshNutrition}
                        disabled={isAnalyzingNutrition}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                        title="Recalculate nutrition with Gemini"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isAnalyzingNutrition ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isAnalyzingNutrition ? 'Analyzing...' : 'Re-analyze'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Big Stat Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Calories Card */}
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                      <span className="font-medium">Total Calories</span>
                      <Flame className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
                        {fridgeNutrition.totalCalories.toLocaleString()}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">kcal</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1">Combined fridge energy</span>
                  </div>

                  {/* Protein Card */}
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-emerald-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                      <span className="font-semibold">Total Protein</span>
                      <Dna className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
                        {fridgeNutrition.totalProtein}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400/70 mt-1">
                      {fridgeNutrition.macroDistribution?.proteinPercent ? `${fridgeNutrition.macroDistribution.proteinPercent}% of caloric split` : 'Muscle synthesis'}
                    </span>
                  </div>

                  {/* Carbs Card */}
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-amber-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
                      <span className="font-semibold">Total Carbs</span>
                      <Wheat className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                        {fridgeNutrition.totalCarbs}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400/70 mt-1">
                      {fridgeNutrition.macroDistribution?.carbsPercent ? `${fridgeNutrition.macroDistribution.carbsPercent}% of caloric split` : 'Dietary fiber & energy'}
                    </span>
                  </div>

                  {/* Fat Card */}
                  <div className="p-3.5 rounded-xl bg-stone-950/70 border border-rose-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
                      <span className="font-semibold">Total Fat</span>
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">
                        {fridgeNutrition.totalFat}
                      </span>
                    </div>
                    <span className="text-[10px] text-rose-400/70 mt-1">
                      {fridgeNutrition.macroDistribution?.fatPercent ? `${fridgeNutrition.macroDistribution.fatPercent}% of caloric split` : 'Healthy lipids & oils'}
                    </span>
                  </div>
                </div>

                {/* Macro Percentage Split Bar */}
                {fridgeNutrition.macroDistribution && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="font-semibold text-stone-300">Inventory Macro Distribution</span>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Protein {fridgeNutrition.macroDistribution.proteinPercent}%</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>Carbs {fridgeNutrition.macroDistribution.carbsPercent}%</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span>Fat {fridgeNutrition.macroDistribution.fatPercent}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Multi-segment bar */}
                    <div className="w-full h-2.5 rounded-full bg-stone-800 flex overflow-hidden">
                      <div
                        style={{ width: `${fridgeNutrition.macroDistribution.proteinPercent}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                        title={`Protein: ${fridgeNutrition.macroDistribution.proteinPercent}%`}
                      />
                      <div
                        style={{ width: `${fridgeNutrition.macroDistribution.carbsPercent}%` }}
                        className="bg-amber-500 transition-all duration-500"
                        title={`Carbs: ${fridgeNutrition.macroDistribution.carbsPercent}%`}
                      />
                      <div
                        style={{ width: `${fridgeNutrition.macroDistribution.fatPercent}%` }}
                        className="bg-rose-500 transition-all duration-500"
                        title={`Fat: ${fridgeNutrition.macroDistribution.fatPercent}%`}
                      />
                    </div>
                  </div>
                )}

                {/* Gemini Nutrition Insight Card */}
                {fridgeNutrition.nutritionInsight && (
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-start space-x-3">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-stone-300">
                      <span className="font-semibold text-emerald-300 mr-1.5">Gemini Dietary Insight:</span>
                      {fridgeNutrition.nutritionInsight}
                    </div>
                  </div>
                )}

                {/* Top Nutrient Highlights */}
                {fridgeNutrition.topNutrientHighlights && fridgeNutrition.topNutrientHighlights.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                      Highlights:
                    </span>
                    {fridgeNutrition.topNutrientHighlights.map((nutrient, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload & Snap Actions (When no image or camera active) */}
        {!isCameraActive && !currentImage && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-stone-700 hover:border-emerald-500/60 bg-stone-950/40 hover:bg-stone-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-stone-800 group-hover:bg-emerald-500/20 text-stone-400 group-hover:text-emerald-400 mx-auto flex items-center justify-center transition-colors mb-4 border border-stone-700 group-hover:border-emerald-500/40">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-semibold text-stone-200 group-hover:text-stone-100 mb-1">
                Drop your fridge photo here, or browse
              </h3>
              <p className="text-sm text-stone-400 max-w-sm mx-auto mb-6">
                Supports JPG, PNG, WebP. High-resolution shots of your shelves work best.
              </p>

              <div className="flex flex-wrap justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium text-sm border border-stone-600 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap with Camera</span>
                </button>
              </div>

              {cameraError && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* Preset Sample Fridges for Instant Testing */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Or test with 1-click sample fridges
                </span>
                <span className="text-xs text-stone-400">No camera needed</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_FRIDGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="group text-left p-3 rounded-xl bg-stone-950/60 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full rounded-lg bg-stone-900 overflow-hidden mb-2.5 p-2 flex items-center justify-center border border-stone-800 group-hover:border-emerald-500/30">
                      <img
                        src={sample.thumbnailSvg}
                        alt={sample.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200 group-hover:text-emerald-300 line-clamp-1">
                        {sample.name}
                      </h4>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                        {sample.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 5%; opacity: 0.8; }
          50% { opacity: 1; }
          100% { top: 92%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
