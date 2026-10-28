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
          "Siga a seta dourada e o ! no mapa até o objetivo. Use WASD, as setas do teclado ou o controle na tela. Perto de uma porta, pressione E ou toque na janela para entrar e sair.",
        ],
        [
          "02",
          "Enfrente",
          "Visite Íris na cabana, vença o guardião e entre no santuário. Liberte o Lume Errante e a Sentinela do Altar; então reacenda a Primeira Brasa. A lista de objetivos muda a cada conquista.",
        ],
        [
          "03",
          "Descanse",
          "Cada inimigo tem seu padrão: chuva vertical, ondas laterais ou pulsos radiais. Ataque, use poção ou defenda. Leia o aviso antes da esquiva e mova o foguinho. Defender reduz o dano do próximo turno.",
        ],
        [
          "04",
          "Retorne",
          "A fogueira e Íris recuperam vida e pelo menos 3 poções. Entradas, saídas, conversas, vitórias e o altar salvam automaticamente. Você também pode salvar pelo botão. Entre com o mesmo username para retomar.",
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
