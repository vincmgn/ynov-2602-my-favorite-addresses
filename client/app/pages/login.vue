<script setup lang="ts">
const config = useRuntimeConfig();
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const userStore = useUserStore();

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<{ token: string }>(`${config.public.apiBase}/users/tokens`, {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    console.log("Login successful");

    const token = useCookie("auth_token");
    token.value = response.token;

    const { item: user } = await $fetch<{
      item: { id: number; email: string; name?: string };
    }>(`${config.public.apiBase}/users/me`, {
      headers: {
        Authorization: `Bearer ${response.token}`,
      },
    });

    userStore.setUser(user);

    await navigateTo("/");
  } catch (error: unknown) {
    console.error("Login failed:", error);
    const err = error as { data?: { message?: string } };
    errorMessage.value = err.data?.message || "Une erreur est survenue lors de la connexion.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <AuthCard>
    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.651A7.34 7.34 0 0112 13c3.43 0 6.365 2.392 7.037 5.571M12 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm-5 0c0 1.621.504 3.036 1.343 4.197M17 11c0 1.621-.504 3.036-1.343 4.197"
        />
      </svg>
    </template>
    <template #title>Connexion</template>
    <template #subtitle>Ravi de vous revoir ! Connectez-vous à votre compte.</template>

    <AuthAlert v-if="errorMessage" :message="errorMessage" type="error" />

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-4">
        <AuthInput
          id="email-address"
          v-model="email"
          label="Adresse email"
          type="email"
          autocomplete="email"
          required
          placeholder="votre@email.com"
          :disabled="isLoading"
        />

        <AuthInput
          id="password"
          v-model="password"
          label="Mot de passe"
          type="password"
          autocomplete="current-password"
          required
          placeholder="••••••••"
          :disabled="isLoading"
        />
      </div>

      <AuthButton :is-loading="isLoading">
        {{ isLoading ? "Connexion..." : "Se connecter" }}
      </AuthButton>
    </form>

    <template #footer>
      <span class="text-gray-500">Pas encore de compte ?</span>
      <NuxtLink
        to="/register"
        class="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
      >
        S'inscrire gratuitement
      </NuxtLink>
    </template>
  </AuthCard>
</template>
