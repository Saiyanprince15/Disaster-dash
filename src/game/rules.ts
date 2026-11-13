import { DISASTER_SCENARIOS } from '../data/scenarios';
import type {
  DecisionOption,
  DecisionPoint,
  DisasterId,
  GameSettings,
  GameState,
} from '../types/game';

export const POINTS_CORRECT = 100;
export const POINTS_INCORRECT = -50;

export function createInitialGameState(): GameState {
  return {
    screen: 'title',
    activeDisasterId: null,
    currentStageIndex: 0,
    phase: 'intro',
    paused: false,
    score: 0,
    decisionsCompleted: 0,
    correctCount: 0,
    incorrectCount: 0,
    answeredDecisionIds: [],
    selectedOptionId: null,
    timedOut: false,
    lastScoreDelta: 0,
    timeRemaining: 20,
    bestScores: {
      earthquake: 0,
      flood: 0,
      fire: 0,
    },
  };
}

export function createInitialSettings(): GameSettings {
  return {
    calmMode: false,
    muted: false,
    volume: 0.6,
  };
}

export function getActiveStage(state: GameState): DecisionPoint | null {
  if (!state.activeDisasterId) return null;
  const scenario = DISASTER_SCENARIOS[state.activeDisasterId];
  return scenario.stages[state.currentStageIndex] ?? null;
}

export function getSelectedOption(state: GameState): DecisionOption | null {
  const stage = getActiveStage(state);
  if (!stage || !state.selectedOptionId) return null;
  return stage.options.find((o) => o.id === state.selectedOptionId) ?? null;
}

export function startDisaster(state: GameState, disasterId: DisasterId): GameState {
  const firstStage = DISASTER_SCENARIOS[disasterId].stages[0];
  return {
    ...state,
    screen: 'gameplay',
    activeDisasterId: disasterId,
    currentStageIndex: 0,
    phase: 'intro',
    paused: false,
    score: 0,
    decisionsCompleted: 0,
    correctCount: 0,
    incorrectCount: 0,
    answeredDecisionIds: [],
    selectedOptionId: null,
    timedOut: false,
    lastScoreDelta: 0,
    timeRemaining: firstStage.timerSeconds,
  };
}

export function beginDecisionPhase(state: GameState): GameState {
  if (state.screen !== 'gameplay' || state.phase !== 'intro') return state;
  const stage = getActiveStage(state);
  return {
    ...state,
    phase: 'decision',
    selectedOptionId: null,
    timedOut: false,
    timeRemaining: stage ? stage.timerSeconds : 20,
  };
}

export function submitDecision(
  state: GameState,
  optionId: string
): { nextState: GameState; outcome: 'correct' | 'incorrect' | 'ignored' } {
  if (state.screen !== 'gameplay' || state.phase !== 'decision' || state.paused) {
    return { nextState: state, outcome: 'ignored' };
  }

  const stage = getActiveStage(state);
  if (!stage) {
    return { nextState: state, outcome: 'ignored' };
  }

  // Prevent repeated scoring on the same decision point once already resolved positively
  if (state.answeredDecisionIds.includes(stage.id)) {
    return { nextState: state, outcome: 'ignored' };
  }

  const option = stage.options.find((opt) => opt.id === optionId);
  if (!option) {
    return { nextState: state, outcome: 'ignored' };
  }

  if (option.isCorrect) {
    const newScore = state.score + POINTS_CORRECT;
    return {
      outcome: 'correct',
      nextState: {
        ...state,
        phase: 'consequence_correct',
        score: newScore,
        decisionsCompleted: state.decisionsCompleted + 1,
        correctCount: state.correctCount + 1,
        answeredDecisionIds: [...state.answeredDecisionIds, stage.id],
        selectedOptionId: option.id,
        timedOut: false,
        lastScoreDelta: POINTS_CORRECT,
      },
    };
  }

  const newScore = state.score + POINTS_INCORRECT;
  return {
    outcome: 'incorrect',
    nextState: {
      ...state,
      phase: 'consequence_incorrect',
      score: newScore,
      incorrectCount: state.incorrectCount + 1,
      selectedOptionId: option.id,
      timedOut: false,
      lastScoreDelta: POINTS_INCORRECT,
    },
  };
}

export function triggerTimeExpired(state: GameState, settings: GameSettings): GameState {
  // Calm Mode NEVER times out
  if (settings.calmMode) return state;
  if (state.screen !== 'gameplay' || state.phase !== 'decision' || state.paused) return state;

  return {
    ...state,
    phase: 'consequence_incorrect',
    score: state.score + POINTS_INCORRECT,
    incorrectCount: state.incorrectCount + 1,
    selectedOptionId: null,
    timedOut: true,
    lastScoreDelta: POINTS_INCORRECT,
    timeRemaining: 0,
  };
}

export function tickTimer(
  state: GameState,
  settings: GameSettings,
  deltaSeconds: number
): GameState {
  if (settings.calmMode || state.paused || state.screen !== 'gameplay' || state.phase !== 'decision') {
    return state;
  }
  const nextRemaining = Math.max(0, state.timeRemaining - deltaSeconds);
  if (nextRemaining <= 0) {
    return triggerTimeExpired(state, settings);
  }
  return {
    ...state,
    timeRemaining: nextRemaining,
  };
}

export function revealGameOver(state: GameState): GameState {
  if (state.phase !== 'consequence_incorrect') return state;
  return {
    ...state,
    phase: 'gameover',
  };
}

export function retryCurrentStage(state: GameState): GameState {
  if (!state.activeDisasterId) return state;
  const stage = getActiveStage(state);
  return {
    ...state,
    screen: 'gameplay',
    phase: 'decision',
    paused: false,
    selectedOptionId: null,
    timedOut: false,
    lastScoreDelta: 0,
    timeRemaining: stage ? stage.timerSeconds : 20,
  };
}

export function advanceAfterCorrectDecision(state: GameState): GameState {
  if (!state.activeDisasterId || state.phase !== 'consequence_correct') return state;
  const scenario = DISASTER_SCENARIOS[state.activeDisasterId];
  const nextIndex = state.currentStageIndex + 1;

  if (nextIndex < scenario.stages.length) {
    const nextStage = scenario.stages[nextIndex];
    return {
      ...state,
      currentStageIndex: nextIndex,
      phase: 'intro',
      selectedOptionId: null,
      timedOut: false,
      lastScoreDelta: 0,
      timeRemaining: nextStage.timerSeconds,
    };
  }

  // Completed all 3 stages -> award completion bonus and show victory/results
  const finalScore = state.score + scenario.completionBonus;
  const prevBest = state.bestScores[scenario.id] ?? 0;
  return {
    ...state,
    screen: 'results',
    phase: 'victory',
    score: finalScore,
    lastScoreDelta: scenario.completionBonus,
    bestScores: {
      ...state.bestScores,
      [scenario.id]: Math.max(prevBest, finalScore),
    },
  };
}

export function toggleCalmModeSetting(settings: GameSettings): GameSettings {
  return {
    ...settings,
    calmMode: !settings.calmMode,
  };
}

export function computePerformanceRating(state: GameState): {
  grade: string;
  summary: string;
} {
  if (state.incorrectCount === 0) {
    return {
      grade: 'Preparedness Ace',
      summary: 'Every hazard navigated calmly with zero dangerous missteps.',
    };
  }
  if (state.incorrectCount === 1) {
    return {
      grade: 'Resilient Survivor',
      summary: 'Strong situational awareness with quick recovery from one hazard error.',
    };
  }
  return {
    grade: 'Trained Responder',
    summary: 'Completed the survival route while learning key hazard-avoidance lessons.',
  };
}
