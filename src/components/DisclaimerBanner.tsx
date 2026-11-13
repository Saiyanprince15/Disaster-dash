import { Info } from 'lucide-react';
import { EDUCATIONAL_DISCLAIMER } from '../data/scenarios';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  return (
    <aside
      aria-label="Educational Disclaimer"
      className={`flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/95 text-slate-300 ${
        compact ? 'px-3 py-2 text-xs leading-snug' : 'px-4 py-3 text-xs sm:text-sm leading-relaxed'
      }`}
    >
      <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
      <p>{EDUCATIONAL_DISCLAIMER}</p>
    </aside>
  );
}
