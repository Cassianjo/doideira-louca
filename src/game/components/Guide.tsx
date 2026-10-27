import { Text, View } from "react-native";
import { useGame } from "../store";
import { Button, ui } from "./UI";
export default function Guide() {
  const g = useGame();
  return (
    <View style={{ gap: 22 }}>
      <Text style={ui.label}>MANUAL DO VIAJANTE</Text>
      <Text style={ui.title}>Mantenha a chama acesa.</Text>
      {[
        [
          "01",
          "Explore",
          "Use WASD, as setas do teclado ou o controle na tela. Árvores e o santuário bloqueiam sua passagem.",
        ],
        [
          "02",
          "Enfrente",
          "Aproxime-se do fantasma à direita do mapa e escolha enfrentar. Ataque, use uma poção ou defenda. Na resposta inimiga, mova o foguinho para desviar das brasas.",
        ],
        [
          "03",
          "Descanse",
          "A fogueira à esquerda restaura sua vida e repõe pelo menos 3 poções. Descanse nela para salvar.",
        ],
        [
          "04",
          "Retorne",
          "Salve no bosque antes de sair. Vitórias também são salvas automaticamente. Use o mesmo username na próxima vez para continuar. O perfil não tem senha.",
        ],
      ].map(([n, title, text]) => (
        <View key={n} style={[ui.panel, ui.row, { alignItems: "flex-start" }]}>
          <Text style={[ui.label, { fontSize: 22, marginRight: 10 }]}>{n}</Text>
          <View style={{ flex: 1, gap: 10 }}>
            <Text style={ui.text}>{title}</Text>
            <Text style={ui.muted}>{text}</Text>
          </View>
        </View>
      ))}
      <Button onPress={() => g.go("menu")}>← Voltar ao menu</Button>
    </View>
  );
}
