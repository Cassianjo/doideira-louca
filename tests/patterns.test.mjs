import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ARENA,
  bulletsAt,
  clampSoul,
  touchesSoul,
} from "../src/game/patterns.ts";

test("rain falls vertically with two open columns per volley", () => {
  const before = bulletsAt("rain", 100, 1),
    after = bulletsAt("rain", 400, 1);
  assert.equal(before.length, 4);
  for (let i = 0; i < before.length; i++) {
    assert.equal(before[i].x, after[i].x);
    assert.ok(after[i].y > before[i].y);
  }
  assert.notDeepEqual(bulletsAt("rain", 100, 1), bulletsAt("rain", 100, 2));
});
test("weaving attacks alternate entry sides and leave an open row", () => {
  const left = bulletsAt("weave", 100, 2),
    later = bulletsAt("weave", 400, 2),
    right = bulletsAt("weave", 100, 1);
  assert.equal(left.length, 2);
  assert.equal(right.length, 2);
  assert.ok(left[0].x < ARENA.width / 2);
  assert.ok(right[0].x > ARENA.width / 2);
  assert.ok(later[0].x > left[0].x);
  assert.notEqual(later[0].y, left[0].y);
});
test("radial volleys expand from center and preserve a two-spoke opening", () => {
  const first = bulletsAt("radial", 100, 1),
    later = bulletsAt("radial", 700, 1);
  assert.equal(first.length, 6);
  const distance = (b) =>
    Math.hypot(b.x - ARENA.width / 2, b.y - ARENA.height / 2);
  assert.ok(later.every((b, i) => distance(b) > distance(first[i])));
  assert.notDeepEqual(bulletsAt("radial", 100, 1), bulletsAt("radial", 100, 2));
});
test("all patterns are deterministic, bounded and end after a turn", () => {
  for (const pattern of ["rain", "weave", "radial"]) {
    for (let time = 0; time < ARENA.duration; time += 100) {
      const bullets = bulletsAt(pattern, time, 3);
      assert.deepEqual(bullets, bulletsAt(pattern, time, 3));
      assert.equal(new Set(bullets.map((b) => b.id)).size, bullets.length);
      assert.ok(
        bullets.every(
          (b) =>
            Number.isFinite(b.x) &&
            Number.isFinite(b.y) &&
            b.radius === 4 &&
            b.x >= -12 &&
            b.x <= ARENA.width + 12 &&
            b.y >= -12 &&
            b.y <= ARENA.height + 12,
        ),
      );
    }
    assert.deepEqual(bulletsAt(pattern, ARENA.duration, 1), []);
    assert.deepEqual(bulletsAt(pattern, -1, 1), []);
  }
});
test("soul collision uses distance and arena clamps preserve reachable edges", () => {
  const bullet = { id: "test", x: 50, y: 50, radius: 4 };
  assert.equal(touchesSoul({ x: 50, y: 50 }, [bullet]), true);
  assert.equal(touchesSoul({ x: 60, y: 60 }, [bullet]), false);
  assert.deepEqual(clampSoul({ x: -999, y: 999 }), {
    x: 11,
    y: ARENA.height - 12,
  });
  assert.deepEqual(clampSoul({ x: 130, y: 80 }), { x: 130, y: 80 });
});

test("each enemy can hit an unattended starting flame and permits movement away", () => {
  const start = { x: ARENA.width / 2, y: 150 };
  for (const pattern of ["rain", "weave", "radial"]) {
    let hit = false,
      escapeExists = false;
    for (let time = 0; time < ARENA.duration; time += 40) {
      const bullets = bulletsAt(pattern, time, 1);
      if (touchesSoul(start, bullets)) {
        hit = true;
        escapeExists ||= !touchesSoul(
          clampSoul({ x: start.x - 36, y: start.y - 36 }),
          bullets,
        );
      }
    }
    assert.ok(hit, `${pattern} requires actual evasion`);
    assert.ok(escapeExists, `${pattern} leaves space to evade`);
  }
});
