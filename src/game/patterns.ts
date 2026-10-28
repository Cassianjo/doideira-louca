/** Logical arena coordinates; UI draws each bullet around its center. */
export const ARENA = { width: 268, height: 180, duration: 5200 } as const;
export type Pattern = "rain" | "weave" | "radial";
export type Bullet = { id: string; x: number; y: number; radius: number };
export type Point = { x: number; y: number };
const inside = (b: Bullet) =>
  b.x >= -12 &&
  b.x <= ARENA.width + 12 &&
  b.y >= -12 &&
  b.y <= ARENA.height + 12;
/** Pure deterministic patterns. Elapsed time, rather than frames, sets speed. */
export function bulletsAt(
  pattern: Pattern,
  elapsedMs: number,
  round: number,
): Bullet[] {
  if (elapsedMs < 0 || elapsedMs >= ARENA.duration) return [];
  const bullets: Bullet[] = [];
  if (pattern === "rain") {
    for (let wave = 0; wave <= Math.floor(elapsedMs / 700); wave++) {
      const age = (elapsedMs - wave * 700) / 1000;
      const gap = (round + wave) % 6;
      for (let lane = 0; lane < 6; lane++) {
        if (lane === gap || lane === (gap + 1) % 6) continue;
        bullets.push({
          id: `rain-${wave}-${lane}`,
          x: 24 + lane * 44 + ((wave % 3) - 1) * 12,
          y: -8 + age * 72,
          radius: 4,
        });
      }
    }
  } else if (pattern === "weave") {
    for (let wave = 0; wave <= Math.floor(elapsedMs / 850); wave++) {
      const age = (elapsedMs - wave * 850) / 1000;
      const fromLeft = (wave + round) % 2 === 0;
      for (let row = 0; row < 3; row++) {
        if (row === (wave + round) % 3) continue;
        bullets.push({
          id: `weave-${wave}-${row}`,
          x: fromLeft ? -8 + age * 85 : ARENA.width + 8 - age * 85,
          y: 30 + row * 60 + Math.sin(age * 3 + row) * 12,
          radius: 4,
        });
      }
    }
  } else {
    for (let wave = 0; wave <= Math.floor(elapsedMs / 1300); wave++) {
      const age = (elapsedMs - wave * 1300) / 1000;
      const gap = (round + wave) % 8;
      for (let spoke = 0; spoke < 8; spoke++) {
        if (spoke === gap || spoke === (gap + 1) % 8) continue;
        const angle = (spoke * Math.PI) / 4;
        const distance = 10 + age * 44;
        bullets.push({
          id: `radial-${wave}-${spoke}`,
          x: ARENA.width / 2 + Math.cos(angle) * distance,
          y: ARENA.height / 2 + Math.sin(angle) * distance,
          radius: 4,
        });
      }
    }
  }
  return bullets.filter(inside);
}
export function touchesSoul(soul: Point, bullets: Bullet[]): boolean {
  return bullets.some(
    (b) => Math.hypot(b.x - soul.x, b.y - soul.y) < b.radius + 7,
  );
}
export function clampSoul(point: Point): Point {
  return {
    x: Math.max(11, Math.min(ARENA.width - 11, point.x)),
    y: Math.max(12, Math.min(ARENA.height - 12, point.y)),
  };
}
