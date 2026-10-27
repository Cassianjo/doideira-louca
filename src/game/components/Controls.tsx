import { useEffect, useRef } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { palette, ui } from "./UI";
export default function Controls({
  move,
}: {
  move: (x: number, y: number) => void;
}) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveRef = useRef(move);
  moveRef.current = move;
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handle = (e: KeyboardEvent) => {
      const d: Record<string, number[]> = {
        ArrowUp: [0, -1],
        w: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0],
      };
      const p = d[e.key];
      if (p) {
        e.preventDefault();
        moveRef.current(p[0], p[1]);
      }
    };
    window.addEventListener("keydown", handle);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("keydown", handle);
      window.removeEventListener("blur", stop);
    };
  }, []);
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      {[
        [[0, -1, "↑"]],
        [
          [-1, 0, "←"],
          [0, 1, "↓"],
          [1, 0, "→"],
        ],
      ].map((row, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 4 }}>
          {row.map(([x, y, label]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`Mover ${label}`}
              onPressIn={() => {
                stop();
                move(Number(x), Number(y));
                timer.current = setInterval(
                  () => moveRef.current(Number(x), Number(y)),
                  130,
                );
              }}
              onPressOut={stop}
              style={({ pressed }) => ({
                width: 44,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? palette.purple : "#302c38",
                borderWidth: 1,
                borderColor: "#5d536b",
              })}
            >
              <Text style={[ui.text, { fontSize: 18 }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
