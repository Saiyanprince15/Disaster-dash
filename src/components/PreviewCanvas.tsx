import { useEffect, useRef } from 'react';
import { renderCardPreviewScene, renderTitleHorizonScene } from '../canvas/disasterScenes';
import type { DisasterId } from '../types/game';

interface PreviewCanvasProps {
  mode: 'title' | DisasterId;
  calmMode: boolean;
  className?: string;
}

export function PreviewCanvas({ mode, calmMode, className = '' }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const calmRef = useRef(calmMode);
  calmRef.current = calmMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const start = performance.now();
    let lastDraw = -100;

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

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      if (now - lastDraw < 40) return;
      lastDraw = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const t = (now - start) / 1000;

      ctx.save();
      ctx.scale(dpr, dpr);
      if (mode === 'title') {
        renderTitleHorizonScene(ctx, w, h, t, calmRef.current);
      } else {
        renderCardPreviewScene(ctx, w, h, mode, t, calmRef.current);
      }
      ctx.restore();
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block h-full w-full ${className}`}
    />
  );
}
