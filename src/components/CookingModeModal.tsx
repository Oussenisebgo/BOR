import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Timer as TimerIcon,
  Sparkles,
  CheckCircle2,
  Mic,
  MicOff,
  Flame,
  ChefHat,
  Utensils,
  Lightbulb,
  Radio,
  Plus,
  HelpCircle,
  Keyboard,
  Info,
} from 'lucide-react';
import { Recipe, RecipeStep } from '../types';
import { SpeechService, SpeechState } from '../services/speechService';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [speechState, setSpeechState] = useState<SpeechState>({ isSpeaking: false, isPaused: false });
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer state for current step
  const currentStep: RecipeStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const initialSeconds = currentStep?.timerSeconds || 0;
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Voice recognition hands-free state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Subscribe to speech service
  useEffect(() => {
    const unsubscribe = SpeechService.subscribe((state) => {
      setSpeechState(state);
    });
    return () => {
      unsubscribe();
      SpeechService.stop();
    };
  }, []);

  // Update timer whenever step changes
  useEffect(() => {
    setIsTimerRunning(false);
    clearInterval(timerIntervalRef.current);
    const secs = recipe.steps[currentStepIndex]?.timerSeconds || 0;
    setTimerSecondsLeft(secs);

    if (autoNarrate && !isCompleted) {
      narrateCurrentStep(currentStepIndex);
    }
  }, [currentStepIndex, recipe]);

  // Timer countdown ticker
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            SpeechService.playTimerChime();
            SpeechService.readAloud('Timer complete! Check your pan.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, timerSecondsLeft]);

  // Read aloud helper
  const narrateCurrentStep = (stepIdx: number) => {
    const step = recipe.steps[stepIdx];
    if (!step) return;
    const textToSpeak = `Step ${step.stepNumber}. ${step.shortSummary}. ${step.instruction}${
      step.chefTip ? `. Chef's tip: ${step.chefTip}` : ''
    }`;
    SpeechService.readAloud(textToSpeak);
  };

  const handleToggleSpeech = () => {
    if (speechState.isSpeaking) {
      SpeechService.stop();
    } else {
      narrateCurrentStep(currentStepIndex);
    }
  };

  // Step navigation
  const goToNextStep = () => {
    SpeechService.stop();
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      SpeechService.readAloud('Congratulations! Your dish is complete. Bon appetit!');
    }
  };

  const goToPrevStep = () => {
    SpeechService.stop();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleToggleSpeech();
      } else if (e.key === 'Escape') {
        if (showHelpModal) {
          setShowHelpModal(false);
        } else {
          onClose();
        }
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        setShowHelpModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, recipe, speechState.isSpeaking, showHelpModal]);

  // Hands-free Voice recognition
  const toggleVoiceControl = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice recognition is not supported in this browser.');
      setTimeout(() => setVoiceNotice(null), 3000);
      return;
    }

    if (isVoiceListening) {
      recognitionRef.current?.stop();
      setIsVoiceListening(false);
      setVoiceNotice(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceNotice('Voice active! Say "Next step", "Previous step", "Repeat", or "Exit" (Say "Help" for list)');
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.toLowerCase().trim();

        // Check for exit / close
        if (
          transcript.includes('exit') ||
          transcript.includes('close') ||
          transcript.includes('quit') ||
          transcript.includes('stop cooking')
        ) {
          SpeechService.stop();
          onClose();
          return;
        }

        // Check for help overlay
        if (transcript.includes('help') || transcript.includes('commands')) {
          setShowHelpModal(true);
          return;
        }

        if (transcript.includes('hide help') || transcript.includes('close help')) {
          setShowHelpModal(false);
          return;
        }

        // Navigation
        if (transcript.includes('next') || transcript.includes('forward')) {
          goToNextStep();
        } else if (transcript.includes('back') || transcript.includes('previous')) {
          goToPrevStep();
        } else if (
          transcript.includes('repeat') ||
          transcript.includes('read') ||
          transcript.includes('again')
        ) {
          narrateCurrentStep(currentStepIndex);
        } else if (transcript.includes('timer') || transcript.includes('start timer')) {
          setIsTimerRunning(true);
        } else if (transcript.includes('stop timer') || transcript.includes('pause')) {
          setIsTimerRunning(false);
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        if (isVoiceListening) {
          try {
            recognition.start();
          } catch {
            setIsVoiceListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Format timer seconds to MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentStepIndex + 1) / recipe.steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col text-stone-100 select-none overflow-y-auto">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-4 border-b border-stone-800/80 bg-stone-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100 line-clamp-1">
              {recipe.title.startsWith('[BOR]') ? recipe.title : `[BOR] ${recipe.title}`}
            </h2>
            <div className="flex items-center space-x-3 text-xs text-stone-400">
              <span>{recipe.totalTime}</span>
              <span>•</span>
              <span>{recipe.calories} kcal</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Hands-Free Mode</span>
            </div>
          </div>
        </div>

        {/* Audio & Close Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Hands-Free Voice Listener Toggle */}
          <button
            onClick={toggleVoiceControl}
            title={isVoiceListening ? 'Turn off voice commands' : 'Turn on voice commands ("Next", "Back")'}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
              isVoiceListening
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
            }`}
          >
            {isVoiceListening ? (
              <>
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Voice Active</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-stone-400" />
                <span className="hidden sm:inline">Voice Commands</span>
              </>
            )}
          </button>

          {/* Auto Read Aloud Switch */}
          <button
            onClick={() => setAutoNarrate(!autoNarrate)}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 border transition-colors ${
              autoNarrate
                ? 'bg-stone-800 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-800/60 text-stone-400 border-stone-700'
            }`}
            title="Auto-read aloud when switching steps"
          >
            <Radio className={`w-3.5 h-3.5 ${autoNarrate ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span className="hidden md:inline">Auto-Read</span>
          </button>

          {/* Voice Commands Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="Voice commands guide ('H' or '?')"
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-emerald-400 border border-stone-700 transition-colors shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Help</span>
          </button>

          {/* Close Cooking Mode */}
          <button
            onClick={() => {
              SpeechService.stop();
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl border border-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Voice notice popup toast */}
      {voiceNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs py-1.5 px-4 text-center font-medium">
          {voiceNotice}
        </div>
      )}

      {/* Progress Line */}
      <div className="w-full bg-stone-800 h-1.5">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Area */}
      {!isCompleted ? (
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Step Counter & Category */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <span>Step {currentStep.stepNumber} of {recipe.steps.length}</span>
              </div>

              {/* Pulsing Read-Aloud Button */}
              <button
                onClick={handleToggleSpeech}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all transform active:scale-95 shadow-lg ${
                  speechState.isSpeaking
                    ? 'bg-emerald-500 text-stone-950 shadow-emerald-500/30 animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500'
                }`}
              >
                {speechState.isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Reading</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            </div>

            {/* Short Summary Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 font-serif tracking-tight">
              {currentStep.shortSummary}
            </h1>

            {/* Giant High-Contrast Step Instruction (Designed for reading across the kitchen counter!) */}
            <div className="p-6 sm:p-10 rounded-3xl bg-stone-900 border-2 border-stone-800 shadow-2xl relative overflow-hidden">
              <p className="text-xl sm:text-3xl lg:text-4xl font-medium text-stone-100 leading-relaxed tracking-wide">
                {currentStep.instruction}
              </p>

              {/* Speech soundwaves animation when active */}
              {speechState.isSpeaking && (
                <div className="mt-6 flex items-center space-x-1.5 text-emerald-400">
                  <span className="text-xs font-semibold tracking-wide uppercase mr-2">Speaking:</span>
                  {[0.4, 0.8, 1, 0.6, 0.9, 0.3, 0.7].map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-bounce"
                      style={{
                        height: `${height * 20}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Step Timer & Chef's Tip Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interactive Step Timer */}
              {currentStep.timerSeconds ? (
                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <TimerIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                        Step Cooking Timer
                      </div>
                      <div className="text-3xl font-mono font-extrabold text-amber-300">
                        {formatTimer(timerSecondsLeft)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                        isTimerRunning
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft(currentStep.timerSeconds || 0);
                      }}
                      title="Reset Timer"
                      className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl border border-stone-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 flex items-center space-x-3 text-stone-400 text-xs">
                  <Utensils className="w-5 h-5 text-stone-500 shrink-0" />
                  <span>No timer needed for this step. Prep and continue at your own pace.</span>
                </div>
              )}

              {/* Chef's Pro-Tip */}
              {currentStep.chefTip && (
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3 text-amber-200 text-xs sm:text-sm">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5 uppercase tracking-wide text-xs">
                      Chef's Pro-Tip:
                    </span>
                    <span className="text-amber-100/90 leading-relaxed">{currentStep.chefTip}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <footer className="pt-8 border-t border-stone-800/80 flex items-center justify-between gap-4">
            <button
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 font-bold text-base sm:text-lg flex items-center space-x-2 border border-stone-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {/* Repeat Audio Button */}
              <button
                onClick={() => narrateCurrentStep(currentStepIndex)}
                className="px-4 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-emerald-400 border border-stone-700 flex items-center space-x-2 text-sm font-semibold transition-colors cursor-pointer"
                title="Repeat instructions aloud"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Repeat</span>
              </button>

              {/* Voice Help Button */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="px-3.5 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-emerald-400 border border-stone-700 flex items-center space-x-2 text-sm font-semibold transition-colors cursor-pointer"
                title="View voice commands help"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Voice Help</span>
              </button>
            </div>

            <button
              onClick={goToNextStep}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-base sm:text-xl shadow-xl shadow-emerald-500/20 flex items-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{currentStepIndex === recipe.steps.length - 1 ? 'Finish Dish!' : 'Next Step'}</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </footer>
        </main>
      ) : (
        /* Recipe Completion Celebration Screen */
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Culinary Masterpiece Complete
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-stone-100">
              Bon Appétit!
            </h1>
            <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto">
              You just prepared <span className="text-stone-200 font-semibold">{recipe.title}</span> using ingredients straight from your fridge.
            </p>
          </div>

          {/* Recipe Highlights Summary */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md p-4 rounded-2xl bg-stone-900 border border-stone-800 text-center">
            <div>
              <span className="text-xs text-stone-400">Total Time</span>
              <p className="text-lg font-bold text-stone-200">{recipe.totalTime}</p>
            </div>
            <div className="border-x border-stone-800">
              <span className="text-xs text-stone-400">Calories</span>
              <p className="text-lg font-bold text-amber-400">{recipe.calories} kcal</p>
            </div>
            <div>
              <span className="text-xs text-stone-400">Servings</span>
              <p className="text-lg font-bold text-teal-400">{recipe.servings}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-md">
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentStepIndex(0);
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm border border-stone-700 transition-colors"
            >
              Cook Again
            </button>
            <button
              onClick={() => {
                SpeechService.stop();
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-colors"
            >
              Back to Recipes
            </button>
          </div>
        </main>
      )}

      {/* Voice Commands Help Modal Overlay */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-commands-help-title"
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelpModal(false);
          }}
        >
          <div className="bg-stone-900 border border-stone-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-stone-100 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="voice-commands-help-title" className="text-xl font-bold font-serif text-stone-100">
                    Voice Commands Guide
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Hands-free voice controls for cooking with messy hands
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
                title="Close Help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voice Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                isVoiceListening
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-400'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isVoiceListening ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
                  }`}
                />
                <span className="font-semibold text-stone-200">
                  Voice Recognition is {isVoiceListening ? 'Active (Listening)' : 'Turned Off'}
                </span>
              </div>
              <button
                onClick={() => toggleVoiceControl()}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  isVoiceListening
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                }`}
              >
                {isVoiceListening ? 'Turn Off' : 'Enable Voice'}
              </button>
            </div>

            {/* Commands List Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Available Voice Commands
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Next Step */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-emerald-400 font-mono">"Next step"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Next
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Advances to the next cooking step or finishes dish at the end.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Aliases: "Next", "Forward"
                  </div>
                </div>

                {/* Previous Step */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-emerald-400 font-mono">"Previous step"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-700 text-stone-300">
                        Back
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Returns to the previous step so you can review instructions.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Aliases: "Previous", "Back"
                  </div>
                </div>

                {/* Repeat */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-amber-400 font-mono">"Repeat"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Audio
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Narrates the current step instruction and chef's tips aloud again.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Aliases: "Read again", "Read", "Again"
                  </div>
                </div>

                {/* Exit */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-rose-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-rose-400 font-mono">"Exit"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Exit
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Stops speech synthesis and closes the Cooking Mode modal.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Aliases: "Close", "Quit", "Stop cooking"
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-teal-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-teal-400 font-mono">"Start timer"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        Timer
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Starts the countdown timer for the current cooking step.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Pause timer: "Stop timer" or "Pause"
                  </div>
                </div>

                {/* Help */}
                <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 hover:border-sky-500/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-sky-400 font-mono">"Help"</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Guide
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Opens this quick reference overlay anytime during cooking.
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-mono">
                    Aliases: "Commands", "Voice help"
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Bar */}
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-stone-300">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                <span>Keyboard Shortcuts Alternative</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-400">
                <div>
                  <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">Right</kbd> Next
                </div>
                <div>
                  <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">Left</kbd> Prev
                </div>
                <div>
                  <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">Space</kbd> Read
                </div>
                <div>
                  <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">H</kbd> Help / <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">Esc</kbd> Exit
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
              >
                Got it, let's cook!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
