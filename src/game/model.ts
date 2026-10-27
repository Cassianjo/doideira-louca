export type Progress = {
  x: number;
  y: number;
  hp: number;
  potions: number;
  victories: number;
  gold: number;
};
export type Screen = "menu" | "world" | "battle" | "inventory" | "guide";
export const fresh: Progress = {
  x: 7,
  y: 10,
  hp: 100,
  potions: 3,
  victories: 0,
  gold: 0,
};
export const blocked = (x: number, y: number) =>
  x < 1 ||
  x > 13 ||
  y < 1 ||
  y > 11 ||
  (x >= 5 && x <= 9 && y <= 3) ||
  ((x === 2 || x === 12) && y >= 3 && y <= 8);
export function move(p: Progress, dx: number, dy: number): Progress {
  const x = p.x + dx,
    y = p.y + dy;
  return blocked(x, y) ? p : { ...p, x, y };
}
