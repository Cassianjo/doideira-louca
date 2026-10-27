import { create } from "zustand";
import { Platform } from "react-native";
import { fresh, move, Progress, Screen } from "./model";
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
  busy: boolean;
  saving: boolean;
  message: string;
  saved: string;
  login: (name: string) => Promise<void>;
  save: () => Promise<void>;
  go: (screen: Screen) => void;
  walk: (dx: number, dy: number) => void;
  change: (patch: Partial<Progress>) => void;
  logout: () => void;
  newGame: () => void;
};
export const useGame = create<State>((set, get) => ({
  username: "",
  token: "",
  progress: { ...fresh },
  screen: "menu",
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
        progress: r.progress,
        saved: r.updated,
        screen: "menu",
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
    if (get().saving) return;
    const { token, progress } = get();
    set({ saving: true, message: "" });
    try {
      const r = await request("/api/progress", "PUT", token, progress);
      set({
        saved: r.updated,
        message: "Progresso salvo. Sua jornada espera por você.",
      });
    } catch (e) {
      set({ message: e instanceof Error ? e.message : "Falha ao salvar." });
    } finally {
      set({ saving: false });
    }
  },
  go: (screen) => set({ screen, message: "" }),
  walk: (dx, dy) => set((s) => ({ progress: move(s.progress, dx, dy) })),
  change: (patch) => set((s) => ({ progress: { ...s.progress, ...patch } })),
  logout: () =>
    set({
      username: "",
      token: "",
      screen: "menu",
      progress: { ...fresh },
      message: "",
      saved: "",
    }),
  newGame: () => set({ progress: { ...fresh }, screen: "world", message: "" }),
}));
