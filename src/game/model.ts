export type Area = "forest" | "hut" | "sanctuary";
export type EnemyId = "guardian" | "wisp" | "sentinel";
export type Progress = {
  x: number;
  y: number;
  hp: number;
  potions: number;
  victories: number;
  gold: number;
  area: Area;
  metKeeper: boolean;
  defeated: EnemyId[];
  completed: boolean;
};
export type Screen = "menu" | "world" | "battle" | "inventory" | "guide";
export const fresh: Progress = {
  x: 7,
  y: 10,
  hp: 100,
  potions: 3,
  victories: 0,
  gold: 0,
  area: "forest",
  metKeeper: false,
  defeated: [],
  completed: false,
};
export function normalizeProgress(p: Partial<Progress>): Progress {
  return { ...fresh, ...p, defeated: [...(p.defeated || [])] };
}
export const locations = {
  hut: { x: 4, y: 5 },
  sanctuary: { x: 7, y: 4 },
  fire: { x: 4, y: 8 },
  exit: { x: 7, y: 11 },
  keeper: { x: 7, y: 3 },
  altar: { x: 7, y: 2 },
  guardian: { x: 10, y: 6 },
  wisp: { x: 10, y: 7 },
  sentinel: { x: 7, y: 4 },
};
export const areaNames: Record<Area, string> = {
  forest: "Bosque das Cinzas",
  hut: "Cabana da Guardiã",
  sanctuary: "Santuário das Brasas",
};
export const near = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  distance = 1,
) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= distance;
export function blocked(x: number, y: number, area: Area = "forest") {
  if (x < 1 || x > 13 || y < 1 || y > 11) return true;
  if (area === "forest")
    return (
      (x >= 5 && x <= 9 && y <= 3) ||
      (x >= 3 && x <= 4 && y >= 2 && y <= 4) ||
      ((x === 2 || x === 12) && y >= 3 && y <= 8)
    );
  if (area === "hut")
    return (
      (x === 7 && y === 3) ||
      (x === 3 && y >= 4 && y <= 6) ||
      (x >= 10 && y === 3)
    );
  return ((x === 3 || x === 11) && y >= 3 && y <= 8) || (x === 7 && y === 1);
}
export function move(p: Progress, dx: number, dy: number): Progress {
  if (Math.abs(dx) + Math.abs(dy) !== 1) return p;
  const x = p.x + dx,
    y = p.y + dy;
  return blocked(x, y, p.area) ? p : { ...p, x, y };
}
export type Interaction = {
  kind: "enter" | "exit" | "talk" | "rest" | "fight" | "altar";
  title: string;
  label: string;
  hint: string;
  locked?: boolean;
  destination?: Area;
  enemy?: EnemyId;
};
export function interaction(p: Progress): Interaction | null {
  if (p.area === "forest") {
    if (near(p, locations.hut))
      return {
        kind: "enter",
        title: "Cabana da Guardiã",
        label: "Entrar na cabana",
        hint: "Uma luz acolhedora brilha na janela.",
        destination: "hut",
      };
    if (near(p, locations.sanctuary)) {
      const locked = !p.metKeeper || !p.defeated.includes("guardian");
      return {
        kind: "enter",
        title: "Santuário das Brasas",
        label: "Entrar no santuário",
        hint: !p.metKeeper
          ? "A guardiã da cabana conhece o selo desta porta."
          : locked
            ? "Derrote o Guardião Esquecido para romper o selo."
            : "O selo se desfez. A porta está aberta.",
        destination: "sanctuary",
        locked,
      };
    }
    if (near(p, locations.guardian) && !p.defeated.includes("guardian"))
      return {
        kind: "fight",
        title: "Guardião Esquecido",
        label: "Enfrentar o guardião",
        hint: "Desvie da chuva de brasas.",
        enemy: "guardian",
      };
    if (near(p, locations.fire))
      return {
        kind: "rest",
        title: "Fogueira do bosque",
        label: "Descansar e salvar",
        hint: "Recupera a vida e repõe pelo menos 3 poções.",
      };
  } else {
    if (near(p, locations.exit))
      return {
        kind: "exit",
        title: "Porta de saída",
        label: "Sair para o bosque",
        hint: "Sua jornada continua lá fora.",
        destination: "forest",
      };
    if (p.area === "hut" && near(p, locations.keeper))
      return {
        kind: "talk",
        title: "Íris, a guardiã",
        label: p.metKeeper ? "Descansar com Íris" : "Conversar com Íris",
        hint: p.metKeeper
          ? "A cabana será sempre um abrigo. Recupere suas forças."
          : "“A brasa adormeceu. Vença o guardião do bosque, entre no santuário e reacenda o altar.”",
      };
    if (p.area === "sanctuary") {
      if (near(p, locations.wisp) && !p.defeated.includes("wisp"))
        return {
          kind: "fight",
          title: "Lume Errante",
          label: "Enfrentar o lume",
          hint: "Ondas laterais: encontre a passagem entre as chamas.",
          enemy: "wisp",
        };
      if (near(p, locations.sentinel) && !p.defeated.includes("sentinel"))
        return {
          kind: "fight",
          title: "Sentinela do Altar",
          label: "Enfrentar a sentinela",
          hint: "Rajadas radiais: afaste-se do centro e encontre uma brecha.",
          enemy: "sentinel",
          locked: !p.defeated.includes("wisp"),
        };
      if (near(p, locations.altar))
        return {
          kind: "altar",
          title: "Altar da Primeira Brasa",
          label: p.completed ? "Descansar no altar" : "Reacender a brasa",
          hint: p.completed
            ? "O bosque voltou a respirar. Você concluiu o capítulo I."
            : "Liberte os dois espíritos do santuário para reacender a chama.",
          locked:
            !p.defeated.includes("wisp") || !p.defeated.includes("sentinel"),
        };
    }
  }
  return null;
}
export type Objective = {
  area: Area;
  x: number;
  y: number;
  title: string;
  detail: string;
  step: number;
};
export function objective(p: Progress): Objective {
  if (!p.metKeeper)
    return {
      area: "hut",
      x: 7,
      y: 4,
      title: "Encontre a guardiã",
      detail:
        "Entre na cabana à esquerda e fale com Íris usando E ou o botão na tela.",
      step: 1,
    };
  if (!p.defeated.includes("guardian"))
    return {
      area: "forest",
      ...locations.guardian,
      title: "Rompa o selo do santuário",
      detail: "Enfrente o Guardião Esquecido à direita do bosque.",
      step: 2,
    };
  if (!p.defeated.includes("wisp"))
    return {
      area: "sanctuary",
      ...locations.wisp,
      title: "Liberte o Lume Errante",
      detail: "Entre no santuário. O primeiro espírito espera à direita.",
      step: 3,
    };
  if (!p.defeated.includes("sentinel"))
    return {
      area: "sanctuary",
      ...locations.sentinel,
      title: "Enfrente a Sentinela do Altar",
      detail:
        "Siga para a parte norte do santuário e encontre o último espírito.",
      step: 4,
    };
  return {
    area: "sanctuary",
    ...locations.altar,
    title: p.completed ? "Capítulo I concluído" : "Reacenda a Primeira Brasa",
    detail: p.completed
      ? "A chama está acesa. Explore, descanse e salve sua jornada."
      : "Aproxime-se do altar ao norte e pressione E para restaurar o bosque.",
    step: p.completed ? 6 : 5,
  };
}
export function objectiveTarget(p: Progress) {
  const goal = objective(p);
  if (goal.area === p.area) return { x: goal.x, y: goal.y };
  return p.area === "forest"
    ? locations[goal.area as "hut" | "sanctuary"]
    : locations.exit;
}
// Find a real walkable route so the arrow never sends the player through a wall.
export function guidance(p: Progress): {
  arrow: string;
  target: { x: number; y: number };
} {
  const target = objectiveTarget(p);
  if (near(p, target, 0)) return { arrow: "✦", target };
  const queue = [{ x: p.x, y: p.y, arrow: "✦" }];
  const seen = new Set([`${p.x},${p.y}`]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.x === target.x && current.y === target.y)
      return { arrow: current.arrow, target };
    for (const [dx, dy, arrow] of [
      [0, -1, "↑"],
      [1, 0, "→"],
      [0, 1, "↓"],
      [-1, 0, "←"],
    ] as const) {
      const x = current.x + dx,
        y = current.y + dy,
        key = `${x},${y}`;
      if (!seen.has(key) && !blocked(x, y, p.area)) {
        seen.add(key);
        queue.push({ x, y, arrow: i === 0 ? arrow : current.arrow });
      }
    }
  }
  return { arrow: "✦", target };
}
