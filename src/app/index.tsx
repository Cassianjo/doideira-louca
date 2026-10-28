import { useEffect, useState, useRef, useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "../game/store";
import Menu from "../game/components/Menu";
import Gameplay from "../game/components/Gameplay";
import Controls from "../game/components/Controls";
import Battle from "../game/components/Battle";
import Inventory from "../game/components/Inventory";
import Guide from "../game/components/Guide";
import PixelSprite from "../game/components/PixelSprite";
import WorldMap from "../game/components/WorldMap";
import { Button, palette, ui } from "../game/components/UI";
export default function App() {
  const g = useGame();
  const battleMove = useRef<(x: number, y: number) => void>(() => {});
  const registerBattleControls = useCallback(
    (move: (x: number, y: number) => void) => {
      battleMove.current = move;
    },
    [],
  );
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const wide = mounted && width > 1000;
  const nav = [
    ["menu", "⌂", "Início"],
    ["world", "◇", "Aventura"],
    ["inventory", "▣", "Inventário"],
    ["guide", "?", "Como jogar"],
  ] as const;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={styles.top}>
        <View style={ui.row}>
          <PixelSprite kind="flame" size={3} />
          <View>
            <Text
              style={[
                ui.text,
                { letterSpacing: 4, fontWeight: "bold", fontSize: 17 },
              ]}
            >
              BRASA
            </Text>
            <Text
              style={[
                ui.label,
                { fontSize: 8, letterSpacing: 2, marginTop: 4 },
              ]}
            >
              CRÔNICAS DO BOSQUE
            </Text>
          </View>
        </View>
        <View style={ui.row}>
          <View style={{ width: 6, height: 6, backgroundColor: "#9daa8b" }} />
          <Text style={ui.muted}>
            {g.username ? `@${g.username}` : "UMA NOVA JORNADA"}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: wide ? "row" : "column" }}>
        <View
          style={[
            styles.sidebar,
            !wide && {
              width: "100%",
              padding: 12,
              flexDirection: "row",
              borderRightWidth: 0,
              borderBottomWidth: 1,
              justifyContent: "space-around",
            },
          ]}
        >
          {wide && (
            <Text style={[ui.label, { marginBottom: 30, paddingLeft: 16 }]}>
              SUA JORNADA
            </Text>
          )}
          {nav.map(([screen, icon, label], i) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              disabled={g.screen === "battle"}
              accessibilityState={{ selected: g.screen === screen }}
              key={screen}
              onPress={() =>
                g.go(
                  g.username ? screen : screen === "guide" ? "guide" : "menu",
                )
              }
              style={({ hovered }: any) => [
                styles.nav,
                g.screen === screen && {
                  backgroundColor: "#302a3b",
                  borderLeftColor: palette.purple,
                },
                hovered && { backgroundColor: "#28242e" },
                !wide && {
                  padding: 8,
                  gap: 5,
                  flex: 1,
                  justifyContent: "center",
                },
              ]}
            >
              <Text
                style={{
                  color: g.screen === screen ? palette.purple : palette.muted,
                  fontSize: 19,
                }}
              >
                {icon}
              </Text>
              <Text
                style={[
                  ui.text,
                  {
                    fontSize: !mounted || width < 500 ? 9 : 12,
                    color: g.screen === screen ? palette.purple : palette.muted,
                  },
                ]}
              >
                {!mounted || width < 500
                  ? ["Início", "Jogar", "Mochila", "Guia"][i]
                  : label}
              </Text>
              {wide && (
                <Text style={[ui.muted, { marginLeft: "auto", fontSize: 10 }]}>
                  0{i + 1}
                </Text>
              )}
            </Pressable>
          ))}
          {wide && (
            <View style={{ marginTop: "auto", padding: 16, gap: 16 }}>
              <View
                style={{ width: 32, height: 1, backgroundColor: palette.line }}
              />
              <Text style={[ui.muted, { fontSize: 11 }]}>
                Mesmo a menor chama{"\n"}afasta a escuridão.
              </Text>
              <Text style={ui.label}>✦ SIGA EM FRENTE</Text>
            </View>
          )}
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: wide ? 40 : !mounted || width < 380 ? 10 : 20,
            paddingBottom:
              (g.screen === "world" || g.screen === "battle") &&
              mounted &&
              width < 700
                ? 180
                : 40,
          }}
        >
          <View style={{ maxWidth: 1180, width: "100%", alignSelf: "center" }}>
            <View
              style={[
                ui.row,
                { marginBottom: 32, justifyContent: "space-between" },
              ]}
            >
              <Text style={[ui.muted, { fontSize: 10 }]}>
                BRASA /{" "}
                <Text style={{ color: palette.text }}>
                  {g.screen === "menu"
                    ? "INÍCIO"
                    : g.screen === "world"
                      ? "EXPLORAÇÃO"
                      : g.screen === "battle"
                        ? "COMBATE"
                        : g.screen === "inventory"
                          ? "INVENTÁRIO"
                          : "GUIA"}
                </Text>
              </Text>
              <Text style={[ui.label, { fontSize: 9 }]}>✦ RPG DE TURNO</Text>
            </View>
            <View
              style={{
                flexDirection: wide && g.screen === "menu" ? "row" : "column",
                gap: 36,
              }}
            >
              <View
                style={{
                  flex: 1,
                  maxWidth: g.screen === "menu" ? 560 : 800,
                  width: "100%",
                  alignSelf: "center",
                }}
              >
                {g.screen === "menu" ? (
                  <Menu />
                ) : g.screen === "guide" ? (
                  <Guide />
                ) : !g.username ? (
                  <Menu />
                ) : g.screen === "world" ? (
                  <Gameplay />
                ) : g.screen === "battle" ? (
                  <Battle registerControls={registerBattleControls} />
                ) : (
                  <Inventory />
                )}
              </View>
              {g.screen === "menu" && (
                <View style={[styles.art, { flex: wide ? 1 : undefined }]}>
                  <View
                    style={[
                      ui.row,
                      { justifyContent: "space-between", marginBottom: 20 },
                    ]}
                  >
                    <Text style={ui.label}>UM MUNDO À SUA ESPERA</Text>
                    <Text style={{ color: palette.gold }}>✧</Text>
                  </View>
                  <WorldMap decorative />
                  <View style={{ paddingVertical: 24, gap: 12 }}>
                    <Text
                      style={[ui.label, { color: palette.gold, fontSize: 9 }]}
                    >
                      CAPÍTULO I
                    </Text>
                    <Text style={[ui.title, { fontSize: 24 }]}>
                      O chamado das cinzas
                    </Text>
                    <Text style={ui.muted}>
                      Por trás das árvores, um antigo santuário guarda aquilo
                      que o tempo esqueceu.
                    </Text>
                  </View>
                  <View
                    style={[
                      ui.row,
                      {
                        borderTopWidth: 1,
                        borderColor: palette.line,
                        paddingTop: 18,
                        justifyContent: "space-between",
                      },
                    ]}
                  >
                    <Text style={[ui.muted, { fontSize: 10 }]}>
                      EXPLORAR · LUTAR · DESCOBRIR
                    </Text>
                    <PixelSprite kind="sword" size={2} />
                  </View>
                </View>
              )}
            </View>
            {g.username && g.screen !== "battle" && (
              <View style={{ marginTop: 26, alignItems: "flex-start" }}>
                <Button onPress={() => g.logout()}>Sair do perfil</Button>
                <Text style={[ui.muted, { fontSize: 10, marginTop: 8 }]}>
                  Salve no bosque antes de sair.
                </Text>
              </View>
            )}
            <View
              style={[
                ui.row,
                {
                  borderTopWidth: 1,
                  borderColor: palette.line,
                  marginTop: 40,
                  paddingTop: 18,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                },
              ]}
            >
              <Text style={[ui.muted, { fontSize: 9, letterSpacing: 1 }]}>
                BRASA © 2026 · FEITO DE PIXELS E CORAGEM
              </Text>
              <Text style={[ui.muted, { fontSize: 9 }]}>
                A aventura vive em você. ✦
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      {mounted &&
        width < 700 &&
        (g.screen === "world" || g.screen === "battle") &&
        !!g.username && (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              padding: 8,
              backgroundColor: "#201c28f0",
              borderWidth: 1,
              borderColor: palette.line,
            }}
          >
            <Controls
              move={
                g.screen === "battle"
                  ? (x, y) => battleMove.current(x, y)
                  : g.walk
              }
            />
          </View>
        )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  top: {
    minHeight: 92,
    borderBottomWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    gap: 20,
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    borderColor: palette.line,
    padding: 20,
    paddingTop: 36,
    gap: 8,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderLeftWidth: 2,
    borderLeftColor: "transparent",
  },
  art: {
    borderWidth: 1,
    borderColor: palette.line,
    padding: 22,
    backgroundColor: "#1c1c22",
    alignSelf: "flex-start",
    width: "100%",
  },
});
