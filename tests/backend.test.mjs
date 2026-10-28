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

test("legacy saves are upgraded on login and GET without losing progress or timestamps", async () => {
  const { DatabaseSync } = await import("node:sqlite");
  const dir = mkdtempSync(join(tmpdir(), "brasa-legacy-"));
  const dbPath = join(dir, "game.sqlite");
  const legacy = { x: 11, y: 8, hp: 31, potions: 1, victories: 7, gold: 245 };
  const timestamp = "2026-10-01T12:00:00.000Z";
  const expected = {
    ...legacy,
    area: "forest",
    metKeeper: false,
    defeated: [],
    completed: false,
  };
  const seed = new DatabaseSync(dbPath);
  seed.exec(
    "CREATE TABLE players (username TEXT PRIMARY KEY, progress TEXT NOT NULL, updated TEXT NOT NULL); CREATE TABLE sessions (token TEXT PRIMARY KEY, username TEXT NOT NULL, expires INTEGER NOT NULL);",
  );
  for (const name of ["legacy_login", "legacy_get"])
    seed
      .prepare("INSERT INTO players VALUES (?, ?, ?)")
      .run(name, JSON.stringify(legacy), timestamp);
  seed
    .prepare("INSERT INTO sessions VALUES (?, ?, ?)")
    .run("existing-session", "legacy_get", Date.now() + 60000);
  seed.close();
  let server = createGameServer(dbPath);
  const listen = async () => {
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    return `http://127.0.0.1:${server.address().port}`;
  };
  let base = await listen();
  try {
    const response = await fetch(base + "/api/progress", {
      headers: { Authorization: "Bearer existing-session" },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      progress: expected,
      updated: timestamp,
    });
    const login = await fetch(base + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "legacy_login" }),
    });
    const result = await login.json();
    assert.deepEqual(result.progress, expected);
    assert.equal(result.updated, timestamp);
    await new Promise((r) => server.close(r));
    const stored = new DatabaseSync(dbPath);
    for (const name of ["legacy_login", "legacy_get"])
      assert.deepEqual(
        JSON.parse(
          stored
            .prepare("SELECT progress FROM players WHERE username = ?")
            .get(name).progress,
        ),
        expected,
      );
    stored.close();
    server = createGameServer(dbPath);
    base = await listen();
    const restored = await (
      await fetch(base + "/api/progress", {
        headers: { Authorization: "Bearer existing-session" },
      })
    ).json();
    assert.deepEqual(restored.progress, expected);
  } finally {
    await new Promise((r) => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("campaign state round-trips, rejects malformed flags and survives legacy PUT requests", async () => {
  const dir = mkdtempSync(join(tmpdir(), "brasa-campaign-"));
  const server = createGameServer(join(dir, "game.sqlite"));
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method, body, token) =>
    fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    const player = await (
      await request("/api/login", "POST", { username: "campaign" })
    ).json();
    assert.equal(player.progress.area, "forest");
    assert.deepEqual(player.progress.defeated, []);
    const campaign = {
      ...player.progress,
      x: 7,
      y: 2,
      hp: 64,
      gold: 135,
      victories: 3,
      area: "sanctuary",
      metKeeper: true,
      defeated: ["guardian", "wisp", "sentinel"],
      completed: true,
    };
    const saved = await request("/api/progress", "PUT", campaign, player.token);
    assert.equal(saved.status, 200);
    assert.deepEqual((await saved.json()).progress, campaign);
    for (const invalid of [
      { area: "dungeon" },
      { area: null },
      { metKeeper: 1 },
      { completed: "true" },
      { defeated: ["guardian", "guardian"] },
      { defeated: ["dragon"] },
      { defeated: null },
      { defeated: "guardian" },
      { defeated: ["guardian", "wisp", "sentinel", "guardian"] },
    ]) {
      assert.equal(
        (
          await request(
            "/api/progress",
            "PUT",
            { ...campaign, ...invalid },
            player.token,
          )
        ).status,
        400,
        JSON.stringify(invalid),
      );
    }
    for (const invalid of [null, [], "hello"])
      assert.equal(
        (await request("/api/progress", "PUT", invalid, player.token)).status,
        400,
      );
    const legacy = { x: 9, y: 6, hp: 80, potions: 2, victories: 4, gold: 170 };
    const legacyResult = await request(
      "/api/progress",
      "PUT",
      legacy,
      player.token,
    );
    assert.equal(legacyResult.status, 200);
    const expected = { ...campaign, ...legacy };
    assert.deepEqual((await legacyResult.json()).progress, expected);
    const loaded = await (
      await fetch(base + "/api/progress", {
        headers: { Authorization: `Bearer ${player.token}` },
      })
    ).json();
    assert.deepEqual(loaded.progress, expected);
  } finally {
    await new Promise((r) => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});
