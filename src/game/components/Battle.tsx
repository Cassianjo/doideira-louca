import { useEffect, useRef, useState, useCallback } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useGame } from "../store";
import { ENEMIES } from "../enemies";
import { ARENA, bulletsAt, clampSoul, touchesSoul } from "../patterns";
import type { Bullet, Point } from "../patterns";
import Controls from "./Controls";
import PixelSprite from "./PixelSprite";
import { Button, palette, ui } from "./UI";
type Phase = "action" | "tell" | "dodge" | "won" | "lost";
export default function Battle({
  registerControls,
}: {
  registerControls?: (move: (x: number, y: number) => void) => void;
}) {
  const { width } = useWindowDimensions();
  const g = useGame();
  const foe = ENEMIES[g.encounter];
  const [enemyHp, setEnemyHp] = useState(foe.maxHp);
  const [phase, setPhase] = useState<Phase>("action");
  const phaseRef = useRef<Phase>("action");
  const [log, setLog] = useState(foe.description);
  const [soul, setSoul] = useState<Point>({ x: ARENA.width / 2, y: 150 });
  const soulRef = useRef(soul);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [remaining, setRemaining] = useState<number>(ARENA.duration);
  const [invulnerable, setInvulnerable] = useState(false);
  const [round, setRound] = useState(1);
  const defended = useRef(false);
  const progress = useGame((s) => s.progress);
  const transition = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const move = useCallback((dx: number, dy: number) => {
    if (phaseRef.current !== "dodge" && phaseRef.current !== "tell") return;
    const next = clampSoul({
      x: soulRef.current.x + dx * 12,
      y: soulRef.current.y + dy * 12,
    });
    soulRef.current = next;
    setSoul(next);
  }, []);
  useEffect(() => {
    registerControls?.(move);
    return () => registerControls?.(() => {});
  }, [registerControls, move]);
  useEffect(() => {
    if (phase !== "tell") return;
    const timer = setTimeout(() => {
      transition("dodge");
      setLog("Desvie com as setas, WASD ou o controle.");
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== "dodge") return;
    let elapsed = 0,
      lastHit = -1000,
      lastFrame = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      // A backgrounded tab cannot jump through the whole enemy turn.
      elapsed += Math.min(100, Math.max(0, now - lastFrame));
      lastFrame = now;
      const active = bulletsAt(foe.pattern, elapsed, round);
      if (elapsed - lastHit >= 700 && touchesSoul(soulRef.current, active)) {
        lastHit = elapsed;
        const hp = Math.max(
          0,
          useGame.getState().progress.hp -
            (defended.current ? Math.ceil(foe.damage / 2) : foe.damage),
        );
        g.change({ hp });
        if (hp === 0) {
          setBullets([]);
          transition("lost");
          setLog("A chama se apagou… a fogueira te dará uma nova chance.");
          return;
        }
      }
      setInvulnerable(elapsed - lastHit < 700);
      setBullets(active);
      setRemaining(Math.max(0, ARENA.duration - elapsed));
      if (elapsed >= ARENA.duration) {
        transition("action");
        setBullets([]);
        setInvulnerable(false);
        setRound((r) => r + 1);
        setLog("Você resistiu. Escolha sua próxima ação.");
      }
    }, 40);
    return () => clearInterval(timer);
  }, [phase, foe, round]);
  const act = (kind: "attack" | "heal" | "defend") => {
    if (phaseRef.current !== "action") return;
    const current = useGame.getState().progress;
    if (kind === "heal" && current.potions === 0) {
      setLog("Sem poções. A fogueira pode reabastecer você.");
      return;
    }
    defended.current = kind === "defend";
    if (kind === "attack") {
      const hp = Math.max(0, enemyHp - 23);
      setEnemyHp(hp);
      if (hp === 0) {
        transition("won");
        setLog(
          `${foe.name} cedeu à sua chama. +${foe.reward} ouro. Siga a seta para o próximo objetivo.`,
        );
        g.winBattle(foe.id);
        return;
      }
    }
    if (kind === "heal")
      g.change({
        hp: Math.min(100, current.hp + 35),
        potions: current.potions - 1,
      });
    setRemaining(ARENA.duration);
    setBullets([]);
    transition("tell");
    setLog(
      `${defended.current ? "Defesa ativa: dano pela metade. " : ""}${foe.tell}`,
    );
  };
  const active = phase === "dodge" || phase === "tell";
  return (
    <View style={{ gap: 18 }}>
      <Text style={ui.label}>
        ENCONTRO · TURNO {round} ·{" "}
        {phase === "tell"
          ? "PREPARE-SE"
          : phase === "dodge"
            ? "ESQUIVE"
            : "SUA VEZ"}
      </Text>
      <Text style={ui.title}>{foe.name}</Text>
      <View
        style={[
          ui.panel,
          { alignItems: "center", gap: 12, paddingVertical: 22 },
        ]}
      >
        <PixelSprite kind={foe.kind} size={7} />
        <Text style={ui.muted}>
          VIDA DO INIMIGO {enemyHp} / {foe.maxHp}
        </Text>
        <View style={{ height: 5, width: 200, backgroundColor: palette.line }}>
          <View
            style={{
              height: 5,
              width: `${(enemyHp / foe.maxHp) * 100}%`,
              backgroundColor: foe.color,
            }}
          />
        </View>
      </View>
      <View style={{ alignItems: "center", gap: 12 }}>
        <View
          accessibilityLabel={`Arena de esquiva: ${foe.name}`}
          style={{
            width: ARENA.width + 6,
            height: ARENA.height + 6,
            borderWidth: 3,
            borderColor: active ? foe.color : palette.line,
            backgroundColor: "#111116",
            overflow: "hidden",
          }}
        >
          {active ? (
            <>
              {foe.pattern === "radial" && (
                <View
                  style={{
                    position: "absolute",
                    left: ARENA.width / 2 - 10,
                    top: ARENA.height / 2 - 10,
                    width: 20,
                    height: 20,
                    borderWidth: 1,
                    borderColor: foe.color,
                    opacity: 0.5,
                  }}
                />
              )}
              {phase === "tell" && (
                <Text
                  style={[
                    ui.label,
                    {
                      position: "absolute",
                      top: 20,
                      alignSelf: "center",
                      color: foe.color,
                    },
                  ]}
                >
                  ! PREPARE-SE !
                </Text>
              )}
              {bullets.map((b) => (
                <View
                  key={b.id}
                  style={{
                    position: "absolute",
                    left: b.x - b.radius,
                    top: b.y - b.radius,
                    width: b.radius * 2,
                    height: b.radius * 2,
                    backgroundColor: foe.color,
                  }}
                />
              ))}
              <View
                style={{
                  position: "absolute",
                  left: soul.x - 9,
                  top: soul.y - 10,
                  opacity: invulnerable ? 0.45 : 1,
                }}
              >
                <PixelSprite kind="flame" size={2} />
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 18,
                gap: 12,
              }}
            >
              <PixelSprite kind="flame" size={3} />
              <Text style={[ui.muted, { textAlign: "center" }]}>
                {phase === "won"
                  ? "VITÓRIA"
                  : phase === "lost"
                    ? "SUA CHAMA PODE RENASCER"
                    : "Escolha uma ação para começar o turno."}
              </Text>
            </View>
          )}
        </View>
        {active && (
          <Text style={[ui.label, { color: foe.color }]}>
            {phase === "tell"
              ? "POSICIONE SUA CHAMA"
              : `RESISTA POR ${(remaining / 1000).toFixed(1)}s`}
          </Text>
        )}
        <Text
          accessibilityLiveRegion="polite"
          style={[ui.text, { textAlign: "center", lineHeight: 22 }]}
        >
          {log}
        </Text>
        <Text
          style={[
            ui.text,
            { color: progress.hp < 30 ? "#e69c83" : palette.purple },
          ]}
        >
          VIDA {progress.hp}/100 · POÇÕES {progress.potions}
        </Text>
      </View>
      {phase === "won" && (
        <View style={{ gap: 10 }}>
          <Text accessibilityRole="alert" style={ui.muted}>
            {g.saving ? "Salvando sua vitória…" : g.message}
          </Text>
          {!g.saving &&
            g.message &&
            !g.message.startsWith("Progresso salvo") && (
              <Button onPress={() => void g.save()}>
                Tentar salvar novamente
              </Button>
            )}
        </View>
      )}
      {phase === "won" || phase === "lost" ? (
        <Button
          primary
          disabled={g.saving}
          onPress={() => g.retreatBattle(phase === "lost")}
        >
          {phase === "lost" ? "Renascer na fogueira" : "Continuar aventura →"}
        </Button>
      ) : (
        <>
          <View style={[ui.row, { flexWrap: "wrap" }]}>
            {[
              ["attack", "⚔ Atacar"],
              ["heal", "✚ Poção"],
              ["defend", "◇ Defender"],
            ].map(([action, label]) => (
              <View key={action} style={{ flex: 1, minWidth: 82 }}>
                <Button
                  disabled={
                    phase !== "action" ||
                    (action === "heal" && !progress.potions)
                  }
                  onPress={() => act(action as "attack" | "heal" | "defend")}
                >
                  {label}
                </Button>
              </View>
            ))}
          </View>
          {width >= 700 && <Controls move={move} />}
          <Button disabled={active} onPress={() => g.retreatBattle()}>
            Recuar
          </Button>
        </>
      )}
    </View>
  );
}
