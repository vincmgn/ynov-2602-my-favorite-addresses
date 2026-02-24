export default defineNuxtPlugin(async () => {
  const userStore = useUserStore();
  const token = useCookie("auth_token");
  const config = useRuntimeConfig();

  const baseURL = import.meta.server ? "http://127.0.0.1:5050/api" : config.public.apiBase;

  if (token.value && !userStore.isLoggedIn) {
    if (import.meta.server)
      console.log(
        "Attempting to restore session in SSR with token:",
        token.value.substring(0, 10) + "..."
      );
    try {
      const { item: user } = await $fetch<{ item: any }>(`${baseURL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      userStore.setUser(user);
    } catch (error) {
      console.error("Failed to restore user session:", error);
    }
  }
});
