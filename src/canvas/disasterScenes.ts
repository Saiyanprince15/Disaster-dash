import type { DisasterId, ScenarioPhase, SceneKey, StickmanPose } from '../types/game';
import { drawStickman, type StickmanRigState } from './stickmanRenderer';

export interface SceneRenderParams {
  sceneKey: SceneKey;
  previousSceneKey?: SceneKey | null;
  stageIndex: number;
  phase: ScenarioPhase;
  phaseElapsedSec: number;
  sceneTimeSec: number; // Frozen during decision phase!
  dt: number;
  calmMode: boolean;
  outcomePose: StickmanPose;
  failureHazard: string;
  selectedOptionId?: string | null;
  timedOut?: boolean;
  rig?: StickmanRigState;
  onFootstep?: (running: boolean) => void;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function drawLibraryScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shakeX: number,
  shakeY: number,
  calmMode: boolean,
  phase: ScenarioPhase,
  phaseElapsedSec: number,
  failureHazard: string
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1B2130');
  grad.addColorStop(1, '#0F141F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  const floorY = h * 0.8;
  ctx.fillStyle = '#2B241D';
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  ctx.strokeStyle = '#574636';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, floorY);
  ctx.lineTo(w + 20, floorY);
  ctx.stroke();

  // Right-side stairwell exit doorway (connects visually to Stage 2 Mezzanine!)
  const exitDoorX = w * 0.89;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(exitDoorX, floorY - 140, 60, 140);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(exitDoorX, floorY - 140, 60, 140);
  ctx.fillStyle = '#059669';
  ctx.fillRect(exitDoorX + 8, floorY - 164, 44, 18);
  ctx.fillStyle = '#ECFDF5';
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.fillText('STAIRS', exitDoorX + 12, floorY - 151);

  // Tall glass windows on right side
  const winX = w * 0.67;
  const winW = w * 0.17;
  const winY = h * 0.16;
  const winH = floorY - winY - 18;
  ctx.fillStyle = '#1E3A5F';
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 4;
  ctx.strokeRect(winX, winY, winW, winH);

  // Cracks on glass during quake or shattering failure
  if (phase !== 'intro' || t > 1.1) {
    ctx.strokeStyle =
      failureHazard === 'shattering_glass' ? '#F8FAFC' : 'rgba(226, 232, 240, 0.55)';
    ctx.lineWidth = failureHazard === 'shattering_glass' ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.moveTo(winX + winW * 0.2, winY + winH * 0.25);
    ctx.lineTo(winX + winW * 0.55, winY + winH * 0.52);
    ctx.lineTo(winX + winW * 0.82, winY + winH * 0.44);
    ctx.moveTo(winX + winW * 0.55, winY + winH * 0.52);
    ctx.lineTo(winX + winW * 0.4, winY + winH * 0.82);
    ctx.stroke();
  }

  // Tall swaying oak bookshelves on left
  const sway = calmMode ? Math.sin(t * 2) * 0.014 : Math.sin(t * 7.5) * 0.048;
  for (let i = 0; i < 2; i++) {
    const bx = w * (0.09 + i * 0.16);
    const bw = 64;
    const bh = h * 0.48;
    let extraTilt = 0;
    if (
      i === 1 &&
      (phase === 'consequence_incorrect' || phase === 'gameover') &&
      failureHazard === 'toppling_shelf'
    ) {
      extraTilt = clamp01((phaseElapsedSec - 0.3) / 0.55) * 0.58;
    }
    ctx.save();
    ctx.translate(bx + bw / 2, floorY);
    ctx.rotate(sway * (i === 0 ? 1 : -1) + extraTilt);
    ctx.fillStyle = '#4A311D';
    ctx.fillRect(-bw / 2, -bh, bw, bh);
    ctx.strokeStyle = '#2E1D10';
    ctx.lineWidth = 2;
    ctx.strokeRect(-bw / 2, -bh, bw, bh);
    for (let s = 1; s <= 4; s++) {
      const sy = -bh + s * (bh / 5);
      ctx.fillStyle = '#2E1D10';
      ctx.fillRect(-bw / 2, sy, bw, 4);
      const colors = ['#D97706', '#0284C7', '#059669', '#DC2626', '#94A3B8'];
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = colors[(s + b) % colors.length];
        ctx.fillRect(-bw / 2 + 6 + b * 11, sy - 20, 8, 20);
      }
    }
    ctx.restore();
  }

  // Warm swinging reading lamps
  for (let l = 0; l < 2; l++) {
    const lx = w * (0.36 + l * 0.25);
    const swing = calmMode ? Math.sin(t * 2) * 0.05 : Math.sin(t * 5.2 + l) * 0.28;
    ctx.save();
    ctx.translate(lx, 0);
    ctx.rotate(swing);
    const cone = ctx.createRadialGradient(0, 82, 6, 0, 175, 130);
    cone.addColorStop(0, 'rgba(251, 191, 36, 0.16)');
    cone.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(-12, 74);
    ctx.lineTo(12, 74);
    ctx.lineTo(90, floorY);
    ctx.lineTo(-90, floorY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 66);
    ctx.stroke();
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 74, 11, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  // Solid oak study table in center safe zone
  const tableX = w * 0.42;
  const tableW = 160;
  const tableH = 62;
  ctx.fillStyle = '#855830';
  ctx.fillRect(tableX, floorY - tableH, tableW, 13);
  ctx.fillStyle = '#5C3A1D';
  ctx.fillRect(tableX + 12, floorY - tableH + 13, 11, tableH - 13);
  ctx.fillRect(tableX + tableW - 23, floorY - tableH + 13, 11, tableH - 13);

  // Falling books & plaster dust during tremor or correct cover moment
  const particleCount = calmMode ? 8 : 22;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
  for (let p = 0; p < particleCount; p++) {
    const px = (p * 97 + t * 18) % w;
    const py = (p * 61 + t * (calmMode ? 24 : 85)) % floorY;
    ctx.fillRect(px, py, 3, 3);
  }

  if (phase === 'consequence_correct' && phaseElapsedSec < 1.5) {
    // Falling books bouncing harmlessly off the oak tabletop while player shelters underneath
    for (let b = 0; b < 3; b++) {
      const dropY = Math.min(floorY - tableH - 8, h * 0.1 + phaseElapsedSec * (240 + b * 45));
      ctx.fillStyle = b === 0 ? '#D97706' : b === 1 ? '#0284C7' : '#DC2626';
      ctx.fillRect(tableX + 26 + b * 42, dropY, 18, 10);
    }
  }

  ctx.restore();
}

function drawMezzanineScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shakeX: number,
  shakeY: number,
  calmMode: boolean,
  phase: ScenarioPhase,
  phaseElapsedSec: number,
  failureHazard: string
) {
  ctx.fillStyle = '#141B29';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  const floorY = h * 0.78;
  ctx.fillStyle = '#273244';
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);

  // Entry stairwell doorway from Stage 1 on far left
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(w * 0.02, floorY - 134, 46, 134);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.02, floorY - 134, 46, 134);

  // Cracked brick masonry wall
  ctx.fillStyle = '#3B2828';
  ctx.fillRect(w * 0.12, h * 0.16, w * 0.17, floorY - h * 0.16);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.17, h * 0.2);
  ctx.lineTo(w * 0.21, h * 0.42);
  ctx.lineTo(w * 0.19, h * 0.65);
  ctx.stroke();

  // Elevator door (hazard)
  const elevX = w * 0.38;
  const elevW = 86;
  const elevH = 148;
  ctx.fillStyle = '#334155';
  ctx.fillRect(elevX, floorY - elevH, elevW, elevH);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(elevX, floorY - elevH, elevW, elevH);
  ctx.beginPath();
  ctx.moveTo(elevX + elevW / 2, floorY - elevH);
  ctx.lineTo(elevX + elevW / 2, floorY);
  ctx.stroke();
  const blink = calmMode ? 0.5 : Math.sin(t * 9) > 0 ? 1 : 0.2;
  ctx.fillStyle = `rgba(239, 68, 68, ${blink})`;
  ctx.beginPath();
  ctx.arc(elevX + elevW / 2, floorY - elevH - 14, 5, 0, Math.PI * 2);
  ctx.fill();

  if (
    (phase === 'consequence_incorrect' || phase === 'gameover') &&
    failureHazard === 'elevator_trap' &&
    phaseElapsedSec > 0.35 &&
    !calmMode
  ) {
    // Sparks from jammed elevator shaft
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(elevX + elevW / 2, floorY - elevH + 10);
    ctx.lineTo(elevX + elevW / 2 - 14, floorY - elevH + 34);
    ctx.lineTo(elevX + elevW / 2 + 12, floorY - elevH + 54);
    ctx.stroke();
  }

  // Concrete stairwell on right (safe egress leading to Courtyard)
  const stairX = w * 0.65;
  ctx.fillStyle = '#475569';
  for (let s = 0; s < 6; s++) {
    ctx.fillRect(stairX + s * 28, floorY - 12 + s * 14, 34, 14);
  }
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(stairX, floorY - 46);
  ctx.lineTo(stairX + 165, floorY + 38);
  ctx.stroke();

  // Green EXIT sign above stairs
  ctx.fillStyle = '#059669';
  ctx.fillRect(stairX + 20, h * 0.2, 68, 24);
  ctx.fillStyle = '#ECFDF5';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.fillText('STAIRS', stairX + 32, h * 0.2 + 16);

  ctx.restore();
}

function drawEqCourtyardScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  shakeX: number,
  shakeY: number,
  calmMode: boolean
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.78);
  sky.addColorStop(0, '#1E293B');
  sky.addColorStop(1, '#334155');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  const groundY = h * 0.78;
  ctx.fillStyle = '#475569';
  ctx.fillRect(-20, groundY, w * 0.54, h - groundY + 20);
  ctx.fillStyle = '#14532D';
  ctx.fillRect(w * 0.52, groundY, w * 0.5, h - groundY + 20);

  // Library brick facade + exit doorway on left (continuity from Stage 2!)
  ctx.fillStyle = '#452A2A';
  ctx.fillRect(0, h * 0.14, w * 0.22, groundY - h * 0.14);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(w * 0.15, groundY - 124, 42, 124);
  ctx.fillStyle = '#64748B';
  ctx.fillRect(w * 0.2, h * 0.52, 68, 14);

  // Parked compact car against brick wall (Stage 3 option D context)
  ctx.fillStyle = '#334155';
  ctx.fillRect(w * 0.24, groundY - 30, 82, 24);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(w * 0.26, groundY - 46, 46, 18);
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(w * 0.27, groundY - 4, 8, 0, Math.PI * 2);
  ctx.arc(w * 0.34, groundY - 4, 8, 0, Math.PI * 2);
  ctx.fill();

  // Utility pole + sagging power line
  const poleX = w * 0.42;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(poleX, groundY);
  ctx.lineTo(poleX, h * 0.22);
  ctx.stroke();

  const wireSag = Math.sin(t * (calmMode ? 1.5 : 5)) * (calmMode ? 4 : 14);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.26);
  ctx.quadraticCurveTo(poleX * 0.5, h * 0.44 + wireSag, poleX, h * 0.24);
  ctx.stroke();

  if (!calmMode && Math.sin(t * 14) > 0.75) {
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(poleX - 6, h * 0.25, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Open Park Lawn signpost on right
  ctx.fillStyle = '#065F46';
  ctx.fillRect(w * 0.78, groundY - 70, 6, 70);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(w * 0.74, groundY - 82, 92, 24);
  ctx.fillStyle = '#022C22';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('OPEN LAWN', w * 0.75 + 6, groundY - 66);

  ctx.restore();
}

function drawFloodUnderpassScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean,
  phase: ScenarioPhase
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0F172A');
  sky.addColorStop(1, '#1E293B');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Storm clouds
  ctx.fillStyle = '#334155';
  for (let c = 0; c < 5; c++) {
    const cx = ((c * w * 0.26 + t * (calmMode ? 6 : 18)) % (w + 160)) - 80;
    ctx.beginPath();
    ctx.arc(cx, h * 0.14, 48, 0, Math.PI * 2);
    ctx.arc(cx + 38, h * 0.12, 38, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sloped road descending left -> raised hilltop building entrance on right
  const roadLeftY = h * 0.82;
  const hillRightY = h * 0.62;
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(0, roadLeftY);
  ctx.lineTo(w * 0.6, roadLeftY);
  ctx.lineTo(w * 0.78, hillRightY);
  ctx.lineTo(w, hillRightY);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Brick hilltop apartment doorway on right (continuity into Stage 2 Lobby!)
  ctx.fillStyle = '#3F2E2A';
  ctx.fillRect(w * 0.86, hillRightY - 128, w * 0.14, 128);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(w * 0.89, hillRightY - 96, 44, 96);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(w * 0.89 + 6, hillRightY - 108, 32, 8);

  // Stalled sedan in low road section
  const carX = w * 0.14;
  const carY = roadLeftY - 38;
  ctx.fillStyle = '#64748B';
  ctx.fillRect(carX, carY, 128, 30);
  ctx.fillStyle = '#475569';
  ctx.fillRect(carX + 24, carY - 22, 74, 22);
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(carX + 28, roadLeftY - 6, 12, 0, Math.PI * 2);
  ctx.arc(carX + 100, roadLeftY - 6, 12, 0, Math.PI * 2);
  ctx.fill();

  // Rising muddy floodwater
  const waterRise = phase === 'intro' ? Math.min(26, t * 8) : 28 + Math.sin(t * 2) * 3;
  const waterY = roadLeftY - waterRise;
  ctx.fillStyle = 'rgba(20, 83, 105, 0.8)';
  ctx.beginPath();
  ctx.moveTo(0, waterY);
  for (let x = 0; x <= w * 0.7; x += 24) {
    ctx.lineTo(x, waterY + Math.sin(x * 0.04 + t * (calmMode ? 1.5 : 4)) * 3.5);
  }
  ctx.lineTo(w * 0.7, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Rain streaks
  ctx.strokeStyle = calmMode ? 'rgba(148, 163, 184, 0.25)' : 'rgba(186, 230, 253, 0.42)';
  ctx.lineWidth = 1.4;
  const drops = calmMode ? 22 : 55;
  for (let r = 0; r < drops; r++) {
    const rx = (r * 73 + t * 180) % w;
    const ry = (r * 49 + t * (calmMode ? 240 : 520)) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 5, ry + 14);
    ctx.stroke();
  }
}

function drawFloodLobbyScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean,
  phase: ScenarioPhase,
  phaseElapsedSec: number,
  failureHazard: string
) {
  ctx.fillStyle = '#1A2232';
  ctx.fillRect(0, 0, w, h);

  const floorY = h * 0.8;
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, floorY, w, h - floorY);

  // Exterior lobby door on left (continuity from Stage 1 hilltop entrance!)
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(w * 0.02, floorY - 134, 46, 134);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.02, floorY - 134, 46, 134);

  // Basement door
  ctx.fillStyle = '#475569';
  ctx.fillRect(w * 0.14, floorY - 128, 70, 128);
  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('BASEMENT', w * 0.14 + 6, floorY - 136);

  // Electrical outlet & humming vending machine
  const vendX = w * 0.34;
  ctx.fillStyle = '#1E3A8A';
  ctx.fillRect(vendX, floorY - 118, 66, 118);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(vendX + 10, floorY - 102, 46, 56);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(vendX - 24, floorY - 28, 14, 18);
  if (!calmMode && Math.sin(t * 16) > 0.7) {
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vendX - 18, floorY - 18);
    ctx.lineTo(vendX - 8, floorY - 8);
    ctx.stroke();
  }

  // Dry ascending stairs on right (continuity up to Terrace!)
  const stairStartX = w * 0.62;
  ctx.fillStyle = '#64748B';
  for (let s = 0; s < 6; s++) {
    ctx.fillRect(stairStartX + s * 32, floorY - (s + 1) * 20, 38, (s + 1) * 20);
  }
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('UPPER FLOORS ↑', stairStartX + 30, floorY - 140);

  // Seeping water pool across floor (rises rapidly if submerged_room triggers)
  const extraDepth =
    (phase === 'consequence_incorrect' || phase === 'gameover') && failureHazard === 'submerged_room'
      ? clamp01((phaseElapsedSec - 0.25) / 0.9) * 85
      : 0;
  ctx.fillStyle = 'rgba(14, 116, 144, 0.68)';
  ctx.fillRect(0, floorY - 12 - extraDepth + Math.sin(t * 2) * 1.5, w * 0.62, 18 + extraDepth);
}

function drawFloodTerraceScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean,
  phase: ScenarioPhase,
  phaseElapsedSec: number
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0F172A');
  sky.addColorStop(1, '#1E3A5F');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  if (!calmMode && Math.sin(t * 3.7) > 0.96) {
    ctx.fillStyle = 'rgba(224, 242, 254, 0.14)';
    ctx.fillRect(0, 0, w, h);
  }

  const streetWaterY = h * 0.82;
  ctx.fillStyle = '#155E75';
  ctx.fillRect(0, streetWaterY, w, h - streetWaterY);

  // Orange rescue boat patrols & steers closer on correct wave signal
  const approachBoost =
    phase === 'consequence_correct' ? easeOutQuad(clamp01(phaseElapsedSec / 2.2)) * -75 : 0;
  const boatX = w * 0.6 + Math.sin(t * 0.8) * 45 + approachBoost;
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(boatX, streetWaterY + 6);
  ctx.lineTo(boatX + 86, streetWaterY + 6);
  ctx.lineTo(boatX + 72, streetWaterY + 24);
  ctx.lineTo(boatX + 12, streetWaterY + 24);
  ctx.closePath();
  ctx.fill();

  if (phase === 'consequence_correct') {
    // Rescue spotlight beam sweeping onto terrace
    const beam = ctx.createLinearGradient(boatX + 20, streetWaterY, w * 0.28, h * 0.45);
    beam.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
    beam.addColorStop(1, 'rgba(253, 224, 71, 0.04)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(boatX + 16, streetWaterY + 8);
    ctx.lineTo(w * 0.18, h * 0.36);
    ctx.lineTo(w * 0.38, h * 0.62);
    ctx.closePath();
    ctx.fill();
  }

  // Elevated terrace platform + roof stair hatch on left (continuity from Stage 2!)
  const terraceY = h * 0.62;
  ctx.fillStyle = '#334155';
  ctx.fillRect(w * 0.06, terraceY, w * 0.6, h - terraceY);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(w * 0.08, terraceY - 46, 44, 46);
  // Shelter canopy
  ctx.fillStyle = '#475569';
  ctx.fillRect(w * 0.14, h * 0.28, w * 0.26, 14);
  ctx.fillRect(w * 0.16, h * 0.28, 8, terraceY - h * 0.28);

  // Tall metal antenna mast on terrace edge
  const mastX = w * 0.61;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(mastX, terraceY);
  ctx.lineTo(mastX, h * 0.14);
  ctx.stroke();
}

function drawFireBedroomScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean,
  phase: ScenarioPhase
) {
  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, 0, w, h);

  const floorY = h * 0.8;
  ctx.fillStyle = '#27272A';
  ctx.fillRect(0, floorY, w, h - floorY);

  // Bed on left
  ctx.fillStyle = '#3F3F46';
  ctx.fillRect(w * 0.08, floorY - 42, 130, 42);
  ctx.fillStyle = '#52525B';
  ctx.fillRect(w * 0.09, floorY - 56, 36, 16);

  // Closet on center-left
  ctx.fillStyle = '#2E2A27';
  ctx.fillRect(w * 0.34, floorY - 148, 82, 148);
  ctx.strokeStyle = '#52525B';
  ctx.strokeRect(w * 0.34, floorY - 148, 82, 148);

  // Closed apartment door on right with orange glow along crack (continuity to Stage 2 Corridor!)
  const doorX = w * 0.74;
  ctx.fillStyle = '#451A03';
  ctx.fillRect(doorX, floorY - 156, 78, 156);
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(doorX, floorY);
  ctx.lineTo(doorX + 78, floorY);
  ctx.stroke();

  // Flashing ceiling smoke detector
  const alarmOn = calmMode ? false : Math.sin(t * 8) > 0;
  ctx.fillStyle = alarmOn ? '#EF4444' : '#7F1D1D';
  ctx.beginPath();
  ctx.arc(w * 0.56, h * 0.12, 7, 0, Math.PI * 2);
  ctx.fill();

  // Rising smoke layer near ceiling + curls from under door
  const smokeHeight = phase === 'intro' ? Math.min(h * 0.36, t * 55) : h * 0.38;
  const smokeGrad = ctx.createLinearGradient(0, 0, 0, smokeHeight);
  smokeGrad.addColorStop(0, 'rgba(39, 39, 42, 0.92)');
  smokeGrad.addColorStop(1, 'rgba(63, 63, 70, 0)');
  ctx.fillStyle = smokeGrad;
  ctx.fillRect(0, 0, w, smokeHeight);

  ctx.fillStyle = 'rgba(161, 161, 170, 0.35)';
  for (let i = 0; i < 5; i++) {
    const sx = doorX - i * 18 - ((t * 14) % 18);
    const sy = floorY - 6 - i * 6;
    ctx.beginPath();
    ctx.arc(sx, sy, 10 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireCorridorScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean
) {
  ctx.fillStyle = '#18181B';
  ctx.fillRect(0, 0, w, h);

  const floorY = h * 0.8;
  ctx.fillStyle = '#27272A';
  ctx.fillRect(0, floorY, w, h - floorY);

  // Apartment entry door on far left (continuity from Stage 1!)
  ctx.fillStyle = '#451A03';
  ctx.fillRect(w * 0.04, floorY - 146, 56, 146);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.04, floorY - 146, 56, 146);

  // Elevator door in middle (danger)
  const elevX = w * 0.42;
  ctx.fillStyle = '#3F3F46';
  ctx.fillRect(elevX, floorY - 146, 84, 146);
  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('ELEVATOR', elevX + 12, floorY - 154);

  // Glowing green EXIT stairwell door on right (continuity to Courtyard!)
  const exitX = w * 0.78;
  ctx.fillStyle = '#334155';
  ctx.fillRect(exitX, floorY - 150, 74, 150);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(exitX + 10, floorY - 182, 54, 22);
  ctx.fillStyle = '#022C22';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.fillText('EXIT', exitX + 22, floorY - 166);

  // Dense upper smoke layer (clear breathable air near floor)
  const smokeBand = h * 0.56;
  const smokeGrad = ctx.createLinearGradient(0, 0, 0, smokeBand);
  smokeGrad.addColorStop(0, 'rgba(24, 24, 27, 0.95)');
  smokeGrad.addColorStop(0.75, 'rgba(63, 63, 70, 0.75)');
  smokeGrad.addColorStop(1, 'rgba(63, 63, 70, 0)');
  ctx.fillStyle = smokeGrad;
  ctx.fillRect(0, 0, w, smokeBand);

  const flicker = calmMode ? 0.2 : 0.2 + Math.sin(t * 9) * 0.08;
  ctx.fillStyle = `rgba(234, 88, 12, ${flicker})`;
  ctx.fillRect(0, 0, w * 0.26, floorY);
}

function drawFireCourtyardScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean
) {
  ctx.fillStyle = '#0B1120';
  ctx.fillRect(0, 0, w, h);

  const groundY = h * 0.8;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, groundY, w, h - groundY);

  // Burning apartment building + exit door on left (continuity from Stage 2!)
  ctx.fillStyle = '#27272A';
  ctx.fillRect(w * 0.04, h * 0.14, w * 0.26, groundY - h * 0.14);
  ctx.fillStyle = '#334155';
  ctx.fillRect(w * 0.22, groundY - 110, 38, 110);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const wx = w * 0.07 + col * 58;
      const wy = h * 0.22 + row * 78;
      ctx.fillStyle = row === 0 ? '#EA580C' : '#F59E0B';
      ctx.fillRect(wx, wy, 38, 44);
      const fh = calmMode ? 18 : 18 + Math.sin(t * 10 + col) * 7;
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(wx + 8, wy + 44);
      ctx.lineTo(wx + 19, wy + 44 - fh);
      ctx.lineTo(wx + 30, wy + 44);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Safe Assembly Point sign on right
  const signX = w * 0.78;
  ctx.fillStyle = '#475569';
  ctx.fillRect(signX, groundY - 96, 6, 96);
  ctx.fillStyle = '#059669';
  ctx.fillRect(signX - 42, groundY - 122, 92, 28);
  ctx.fillStyle = '#ECFDF5';
  ctx.font = 'bold 11px "Outfit", sans-serif';
  ctx.fillText('ASSEMBLY', signX - 28, groundY - 104);

  if (!calmMode) {
    const beacon = Math.sin(t * 8) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.18)';
    ctx.fillStyle = beacon;
    ctx.beginPath();
    ctx.arc(w * 0.92, groundY - 40, 65, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStaticBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneKey: SceneKey,
  t: number,
  shakeX: number,
  shakeY: number,
  calmMode: boolean,
  phase: ScenarioPhase,
  phaseElapsedSec: number,
  failureHazard: string
) {
  switch (sceneKey) {
    case 'eq_library':
      drawLibraryScene(ctx, w, h, t, shakeX, shakeY, calmMode, phase, phaseElapsedSec, failureHazard);
      break;
    case 'eq_mezzanine':
      drawMezzanineScene(ctx, w, h, t, shakeX, shakeY, calmMode, phase, phaseElapsedSec, failureHazard);
      break;
    case 'eq_courtyard':
      drawEqCourtyardScene(ctx, w, h, t, shakeX, shakeY, calmMode);
      break;
    case 'fl_underpass':
      drawFloodUnderpassScene(ctx, w, h, t, calmMode, phase);
      break;
    case 'fl_lobby':
      drawFloodLobbyScene(ctx, w, h, t, calmMode, phase, phaseElapsedSec, failureHazard);
      break;
    case 'fl_terrace':
      drawFloodTerraceScene(ctx, w, h, t, calmMode, phase, phaseElapsedSec);
      break;
    case 'fr_bedroom':
      drawFireBedroomScene(ctx, w, h, t, calmMode, phase);
      break;
    case 'fr_corridor':
      drawFireCorridorScene(ctx, w, h, t, calmMode);
      break;
    case 'fr_courtyard':
      drawFireCourtyardScene(ctx, w, h, t, calmMode);
      break;
  }
}

function drawFailureHazardOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  charX: number,
  charY: number,
  failureHazard: string,
  elapsed: number,
  calmMode: boolean
) {
  const triggerT = clamp01((elapsed - 0.3) / 0.65);
  if (triggerT <= 0) return;

  ctx.save();
  switch (failureHazard) {
    case 'shattering_glass': {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      for (let i = 0; i < 12; i++) {
        const sx = charX + (i - 5) * 14 - triggerT * 45;
        const sy = charY - 85 + (i % 4) * 16 + triggerT * 75;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 9, sy + 5);
        ctx.lineTo(sx + 3, sy + 12);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'falling_debris':
    case 'toppling_shelf': {
      ctx.fillStyle = '#57534E';
      for (let i = 0; i < 5; i++) {
        const dx = charX - 34 + i * 16;
        const dy = charY - 150 + triggerT * (128 + (i % 2) * 14);
        ctx.fillRect(dx, dy, 13, 10);
      }
      // Dust cloud puff at impact
      if (triggerT > 0.65) {
        ctx.fillStyle = `rgba(203, 213, 225, ${(triggerT - 0.65) * 0.9})`;
        ctx.beginPath();
        ctx.arc(charX - 10, charY - 8, 22, 0, Math.PI * 2);
        ctx.arc(charX + 12, charY - 6, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'electric_arc':
    case 'lightning_strike': {
      if (!calmMode) {
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(charX - 24, charY - 160);
        ctx.lineTo(charX - 6, charY - 95);
        ctx.lineTo(charX + 10, charY - 65);
        ctx.lineTo(charX, charY - 22);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(charX, charY - 90);
        ctx.lineTo(charX, charY - 25);
        ctx.stroke();
      }
      break;
    }

    case 'swept_water': {
      const waveX = w * 0.85 - triggerT * w * 0.7;
      ctx.fillStyle = 'rgba(14, 116, 144, 0.72)';
      ctx.beginPath();
      ctx.arc(charX, charY - 12, 26 + triggerT * 24, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.fillRect(waveX, charY - 26, 60, 26);
      break;
    }

    case 'smoke_blast':
    case 'smoke_inhalation': {
      ctx.fillStyle = `rgba(39, 39, 42, ${0.4 + triggerT * 0.45})`;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(
          charX + Math.sin(i * 1.9) * 24,
          charY - 65 + i * 9 + triggerT * 20,
          20 + triggerT * 14,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (failureHazard === 'smoke_blast' && !calmMode) {
        ctx.fillStyle = `rgba(234, 88, 12, ${0.45 * (1 - triggerT * 0.5)})`;
        ctx.beginPath();
        ctx.arc(charX + 18, charY - 38, 36 * triggerT, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'flame_flare': {
      ctx.fillStyle = calmMode ? 'rgba(245, 158, 11, 0.45)' : 'rgba(249, 115, 22, 0.75)';
      ctx.beginPath();
      ctx.moveTo(charX - 16, charY - 18);
      ctx.lineTo(charX, charY - 62 - triggerT * 18);
      ctx.lineTo(charX + 16, charY - 18);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function getSceneBaseGroundAndDecisionX(sceneKey: SceneKey, w: number, h: number) {
  if (sceneKey === 'fl_terrace') return { groundY: h * 0.62, decisionX: w * 0.34, entryX: w * 0.12 };
  if (sceneKey === 'eq_mezzanine') return { groundY: h * 0.78, decisionX: w * 0.5, entryX: w * 0.08 };
  if (sceneKey === 'eq_courtyard') return { groundY: h * 0.78, decisionX: w * 0.45, entryX: w * 0.18 };
  if (sceneKey === 'fl_underpass') return { groundY: h * 0.82, decisionX: w * 0.46, entryX: w * 0.22 };
  if (sceneKey === 'fl_lobby') return { groundY: h * 0.8, decisionX: w * 0.48, entryX: w * 0.07 };
  if (sceneKey === 'fr_bedroom') return { groundY: h * 0.8, decisionX: w * 0.56, entryX: w * 0.2 };
  if (sceneKey === 'fr_corridor') return { groundY: h * 0.8, decisionX: w * 0.36, entryX: w * 0.09 };
  if (sceneKey === 'fr_courtyard') return { groundY: h * 0.8, decisionX: w * 0.46, entryX: w * 0.24 };
  return { groundY: h * 0.8, decisionX: w * 0.58, entryX: w * 0.22 }; // eq_library
}

export function renderGameplayScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: SceneRenderParams
): void {
  const {
    sceneKey,
    previousSceneKey,
    stageIndex,
    phase,
    phaseElapsedSec,
    sceneTimeSec,
    dt,
    calmMode,
    outcomePose,
    failureHazard,
    rig,
    onFootstep,
  } = params;

  // Screen shake for earthquakes (suppressed in Calm Mode and frozen during decision!)
  let shakeX = 0;
  let shakeY = 0;
  if (
    !calmMode &&
    sceneKey.startsWith('eq_') &&
    (phase === 'intro' || phase === 'consequence_incorrect')
  ) {
    const intensity = phase === 'consequence_incorrect' ? 6 : 4;
    shakeX = Math.sin(sceneTimeSec * 42) * intensity;
    shakeY = Math.cos(sceneTimeSec * 36) * (intensity * 0.6);
  }

  // Seamless camera pan transition when entering Stage 2 or 3
  const panDuration = calmMode ? 1.15 : 0.85;
  const isPanningIn =
    stageIndex > 0 && previousSceneKey && phase === 'intro' && phaseElapsedSec < panDuration;

  if (isPanningIn && previousSceneKey) {
    const panT = easeInOutCubic(clamp01(phaseElapsedSec / panDuration));

    // Outgoing scene sliding left
    ctx.save();
    ctx.translate(-panT * w, 0);
    drawStaticBackground(
      ctx,
      w,
      h,
      previousSceneKey,
      sceneTimeSec,
      0,
      0,
      calmMode,
      'consequence_correct',
      2.5,
      'none'
    );
    ctx.restore();

    // Incoming scene sliding in from right
    ctx.save();
    ctx.translate((1 - panT) * w, 0);
    drawStaticBackground(
      ctx,
      w,
      h,
      sceneKey,
      sceneTimeSec,
      shakeX,
      shakeY,
      calmMode,
      phase,
      phaseElapsedSec,
      failureHazard
    );
    ctx.restore();

    // Passing foreground structural doorway pillar wipe between locations
    const pillarX = (1 - panT) * w - 22;
    ctx.fillStyle = '#090D16';
    ctx.fillRect(pillarX, 0, 44, h);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pillarX, 0);
    ctx.lineTo(pillarX, h);
    ctx.moveTo(pillarX + 44, 0);
    ctx.lineTo(pillarX + 44, h);
    ctx.stroke();
  } else {
    drawStaticBackground(
      ctx,
      w,
      h,
      sceneKey,
      sceneTimeSec,
      shakeX,
      shakeY,
      calmMode,
      phase,
      phaseElapsedSec,
      failureHazard
    );
  }

  // Compute character position & pose across continuous narrative states
  const { groundY, decisionX, entryX } = getSceneBaseGroundAndDecisionX(sceneKey, w, h);
  let charX = decisionX;
  let charY = groundY;
  let pose: StickmanPose = 'idle';
  let facing: 1 | -1 = 1;
  let knockdownProgress = 0;

  if (phase === 'intro') {
    const walkDur = calmMode ? 1.55 : 1.95;
    const progress = clamp01(phaseElapsedSec / walkDur);
    const easedMove = easeOutQuad(progress);
    charX = entryX + (decisionX - entryX) * easedMove;

    if (progress < 0.85) {
      pose = 'walk';
    } else if (progress < 1) {
      // Critical event hits right before decision freeze -> character flinches/reacts!
      pose = 'flinch';
    } else {
      pose = 'flinch';
    }
  } else if (phase === 'decision') {
    // Frozen at critical reaction pose!
    charX = decisionX;
    charY = groundY;
    pose = 'flinch';
  } else if (phase === 'consequence_correct') {
    const actT = clamp01(phaseElapsedSec / 1.15);
    const exitT = clamp01((phaseElapsedSec - 1.45) / 1.25);

    if (sceneKey === 'eq_library') {
      if (exitT <= 0) {
        pose = 'crouch_cover';
        charX = decisionX + (w * 0.5 - decisionX) * actT;
      } else {
        pose = 'walk';
        charX = w * 0.5 + exitT * (w * 0.39);
      }
    } else if (sceneKey === 'eq_mezzanine') {
      pose = 'climb_stairs';
      const move = clamp01(phaseElapsedSec / 2.2);
      charX = decisionX + move * (w * 0.34);
      charY = groundY + Math.max(0, move - 0.35) * (h * 0.14);
    } else if (sceneKey === 'eq_courtyard') {
      const move = clamp01(phaseElapsedSec / 1.4);
      charX = decisionX + move * (w * 0.25);
      pose = move < 0.92 ? 'walk' : 'celebrate';
    } else if (sceneKey === 'fl_underpass') {
      const move = clamp01(phaseElapsedSec / 2.2);
      charX = decisionX + move * (w * 0.44);
      if (charX > w * 0.6 && charX < w * 0.78) {
        const slopeT = (charX - w * 0.6) / (w * 0.18);
        charY = h * 0.82 - slopeT * (h * 0.2);
      } else if (charX >= w * 0.78) {
        charY = h * 0.62;
      }
      pose = move > 0.35 && move < 0.75 ? 'climb_stairs' : 'walk';
    } else if (sceneKey === 'fl_lobby') {
      const move = clamp01(phaseElapsedSec / 2.2);
      charX = decisionX + move * (w * 0.36);
      if (move > 0.35) {
        const stairT = (move - 0.35) / 0.65;
        charY = h * 0.8 - stairT * (h * 0.22);
        pose = 'climb_stairs';
      } else {
        pose = 'walk';
      }
    } else if (sceneKey === 'fl_terrace') {
      const move = clamp01(phaseElapsedSec / 0.8);
      charX = decisionX - move * (w * 0.06);
      facing = -1;
      if (move > 0.7) facing = 1;
      pose = move < 0.75 ? 'walk' : 'wave_signal';
    } else if (sceneKey === 'fr_bedroom') {
      if (exitT <= 0) {
        charX = decisionX + actT * (w * 0.14);
        pose = 'test_door';
      } else {
        charX = decisionX + w * 0.14 + exitT * (w * 0.16);
        pose = 'walk';
      }
    } else if (sceneKey === 'fr_corridor') {
      const move = clamp01(phaseElapsedSec / 2.3);
      charX = decisionX + move * (w * 0.45);
      pose = move < 0.82 ? 'crawl_low' : 'walk';
    } else if (sceneKey === 'fr_courtyard') {
      if (exitT <= 0) {
        charX = decisionX + actT * (w * 0.08);
        pose = 'roll_extinguish';
      } else {
        charX = decisionX + w * 0.08 + exitT * (w * 0.2);
        pose = exitT < 0.85 ? 'walk' : 'celebrate';
      }
    } else {
      pose = outcomePose;
    }
  } else if (phase === 'consequence_incorrect' || phase === 'gameover') {
    const movePhase = clamp01(phaseElapsedSec / 0.38);
    const collapsePhase = clamp01((phaseElapsedSec - 0.32) / 0.68);
    knockdownProgress = collapsePhase;

    // Move briefly toward the dangerous choice before hazard strikes
    if (failureHazard === 'shattering_glass') {
      charX = decisionX + movePhase * (w * 0.12);
    } else if (failureHazard === 'toppling_shelf') {
      charX = decisionX - movePhase * (w * 0.24);
      facing = -1;
    } else if (failureHazard === 'elevator_trap') {
      charX = decisionX - movePhase * (w * 0.08);
      facing = -1;
    } else if (failureHazard === 'electric_arc') {
      charX = decisionX - movePhase * (w * 0.1);
      facing = -1;
    } else if (failureHazard === 'balcony_fall') {
      charX = decisionX + movePhase * (w * 0.12);
      charY = groundY + collapsePhase * 42;
    } else if (failureHazard === 'smoke_blast') {
      charX = decisionX + movePhase * (w * 0.12);
    } else if (failureHazard === 'lightning_strike') {
      charX = decisionX + movePhase * (w * 0.24);
    } else if (failureHazard === 'flame_flare') {
      charX = decisionX + movePhase * (w * 0.16);
    }

    if (phaseElapsedSec < 0.24) {
      pose = 'run';
    } else if (phaseElapsedSec < 0.42) {
      pose = 'flinch';
    } else {
      pose = 'fall_knockdown';
    }
  }

  // Draw character
  drawStickman(ctx, {
    x: charX + shakeX * 0.5,
    y: charY + shakeY * 0.5,
    scale: Math.max(0.95, Math.min(1.36, h / 370)),
    facing,
    pose,
    time: sceneTimeSec,
    dt,
    calmMode,
    knockdownProgress,
    rig,
    onFootstep: phase === 'decision' ? undefined : onFootstep,
  });

  // Draw specific environmental failure hazard right after wrong action
  if (phase === 'consequence_incorrect' || phase === 'gameover') {
    drawFailureHazardOverlay(
      ctx,
      w,
      h,
      charX,
      charY,
      failureHazard,
      phase === 'gameover' ? 1.5 : phaseElapsedSec,
      calmMode
    );
  }

  // Progressive desaturation + grey overlay fade-in during failure sequence -> Game Over
  if (phase === 'consequence_incorrect' || phase === 'gameover') {
    const fadeT =
      phase === 'gameover' ? 1 : clamp01((phaseElapsedSec - 0.65) / 0.85);
    if (fadeT > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = `rgba(128, 128, 128, ${fadeT * 0.92})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      ctx.fillStyle = `rgba(15, 23, 42, ${fadeT * 0.62})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

export function renderCardPreviewScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  disasterId: DisasterId,
  t: number,
  calmMode: boolean
): void {
  if (disasterId === 'earthquake') {
    const shake = calmMode ? 0 : Math.sin(t * 28) * 2.5;
    ctx.fillStyle = '#181E2B';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(shake, 0);
    const buildings = [
      { bx: w * 0.12, by: h * 0.22, bw: w * 0.22, bh: h * 0.58 },
      { bx: w * 0.42, by: h * 0.14, bw: w * 0.26, bh: h * 0.66 },
      { bx: w * 0.74, by: h * 0.3, bw: w * 0.16, bh: h * 0.5 },
    ];
    for (const b of buildings) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(b.bx, b.by, b.bw, b.bh);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      for (let wy = b.by + 12; wy < h * 0.72; wy += 18) {
        for (let wx = b.bx + 8; wx < b.bx + b.bw - 12; wx += 16) {
          ctx.fillRect(wx, wy, 7, 9);
        }
      }
    }
    ctx.fillStyle = '#292524';
    ctx.fillRect(-10, h * 0.78, w + 20, h * 0.24);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.78);
    ctx.lineTo(w * 0.38, h * 0.87);
    ctx.lineTo(w * 0.34, h * 0.96);
    ctx.moveTo(w * 0.38, h * 0.87);
    ctx.lineTo(w * 0.49, h * 0.93);
    ctx.stroke();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect((i * 43 + t * 14) % w, (i * 29 + t * 38) % (h * 0.78), 3, 3);
    }
    ctx.restore();
  } else if (disasterId === 'flood') {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(w * 0.3, h * 0.18, 28, 0, Math.PI * 2);
    ctx.arc(w * 0.45, h * 0.16, 32, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h * 0.2, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(w * 0.16, h * 0.46, w * 0.2, h * 0.34);
    ctx.fillRect(w * 0.64, h * 0.4, w * 0.2, h * 0.4);
    const wy = h * 0.64 + Math.sin(t * 2) * 3;
    ctx.fillStyle = 'rgba(14, 165, 233, 0.48)';
    ctx.beginPath();
    ctx.moveTo(0, wy);
    for (let x = 0; x <= w; x += 18) {
      ctx.lineTo(x, wy + Math.sin(x * 0.06 + t * (calmMode ? 1.5 : 4)) * 4);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) {
      const rx = (i * 39 + t * 100) % w;
      const ry = (i * 27 + t * (calmMode ? 120 : 280)) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 10);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#27272A';
    ctx.fillRect(w * 0.24, h * 0.3, w * 0.52, h * 0.52);
    ctx.fillStyle = 'rgba(113, 113, 122, 0.38)';
    for (let i = 0; i < 6; i++) {
      const sy = h * 0.38 - ((t * (calmMode ? 14 : 32) + i * 24) % 90);
      const sx = w * 0.42 + i * 16 + Math.sin(t * 2 + i) * 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 14 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let f = 0; f < 4; f++) {
      const fx = w * (0.3 + f * 0.13);
      const fh = calmMode ? 24 : 24 + Math.sin(t * 9 + f * 1.4) * 9;
      ctx.fillStyle = f % 2 === 0 ? '#EA580C' : '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(fx - 12, h * 0.82);
      ctx.lineTo(fx, h * 0.82 - fh);
      ctx.lineTo(fx + 12, h * 0.82);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function renderTitleHorizonScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  calmMode: boolean
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#090D16');
  sky.addColorStop(0.65, '#131C2E');
  sky.addColorStop(1, '#1B2538');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const groundY = h * 0.82;
  ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
  const offset = (t * (calmMode ? 8 : 22)) % 220;
  for (let i = -1; i < Math.ceil(w / 110) + 2; i++) {
    const bx = i * 110 - offset;
    const bh = 90 + ((i * 37) % 95);
    ctx.fillRect(bx, groundY - bh, 86, bh);
  }

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  drawStickman(ctx, {
    x: w * 0.74,
    y: groundY,
    scale: Math.max(0.9, Math.min(1.3, h / 560)),
    facing: 1,
    pose: calmMode ? 'walk' : 'run',
    time: t,
    calmMode,
  });
}
