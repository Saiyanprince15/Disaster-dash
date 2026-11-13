import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  DoorOpen,
  Eye,
  Flame,
  Footprints,
  Hand,
  Pause,
  RotateCcw,
  Shield,
  SquareStack,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { renderGameplayScene } from '../canvas/disasterScenes';
import { createStickmanRig } from '../canvas/stickmanRenderer';
import { DISASTER_SCENARIOS } from '../data/scenarios';
import { getActiveStage, getSelectedOption } from '../game/rules';
import type { ActionIconKey, GameSettings, GameState, SceneKey } from '../types/game';
import { AudioAndCalmControls } from './AudioAndCalmControls';

interface GameplayScreenProps {
  state: GameState;
  settings: GameSettings;
  onSelectOption: (optionId: string) => void;
  onContinueAfterCorrect: () => void;
  onRetryStage: () => void;
  onTogglePause: () => void;
  onRestartScenario: () => void;
  onExitToSelection: () => void;
  onToggleCalmMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onSkipIntro: () => void;
}

function ActionIcon({ icon, className }: { icon: ActionIconKey; className?: string }) {
  const cls = className ?? 'h-4 w-4 shrink-0';
  switch (icon) {
    case 'shield':
      return <Shield className={cls} aria-hidden="true" />;
    case 'door':
      return <DoorOpen className={cls} aria-hidden="true" />;
    case 'stairs':
      return <Footprints className={cls} aria-hidden="true" />;
    case 'elevator':
      return <SquareStack className={cls} aria-hidden="true" />;
    case 'arrow_up':
      return <ArrowUp className={cls} aria-hidden="true" />;
    case 'flame':
      return <Flame className={cls} aria-hidden="true" />;
    case 'zap':
      return <Zap className={cls} aria-hidden="true" />;
    case 'car':
      return <Car className={cls} aria-hidden="true" />;
    case 'waves':
      return <Waves className={cls} aria-hidden="true" />;
    case 'hand':
      return <Hand className={cls} aria-hidden="true" />;
    case 'eye':
      return <Eye className={cls} aria-hidden="true" />;
    case 'wind':
      return <Wind className={cls} aria-hidden="true" />;
    case 'bag':
      return <Briefcase className={cls} aria-hidden="true" />;
    case 'building':
      return <Building2 className={cls} aria-hidden="true" />;
    case 'window':
    case 'alert':
    default:
      return <AlertTriangle className={cls} aria-hidden="true" />;
  }
}

export function GameplayScreen({
  state,
  settings,
  onSelectOption,
  onContinueAfterCorrect,
  onRetryStage,
  onTogglePause,
  onRestartScenario,
  onExitToSelection,
  onToggleCalmMode,
  onToggleMute,
  onChangeVolume,
  onSkipIntro,
}: GameplayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  stateRef.current = state;
  settingsRef.current = settings;

  const phaseStartRef = useRef<number>(performance.now());
  const prevPhaseKeyRef = useRef<string>('');
  const sceneTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rigRef = useRef(createStickmanRig());
  const previousSceneKeyRef = useRef<SceneKey | null>(null);
  const lastStageIndexRef = useRef<number>(state.currentStageIndex);

  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [touchPreviewId, setTouchPreviewId] = useState<string | null>(null);
  const [lockedSelectionId, setLockedSelectionId] = useState<string | null>(null);
  const [blurEntered, setBlurEntered] = useState(false);

  const scenario = state.activeDisasterId ? DISASTER_SCENARIOS[state.activeDisasterId] : null;
  const stage = getActiveStage(state);
  const selectedOption = getSelectedOption(state);

  // Track previous scene key for seamless camera pan between stages
  if (lastStageIndexRef.current !== state.currentStageIndex && scenario) {
    const prevStage = scenario.stages[lastStageIndexRef.current];
    if (prevStage && state.currentStageIndex > lastStageIndexRef.current) {
      previousSceneKeyRef.current = prevStage.sceneKey;
    } else {
      previousSceneKeyRef.current = null;
    }
    lastStageIndexRef.current = state.currentStageIndex;
  }
  if (state.currentStageIndex === 0 && state.phase === 'intro' && state.decisionsCompleted === 0) {
    previousSceneKeyRef.current = null;
  }

  const phaseKey = `${state.activeDisasterId}-${state.currentStageIndex}-${state.phase}-${state.selectedOptionId ?? ''}`;
  if (prevPhaseKeyRef.current !== phaseKey) {
    prevPhaseKeyRef.current = phaseKey;
    phaseStartRef.current = performance.now();
  }

  // Trigger progressive blur simultaneously when decision phase begins
  useEffect(() => {
    if (state.phase === 'decision') {
      setHoveredOptionId(null);
      setTouchPreviewId(null);
      setLockedSelectionId(null);
      setBlurEntered(false);
      const raf = requestAnimationFrame(() => {
        setBlurEntered(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    setBlurEntered(false);
  }, [state.phase, state.currentStageIndex, state.activeDisasterId]);

  // Canvas animation loop decoupled from React renders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastDraw = -100;
    lastFrameTimeRef.current = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (now - lastDraw < 28) return;
      const dt = Math.min(0.08, Math.max(0.001, (now - lastFrameTimeRef.current) / 1000));
      lastFrameTimeRef.current = now;
      lastDraw = now;

      const s = stateRef.current;
      const cfg = settingsRef.current;
      const activeStage = getActiveStage(s);
      const selOpt = getSelectedOption(s);

      // Freeze environmental & character scene time during decision phase & pause!
      const isFrozen = s.paused || s.phase === 'decision';
      if (!isFrozen) {
        sceneTimeRef.current += dt * (cfg.calmMode ? 0.68 : 1);
      }

      if (activeStage) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const phaseElapsedSec = s.paused ? 0.4 : (now - phaseStartRef.current) / 1000;

        ctx.save();
        ctx.scale(dpr, dpr);
        renderGameplayScene(ctx, w, h, {
          sceneKey: activeStage.sceneKey,
          previousSceneKey: previousSceneKeyRef.current,
          stageIndex: s.currentStageIndex,
          phase: s.phase,
          phaseElapsedSec,
          sceneTimeSec: sceneTimeRef.current,
          dt: isFrozen ? 0 : dt,
          calmMode: cfg.calmMode,
          outcomePose: selOpt?.outcomePose ?? 'idle',
          failureHazard: selOpt?.failureHazard ?? (s.timedOut ? 'falling_debris' : 'none'),
          selectedOptionId: s.selectedOptionId,
          timedOut: s.timedOut,
          rig: rigRef.current,
          onFootstep: (running) => soundEngine.playFootstep(running),
        });
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  // Keyboard shortcuts: 1-4 to pick options, Enter/Space to continue after correct, Esc/P to pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (state.phase !== 'gameover') {
          e.preventDefault();
          onTogglePause();
        }
        return;
      }

      if (state.paused) return;

      if (state.phase === 'decision' && stage && !lockedSelectionId) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx !== -1 && stage.options[idx]) {
          e.preventDefault();
          const opt = stage.options[idx];
          setLockedSelectionId(opt.id);
          onSelectOption(opt.id);
        }
      } else if (state.phase === 'consequence_correct' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onContinueAfterCorrect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.paused,
    state.phase,
    stage,
    lockedSelectionId,
    onSelectOption,
    onContinueAfterCorrect,
    onTogglePause,
  ]);

  const inspectedOption = useMemo(() => {
    if (!stage) return null;
    const id = touchPreviewId ?? hoveredOptionId;
    if (!id) return null;
    return stage.options.find((o) => o.id === id) ?? null;
  }, [stage, hoveredOptionId, touchPreviewId]);

  const correctOption = useMemo(() => {
    if (!stage) return null;
    return stage.options.find((o) => o.isCorrect) ?? null;
  }, [stage]);

  if (!scenario || !stage) return null;

  const timerPct = Math.max(0, Math.min(100, (state.timeRemaining / stage.timerSeconds) * 100));
  const timerUrgent = !settings.calmMode && state.timeRemaining <= 5;

  const lastPointerTypeRef = useRef<string>('mouse');

  const handleOptionActivate = (
    optionId: string,
    isKeyboard: boolean,
    buttonEl: HTMLButtonElement
  ) => {
    if (lockedSelectionId) return;

    const pointerType = isKeyboard ? 'keyboard' : lastPointerTypeRef.current;
    if (pointerType === 'touch' && touchPreviewId !== optionId) {
      // Touch devices: first tap reveals contextual info, second tap confirms
      soundEngine.playHover();
      setTouchPreviewId(optionId);
      setHoveredOptionId(optionId);
      return;
    }

    buttonEl.blur();
    setLockedSelectionId(optionId);
    onSelectOption(optionId);
  };

  // Smooth progressive blur (simultaneous with decision countdown!)
  const blurClasses =
    state.phase === 'decision' && blurEntered
      ? settings.calmMode
        ? 'backdrop-blur-[3.5px] bg-slate-950/30 opacity-100'
        : 'backdrop-blur-[7px] bg-slate-950/40 opacity-100'
      : 'backdrop-blur-none bg-slate-950/0 opacity-0';

  return (
    <main className="flex h-screen min-h-[540px] flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Unobtrusive Top Perimeter HUD */}
      <header className="z-20 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 bg-slate-950/95 px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            aria-label="Pause game"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
            <span className="font-display font-bold text-white whitespace-nowrap">
              {scenario.title}
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="font-mono-tabular font-semibold text-amber-400 whitespace-nowrap">
              Stage {stage.stageNumber}/3
            </span>
            <span className="hidden md:inline text-slate-600" aria-hidden="true">·</span>
            <span className="hidden md:inline text-slate-300 truncate">{stage.locationName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div
            data-testid="hud-score"
            className="flex items-center gap-3 text-xs sm:text-sm"
          >
            <span>
              <span className="text-slate-400 mr-1.5">Score</span>
              <span className="font-mono-tabular font-bold text-white">{state.score}</span>
            </span>
            <span className="hidden lg:inline text-slate-700" aria-hidden="true">·</span>
            <span className="hidden lg:inline">
              <span className="text-slate-400 mr-1">Correct</span>
              <span className="font-mono-tabular font-semibold text-emerald-400">
                {state.correctCount}
              </span>
            </span>
          </div>

          <AudioAndCalmControls
            settings={settings}
            onToggleCalmMode={onToggleCalmMode}
            onToggleMute={onToggleMute}
            onChangeVolume={onChangeVolume}
            showVolumeSlider={false}
          />
        </div>
      </header>

      {/* Primary Full-Viewport Animated 2D Survival Stage */}
      <section className="relative flex-1 w-full overflow-hidden bg-slate-950">
        <canvas
          ref={canvasRef}
          data-testid="game-canvas"
          aria-label={`${scenario.title} stage ${stage.stageNumber} animated scene at ${stage.locationName}`}
          className="block h-full w-full"
        />

        {/* Progressive Blur Backdrop synchronized with Countdown Timer */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-[backdrop-filter,opacity,background-color] ease-out ${
            settings.calmMode ? 'duration-700' : 'duration-500'
          } ${blurClasses}`}
        />

        {/* Intro Cinematic Caption Strip */}
        {state.phase === 'intro' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 px-4 sm:px-6 flex justify-center">
            <div className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-xl border border-slate-700/80 bg-slate-950/88 px-4 py-2.5 shadow-2xl backdrop-blur-sm">
              <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                {settings.calmMode ? stage.calmEstablishingText : stage.establishingText}
              </p>
              <button
                type="button"
                onClick={onSkipIntro}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Floating Compact Decision Interface over Blurred Frozen Scene */}
        {state.phase === 'decision' && (
          <div
            data-testid="decision-panel"
            className="absolute inset-0 z-10 flex flex-col items-center justify-end p-3 sm:p-6 pb-4 sm:pb-7 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl space-y-2.5">
              {/* Situation Cue + Synchronized Timer Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-700/80 bg-slate-950/85 px-4 py-2.5 shadow-lg backdrop-blur-md">
                <h2 className="font-display text-sm sm:text-base font-bold text-white leading-snug max-w-xl">
                  {settings.calmMode ? stage.calmPrompt : stage.prompt}
                </h2>

                {settings.calmMode ? (
                  <div
                    data-testid="calm-timer-disabled"
                    className="text-xs font-semibold text-emerald-300 whitespace-nowrap"
                  >
                    Calm Mode · No Timer
                  </div>
                ) : (
                  <div
                    data-testid="normal-timer"
                    className="flex items-center gap-2.5 shrink-0"
                  >
                    <div className="w-24 sm:w-32 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-[width] duration-100 linear ${
                          timerUrgent ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${timerPct}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono-tabular text-xs sm:text-sm font-bold w-8 text-right ${
                        timerUrgent ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {Math.ceil(state.timeRemaining)}s
                    </span>
                  </div>
                )}
              </div>

              {/* Contextual Hover / Touch Description Popover (Never spoils right/wrong!) */}
              <div
                aria-live="polite"
                data-testid="action-hover-info"
                className="flex min-h-[42px] items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-300 backdrop-blur-md transition-opacity duration-150"
              >
                {inspectedOption ? (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <ActionIcon
                        icon={inspectedOption.actionIcon}
                        className="h-4 w-4 shrink-0 text-amber-400"
                      />
                      <span className="truncate sm:whitespace-normal leading-snug text-slate-100">
                        <strong className="font-semibold text-amber-300 mr-1.5">
                          {inspectedOption.shortLabel}:
                        </strong>
                        {inspectedOption.hoverDescription}
                      </span>
                    </div>
                    {touchPreviewId === inspectedOption.id && (
                      <span className="text-[11px] font-semibold text-amber-300 whitespace-nowrap shrink-0">
                        Tap again to act
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">
                    Hover or focus an action to inspect what it involves · Keys 1–4
                  </span>
                )}
              </div>

              {/* Four Compact Interactive Action Prompts */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {stage.options.map((opt, idx) => {
                  const isSelected = lockedSelectionId === opt.id;
                  const isPreviewed = touchPreviewId === opt.id || hoveredOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(lockedSelectionId)}
                      data-testid={`option-${idx + 1}`}
                      onMouseEnter={() => {
                        if (!lockedSelectionId) {
                          soundEngine.playHover();
                          setHoveredOptionId(opt.id);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredOptionId((prev) => (prev === opt.id ? null : prev));
                      }}
                      onFocus={() => {
                        if (!lockedSelectionId) {
                          setHoveredOptionId(opt.id);
                        }
                      }}
                      onBlur={() => {
                        setHoveredOptionId((prev) => (prev === opt.id ? null : prev));
                      }}
                      onPointerDown={(e) => {
                        lastPointerTypeRef.current = e.pointerType || 'mouse';
                      }}
                      onClick={(e) => {
                        handleOptionActivate(opt.id, e.detail === 0, e.currentTarget);
                      }}
                      className={`group flex min-h-[48px] items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left shadow-lg backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                        isSelected
                          ? 'scale-[0.98] border-amber-400 bg-amber-500/20 text-white'
                          : isPreviewed
                            ? 'scale-[1.015] border-amber-400/80 bg-slate-900/95 text-white shadow-amber-500/10'
                            : 'border-slate-700/90 bg-slate-900/88 text-slate-100 hover:scale-[1.015] hover:border-amber-400/80 hover:bg-slate-800/95'
                      } disabled:cursor-not-allowed`}
                    >
                      <span className="font-mono-tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-xs font-bold text-amber-400 group-hover:border-amber-400/70">
                        {idx + 1}
                      </span>
                      <ActionIcon
                        icon={opt.actionIcon}
                        className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-amber-300 transition-colors"
                      />
                      <span className="font-display text-sm font-semibold leading-tight text-slate-100">
                        {opt.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Non-Blocking Rewarding Confirmation Banner during Survival Animation */}
        {state.phase === 'consequence_correct' && selectedOption && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3 sm:px-6">
            <div
              data-testid="correct-feedback"
              className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/50 bg-slate-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-display">
                    <span>{selectedOption.feedbackTitle}</span>
                    <span className="text-emerald-400 font-mono-tabular">· +100 pts</span>
                  </div>
                  <p className="text-xs leading-snug text-slate-300">
                    {selectedOption.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="continue-button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onContinueAfterCorrect();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 font-display text-xs sm:text-sm font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
              >
                <span>{state.currentStageIndex < 2 ? 'Next Stage' : 'Finish'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Structured Death Explanation & Game Over Overlay */}
        {state.phase === 'gameover' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gameover-heading"
            data-testid="gameover-modal"
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]"
          >
            <div className="w-full max-w-lg rounded-xl border border-rose-500/45 bg-slate-900/95 p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <h2 id="gameover-heading" className="font-display text-xl sm:text-2xl font-extrabold text-white">
                    Game Over
                  </h2>
                </div>
                <span className="font-mono-tabular text-sm font-bold text-rose-400">
                  -50 pts
                </span>
              </div>

              <div className="mt-4 space-y-3.5 text-sm">
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                    What You Did
                  </p>
                  <p className="mt-0.5 font-display font-semibold text-white">
                    {state.timedOut
                      ? 'Hesitated until the countdown expired.'
                      : selectedOption?.shortLabel ?? 'Unsafe action selected.'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-rose-400">
                    Why It Failed
                  </p>
                  <p className="mt-0.5 leading-relaxed text-slate-200">
                    {state.timedOut
                      ? 'Waiting too long during an active emergency leaves you exposed to escalating hazards. Act decisively or switch to Calm Mode.'
                      : selectedOption?.explanation}
                  </p>
                </div>

                {correctOption && (
                  <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
                      What You Should Have Done
                    </p>
                    <p className="mt-0.5 leading-relaxed text-slate-200">
                      <strong className="text-white font-semibold">{correctOption.shortLabel}:</strong>{' '}
                      {stage.safetyPrinciple}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">
                  Score: <strong className="font-mono-tabular text-slate-200">{state.score}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onExitToSelection}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 whitespace-nowrap"
                  >
                    Return to Disasters
                  </button>
                  <button
                    type="button"
                    data-testid="retry-button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onRetryStage();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-display text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-400 whitespace-nowrap"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pause Modal */}
        {state.paused && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-heading"
            data-testid="pause-modal"
            className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 id="pause-heading" className="font-display text-2xl font-bold text-white">
                Simulation Paused
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Adjust audio or switch between Normal and Calm Mode without losing progress.
              </p>

              <div className="mt-4">
                <AudioAndCalmControls
                  settings={settings}
                  onToggleCalmMode={onToggleCalmMode}
                  onToggleMute={onToggleMute}
                  onChangeVolume={onChangeVolume}
                />
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={onTogglePause}
                  className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-display text-sm font-bold text-slate-950 hover:bg-amber-400"
                >
                  Resume Simulation
                </button>
                <button
                  type="button"
                  onClick={onRestartScenario}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Restart {scenario.title}
                </button>
                <button
                  type="button"
                  onClick={onExitToSelection}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Back to Disaster Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
