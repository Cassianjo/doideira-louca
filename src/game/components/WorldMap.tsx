import { View, Text, StyleSheet } from "react-native";
import PixelSprite from "./PixelSprite";
export default function WorldMap({
  x = 7,
  y = 10,
  decorative = false,
}: {
  x?: number;
  y?: number;
  decorative?: boolean;
}) {
  return (
    <View style={styles.map} accessibilityLabel="Mapa do Bosque das Cinzas">
      <View style={styles.moon} />
      {Array.from({ length: 13 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", flex: 1 }}>
          {Array.from({ length: 15 }, (_, col) => {
            const path =
              (col >= 6 && col <= 8 && row >= 4) ||
              (row >= 8 && row <= 9 && col >= 3 && col <= 11);
            const tree = (col <= 2 || col >= 12) && row > 1 && row < 11;
            return (
              <View
                key={col}
                style={{
                  flex: 1,
                  backgroundColor: path
                    ? (row + col) % 3 === 0
                      ? "#786c5c"
                      : "#6b6455"
                    : (row * 17 + col * 7) % 5 === 0
                      ? "#344539"
                      : "#2d3c33",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible",
                }}
              >
                {tree && row % 2 === 0 ? (
                  <PixelSprite kind="tree" size={3} />
                ) : !path && (row * 3 + col) % 11 === 0 ? (
                  <Text style={{ color: "#7c8060", fontSize: 10 }}>✦</Text>
                ) : null}
                {col === x && row === y && !decorative && (
                  <View style={{ position: "absolute", zIndex: 9, bottom: 0 }}>
                    <PixelSprite size={3} />
                  </View>
                )}
                {col === 10 && row === 6 && (
                  <PixelSprite kind="ghost" size={3} />
                )}{" "}
                {col === 4 && row === 8 && (
                  <PixelSprite kind="flame" size={2} />
                )}
              </View>
            );
          })}
        </View>
      ))}
      <View style={styles.castle}>
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
        <Text style={styles.castleName}>SANTUÁRIO DAS BRASAS</Text>
      </View>
      <View pointerEvents="none" style={styles.vignette} />
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    width: "100%",
    aspectRatio: 15 / 13,
    backgroundColor: "#2d3c33",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#596052",
  },
  moon: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: "#b1aa83",
    right: 45,
    top: 10,
    borderRadius: 30,
    zIndex: 1,
    opacity: 0.5,
  },
  castle: {
    position: "absolute",
    left: "32%",
    top: "7%",
    width: "36%",
    height: "28%",
    alignItems: "center",
  },
  roof: {
    width: "78%",
    height: 22,
    backgroundColor: "#535063",
    borderTopWidth: 6,
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
    paddingTop: 15,
  },
  towers: {
    position: "absolute",
    top: -12,
    width: "115%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tower: {
    width: "22%",
    backgroundColor: "#66616e",
    borderTopWidth: 10,
    borderColor: "#89818b",
  },
  window: {
    width: 10,
    height: 18,
    backgroundColor: "#d4b77c",
    borderWidth: 3,
    borderColor: "#514b5b",
  },
  door: {
    position: "absolute",
    bottom: 0,
    width: 28,
    height: 35,
    backgroundColor: "#2a2732",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 3,
    borderColor: "#968779",
  },
  castleName: {
    position: "absolute",
    bottom: -20,
    fontSize: 7,
    letterSpacing: 1,
    color: "#d0c8a7",
    fontFamily: "monospace",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    borderWidth: 10,
    borderColor: "#17251c55",
  },
});
