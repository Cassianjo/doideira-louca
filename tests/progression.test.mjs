import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  normalizeProgress,
  blocked,
  interaction,
  objective,
  objectiveTarget,
  guidance,
  move,
} from "../src/game/model.ts";
const arrows = { "↑": [0, -1], "→": [1, 0], "↓": [0, 1], "←": [-1, 0] };
function follow(p) {
  for (let n = 0; n < 200; n++) {
    const t = objectiveTarget(p);
    if (p.x === t.x && p.y === t.y) return p;
    const a = arrows[guidance(p).arrow];
    assert.ok(a, "an actual route exists");
    const next = move(p, ...a);
    assert.notEqual(next, p, "guidance must not point into walls");
    p = next;
  }
  assert.fail("guidance failed to reach objective");
}
test("doors offer entry/exit nearby and never change areas just by walking", () => {
  const p = { ...fresh, x: 4, y: 6 };
  assert.equal(interaction(p).destination, "hut");
  assert.equal(move(p, 0, -1).area, "forest");
  assert.equal(interaction({ ...fresh, x: 7, y: 4 }).locked, true);
  assert.equal(
    interaction({
      ...fresh,
      x: 7,
      y: 4,
      metKeeper: true,
      defeated: ["guardian"],
    }).locked,
    false,
  );
  assert.equal(
    interaction({ ...fresh, area: "hut", x: 7, y: 10 }).kind,
    "exit",
  );
  assert.equal(interaction({ ...fresh, x: 8, y: 10 }), null);
});
test("every chapter stage guides to a reachable interactive target, including cross-area routes", () => {
  let p = normalizeProgress(fresh);
  assert.equal(objective(p).step, 1);
  p = follow(p);
  assert.equal(interaction(p).destination, "hut");
  p = follow({ ...p, area: "hut", x: 7, y: 10 });
  assert.equal(interaction(p).kind, "talk");
  p = { ...p, metKeeper: true };
  assert.equal(objective(p).step, 2);
  p = follow(p);
  assert.equal(interaction(p).kind, "exit");
  p = follow({ ...p, area: "forest", x: 4, y: 6 });
  assert.equal(interaction(p).enemy, "guardian");
  p = { ...p, defeated: ["guardian"] };
  p = follow(p);
  assert.equal(interaction(p).destination, "sanctuary");
  assert.equal(interaction(p).locked, false);
  p = follow({ ...p, area: "sanctuary", x: 7, y: 10 });
  assert.equal(interaction(p).enemy, "wisp");
  assert.equal(
    interaction({ ...p, x: 7, y: 4 }).locked,
    true,
    "sentinel waits for wisp",
  );
  assert.equal(
    interaction({ ...p, x: 7, y: 2 }).locked,
    true,
    "altar cannot skip encounters",
  );
  p = follow({ ...p, defeated: ["guardian", "wisp"] });
  assert.equal(interaction(p).enemy, "sentinel");
  assert.equal(interaction(p).locked, false);
  p = follow({ ...p, defeated: ["guardian", "wisp", "sentinel"] });
  assert.equal(interaction(p).kind, "altar");
  assert.equal(interaction(p).locked, false);
  assert.equal(objective({ ...p, completed: true }).step, 6);
});
test("routes work from all walkable starts in each area and legacy progress remains intact", () => {
  for (const area of ["forest", "hut", "sanctuary"])
    for (let x = 1; x <= 13; x++)
      for (let y = 1; y <= 11; y++)
        if (!blocked(x, y, area)) follow({ ...fresh, area, x, y });
  const old = { x: 9, y: 7, hp: 42, potions: 2, victories: 8, gold: 280 };
  const p = normalizeProgress(old);
  for (const key of Object.keys(old)) assert.equal(p[key], old[key]);
  assert.equal(p.area, "forest");
  assert.deepEqual(p.defeated, []);
  const changed = normalizeProgress(fresh);
  changed.defeated.push("guardian");
  assert.deepEqual(fresh.defeated, []);
});
