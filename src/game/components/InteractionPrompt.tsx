import { Platform, Text, View } from "react-native";
import type { Interaction } from "../model";
import { Button, palette, ui } from "./UI";
export default function InteractionPrompt({
  action,
  onInteract,
}: {
  action: Interaction;
  onInteract: () => void;
}) {
  return (
    <View
      testID="interaction-prompt"
      style={{
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#201c28f5",
        borderWidth: 1,
        borderColor: palette.gold,
        padding: 12,
        gap: 6,
      }}
    >
      <Text style={[ui.label, { color: palette.gold, letterSpacing: 1 }]}>
        {action.title}
      </Text>
      <Text style={[ui.muted, { fontSize: 11, lineHeight: 16 }]}>
        {action.hint}
      </Text>
      {action.locked ? (
        <Text style={[ui.text, { fontSize: 12, color: palette.gold }]}>
          ◇{" "}
          {action.kind === "enter"
            ? "Porta selada"
            : "Conclua o objetivo anterior"}
        </Text>
      ) : (
        <Button primary onPress={onInteract}>
          {Platform.OS === "web" ? "[E] " : "Toque · "}
          {action.label}
        </Button>
      )}
    </View>
  );
}
