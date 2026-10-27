import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useGame } from "../store";
import Controls from "./Controls";
import PixelSprite from "./PixelSprite";
import { Button, palette, ui } from "./UI";
type Bullet = { x: number; y: number };
export default function Battle() {
  const g = useGame();
  const [enemy, setEnemy] = useState(90);
  const [phase, setPhase] = useState<"action" | "dodge" | "won" | "lost">(
    "action",
  );
  const [log, setLog] = useState(
    "O guardião observa sua chama. O que você fará?",
  );
  const [soul, setSoul] = useState({ x: 140, y: 100 });
  const soulRef = useRef(soul);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const round = useRef(0);
  const lastHit = useRef(0);
  const damage = useRef(6);
  const progress = useGame((s) => s.progress);
  const move = (dx: number, dy: number) => {
    if (phase !== "dodge") return;
    const next = {
      x: Math.max(8, Math.min(270, soulRef.current.x + dx * 12)),
      y: Math.max(8, Math.min(170, soulRef.current.y + dy * 12)),
    };
    soulRef.current = next;
    setSoul(next);
  };
  useEffect(() => {
    if (phase !== "dodge") return;
    let tick = 0;
    let active: Bullet[] = [];
    lastHit.current = 0;
    const timer = setInterval(() => {
      tick++;
      if (tick % 5 === 0) {
        const lane = (tick * 37 + round.current * 41) % 268;
        active.push({ x: lane, y: -10 });
      }
      active = active
        .map((b) => ({ ...b, y: b.y + 5 }))
        .filter((b) => b.y < 190);
      const s = soulRef.current;
      if (
        tick - lastHit.current > 10 &&
        active.some((b) => Math.abs(b.x - s.x) < 13 && Math.abs(b.y - s.y) < 13)
      ) {
        lastHit.current = tick;
        const hp = Math.max(0, useGame.getState().progress.hp - damage.current);
        g.change({ hp });
        if (hp === 0) {
          setPhase("lost");
          setLog("A chama se apagou… mas ainda há uma nova chance.");
          return;
        }
      }
      setBullets([...active]);
      if (tick >= 100) {
        setPhase("action");
        setBullets([]);
        setLog("Você resistiu. É a sua vez!");
      }
    }, 50);
    return () => clearInterval(timer);
  }, [phase]);
  const act = (kind: "attack" | "heal" | "defend") => {
    if (phase !== "action") return;
    if (kind === "heal" && progress.potions === 0) {
      setLog("Você está sem poções.");
      return;
    }
    damage.current = kind === "defend" ? 3 : 6;
    if (kind === "attack") {
      const hp = Math.max(0, enemy - 23);
      setEnemy(hp);
      if (!hp) {
        setPhase("won");
        g.change({
          victories: progress.victories + 1,
          gold: progress.gold + 35,
        });
        setLog(
          "O guardião encontrou paz. +35 ouro. Sua chama ficou mais forte.",
        );
        void g.save();
        return;
      }
    }
    if (kind === "heal")
      g.change({
        hp: Math.min(100, progress.hp + 35),
        potions: progress.potions - 1,
      });
    round.current++;
    setPhase("dodge");
    setLog(
      kind === "defend"
        ? "Defesa ativa: dano reduzido. Desvie por 5 segundos!"
        : "Mova o foguinho e desvie das brasas por 5 segundos!",
    );
  };
  return (
    <View style={{ gap: 20 }}>
      <Text style={ui.label}>ENCONTRO · TURNO {round.current + 1}</Text>
      <Text style={ui.title}>O Guardião Esquecido</Text>
      <View
        style={[
          ui.panel,
          { alignItems: "center", gap: 16, paddingVertical: 30 },
        ]}
      >
        <PixelSprite kind="ghost" size={9} />
        <Text style={ui.muted}>GUARDIÃO {enemy} / 90</Text>
        <View style={{ height: 5, width: 200, backgroundColor: palette.line }}>
          <View
            style={{
              height: 5,
              width: `${(enemy / 90) * 100}%`,
              backgroundColor: palette.gold,
            }}
          />
        </View>
      </View>
      <View style={{ alignItems: "center", gap: 16 }}>
        <View
          style={{
            width: 300,
            height: 200,
            borderWidth: 3,
            borderColor: phase === "dodge" ? palette.gold : palette.line,
            backgroundColor: "#111116",
            overflow: "hidden",
          }}
        >
          {phase === "dodge" ? (
            <>
              <View style={{ position: "absolute", left: soul.x, top: soul.y }}>
                <PixelSprite kind="flame" size={2} />
              </View>
              {bullets.map((b, i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: b.x,
                    top: b.y,
                    width: 7,
                    height: 12,
                    backgroundColor: "#cab7e5",
                  }}
                />
              ))}
            </>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                gap: 12,
              }}
            >
              <PixelSprite kind="flame" size={3} />
              <Text style={[ui.muted, { textAlign: "center" }]}>
                {phase === "won"
                  ? "VITÓRIA"
                  : phase === "lost"
                    ? "A JORNADA CONTINUA"
                    : "Sua chama permanece acesa."}
              </Text>
            </View>
          )}
        </View>
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
          {!g.saving && g.message && !g.message.startsWith("Progresso salvo") && (
            <Button onPress={() => void g.save()}>Tentar salvar novamente</Button>
          )}
        </View>
      )}
      {phase === "won" || phase === "lost" ? (
        <Button
          primary
          onPress={() => {
            if (phase === "lost") g.change({ hp: 100, x: 7, y: 10 });
            g.go("world");
          }}
        >
          Voltar ao bosque
        </Button>
      ) : (
        <>
          <View style={[ui.row, { flexWrap: "wrap" }]}>
            {[
              ["attack", "⚔ Atacar"],
              ["heal", "✚ Poção"],
              ["defend", "◇ Defender"],
            ].map(([action, label]) => (
              <View key={action} style={{ flex: 1, minWidth: 90 }}>
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
          <Controls move={move} />
          <Button disabled={phase === "dodge"} onPress={() => g.go("world")}>
            Fugir para o bosque
          </Button>
        </>
      )}
    </View>
  );
}
