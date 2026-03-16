import { defineStore } from "pinia";
import type { User } from "~/types";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    userName: (state) => state.user?.name || state.user?.email || "Utilisateur",
  },

  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
    logout() {
      this.user = null;
      // Ici on pourrait aussi supprimer le cookie/token si nécessaire
    },
  },
});
