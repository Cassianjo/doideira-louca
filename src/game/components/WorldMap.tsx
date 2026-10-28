import { useState, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  areaNames,
  blocked,
  fresh,
  guidance,
  locations,
  type Progress,
} from "../model";
import PixelSprite from "./PixelSprite";
import { palette } from "./UI";
export default function WorldMap({
  progress = fresh,
  decorative = false,
  overlay,
}: {
  progress?: Progress;
  decorative?: boolean;
  overlay?: ReactNode;
}) {
  const p = progress,
    forest = p.area === "forest",
    hut = p.area === "hut";
  const [width, setWidth] = useState(0);
  const pixel = Math.max(1, Math.min(4, Math.floor((width || 350) / 150)));
  const guide = guidance(p);
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.map, { borderColor: forest ? "#596052" : "#786c80" }]}
      accessibilityLabel={`Mapa: ${areaNames[p.area]}`}
    >
      {Array.from({ length: 13 }, (_, y) => (
        <View key={y} style={{ flex: 1, flexDirection: "row" }}>
          {Array.from({ length: 15 }, (_, x) => {
            const wall = blocked(x, y, p.area),
              path =
                forest &&
                ((x >= 6 && x <= 8 && y >= 4) ||
                  (y >= 8 && y <= 9 && x >= 3 && x <= 11) ||
                  (x === 4 && y >= 5));
            const target =
              !decorative && x === guide.target.x && y === guide.target.y;
            const colors = forest
              ? path
                ? ["#786c5c", "#6b6455"]
                : ["#344539", "#2d3c33"]
              : hut
                ? ["#5b453c", "#654c40"]
                : ["#3b3749", "#403c50"];
            let kind:
              | "tree"
              | "flame"
              | "ghost"
              | "wisp"
              | "sentinel"
              | "keeper"
              | "chest"
              | undefined;
            if (forest && (x <= 2 || x >= 12) && y > 1 && y < 11 && y % 2 === 0)
              kind = "tree";
            if (forest && x === locations.fire.x && y === locations.fire.y)
              kind = "flame";
            if (
              forest &&
              x === locations.guardian.x &&
              y === locations.guardian.y &&
              !p.defeated.includes("guardian")
            )
              kind = "ghost";
            if (hut && x === 7 && y === 3) kind = "keeper";
            if (hut && x === 11 && y === 3) kind = "chest";
            if (
              !forest &&
              !hut &&
              x === 10 &&
              y === 7 &&
              !p.defeated.includes("wisp")
            )
              kind = "wisp";
            if (
              !forest &&
              !hut &&
              x === 7 &&
              y === 4 &&
              !p.defeated.includes("sentinel")
            )
              kind = "sentinel";
            if (!forest && !hut && x === 7 && y === 2 && p.completed)
              kind = "flame";
            const player = !decorative && x === p.x && y === p.y;
            return (
              <View
                key={x}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    wall && !forest
                      ? "#25222e"
                      : colors[(x + y) % 3 === 0 ? 0 : 1],
                  borderWidth: !forest ? 0.4 : 0,
                  borderColor: "#ffffff06",
                  zIndex: player ? 5 : kind ? 2 : 0,
                }}
              >
                {target && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderWidth: 2,
                      borderColor: palette.gold,
                      backgroundColor: "#d6b67c24",
                    }}
                  />
                )}
                {!forest && x === 7 && y === 11 && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#ae8b5c",
                      borderWidth: 2,
                      borderColor: "#e1c193",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#28222d",
                        fontSize: pixel * 6,
                      }}
                    >
                      ↓
                    </Text>
                  </View>
                )}
                {!forest && !hut && x === 7 && y === 2 && !p.completed && (
                  <Text style={{ color: "#9b8bb0", fontSize: pixel * 8 }}>
                    ♜
                  </Text>
                )}
                {kind && <PixelSprite kind={kind} size={pixel} />}
                {player && (
                  <>
                    <PixelSprite size={pixel} />
                    <Text
                      accessibilityLabel={`Direção do objetivo: ${guide.arrow}`}
                      style={{
                        position: "absolute",
                        top: -pixel * 8,
                        color: palette.gold,
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        fontSize: pixel * 7,
                        backgroundColor: "#17171dcc",
                        paddingHorizontal: 2,
                      }}
                    >
                      {guide.arrow}
                    </Text>
                  </>
                )}
                {target && !player && (
                  <Text
                    style={{
                      position: "absolute",
                      top: -pixel * 5,
                      color: palette.gold,
                      fontSize: pixel * 6,
                      fontWeight: "bold",
                    }}
                  >
                    !
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      {forest && (
        <>
          <View pointerEvents="none" style={styles.castle}>
            <View style={styles.roof} />
            <View style={styles.towers}>
              <View style={styles.tower} />
              <View style={styles.tower} />
            </View>
            <View style={styles.building}>
              <View style={styles.window} />
              <View style={styles.window} />
            </View>
            <View style={styles.door} />
            <Text style={styles.name}>SANTUÁRIO</Text>
          </View>
          <View pointerEvents="none" style={styles.hut}>
            <View
              style={{
                height: "28%",
                backgroundColor: "#85634c",
                borderTopWidth: 5,
                borderColor: "#b18d64",
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor: "#785745",
                borderWidth: 2,
                borderColor: "#4a392e",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                paddingRight: "15%",
              }}
            >
              <View
                style={{
                  width: "35%",
                  height: "70%",
                  backgroundColor: "#291f21",
                  borderWidth: 2,
                  borderColor: "#b18d64",
                }}
              />
            </View>
            <Text style={styles.name}>CABANA</Text>
          </View>
        </>
      )}
      {!forest && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            backgroundColor: "#17171dcc",
            padding: 6,
          }}
        >
          <Text
            style={{
              color: palette.gold,
              fontSize: 9,
              fontFamily: "monospace",
            }}
          >
            {hut
              ? "ABRIGO DE ÍRIS"
              : p.completed
                ? "A PRIMEIRA BRASA VIVE"
                : "OS ESPÍRITOS AGUARDAM"}
          </Text>
        </View>
      )}
      {overlay && (
        <View
          style={{
            position: "absolute",
            top: p.y >= 8 ? 8 : undefined,
            bottom: p.y < 8 ? 8 : undefined,
            left: 8,
            right: 8,
            zIndex: 20,
            alignItems: "center",
          }}
        >
          {overlay}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    width: "100%",
    aspectRatio: 15 / 13,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
  },
  castle: {
    position: "absolute",
    left: `${(5 / 15) * 100}%`,
    top: `${(0.5 / 13) * 100}%`,
    width: `${(5 / 15) * 100}%`,
    height: `${(3.5 / 13) * 100}%`,
    alignItems: "center",
  },
  roof: {
    width: "78%",
    height: "16%",
    backgroundColor: "#535063",
    borderTopWidth: 5,
    borderColor: "#777080",
  },
  building: {
    backgroundColor: "#77747c",
    width: "90%",
    flex: 1,
    borderWidth: 4,
    borderColor: "#555361",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  towers: {
    position: "absolute",
    top: -6,
    width: "110%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tower: {
    width: "22%",
    backgroundColor: "#66616e",
    borderTopWidth: 8,
    borderColor: "#89818b",
  },
  window: {
    width: "12%",
    height: "30%",
    backgroundColor: "#d4b77c",
    borderWidth: 2,
    borderColor: "#514b5b",
  },
  door: {
    position: "absolute",
    bottom: 0,
    width: "22%",
    height: "40%",
    backgroundColor: "#2a2732",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 2,
    borderColor: "#968779",
  },
  name: {
    position: "absolute",
    bottom: -12,
    fontSize: 7,
    letterSpacing: 1,
    color: "#e1c7a0",
    fontFamily: "monospace",
    alignSelf: "center",
  },
  hut: {
    position: "absolute",
    left: `${(3 / 15) * 100}%`,
    top: `${(2 / 13) * 100}%`,
    width: `${(2 / 15) * 100}%`,
    height: `${(3 / 13) * 100}%`,
  },
});
