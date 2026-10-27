import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
export const palette = {
  bg: "#17171d",
  panel: "#222129",
  line: "#3c3745",
  muted: "#96909f",
  text: "#ede6db",
  purple: "#c3a6df",
  gold: "#d6b67c",
};
export const ui = StyleSheet.create({
  text: { color: palette.text, fontFamily: "monospace" },
  muted: {
    color: palette.muted,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 20,
  },
  title: {
    color: palette.text,
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "bold",
  },
  panel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderWidth: 1,
    padding: 24,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: {
    color: palette.purple,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 2,
  },
  button: {
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#292631",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
});
export function Button({
  children,
  onPress,
  primary = false,
  disabled = false,
}: {
  children: ReactNode;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        ui.button,
        primary && {
          backgroundColor: palette.purple,
          borderColor: palette.purple,
        },
        hovered && { borderColor: palette.purple },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text
        style={[
          ui.text,
          { fontSize: 12 },
          primary && { color: "#25202d", fontWeight: "bold" },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Rule({ label }: { label: string }) {
  return (
    <View style={[ui.row, { marginVertical: 20 }]}>
      <View style={{ height: 1, backgroundColor: palette.line, flex: 1 }} />
      <Text style={ui.label}>{label}</Text>
      <View style={{ height: 1, backgroundColor: palette.line, flex: 1 }} />
    </View>
  );
}
