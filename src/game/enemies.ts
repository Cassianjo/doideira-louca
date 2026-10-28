import type { EnemyId } from "./model";
import type { Pattern } from "./patterns";
export type Enemy = {
  id: EnemyId;
  name: string;
  maxHp: number;
  reward: number;
  kind: "ghost" | "wisp" | "sentinel";
  color: string;
  pattern: Pattern;
  damage: number;
  description: string;
  tell: string;
};
export const ENEMIES: Record<EnemyId, Enemy> = {
  guardian: {
    id: "guardian",
    name: "O Guardião Esquecido",
    maxHp: 69,
    reward: 35,
    kind: "ghost",
    color: "#c3a6df",
    pattern: "rain",
    damage: 6,
    description:
      "A chuva de memórias cai em colunas. Encontre um intervalo entre elas.",
    tell: "↓ Chuva de memórias: procure os espaços entre as colunas.",
  },
  wisp: {
    id: "wisp",
    name: "Lume Errante",
    maxHp: 69,
    reward: 45,
    kind: "wisp",
    color: "#f0b26e",
    pattern: "weave",
    damage: 7,
    description:
      "Labaredas atravessam a arena dos dois lados, em ondas sinuosas.",
    tell: "↔ Ondas de fogo: alterne entre as faixas livres.",
  },
  sentinel: {
    id: "sentinel",
    name: "Sentinela do Altar",
    maxHp: 92,
    reward: 70,
    kind: "sentinel",
    color: "#9ecac4",
    pattern: "radial",
    damage: 8,
    description:
      "Estrelas partem do centro. Observe a abertura de cada círculo.",
    tell: "✧ Pulso de cinzas: afaste-se do centro e procure a abertura.",
  },
};
