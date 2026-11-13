import { ArrowLeft, Play } from 'lucide-react';
import { DISASTER_LIST } from '../data/scenarios';
import type { DisasterId, GameSettings } from '../types/game';
import { AudioAndCalmControls } from './AudioAndCalmControls';
import { DisclaimerBanner } from './DisclaimerBanner';
import { PreviewCanvas } from './PreviewCanvas';

interface DisasterSelectionScreenProps {
  settings: GameSettings;
  bestScores: Record<DisasterId, number>;
  onSelectDisaster: (id: DisasterId) => void;
  onBackToTitle: () => void;
  onToggleCalmMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
}

export function DisasterSelectionScreen({
  settings,
  bestScores,
  onSelectDisaster,
  onBackToTitle,
  onToggleCalmMode,
  onToggleMute,
  onChangeVolume,
}: DisasterSelectionScreenProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToTitle}
              aria-label="Back to main menu"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Menu</span>
            </button>
            <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Choose a Disaster Scenario
            </h1>
          </div>

          <AudioAndCalmControls
            settings={settings}
            onToggleCalmMode={onToggleCalmMode}
            onToggleMute={onToggleMute}
            onChangeVolume={onChangeVolume}
          />
        </div>

        <section className="my-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DISASTER_LIST.map((disaster) => {
            const best = bestScores[disaster.id] ?? 0;
            const visualHint =
              disaster.id === 'earthquake'
                ? 'Cracked ground · Swaying structures · Falling dust'
                : disaster.id === 'flood'
                  ? 'Rising water · Storm clouds · Submerged streets'
                  : 'Spreading smoke · Flickering flames · Burning facade';

            return (
              <article
                key={disaster.id}
                data-testid={`disaster-card-${disaster.id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-lg"
              >
                <div className="relative h-48 w-full overflow-hidden border-b border-slate-800 bg-slate-950">
                  <PreviewCanvas mode={disaster.id} calmMode={settings.calmMode} />
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-display text-2xl font-bold text-white">
                        {disaster.title}
                      </h2>
                      {best > 0 && (
                        <span className="font-mono-tabular text-xs font-semibold text-amber-400 whitespace-nowrap">
                          Best: {best}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {visualHint}
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {settings.calmMode ? disaster.calmDescription : disaster.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      3 Stages · 12 Choices
                    </span>

                    <button
                      type="button"
                      data-testid={`start-${disaster.id}`}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectDisaster(disaster.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-display text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap shrink-0"
                    >
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                      <span>Start {disaster.title}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <DisclaimerBanner />
      </div>
    </main>
  );
}
