<script setup lang="ts">
import { ref } from "vue";
import { useCookie, useRuntimeConfig } from "#app";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close" | "success"): void;
}>();

const config = useRuntimeConfig();
const authToken = useCookie("auth_token");

const name = ref("");
const addressSearch = ref("");
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

    successMessage.value = "Adresse ajoutée avec succès !";
    setTimeout(() => {
      emit("success");
      resetForm();
    }, 1500);
  } catch (error: unknown) {
    console.error("Failed to add address:", error);
    const err = error as { data?: { message?: string } };
    errorMessage.value =
      err.data?.message || "Impossible de localiser cette adresse. Veuillez être plus précis.";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  name.value = "";
  addressSearch.value = "";
  description.value = "";
  errorMessage.value = "";
  successMessage.value = "";
};

const handleClose = () => {
  if (!isLoading.value) {
    emit("close");
  }
};
</script>

<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[2000] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background backdrop -->
        <div
          class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          @click="handleClose"
        />

        <!-- Modal panel -->
        <div
          class="inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:align-middle"
        >
          <div class="bg-white px-8 pt-8 pb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 id="modal-title" class="text-2xl font-extrabold text-gray-900 tracking-tight">
                Nouvelle adresse favorite
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                @click="handleClose"
              >
                <i class="fa-solid fa-xmark text-xl" />
              </button>
            </div>

            <AuthAlert v-if="errorMessage" :message="errorMessage" type="error" />
            <AuthAlert v-if="successMessage" :message="successMessage" type="success" />

            <form class="mt-4 space-y-5" @submit.prevent="handleSubmit">
              <AuthInput
                id="name"
                v-model="name"
                label="Nom de l'endroit"
                type="text"
                placeholder="ex: Mon restaurant préféré..."
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
                />
              </div>

              <div class="pt-2">
                <AuthButton :is-loading="isLoading">
                  {{ isLoading ? "Recherche de l'adresse..." : "Enregistrer l'adresse" }}
                </AuthButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
