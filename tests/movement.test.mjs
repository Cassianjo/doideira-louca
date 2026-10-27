import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, move } from "../src/game/model.ts";
test("movement respects map boundaries, trees and sanctuary", () => {
  assert.deepEqual(move(fresh, 1, 0), { ...fresh, x: 8 });
  const edge = { ...fresh, x: 1 };
  assert.equal(move(edge, -1, 0), edge);
  const tree = { ...fresh, x: 3, y: 6 };
  assert.equal(move(tree, -1, 0), tree);
  const temple = { ...fresh, x: 7, y: 4 };
  assert.equal(move(temple, 0, -1), temple);
  assert.deepEqual(move({ ...fresh, x: 3, y: 9 }, 0, -1), {
    ...fresh,
    x: 3,
    y: 8,
  });
});
