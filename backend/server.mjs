import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function createGameServer(
  dbPath = process.env.RPG_DB || resolve("backend/data/game.sqlite"),
) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(
    "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS players (username TEXT PRIMARY KEY, progress TEXT NOT NULL, updated TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, username TEXT NOT NULL, expires INTEGER NOT NULL);",
  );
  const initial = { x: 7, y: 10, hp: 100, potions: 3, victories: 0, gold: 0 };
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    const allowed = (
      process.env.CORS_ORIGINS || "http://localhost:8081,http://127.0.0.1:8081"
    ).split(",");
    if (origin && !allowed.includes(origin)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Content-Type", "application/json");
    const send = (status, data) => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
    };
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    try {
      const path = new URL(req.url, "http://localhost").pathname;
      if (path === "/health" && req.method === "GET")
        return send(200, { ok: true });
      let body = {};
      if (["POST", "PUT"].includes(req.method)) {
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (raw.length > 8192)
            return send(413, { error: "Dados muito grandes." });
        }
        try {
          body = JSON.parse(raw);
          if (!body || typeof body !== "object" || Array.isArray(body)) return send(400, { error: "Objeto JSON esperado." });
        } catch {
          return send(400, { error: "JSON inválido." });
        }
      }
      if (path === "/api/login" && req.method === "POST") {
        if (
          typeof body.username !== "string" ||
          !/^[a-zA-Z0-9_]{3,20}$/.test(body.username)
        )
          return send(400, { error: "Use de 3 a 20 letras, números ou _." });
        const username = body.username.toLowerCase();
        db.prepare("INSERT OR IGNORE INTO players VALUES (?, ?, ?)").run(
          username,
          JSON.stringify(initial),
          new Date().toISOString(),
        );
        const token = randomBytes(32).toString("hex");
        db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
        db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(
          token,
          username,
          Date.now() + 86400000,
        );
        return send(200, {
          username,
          token,
          ...db
            .prepare("SELECT progress, updated FROM players WHERE username = ?")
            .get(username),
          progress: JSON.parse(
            db
              .prepare("SELECT progress FROM players WHERE username = ?")
              .get(username).progress,
          ),
        });
      }
      if (path === "/api/progress") {
        const token = (req.headers.authorization || "").replace(/^Bearer /, "");
        const session = db
          .prepare(
            "SELECT username FROM sessions WHERE token = ? AND expires > ?",
          )
          .get(token, Date.now());
        if (!session)
          return send(401, { error: "Entre novamente para salvar." });
        if (req.method === "GET") {
          const player = db
            .prepare("SELECT * FROM players WHERE username = ?")
            .get(session.username);
          return send(200, {
            progress: JSON.parse(player.progress),
            updated: player.updated,
          });
        }
        if (req.method === "PUT") {
          const ranges = {
            x: [1, 13],
            y: [1, 11],
            hp: [0, 100],
            potions: [0, 99],
            victories: [0, 100000],
            gold: [0, 10000000],
          };
          const progress = {};
          for (const [key, [min, max]] of Object.entries(ranges)) {
            if (
              !Number.isInteger(body[key]) ||
              body[key] < min ||
              body[key] > max
            )
              return send(400, { error: `Progresso inválido: ${key}` });
            progress[key] = body[key];
          }
          const updated = new Date().toISOString();
          db.prepare(
            "UPDATE players SET progress = ?, updated = ? WHERE username = ?",
          ).run(JSON.stringify(progress), updated, session.username);
          return send(200, { progress, updated });
        }
      }
      send(404, { error: "Rota não encontrada." });
    } catch (error) {
      console.error("API:", error.message);
      send(500, { error: "Não foi possível concluir. Tente novamente." });
    }
  });
  server.on("close", () => db.close());
  return server;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  createGameServer().listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
    console.log("RPG API pronta na porta " + (process.env.PORT || 3001)),
  );
