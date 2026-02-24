<script setup lang="ts">
const userStore = useUserStore();

const handleLogout = () => {
  const token = useCookie("auth_token");
  token.value = null;
  userStore.logout();
  navigateTo("/login");
};
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo/Home Link -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span class="font-bold text-xl tracking-tight text-gray-900">MFP</span>
        </NuxtLink>

        <!-- User Navigation -->
        <div class="flex items-center gap-4">
          <template v-if="userStore.isLoggedIn">
            <div class="flex items-center gap-3 pr-4 border-r border-gray-200">
              <div class="flex flex-col items-end">
                <span class="text-sm font-medium text-gray-900 leading-none">{{ userStore.userName }}</span>
                <span class="text-xs text-gray-500 mt-1">Connecté</span>
              </div>
              <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold border-2 border-white shadow-sm">
                {{ userStore.userName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <button
              @click="handleLogout"
              class="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Connexion
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
            >
              S'inscrire
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
