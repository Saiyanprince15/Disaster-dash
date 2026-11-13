export type DisasterId = 'earthquake' | 'flood' | 'fire';

export type GameScreen = 'title' | 'selection' | 'gameplay' | 'results';

export type ScenarioPhase =
  | 'intro'
  | 'decision'
  | 'consequence_correct'
  | 'consequence_incorrect'
  | 'gameover'
  | 'victory';

export type StickmanPose =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'land'
  | 'flinch'
  | 'crouch_cover'
  | 'climb_stairs'
  | 'crawl_low'
  | 'test_door'
  | 'wave_signal'
  | 'roll_extinguish'
  | 'celebrate'
  | 'fall_knockdown';

export type ActionIconKey =
  | 'shield'
  | 'door'
  | 'stairs'
  | 'elevator'
  | 'arrow_up'
  | 'flame'
  | 'zap'
  | 'car'
  | 'waves'
  | 'hand'
  | 'eye'
  | 'alert'
  | 'wind'
  | 'window'
  | 'bag'
  | 'building';

export type SceneKey =
  | 'eq_library'
  | 'eq_mezzanine'
  | 'eq_courtyard'
  | 'fl_underpass'
  | 'fl_lobby'
  | 'fl_terrace'
  | 'fr_bedroom'
  | 'fr_corridor'
  | 'fr_courtyard';

export interface DecisionOption {
  id: string;
  shortLabel: string;
  hoverDescription: string;
  actionIcon: ActionIconKey;
  label: string;
  calmLabel: string;
  isCorrect: boolean;
  feedbackTitle: string;
  explanation: string;
  outcomePose: StickmanPose;
  failureHazard: string;
}

export interface DecisionPoint {
  id: string;
  stageNumber: 1 | 2 | 3;
  locationName: string;
  sceneKey: SceneKey;
  introDurationMs: number;
  calmIntroDurationMs: number;
  timerSeconds: number;
  establishingText: string;
  calmEstablishingText: string;
  prompt: string;
  calmPrompt: string;
  safetyPrinciple: string;
  options: [DecisionOption, DecisionOption, DecisionOption, DecisionOption];
}

export interface DisasterScenario {
  id: DisasterId;
  title: string;
  subtitle: string;
  description: string;
  calmDescription: string;
  accentColor: string;
  completionBonus: number;
  stages: [DecisionPoint, DecisionPoint, DecisionPoint];
}

export interface GameSettings {
  calmMode: boolean;
  muted: boolean;
  volume: number; // 0.0 to 1.0
}

export interface GameState {
  screen: GameScreen;
  activeDisasterId: DisasterId | null;
  currentStageIndex: number; // 0, 1, 2
  phase: ScenarioPhase;
  paused: boolean;
  score: number;
  decisionsCompleted: number;
  correctCount: number;
  incorrectCount: number;
  answeredDecisionIds: string[];
  selectedOptionId: string | null;
  timedOut: boolean;
  lastScoreDelta: number;
  timeRemaining: number;
  bestScores: Record<DisasterId, number>;
}
