<script setup lang="ts">
import { ref } from "vue";
import { useCookie, useRuntimeConfig, navigateTo } from "#app";

// Authentication check
const authToken = useCookie("auth_token");
if (!authToken.value) {
  navigateTo("/login");
}

const config = useRuntimeConfig();
const name = ref("");
const addressSearch = ref(""); // "XX rue de XXXX, Ville"
const description = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleSubmit = async () => {
  if (!name.value || !addressSearch.value) {
    errorMessage.value = "Le nom et l'adresse sont requis.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await $fetch(`${config.public.apiBase}/addresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
      body: {
        name: name.value,
        searchWord: addressSearch.value,
        description: description.value,
      },
    });

    successMessage.value = "Adresse ajoutée avec succès ! Redirection...";
    setTimeout(() => {
      navigateTo("/map");
    }, 1500);
  } catch (error: any) {
    console.error("Failed to add address:", error);
    errorMessage.value =
      error.data?.message || "Impossible de localiser cette adresse. Veuillez être plus précis.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div class="flex items-center gap-4 mb-8">
        <NuxtLink to="/map" class="text-gray-400 hover:text-indigo-600 transition-colors">
          <i class="fa-solid fa-arrow-left text-xl"></i>
        </NuxtLink>
        <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">
          Nouvelle adresse favorite
        </h1>
      </div>

      <AuthAlert v-if="errorMessage" :message="errorMessage" type="error" />
      <AuthAlert v-if="successMessage" :message="successMessage" type="success" />

      <form class="mt-6 space-y-5 gap-2" @submit.prevent="handleSubmit">
        <AuthInput
          id="name"
          v-model="name"
          label="Nom de l'endroit"
          type="text"
          placeholder="ex: Mon restaurant préféré, Chez Mamie..."
          required
          :disabled="isLoading"
        />

        <AuthInput
          id="address"
          v-model="addressSearch"
          label="Adresse physique"
          type="text"
          placeholder="ex: 10 rue de la Paix, Paris"
          required
          :disabled="isLoading"
        />

        <div class="space-y-1">
          <label for="description" class="block text-sm font-semibold text-gray-700"
            >Description (optionnel)</label
          >
          <textarea
            id="description"
            v-model="description"
            rows="3"
            placeholder="Petite note sur cet endroit..."
            class="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="pt-2">
          <AuthButton :is-loading="isLoading">
            {{ isLoading ? "Recherche de l'adresse..." : "Enregistrer l'adresse" }}
          </AuthButton>
        </div>
      </form>
    </div>
  </div>
</template>
