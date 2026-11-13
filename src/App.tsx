import { useCallback, useEffect, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { DisasterSelectionScreen } from './components/DisasterSelectionScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { TitleScreen } from './components/TitleScreen';
import { DISASTER_SCENARIOS } from './data/scenarios';
import {
  advanceAfterCorrectDecision,
  beginDecisionPhase,
  createInitialGameState,
  createInitialSettings,
  getActiveStage,
  retryCurrentStage,
  revealGameOver,
  startDisaster,
  submitDecision,
  tickTimer,
  toggleCalmModeSetting,
} from './game/rules';
import type { DisasterId, GameSettings, GameState } from './types/game';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initial = createInitialGameState();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return { ...initial, screen: 'selection' };
      }
    }
    return initial;
  });

  const [settings, setSettings] = useState<GameSettings>(() => createInitialSettings());

  // Sync sound engine settings
  useEffect(() => {
    soundEngine.updateSettings(settings);
  }, [settings]);

  // Mirror state machine to document.body.dataset.state for accessibility & automated verification
  useEffect(() => {
    if (gameState.screen === 'title') {
      document.body.dataset.state = 'title';
    } else if (gameState.screen === 'selection') {
      document.body.dataset.state = 'selection';
    } else if (gameState.screen === 'results' || gameState.phase === 'gameover') {
      document.body.dataset.state = 'gameover';
    } else if (gameState.paused) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [gameState.screen, gameState.phase, gameState.paused]);

  // Intro establishing sequence auto-transition to decision point (freeze + blur + timer start together)
  useEffect(() => {
    if (gameState.screen !== 'gameplay' || gameState.phase !== 'intro' || gameState.paused) {
      return;
    }
    const stage = getActiveStage(gameState);
    if (!stage) return;

    if (gameState.currentStageIndex > 0) {
      soundEngine.playStageTransition();
    }
    if (gameState.activeDisasterId) {
      soundEngine.playDisasterIntro(gameState.activeDisasterId);
    }

    const delay = settings.calmMode ? stage.calmIntroDurationMs : stage.introDurationMs;
    const timer = window.setTimeout(() => {
      soundEngine.playDecisionFreeze();
      setGameState((prev) => beginDecisionPhase(prev));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    gameState.screen,
    gameState.phase,
    gameState.paused,
    gameState.currentStageIndex,
    gameState.activeDisasterId,
    settings.calmMode,
  ]);

  // Normal Mode countdown timer synchronized with blur (100ms smooth tick; disabled in Calm Mode)
  useEffect(() => {
    if (
      settings.calmMode ||
      gameState.screen !== 'gameplay' ||
      gameState.phase !== 'decision' ||
      gameState.paused
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setGameState((prev) => {
        const next = tickTimer(prev, settings, 0.1);
        const prevSec = Math.ceil(prev.timeRemaining);
        const nextSec = Math.ceil(next.timeRemaining);
        if (next.phase === 'decision' && nextSec < prevSec && nextSec <= 5 && nextSec > 0) {
          soundEngine.playCountdownTick(nextSec <= 3);
        }
        if (next.phase === 'consequence_incorrect' && prev.phase === 'decision') {
          soundEngine.playIncorrect();
          soundEngine.playHazardConsequence('falling_debris');
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [settings, gameState.screen, gameState.phase, gameState.paused]);

  // Auto-advance seamlessly after the survival animation & exit pan complete
  useEffect(() => {
    if (
      gameState.screen !== 'gameplay' ||
      gameState.phase !== 'consequence_correct' ||
      gameState.paused
    ) {
      return;
    }
    const duration = settings.calmMode ? 3400 : 2850;
    const timer = window.setTimeout(() => {
      setGameState((prev) => {
        const next = advanceAfterCorrectDecision(prev);
        if (next.screen === 'results') {
          soundEngine.playVictory();
        }
        return next;
      });
    }, duration);

    return () => window.clearTimeout(timer);
  }, [gameState.screen, gameState.phase, gameState.paused, settings.calmMode]);

  // Full cinematic failure sequence beat (hazard -> collapse -> desaturate -> grey fade -> Game Over)
  useEffect(() => {
    if (gameState.screen !== 'gameplay' || gameState.phase !== 'consequence_incorrect') {
      return;
    }
    const delay = settings.calmMode ? 1250 : 1650;
    const timer = window.setTimeout(() => {
      soundEngine.playGameOver();
      setGameState((prev) => revealGameOver(prev));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [gameState.screen, gameState.phase, settings.calmMode]);

  const handleToggleCalmMode = useCallback(() => {
    soundEngine.playSelect();
    setSettings((prev) => toggleCalmModeSetting(prev));
  }, []);

  const handleToggleMute = useCallback(() => {
    setSettings((prev) => ({ ...prev, muted: !prev.muted }));
  }, []);

  const handleChangeVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSettings((prev) => ({
      ...prev,
      volume: clamped,
      muted: clamped === 0,
    }));
  }, []);

  const handleStartFromTitle = useCallback(() => {
    soundEngine.playSelect();
    setGameState((prev) => ({ ...prev, screen: 'selection' }));
  }, []);

  const handleSelectDisaster = useCallback((id: DisasterId) => {
    soundEngine.playSelect();
    setGameState((prev) => startDisaster(prev, id));
  }, []);

  const handleSelectOption = useCallback((optionId: string) => {
    setGameState((prev) => {
      const stage = getActiveStage(prev);
      const picked = stage?.options.find((o) => o.id === optionId);
      const { nextState, outcome } = submitDecision(prev, optionId);
      if (outcome === 'correct') {
        soundEngine.playCorrect();
      } else if (outcome === 'incorrect') {
        soundEngine.playIncorrect();
        if (picked) {
          soundEngine.playHazardConsequence(picked.failureHazard);
        }
      }
      return nextState;
    });
  }, []);

  const handleContinueAfterCorrect = useCallback(() => {
    soundEngine.playSelect();
    setGameState((prev) => {
      const next = advanceAfterCorrectDecision(prev);
      if (next.screen === 'results') {
        soundEngine.playVictory();
      }
      return next;
    });
  }, []);

  const handleRetryStage = useCallback(() => {
    soundEngine.playSelect();
    setGameState((prev) => retryCurrentStage(prev));
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  }, []);

  const handleRestartScenario = useCallback(() => {
    soundEngine.playSelect();
    setGameState((prev) =>
      prev.activeDisasterId ? startDisaster(prev, prev.activeDisasterId) : prev
    );
  }, []);

  const handleExitToSelection = useCallback(() => {
    soundEngine.playSelect();
    setGameState((prev) => ({
      ...prev,
      screen: 'selection',
      paused: false,
    }));
  }, []);

  const handleSkipIntro = useCallback(() => {
    soundEngine.playSelect();
    soundEngine.playDecisionFreeze();
    setGameState((prev) => beginDecisionPhase(prev));
  }, []);

  if (gameState.screen === 'title') {
    return (
      <TitleScreen
        settings={settings}
        onStart={handleStartFromTitle}
        onToggleCalmMode={handleToggleCalmMode}
        onToggleMute={handleToggleMute}
        onChangeVolume={handleChangeVolume}
      />
    );
  }

  if (gameState.screen === 'selection') {
    return (
      <DisasterSelectionScreen
        settings={settings}
        bestScores={gameState.bestScores}
        onSelectDisaster={handleSelectDisaster}
        onBackToTitle={() => setGameState((prev) => ({ ...prev, screen: 'title' }))}
        onToggleCalmMode={handleToggleCalmMode}
        onToggleMute={handleToggleMute}
        onChangeVolume={handleChangeVolume}
      />
    );
  }

  if (gameState.screen === 'results') {
    return (
      <ResultsScreen
        state={gameState}
        settings={settings}
        onReplayDisaster={handleRestartScenario}
        onChooseAnotherDisaster={handleExitToSelection}
        onToggleCalmMode={handleToggleCalmMode}
        onToggleMute={handleToggleMute}
        onChangeVolume={handleChangeVolume}
      />
    );
  }

  // Gameplay screen
  const activeScenario = gameState.activeDisasterId
    ? DISASTER_SCENARIOS[gameState.activeDisasterId]
    : null;
  if (!activeScenario) return null;

  return (
    <GameplayScreen
      state={gameState}
      settings={settings}
      onSelectOption={handleSelectOption}
      onContinueAfterCorrect={handleContinueAfterCorrect}
      onRetryStage={handleRetryStage}
      onTogglePause={handleTogglePause}
      onRestartScenario={handleRestartScenario}
      onExitToSelection={handleExitToSelection}
      onToggleCalmMode={handleToggleCalmMode}
      onToggleMute={handleToggleMute}
      onChangeVolume={handleChangeVolume}
      onSkipIntro={handleSkipIntro}
    />
  );
}
