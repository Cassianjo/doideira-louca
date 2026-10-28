import { create } from "zustand";
import { Platform } from "react-native";
import {
  fresh,
  move,
  normalizeProgress,
  interaction,
  type Progress,
  type Screen,
  type EnemyId,
} from "./model";
import { ENEMIES } from "./enemies";
const base =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web" && typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");
async function request(
  path: string,
  method: string,
  token = "",
  data?: unknown,
) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Servidor indisponível.");
  return result;
}
type State = {
  username: string;
  token: string;
  progress: Progress;
  screen: Screen;
  encounter: EnemyId;
  dialogue: string;
  busy: boolean;
  saving: boolean;
  message: string;
  saved: string;
  login: (name: string) => Promise<void>;
  save: () => Promise<void>;
  go: (screen: Screen) => void;
  walk: (dx: number, dy: number) => void;
  change: (patch: Partial<Progress>) => void;
  interact: () => void;
  closeDialogue: () => void;
  startBattle: (id: EnemyId) => void;
  winBattle: (id: EnemyId) => void;
  retreatBattle: (defeated?: boolean) => void;
  logout: () => void;
  newGame: () => void;
};
let queuedSave = false;
export const useGame = create<State>((set, get) => ({
  username: "",
  token: "",
  progress: normalizeProgress(fresh),
  screen: "menu",
  encounter: "guardian",
  dialogue: "",
  busy: false,
  saving: false,
  message: "",
  saved: "",
  login: async (name) => {
    if (get().busy) return;
    set({ busy: true, message: "" });
    try {
      const r = await request("/api/login", "POST", "", {
        username: name.trim(),
      });
      set({
        username: r.username,
        token: r.token,
        progress: normalizeProgress(r.progress),
        saved: r.updated,
        screen: "menu",
        dialogue: "",
      });
    } catch (e) {
      set({
        message:
          e instanceof Error && e.message !== "Failed to fetch"
            ? e.message
            : "Sem conexão com o servidor. Verifique se o backend está ativo.",
      });
    } finally {
      set({ busy: false });
    }
  },
  save: async () => {
    if (!get().token) return;
    if (get().saving) {
      queuedSave = true;
      return;
    }
    const { token, progress } = get();
    set({ saving: true, message: "" });
    try {
      const r = await request("/api/progress", "PUT", token, progress);
      if (get().token === token)
        set({
          saved: r.updated,
          message: "Progresso salvo. Sua jornada espera por você.",
        });
    } catch (e) {
      if (get().token === token)
        set({ message: e instanceof Error ? e.message : "Falha ao salvar." });
    } finally {
      set({ saving: false });
      if (queuedSave) {
        queuedSave = false;
        void get().save();
      }
    }
  },
  go: (screen) => {
    if (get().screen !== "battle") set({ screen, message: "" });
  },
  walk: (dx, dy) => {
    if (!get().dialogue && get().screen === "world")
      set((s) => ({ progress: move(s.progress, dx, dy) }));
  },
  change: (patch) => set((s) => ({ progress: { ...s.progress, ...patch } })),
  closeDialogue: () => set({ dialogue: "" }),
  interact: () => {
    if (get().screen !== "world") return;
    if (get().dialogue) {
      get().closeDialogue();
      return;
    }
    const p = get().progress,
      action = interaction(p);
    if (!action || action.locked) return;
    if (action.kind === "fight" && action.enemy) {
      get().startBattle(action.enemy);
      return;
    }
    if (action.kind === "enter" && action.destination)
      get().change({ area: action.destination, x: 7, y: 9 });
    if (action.kind === "exit")
      get().change({
        area: "forest",
        x: p.area === "hut" ? 4 : 7,
        y: p.area === "hut" ? 6 : 5,
      });
    if (action.kind === "rest")
      get().change({ hp: 100, potions: Math.max(3, p.potions) });
    if (action.kind === "talk") {
      get().change({
        metKeeper: true,
        hp: 100,
        potions: Math.max(3, p.potions),
      });
      set({
        dialogue: p.metKeeper
          ? "Íris: Você sempre terá abrigo aqui. Sua vida e suas poções foram restauradas. Siga a seta dourada para encontrar seu próximo objetivo."
          : "Íris: A Primeira Brasa se apagou. Vença o Guardião Esquecido à direita do bosque para abrir o santuário. Lá dentro, liberte o Lume Errante e a Sentinela do Altar. Então reacenda a chama. Siga a seta dourada; eu cuidarei de você quando precisar descansar.",
      });
    }
    if (action.kind === "altar") {
      get().change({
        completed: true,
        hp: 100,
        potions: Math.max(3, p.potions),
      });
      set({
        dialogue: p.completed
          ? "A chama aquece o santuário. Íris e o bosque estão a salvo. Seu progresso foi salvo."
          : "A Primeira Brasa voltou a arder! Os espíritos encontraram paz e a vida retorna ao bosque. Capítulo I concluído. Obrigado por manter a chama acesa.",
      });
    }
    void get().save();
  },
  startBattle: (id) => {
    const a = interaction(get().progress);
    if (
      get().screen !== "world" ||
      !a ||
      a.enemy !== id ||
      a.locked ||
      get().progress.defeated.includes(id)
    )
      return;
    set({ encounter: id, screen: "battle", message: "", dialogue: "" });
  },
  winBattle: (id) => {
    const p = get().progress;
    if (
      get().screen !== "battle" ||
      get().encounter !== id ||
      p.defeated.includes(id)
    )
      return;
    get().change({
      defeated: [...p.defeated, id],
      victories: p.victories + 1,
      gold: p.gold + ENEMIES[id].reward,
    });
    void get().save();
  },
  retreatBattle: (defeated) => {
    if (defeated) get().change({ hp: 100, area: "forest", x: 7, y: 10 });
    set({
      screen: "world",
      message: defeated
        ? "Íris resgatou sua chama. Descanse na cabana ou siga o objetivo para tentar novamente."
        : "",
      dialogue: "",
    });
    if (defeated) void get().save();
  },
  logout: () =>
    set({
      username: "",
      token: "",
      screen: "menu",
      progress: normalizeProgress(fresh),
      message: "",
      saved: "",
      dialogue: "",
    }),
  newGame: () =>
    set({
      progress: normalizeProgress(fresh),
      screen: "world",
      message: "",
      dialogue: "",
    }),
}));
