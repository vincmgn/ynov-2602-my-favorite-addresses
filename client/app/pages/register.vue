<script setup lang="ts">
const config = useRuntimeConfig();
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await $fetch(`${config.public.apiBase}/users`, {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: "include",
    });

    successMessage.value = "Compte créé avec succès !";

    setTimeout(() => {
      navigateTo("/login");
    }, 100); // Délai réduit pour les tests
  } catch (error: unknown) {
    console.error("Registration failed:", error);
    const err = error as { data?: { message?: string } };
    errorMessage.value = err.data?.message || "Une erreur est survenue lors de l'inscription.";
    console.log("Set errorMessage to:", errorMessage.value);
  } finally {
    isLoading.value = false;
    console.log("Registration process finished, isLoading is false");
  }
};
</script>

<template>
  <AuthCard>
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    </template>
    <template #title>Créer un compte</template>
    <template #subtitle>Rejoignez-nous et commencez à enregistrer vos adresses favorites.</template>

    <AuthAlert v-if="errorMessage" :message="errorMessage" type="error" />
    <AuthAlert v-if="successMessage" :message="successMessage" type="success" />

    <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
      <div class="space-y-4">
        <AuthInput id="email-address" v-model="email" label="Adresse email" type="email" autocomplete="email" required
          placeholder="votre@email.com" :disabled="isLoading" />

        <AuthInput id="password" v-model="password" label="Mot de passe" type="password" autocomplete="new-password"
          required placeholder="••••••••" :disabled="isLoading" />

        <AuthInput id="confirm-password" v-model="confirmPassword" label="Confirmer le mot de passe" type="password"
          required placeholder="••••••••" :disabled="isLoading" />
      </div>

      <AuthButton :is-loading="isLoading">
        {{ isLoading ? "Inscription..." : "S'inscrire" }}
      </AuthButton>
    </form>

    <template #footer>
      <span class="text-gray-500">Déjà un compte ?</span>
      <NuxtLink to="/login" class="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
        Se connecter
      </NuxtLink>
    </template>
  </AuthCard>
</template>
