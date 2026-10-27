import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createGameServer } from "../backend/server.mjs";
test("profiles, validation, authorization, isolation and durable saves", async () => {
  const dir = mkdtempSync(join(tmpdir(), "brasa-"));
  const db = join(dir, "game.sqlite");
  let server = createGameServer(db);
  const listen = async () => {
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    return `http://127.0.0.1:${server.address().port}`;
  };
  let base = await listen();
  const call = (path, method = "GET", data, token) =>
    fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  try {
    assert.equal((await call("/health")).status, 200);
    assert.equal(
      (await call("/api/login", "POST", { username: "../x" })).status,
      400,
    );
    const a = await (
      await call("/api/login", "POST", { username: "Hero_1" })
    ).json();
    assert.equal(a.username, "hero_1");
    const progress = {
      ...a.progress,
      x: 9,
      y: 7,
      hp: 42,
      victories: 2,
      gold: 70,
    };
    assert.equal((await call("/api/progress", "PUT", progress)).status, 401);
    assert.equal(
      (await call("/api/progress", "PUT", { ...progress, hp: 101 }, a.token))
        .status,
      400,
    );
    assert.equal(
      (await call("/api/progress", "PUT", progress, a.token)).status,
      200,
    );
    const b = await (
      await call("/api/login", "POST", { username: "other" })
    ).json();
    assert.equal(b.progress.gold, 0);
    assert.equal(
      (
        await fetch(base + "/health", {
          headers: { Origin: "https://untrusted.example" },
        })
      ).status,
      403,
    );
    await new Promise((r) => server.close(r));
    server = createGameServer(db);
    base = await listen();
    const restored = await (
      await call("/api/login", "POST", { username: "HERO_1" })
    ).json();
    assert.deepEqual(restored.progress, progress);
    assert.deepEqual(
      (
        await (
          await call("/api/progress", "GET", undefined, restored.token)
        ).json()
      ).progress,
      progress,
    );
  } finally {
    await new Promise((r) => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});
