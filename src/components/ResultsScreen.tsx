import { Award, RotateCcw, ArrowLeft } from 'lucide-react';
import { DISASTER_SCENARIOS } from '../data/scenarios';
import { computePerformanceRating } from '../game/rules';
import type { GameSettings, GameState } from '../types/game';
import { AudioAndCalmControls } from './AudioAndCalmControls';
import { DisclaimerBanner } from './DisclaimerBanner';

interface ResultsScreenProps {
  state: GameState;
  settings: GameSettings;
  onReplayDisaster: () => void;
  onChooseAnotherDisaster: () => void;
  onToggleCalmMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
}

export function ResultsScreen({
  state,
  settings,
  onReplayDisaster,
  onChooseAnotherDisaster,
  onToggleCalmMode,
  onToggleMute,
  onChangeVolume,
}: ResultsScreenProps) {
  const scenario = state.activeDisasterId ? DISASTER_SCENARIOS[state.activeDisasterId] : null;
  if (!scenario) return null;

  const rating = computePerformanceRating(state);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Award className="h-6 w-6" aria-hidden="true" />
            <span className="font-display text-lg font-bold text-white">
              Survival Complete · {scenario.title}
            </span>
          </div>

          <AudioAndCalmControls
            settings={settings}
            onToggleCalmMode={onToggleCalmMode}
            onToggleMute={onToggleMute}
            onChangeVolume={onChangeVolume}
          />
        </div>

        <section className="my-6 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Final Performance
                </p>
                <h1
                  data-testid="results-grade"
                  className="mt-1 font-display text-3xl font-extrabold text-white sm:text-4xl"
                >
                  {rating.grade}
                </h1>
                <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300">
                  {rating.summary}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-slate-950 px-6 py-4 text-right">
                <p className="text-xs font-medium text-slate-400">Final Score</p>
                <p
                  data-testid="final-score"
                  className="font-mono-tabular mt-1 text-4xl font-extrabold text-amber-400"
                >
                  {state.score}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Includes +{scenario.completionBonus} completion bonus
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-800 pt-6">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">Decisions Completed</p>
                <p className="font-mono-tabular mt-1 text-2xl font-bold text-white">
                  {state.decisionsCompleted} / 3
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">Correct Decisions</p>
                <p className="font-mono-tabular mt-1 text-2xl font-bold text-emerald-400">
                  {state.correctCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-400">Incorrect Decisions</p>
                <p className="font-mono-tabular mt-1 text-2xl font-bold text-rose-400">
                  {state.incorrectCount}
                </p>
              </div>
            </div>
          </div>

          {/* Key Safety Takeaways */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Safety Principles Applied in {scenario.title}
            </h2>
            <ol className="mt-4 space-y-3">
              {scenario.stages.map((st) => (
                <li
                  key={st.id}
                  className="flex flex-col gap-1 border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs font-semibold text-amber-400">
                    Stage {st.stageNumber} · {st.locationName}
                  </span>
                  <span className="text-sm text-slate-200">{st.safetyPrinciple}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="choose-another-disaster"
              onClick={onChooseAnotherDisaster}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-display text-sm font-bold text-slate-950 hover:bg-amber-400 whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Play Another Disaster</span>
            </button>

            <button
              type="button"
              data-testid="replay-disaster"
              onClick={onReplayDisaster}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Replay {scenario.title}</span>
            </button>
          </div>
        </section>

        <DisclaimerBanner />
      </div>
    </main>
  );
}
