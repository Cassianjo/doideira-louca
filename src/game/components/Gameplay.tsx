import { Text, View } from "react-native";
import { useGame } from "../store";
import Controls from "./Controls";
import WorldMap from "./WorldMap";
import { Button, palette, ui } from "./UI";
export default function Gameplay() {
  const g = useGame();
  const p = g.progress;
  const nearEnemy = Math.abs(p.x - 10) + Math.abs(p.y - 6) <= 2;
  const nearFire = Math.abs(p.x - 4) + Math.abs(p.y - 8) <= 1;
  return (
    <View style={{ gap: 20 }}>
      <View
        style={[ui.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
      >
        <View>
          <Text style={ui.label}>CAPÍTULO I · EXPLORAÇÃO</Text>
          <Text style={[ui.title, { marginTop: 8 }]}>Bosque das Cinzas</Text>
        </View>
        <Button onPress={() => g.go("menu")}>← Menu</Button>
      </View>
      <Text style={ui.muted}>
        Uma presença antiga vigia o santuário. Encontre a chama no bosque.
      </Text>
      <WorldMap x={p.x} y={p.y} />
      <View
        style={[ui.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
      >
        <View style={{ gap: 10 }}>
          <Text style={ui.text}>VIDA {p.hp} / 100</Text>
          <View
            style={{ height: 6, width: 170, backgroundColor: palette.line }}
          >
            <View
              style={{
                height: 6,
                width: `${p.hp}%`,
                backgroundColor: palette.purple,
              }}
            />
          </View>
          <Text style={ui.muted}>
            ✦ {p.gold} ouro · {p.potions} poções
          </Text>
        </View>
        <Controls move={g.walk} />
      </View>
      <View style={[ui.panel, { gap: 14 }]}>
        <Text style={ui.text}>
          {nearEnemy
            ? "O guardião bloqueia seu caminho."
            : nearFire
              ? "A fogueira aquece sua alma."
              : "Explore com as setas, WASD ou o controle."}
        </Text>
        {nearEnemy && (
          <Button primary onPress={() => g.go("battle")}>
            Enfrentar o guardião
          </Button>
        )}
        {nearFire && (
          <Button
            primary
            onPress={() => {
              g.change({ hp: 100, potions: Math.max(3, p.potions) });
              void g.save();
            }}
          >
            Descansar e salvar
          </Button>
        )}
        <View style={[ui.row, { flexWrap: "wrap" }]}>
          <View style={{ flex: 1 }}>
            <Button disabled={g.saving} onPress={() => void g.save()}>
              {g.saving ? "Salvando…" : "Salvar progresso"}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={() => g.go("inventory")}>Inventário</Button>
          </View>
        </View>
        {!!g.message && (
          <Text
            accessibilityRole="alert"
            style={[ui.muted, { color: palette.gold }]}
          >
            {g.message}
          </Text>
        )}
      </View>
    </View>
  );
}
