import { useEffect } from 'react';
import { Play } from 'lucide-react';
import type { GameSettings } from '../types/game';
import { AudioAndCalmControls } from './AudioAndCalmControls';
import { DisclaimerBanner } from './DisclaimerBanner';
import { PreviewCanvas } from './PreviewCanvas';

interface TitleScreenProps {
  settings: GameSettings;
  onStart: () => void;
  onToggleCalmMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
}

export function TitleScreen({
  settings,
  onStart,
  onToggleCalmMode,
  onToggleMute,
  onChangeVolume,
}: TitleScreenProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'BUTTON' || activeTag === 'INPUT') return;
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <PreviewCanvas mode="title" calmMode={settings.calmMode} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-6 sm:px-10 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-sm font-semibold tracking-wide text-amber-400">
            2D Survival Simulation
          </p>
          <AudioAndCalmControls
            settings={settings}
            onToggleCalmMode={onToggleCalmMode}
            onToggleMute={onToggleMute}
            onChangeVolume={onChangeVolume}
          />
        </div>

        <section className="my-auto max-w-2xl py-8">
          {/* Bespoke SVG Title Emblem */}
          <div className="mb-5 inline-flex items-center gap-3.5">
            <svg
              viewBox="0 0 56 56"
              className="h-14 w-14 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="50"
                height="50"
                rx="12"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2.5"
              />
              <circle cx="29" cy="16" r="4.5" fill="#F8FAFC" />
              <path
                d="M28 21 L25 32 M26 24 L35 28 M26 24 L19 29 M25 32 L18 44 M25 32 L34 43"
                stroke="#F8FAFC"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M25 22 Q18 24 14 27"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl text-balance">
                Disaster Dash
              </h1>
            </div>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Step into three unfolding emergency scenarios—Earthquake, Flood, and Fire.
            Watch each scene unfold, make rapid life-saving decisions, and learn why every choice matters.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onStart();
              }}
              className="inline-flex items-center gap-2.5 rounded-xl bg-amber-500 px-6 py-3.5 font-display text-base font-bold text-slate-950 shadow-lg transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap shrink-0"
            >
              <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              <span>Start Simulation</span>
            </button>

            <span className="text-xs sm:text-sm text-slate-400">
              {settings.calmMode
                ? 'Calm Mode active · No timers · Gentler visuals'
                : '3 Disasters · 9 Stages · Toggle Calm Mode anytime'}
            </span>
          </div>
        </section>

        <div className="space-y-3">
          <DisclaimerBanner />
          <p className="text-xs text-slate-400">
            Press Enter or Space to start · Keys 1–4 choose options during gameplay · Esc pauses
          </p>
        </div>
      </div>
    </main>
  );
}
