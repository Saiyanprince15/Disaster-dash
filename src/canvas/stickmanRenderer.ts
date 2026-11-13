import type { StickmanPose } from '../types/game';

export interface StickmanDrawOptions {
  x: number;
  y: number; // ground contact y
  scale?: number;
  facing?: 1 | -1;
  pose: StickmanPose;
  time: number;
  dt?: number;
  scarfColor?: string;
  strokeColor?: string;
  calmMode?: boolean;
  knockdownProgress?: number; // 0..1 for fall animation
  rig?: StickmanRigState;
  onFootstep?: (running: boolean) => void;
}

export interface JointAngles {
  hipOffsetY: number;
  torsoAngle: number;
  headOffset: { x: number; y: number };
  leftShoulder: number;
  leftElbow: number;
  rightShoulder: number;
  rightElbow: number;
  leftHip: number;
  leftKnee: number;
  rightHip: number;
  rightKnee: number;
  bodyRotation: number;
}

export interface StickmanRigState {
  angles: JointAngles;
  facingBlend: number;
  lastStepSign: number;
  initialized: boolean;
}

export function createStickmanRig(): StickmanRigState {
  return {
    angles: getPoseAngles('idle', 0, 0),
    facingBlend: 1,
    lastStepSign: 0,
    initialized: false,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getPoseAngles(pose: StickmanPose, t: number, knockdownProgress = 0): JointAngles {
  const breathe = Math.sin(t * 2.4) * 0.03;

  switch (pose) {
    case 'walk': {
      const cycle = t * 6.8;
      const stride = Math.sin(cycle);
      const bounce = Math.abs(Math.cos(cycle)) * 3.2;
      return {
        hipOffsetY: -36 - bounce,
        torsoAngle: 0.09 + Math.sin(cycle * 2) * 0.02,
        headOffset: { x: 2, y: Math.abs(Math.sin(cycle)) * -0.8 },
        leftShoulder: -stride * 0.58,
        leftElbow: -0.35 - Math.max(0, -stride) * 0.25,
        rightShoulder: stride * 0.58,
        rightElbow: -0.35 - Math.max(0, stride) * 0.25,
        leftHip: stride * 0.54,
        leftKnee: stride > 0 ? 0.14 : 0.68,
        rightHip: -stride * 0.54,
        rightKnee: -stride > 0 ? 0.14 : 0.68,
        bodyRotation: 0,
      };
    }

    case 'run': {
      const cycle = t * 11.5;
      const stride = Math.sin(cycle);
      const bounce = Math.abs(Math.cos(cycle)) * 5.5;
      return {
        hipOffsetY: -34 - bounce,
        torsoAngle: 0.3 + Math.sin(cycle * 2) * 0.03,
        headOffset: { x: 4, y: 1 },
        leftShoulder: -stride * 0.92,
        leftElbow: -1.12,
        rightShoulder: stride * 0.92,
        rightElbow: -1.12,
        leftHip: stride * 0.88,
        leftKnee: stride > 0 ? 0.22 : 1.18,
        rightHip: -stride * 0.88,
        rightKnee: -stride > 0 ? 0.22 : 1.18,
        bodyRotation: 0,
      };
    }

    case 'jump': {
      return {
        hipOffsetY: -32,
        torsoAngle: 0.22,
        headOffset: { x: 3, y: -1 },
        leftShoulder: -1.75,
        leftElbow: -0.5,
        rightShoulder: -1.35,
        rightElbow: -0.45,
        leftHip: 0.65,
        leftKnee: 1.05,
        rightHip: -0.45,
        rightKnee: 1.15,
        bodyRotation: 0,
      };
    }

    case 'land': {
      return {
        hipOffsetY: -24,
        torsoAngle: 0.42,
        headOffset: { x: 4, y: 2 },
        leftShoulder: 0.45,
        leftElbow: -0.7,
        rightShoulder: -0.6,
        rightElbow: -0.7,
        leftHip: -0.55,
        leftKnee: 1.25,
        rightHip: 0.35,
        rightKnee: 1.15,
        bodyRotation: 0,
      };
    }

    case 'flinch': {
      const tremor = Math.sin(t * 22) * 0.04;
      return {
        hipOffsetY: -33,
        torsoAngle: -0.14 + tremor,
        headOffset: { x: -2, y: 1 },
        leftShoulder: -1.85,
        leftElbow: -1.05,
        rightShoulder: -1.45,
        rightElbow: -1.15,
        leftHip: -0.28,
        leftKnee: 0.34,
        rightHip: 0.25,
        rightKnee: 0.28,
        bodyRotation: 0,
      };
    }

    case 'crouch_cover': {
      const shiver = Math.sin(t * 8) * 0.02;
      return {
        hipOffsetY: -18,
        torsoAngle: 0.72 + shiver,
        headOffset: { x: 5, y: 4 },
        leftShoulder: -2.18,
        leftElbow: -1.65,
        rightShoulder: -1.95,
        rightElbow: -1.55,
        leftHip: -0.88,
        leftKnee: 1.78,
        rightHip: -0.66,
        rightKnee: 1.66,
        bodyRotation: 0,
      };
    }

    case 'crawl_low': {
      const crawl = Math.sin(t * 5.6);
      return {
        hipOffsetY: -14,
        torsoAngle: 1.32,
        headOffset: { x: 4, y: -2 },
        leftShoulder: -1.1 + crawl * 0.38,
        leftElbow: -0.48,
        rightShoulder: -1.1 - crawl * 0.38,
        rightElbow: -0.48,
        leftHip: -0.6 - crawl * 0.34,
        leftKnee: 1.5,
        rightHip: -0.6 + crawl * 0.34,
        rightKnee: 1.5,
        bodyRotation: 0,
      };
    }

    case 'climb_stairs': {
      const cycle = t * 6.2;
      const step = Math.sin(cycle);
      const lift = Math.abs(Math.sin(cycle)) * 4;
      return {
        hipOffsetY: -34 - lift,
        torsoAngle: 0.18,
        headOffset: { x: 3, y: 0 },
        leftShoulder: -0.85 + step * 0.28,
        leftElbow: -0.62,
        rightShoulder: 0.32 - step * 0.28,
        rightElbow: -0.52,
        leftHip: step * 0.68 - 0.2,
        leftKnee: 0.88,
        rightHip: -step * 0.68 - 0.2,
        rightKnee: 0.88,
        bodyRotation: 0,
      };
    }

    case 'test_door': {
      const reach = Math.sin(t * 3.5) * 0.08;
      return {
        hipOffsetY: -23,
        torsoAngle: 0.44,
        headOffset: { x: 2, y: 1 },
        leftShoulder: -0.42,
        leftElbow: -0.5,
        rightShoulder: -1.58 + reach,
        rightElbow: -0.22,
        leftHip: -0.56,
        leftKnee: 1.32,
        rightHip: -0.34,
        rightKnee: 1.14,
        bodyRotation: 0,
      };
    }

    case 'wave_signal': {
      const wave = Math.sin(t * 7.8) * 0.48;
      return {
        hipOffsetY: -37,
        torsoAngle: -0.04,
        headOffset: { x: 0, y: 0 },
        leftShoulder: 0.35,
        leftElbow: -0.3,
        rightShoulder: -2.68 + wave,
        rightElbow: -0.35 + wave * 0.4,
        leftHip: -0.16,
        leftKnee: 0.1,
        rightHip: 0.18,
        rightKnee: 0.1,
        bodyRotation: 0,
      };
    }

    case 'roll_extinguish': {
      return {
        hipOffsetY: -12,
        torsoAngle: 1.45,
        headOffset: { x: 3, y: 2 },
        leftShoulder: -2.0,
        leftElbow: -1.4,
        rightShoulder: -1.9,
        rightElbow: -1.4,
        leftHip: -0.8,
        leftKnee: 1.6,
        rightHip: -0.7,
        rightKnee: 1.5,
        bodyRotation: t * 5.8,
      };
    }

    case 'celebrate': {
      const hop = Math.abs(Math.sin(t * 4.5)) * 7;
      return {
        hipOffsetY: -37 - hop,
        torsoAngle: -0.05,
        headOffset: { x: 0, y: -1 },
        leftShoulder: -2.55 + Math.sin(t * 6) * 0.18,
        leftElbow: -0.35,
        rightShoulder: -2.55 - Math.sin(t * 6) * 0.18,
        rightElbow: -0.35,
        leftHip: -0.22,
        leftKnee: 0.12,
        rightHip: 0.22,
        rightKnee: 0.12,
        bodyRotation: 0,
      };
    }

    case 'fall_knockdown': {
      // Multi-stage eased collapse: recoil -> drop -> settle on ground
      const p = Math.min(1, Math.max(0, knockdownProgress));
      const stage1 = Math.min(1, p / 0.35);
      const stage2 = Math.max(0, Math.min(1, (p - 0.2) / 0.8));
      const eased2 = 1 - Math.pow(1 - stage2, 2.4);
      return {
        hipOffsetY: -36 + eased2 * 29,
        torsoAngle: -0.18 * stage1 - eased2 * 1.38,
        headOffset: { x: -2, y: 2 },
        leftShoulder: -1.2 * stage1 - eased2 * 1.1,
        leftElbow: -0.45,
        rightShoulder: 0.4 * stage1 - eased2 * 1.65,
        rightElbow: -0.55,
        leftHip: 0.28 + eased2 * 0.45,
        leftKnee: 0.38,
        rightHip: -0.38 + eased2 * 0.62,
        rightKnee: 0.56,
        bodyRotation: 0,
      };
    }

    case 'idle':
    default:
      return {
        hipOffsetY: -37,
        torsoAngle: 0.04 + breathe,
        headOffset: { x: 1, y: 0 },
        leftShoulder: 0.22 + breathe,
        leftElbow: -0.28,
        rightShoulder: -0.18 - breathe,
        rightElbow: -0.35,
        leftHip: -0.15,
        leftKnee: 0.08,
        rightHip: 0.18,
        rightKnee: 0.08,
        bodyRotation: 0,
      };
  }
}

function interpolateAngles(current: JointAngles, target: JointAngles, alpha: number): JointAngles {
  return {
    hipOffsetY: lerp(current.hipOffsetY, target.hipOffsetY, alpha),
    torsoAngle: lerp(current.torsoAngle, target.torsoAngle, alpha),
    headOffset: {
      x: lerp(current.headOffset.x, target.headOffset.x, alpha),
      y: lerp(current.headOffset.y, target.headOffset.y, alpha),
    },
    leftShoulder: lerp(current.leftShoulder, target.leftShoulder, alpha),
    leftElbow: lerp(current.leftElbow, target.leftElbow, alpha),
    rightShoulder: lerp(current.rightShoulder, target.rightShoulder, alpha),
    rightElbow: lerp(current.rightElbow, target.rightElbow, alpha),
    leftHip: lerp(current.leftHip, target.leftHip, alpha),
    leftKnee: lerp(current.leftKnee, target.leftKnee, alpha),
    rightHip: lerp(current.rightHip, target.rightHip, alpha),
    rightKnee: lerp(current.rightKnee, target.rightKnee, alpha),
    bodyRotation: target.bodyRotation === 0 ? lerp(current.bodyRotation, 0, alpha) : target.bodyRotation,
  };
}

export function drawStickman(ctx: CanvasRenderingContext2D, opts: StickmanDrawOptions): void {
  const {
    x,
    y,
    scale = 1,
    facing = 1,
    pose,
    time,
    dt = 0.033,
    scarfColor = '#F59E0B',
    strokeColor = '#F8FAFC',
    calmMode = false,
    knockdownProgress = 0,
    rig,
    onFootstep,
  } = opts;

  const animTime = calmMode ? time * 0.62 : time;
  const targetAngles = getPoseAngles(pose, animTime, knockdownProgress);

  let angles = targetAngles;
  let effectiveFacing: number = facing;

  if (rig) {
    if (!rig.initialized) {
      rig.angles = targetAngles;
      rig.facingBlend = facing;
      rig.initialized = true;
    } else {
      const speed = pose === 'fall_knockdown' || pose === 'flinch' ? 16 : calmMode ? 8.5 : 13;
      const alpha = Math.min(1, 1 - Math.exp(-speed * Math.max(0.001, dt)));
      rig.angles = interpolateAngles(rig.angles, targetAngles, alpha);
      rig.facingBlend = lerp(rig.facingBlend, facing, Math.min(1, 1 - Math.exp(-12 * dt)));
    }
    angles = rig.angles;
    effectiveFacing = Math.abs(rig.facingBlend) < 0.08 ? (rig.facingBlend >= 0 ? 0.08 : -0.08) : rig.facingBlend;

    // Emit footstep callback synced to stride phase
    if (onFootstep && (pose === 'walk' || pose === 'run' || pose === 'climb_stairs')) {
      const freq = pose === 'run' ? 11.5 : pose === 'climb_stairs' ? 6.2 : 6.8;
      const sign = Math.sin(animTime * freq) >= 0 ? 1 : -1;
      if (rig.lastStepSign !== 0 && sign !== rig.lastStepSign) {
        onFootstep(pose === 'run');
      }
      rig.lastStepSign = sign;
    } else {
      rig.lastStepSign = 0;
    }
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * effectiveFacing, scale);

  // Ground shadow scales with height/pose
  const airborneLift = pose === 'jump' ? 0.68 : 1;
  ctx.fillStyle = `rgba(2, 6, 23, ${0.44 * airborneLift})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    2,
    (pose === 'fall_knockdown' ? 30 : 16) * airborneLift,
    4.5 * airborneLift,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const hipX = 0;
  const hipY = angles.hipOffsetY;

  if (angles.bodyRotation !== 0) {
    ctx.translate(hipX, hipY);
    ctx.rotate(angles.bodyRotation);
    ctx.translate(-hipX, -hipY);
  }

  const torsoLen = 28;
  const shoulderX = hipX + Math.sin(angles.torsoAngle) * torsoLen;
  const shoulderY = hipY - Math.cos(angles.torsoAngle) * torsoLen;

  const neckX = shoulderX + Math.sin(angles.torsoAngle) * 5;
  const neckY = shoulderY - Math.cos(angles.torsoAngle) * 5;

  const headX = neckX + angles.headOffset.x;
  const headY = neckY - 9 + angles.headOffset.y;

  const drawLimb = (
    sx: number,
    sy: number,
    upperAngle: number,
    upperLen: number,
    lowerRelAngle: number,
    lowerLen: number,
    color: string,
    lineWidth: number,
    withFoot = false
  ) => {
    const mx = sx + Math.sin(upperAngle) * upperLen;
    const my = sy + Math.cos(upperAngle) * upperLen;
    const ex = mx + Math.sin(upperAngle + lowerRelAngle) * lowerLen;
    const ey = my + Math.cos(upperAngle + lowerRelAngle) * lowerLen;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(mx, my);
    ctx.lineTo(ex, ey);
    if (withFoot) {
      const footAngle = upperAngle + lowerRelAngle + 1.35;
      ctx.lineTo(ex + Math.sin(footAngle) * 6, ey + Math.cos(footAngle) * 2.2);
    }
    ctx.stroke();

    return { ex, ey };
  };

  // Back arm & back leg (muted for crisp 2D silhouette readability)
  const backColor = 'rgba(203, 213, 225, 0.78)';
  drawLimb(hipX, hipY, angles.leftHip, 19, angles.leftKnee, 19, backColor, 4.2, true);
  drawLimb(shoulderX, shoulderY, angles.leftShoulder, 16, angles.leftElbow, 15, backColor, 3.8);

  // Torso
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(shoulderX, shoulderY);
  ctx.stroke();

  // Safety scarf fluttering behind neck for strong character identity
  const scarfFlutter =
    pose === 'fall_knockdown'
      ? 1
      : Math.sin(animTime * (calmMode ? 3 : 8.5)) * (pose === 'run' ? 5.5 : 2.2);
  ctx.strokeStyle = scarfColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(shoulderX - 2, shoulderY + 1);
  ctx.quadraticCurveTo(
    shoulderX - 12,
    shoulderY + 5 + scarfFlutter * 0.5,
    shoulderX - 20,
    shoulderY + 9 + scarfFlutter
  );
  ctx.stroke();

  // Front leg & front arm
  drawLimb(hipX, hipY, angles.rightHip, 19, angles.rightKnee, 19, strokeColor, 4.5, true);
  const frontHand = drawLimb(
    shoulderX,
    shoulderY,
    angles.rightShoulder,
    16,
    angles.rightElbow,
    15,
    strokeColor,
    4.1
  );

  // Bright signal cloth when waving on terrace
  if (pose === 'wave_signal') {
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(frontHand.ex, frontHand.ey);
    ctx.lineTo(frontHand.ex + 15, frontHand.ey - 9 + Math.sin(animTime * 9) * 4);
    ctx.lineTo(frontHand.ex + 11, frontHand.ey + 5 + Math.sin(animTime * 9) * 3);
    ctx.closePath();
    ctx.fill();
  }

  // Head
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(headX, headY, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Facing eye cue
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(headX + 3.5, headY - 1, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
