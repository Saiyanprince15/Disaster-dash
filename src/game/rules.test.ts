import test from 'node:test';
import assert from 'node:assert/strict';
import { DISASTER_LIST, DISASTER_SCENARIOS, EDUCATIONAL_DISCLAIMER } from '../data/scenarios';
import {
  POINTS_CORRECT,
  POINTS_INCORRECT,
  advanceAfterCorrectDecision,
  beginDecisionPhase,
  computePerformanceRating,
  createInitialGameState,
  createInitialSettings,
  getActiveStage,
  revealGameOver,
  retryCurrentStage,
  startDisaster,
  submitDecision,
  tickTimer,
  toggleCalmModeSetting,
} from './rules';

test('scenario dataset has 3 disasters, 9 decision points, and 36 options with 1 correct each', () => {
  assert.equal(DISASTER_LIST.length, 3);
  let totalStages = 0;
  let totalOptions = 0;

  for (const disaster of DISASTER_LIST) {
    assert.equal(disaster.stages.length, 3, `${disaster.id} must have 3 stages`);
    for (const stage of disaster.stages) {
      totalStages += 1;
      assert.equal(stage.options.length, 4, `${stage.id} must have 4 options`);
      totalOptions += stage.options.length;
      const correctCount = stage.options.filter((o) => o.isCorrect).length;
      assert.equal(correctCount, 1, `${stage.id} must have exactly 1 correct option`);
      for (const opt of stage.options) {
        assert.ok(opt.shortLabel.length > 3, `${opt.id} must have a shortLabel`);
        assert.ok(opt.hoverDescription.length > 10, `${opt.id} must have a hoverDescription`);
        assert.ok(opt.explanation.length > 10);
        assert.ok(opt.calmLabel.length > 5);
      }
    }
  }

  assert.equal(totalStages, 9);
  assert.equal(totalOptions, 36);
  assert.ok(EDUCATIONAL_DISCLAIMER.includes('Disaster Dash is an educational simulation'));
});

test('scoring awards +100 on correct, -50 on incorrect, +200 bonus, and prevents duplicate scoring', () => {
  let state = createInitialGameState();
  state = startDisaster(state, 'earthquake');
  state = beginDecisionPhase(state);

  const stage1 = getActiveStage(state)!;
  const wrongOpt = stage1.options.find((o) => !o.isCorrect)!;
  const correctOpt = stage1.options.find((o) => o.isCorrect)!;

  // Wrong answer deducts 50 and enters consequence_incorrect
  const wrongResult = submitDecision(state, wrongOpt.id);
  assert.equal(wrongResult.outcome, 'incorrect');
  assert.equal(wrongResult.nextState.score, POINTS_INCORRECT);
  assert.equal(wrongResult.nextState.incorrectCount, 1);

  // Transition to gameover and retry
  state = revealGameOver(wrongResult.nextState);
  assert.equal(state.phase, 'gameover');
  state = retryCurrentStage(state);
  assert.equal(state.phase, 'decision');
  assert.equal(state.score, POINTS_INCORRECT);

  // Correct answer awards +100
  const rightResult = submitDecision(state, correctOpt.id);
  assert.equal(rightResult.outcome, 'correct');
  assert.equal(rightResult.nextState.score, POINTS_INCORRECT + POINTS_CORRECT);
  assert.equal(rightResult.nextState.correctCount, 1);
  assert.equal(rightResult.nextState.decisionsCompleted, 1);

  // Clicking another or same option during consequence_correct is ignored (no double points)
  const dupAttempt = submitDecision(rightResult.nextState, correctOpt.id);
  assert.equal(dupAttempt.outcome, 'ignored');
  assert.equal(dupAttempt.nextState.score, POINTS_INCORRECT + POINTS_CORRECT);
});

test('completing all 3 stages awards completion bonus and transitions to results', () => {
  let state = startDisaster(createInitialGameState(), 'fire');
  const scenario = DISASTER_SCENARIOS.fire;

  for (let i = 0; i < 3; i++) {
    state = beginDecisionPhase(state);
    const stage = getActiveStage(state)!;
    const correctOpt = stage.options.find((o) => o.isCorrect)!;
    const res = submitDecision(state, correctOpt.id);
    assert.equal(res.outcome, 'correct');
    state = advanceAfterCorrectDecision(res.nextState);
  }

  assert.equal(state.screen, 'results');
  assert.equal(state.phase, 'victory');
  assert.equal(state.correctCount, 3);
  assert.equal(state.incorrectCount, 0);
  assert.equal(state.decisionsCompleted, 3);
  assert.equal(state.score, 3 * POINTS_CORRECT + scenario.completionBonus);
  assert.equal(computePerformanceRating(state).grade, 'Preparedness Ace');
});

test('Calm Mode disables timer immediately, preserves progress/score, and restores timer when toggled off', () => {
  let settings = createInitialSettings();
  let state = startDisaster(createInitialGameState(), 'flood');
  state = beginDecisionPhase(state);

  // Complete stage 1 in Normal Mode
  const stage1Correct = getActiveStage(state)!.options.find((o) => o.isCorrect)!;
  state = submitDecision(state, stage1Correct.id).nextState;
  state = advanceAfterCorrectDecision(state);
  state = beginDecisionPhase(state);

  assert.equal(state.currentStageIndex, 1);
  assert.equal(state.score, 100);

  // Tick 5 seconds in Normal Mode
  state = tickTimer(state, settings, 5);
  assert.equal(state.timeRemaining, 15);

  // Toggle Calm Mode ON mid-scenario
  settings = toggleCalmModeSetting(settings);
  assert.equal(settings.calmMode, true);

  // Progress & score preserved, and timer stops ticking even after 100 seconds
  assert.equal(state.currentStageIndex, 1);
  assert.equal(state.score, 100);
  state = tickTimer(state, settings, 100);
  assert.equal(state.phase, 'decision');
  assert.equal(state.timeRemaining, 15);

  // Toggle Calm Mode back OFF -> timer ticks again and can expire on Normal Mode
  settings = toggleCalmModeSetting(settings);
  assert.equal(settings.calmMode, false);
  state = tickTimer(state, settings, 16);
  assert.equal(state.phase, 'consequence_incorrect');
  assert.equal(state.timedOut, true);
  assert.equal(state.score, 50);
});
