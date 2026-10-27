import { View } from "react-native";
const sprites = {
  hero: [
    "...hhhh...",
    "..hhhhhh..",
    "..sffsf...",
    "..fffff...",
    "...fff....",
    "..bbbbb...",
    ".bbbbbbb..",
    ".fsbbb sf.".replaceAll(" ", ""),
    "..bbbbb...",
    "..b...b...",
    ".ss...ss..",
  ],
  flame: [
    "....r....",
    "...rr....",
    "...ryr...",
    "..ryyr...",
    ".rryyrr..",
    ".ryyyyr..",
    "rrywwyrr.",
    "rrywwyrr.",
    ".ryyyyr..",
    "..rrrr...",
  ],
  ghost: [
    "...pppp...",
    "..pwwwwp..",
    ".pwwwwwwp.",
    ".pwbwwbwp.",
    ".pwbwwbwp.",
    ".pwwwwwwp.",
    ".pwwbbwwp.",
    ".pwwwwwwp.",
    ".pwpwwpwp.",
    "..p.pp.p..",
  ],
  sword: [
    "......ww.",
    ".....ww..",
    "....ww...",
    "...ww....",
    "p.ww.....",
    ".pp......",
    "..p......",
    ".s.p.....",
    "s........",
  ],
  chest: [
    ".yyyyyyy.",
    "yoooooooy",
    "yoooooooy",
    "yyyyyyyyy",
    "oooyyyooo",
    "oooywyooo",
    "oooyyyooo",
    "ooooooooo",
    "yyyyyyyyy",
  ],
  tree: [
    "....g....",
    "...ggg...",
    "..gglgg..",
    ".ggllggg.",
    "gggllgggg",
    "..ggggg..",
    ".ggglggg.",
    "gggllgggg",
    "...ss....",
    "...ss....",
  ],
};
const colors: Record<string, string> = {
  h: "#47314b",
  s: "#a77753",
  f: "#f4c49a",
  b: "#c4a9e3",
  r: "#d56748",
  y: "#f3bd60",
  w: "#fff1c6",
  p: "#82749d",
  o: "#a07049",
  g: "#324c42",
  l: "#4a6651",
};
export default function PixelSprite({
  kind = "hero",
  size = 4,
}: {
  kind?: keyof typeof sprites;
  size?: number;
}) {
  const rows = sprites[kind];
  return (
    <View
      accessibilityLabel={kind}
      style={{ width: rows[0].length * size, height: rows.length * size }}
    >
      {rows.map((row, y) => (
        <View key={y} style={{ flexDirection: "row", height: size }}>
          {[...row].map((pixel, x) => (
            <View
              key={x}
              style={{
                width: size,
                height: size,
                backgroundColor: colors[pixel] || "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
