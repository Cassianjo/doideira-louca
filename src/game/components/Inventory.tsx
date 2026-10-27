import { Text, View } from "react-native";
import { useGame } from "../store";
import PixelSprite from "./PixelSprite";
import { Button, Rule, ui } from "./UI";
export default function Inventory() {
  const g = useGame();
  return (
    <View style={{ gap: 20 }}>
      <Text style={ui.label}>EQUIPAMENTO & SUPRIMENTOS</Text>
      <Text style={ui.title}>Sua mochila</Text>
      <Text style={ui.muted}>
        Leve apenas o necessário. A coragem não ocupa espaço.
      </Text>
      <Rule label="ITENS" />
      {[
        {
          kind: "sword" as const,
          title: "Espada de viajante",
          desc: "Uma lâmina fiel. Causa 23 de dano.",
          qty: "EQUIPADA",
        },
        {
          kind: "flame" as const,
          title: "Poção de brasa",
          desc: "Restaura 35 de vida. Consome uma poção.",
          qty: `${g.progress.potions} UN.`,
        },
        {
          kind: "chest" as const,
          title: "Fragmentos de ouro",
          desc: "Recompensas por enfrentar o desconhecido.",
          qty: String(g.progress.gold),
        },
      ].map((item) => (
        <View key={item.title} style={[ui.panel, ui.row]}>
          <PixelSprite kind={item.kind} size={4} />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={ui.text}>{item.title}</Text>
            <Text style={ui.muted}>{item.desc}</Text>
          </View>
          <Text style={ui.label}>{item.qty}</Text>
        </View>
      ))}
      <Button
        disabled={!g.progress.potions || g.progress.hp === 100}
        primary
        onPress={() =>
          g.change({
            hp: Math.min(100, g.progress.hp + 35),
            potions: g.progress.potions - 1,
          })
        }
      >
        Usar poção · Vida {g.progress.hp}/100
      </Button>
      <Button onPress={() => g.go("world")}>← Voltar ao bosque</Button>
    </View>
  );
}
