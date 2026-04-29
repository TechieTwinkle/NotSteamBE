import { create } from "zustand";

const saved = localStorage.getItem("notsteam-auth");
const parsed = saved ? JSON.parse(saved) : { token: null, user: null };

export const useAuthStore = create((set) => ({
  token: parsed.token,
  user: parsed.user,
  setAuth: (token, user) => {
    const payload = { token, user };
    localStorage.setItem("notsteam-auth", JSON.stringify(payload));
    set(payload);
  },
  logout: () => {
    localStorage.removeItem("notsteam-auth");
    set({ token: null, user: null });
  }
}));

