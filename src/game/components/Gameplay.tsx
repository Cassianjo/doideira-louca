import { useEffect } from "react";
import { Modal, Platform, Text, View, useWindowDimensions } from "react-native";
import { useGame } from "../store";
import { areaNames, guidance, interaction, objective } from "../model";
import Controls from "./Controls";
import WorldMap from "./WorldMap";
import InteractionPrompt from "./InteractionPrompt";
import { Button, palette, ui } from "./UI";
export default function Gameplay() {
  const { width } = useWindowDimensions();
  const g = useGame(),
    p = g.progress,
    goal = objective(p),
    direction = guidance(p),
    action = interaction(p);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        e.repeat ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        useGame.getState().interact();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  return (
    <View style={{ gap: 18 }}>
      <View
        style={[ui.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
      >
        <View>
          <Text style={ui.label}>
            CAPÍTULO I · {p.area === "forest" ? "EXPLORAÇÃO" : "INTERIOR"}
          </Text>
          <Text style={[ui.title, { marginTop: 8 }]}>{areaNames[p.area]}</Text>
        </View>
        <Button onPress={() => g.go("menu")}>← Menu</Button>
      </View>
      <View
        testID="quest-objective"
        style={[
          ui.panel,
          ui.row,
          { padding: 16, alignItems: "flex-start", borderColor: palette.gold },
        ]}
      >
        <Text style={{ color: palette.gold, fontSize: 32 }}>
          {p.completed ? "✦" : direction.arrow}
        </Text>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[ui.label, { color: palette.gold }]}>
            OBJETIVO {Math.min(goal.step, 5)} / 5
          </Text>
          <Text accessibilityLiveRegion="polite" style={ui.text}>
            {goal.title}
          </Text>
          <Text style={[ui.muted, { fontSize: 11, lineHeight: 18 }]}>
            {goal.detail}
          </Text>
          <View style={{ height: 3, backgroundColor: palette.line }}>
            <View
              style={{
                height: 3,
                width: `${((goal.step - 1) / 5) * 100}%`,
                backgroundColor: palette.gold,
              }}
            />
          </View>
        </View>
      </View>
      <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
        <WorldMap
          progress={p}
          overlay={
            action ? (
              <InteractionPrompt action={action} onInteract={g.interact} />
            ) : undefined
          }
        />
      </View>
      <View
        style={[ui.row, { justifyContent: "space-between", flexWrap: "wrap" }]}
      >
        <View style={{ gap: 10 }}>
          <Text style={ui.text}>VIDA {p.hp} / 100</Text>
          <View
            style={{ height: 6, width: 160, backgroundColor: palette.line }}
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
        {width >= 700 && <Controls move={g.walk} />}
      </View>
      <Text style={[ui.muted, { fontSize: 11 }]}>
        Siga a seta dourada até o ! no mapa.{" "}
        {Platform.OS === "web"
          ? "WASD / setas para mover · E para interagir."
          : "Use as setas para mover e toque no botão da janela para interagir."}
      </Text>
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
      <Modal
        transparent
        visible={!!g.dialogue}
        onRequestClose={g.closeDialogue}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000b",
            padding: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={[
              ui.panel,
              {
                maxWidth: 500,
                width: "100%",
                gap: 20,
                borderColor: palette.gold,
              },
            ]}
          >
            <Text style={[ui.label, { color: palette.gold }]}>
              {p.area === "hut"
                ? "ÍRIS · GUARDIÃ DO BOSQUE"
                : "A PRIMEIRA BRASA"}
            </Text>
            <Text style={[ui.text, { lineHeight: 25 }]}>{g.dialogue}</Text>
            <Text style={ui.muted}>
              {g.saving ? "Salvando sua jornada…" : g.message}
            </Text>
            <Button primary onPress={g.closeDialogue}>
              Continuar{Platform.OS === "web" ? " [E]" : ""}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
