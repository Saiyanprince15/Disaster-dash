import { Volume2, VolumeX } from 'lucide-react';
import type { GameSettings } from '../types/game';

interface AudioAndCalmControlsProps {
  settings: GameSettings;
  onToggleCalmMode: () => void;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  showVolumeSlider?: boolean;
}

export function AudioAndCalmControls({
  settings,
  onToggleCalmMode,
  onToggleMute,
  onChangeVolume,
  showVolumeSlider = true,
}: AudioAndCalmControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={(e) => {
          e.currentTarget.blur();
          onToggleCalmMode();
        }}
        aria-pressed={settings.calmMode}
        data-testid="calm-mode-toggle"
        className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
          settings.calmMode
            ? 'border-emerald-500/60 bg-emerald-950/90 text-emerald-200 hover:bg-emerald-900/90'
            : 'border-slate-700 bg-slate-900/95 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
        }`}
      >
        <span>Calm Mode: {settings.calmMode ? 'On' : 'Off'}</span>
      </button>

      <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-2.5 py-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={settings.muted ? 'Unmute audio' : 'Mute audio'}
          aria-pressed={settings.muted}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          {settings.muted || settings.volume === 0 ? (
            <VolumeX className="h-4 w-4 text-slate-400" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4 text-amber-400" aria-hidden="true" />
          )}
        </button>

        {showVolumeSlider && (
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <span className="sr-only">Audio Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.muted ? 0 : Math.round(settings.volume * 100)}
              onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
              aria-label="Audio Volume"
              className="h-1.5 w-16 sm:w-20 cursor-pointer accent-amber-500"
            />
          </label>
        )}
      </div>
    </div>
  );
}
