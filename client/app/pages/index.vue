<script setup lang="ts">
const config = useRuntimeConfig();
const authToken = useCookie("auth_token");

const { data: user, error } = await useFetch<{ item: Record<string, unknown> }>(
  `${config.public.apiBase}/users/me`,
  {
    headers: computed(() => ({
      Authorization: authToken.value ? `Bearer ${authToken.value}` : "",
    })),
  }
);

const handleLogout = async () => {
  authToken.value = null;
  await navigateTo("/login");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Tableau de bord</h1>
        <button
          class="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          @click="handleLogout"
        >
          Se déconnecter
        </button>
      </div>

      <div v-if="user?.item" class="space-y-6">
        <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <h2 class="text-lg font-semibold text-indigo-900 mb-2">Bienvenue de retour !</h2>
          <p class="text-indigo-700">
            Vous êtes connecté en tant que <span class="font-bold">{{ user.item.email }}</span>
          </p>
        </div>

        <div class="">
          <div
            class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 class="font-bold text-gray-900 mb-2">Mes Adresses</h3>
            <p class="text-sm text-gray-500">Gérez vos adresses favorites enregistrées.</p>
            <NuxtLink
              to="/map"
              class="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Voir tout →
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div
          class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Session expirée</h2>
        <p class="mt-2 text-gray-500 mb-6">
          Veuillez vous reconnecter pour accéder à vos adresses.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          S'identifier
        </NuxtLink>
      </div>

      <div v-else class="text-center py-12">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 bg-gray-200 rounded-full mb-4" />
          <div class="h-4 w-48 bg-gray-200 rounded mb-2" />
          <div class="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
