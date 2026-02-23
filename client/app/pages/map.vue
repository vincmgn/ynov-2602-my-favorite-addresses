<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useCookie, useRuntimeConfig, navigateTo, useFetch } from "#app";
import type { Map, Marker } from "leaflet";

interface Address {
  id: number;
  name: string;
  description?: string;
  lat: number;
  lng: number;
}

// Authentication check
const authToken = useCookie("auth_token");
if (!authToken.value) {
  navigateTo("/login");
}

const config = useRuntimeConfig();
const mapContainer = ref<HTMLElement | null>(null);
const searchQuery = ref("");
const favorites = ref<Address[]>([]);
const markersList = ref<Marker[]>([]);
let map: Map | null = null;
let leafletLib: any = null;

// Fetch favorites from backend
const { data } = await useFetch<{ items: Address[] }>(`${config.public.apiBase}/addresses`, {
  headers: computed(() => ({
    Authorization: `Bearer ${authToken.value}`,
  })),
});

const updateMarkers = () => {
  if (!map || !leafletLib) return;

  // Clear existing markers
  markersList.value.forEach((m) => {
    if (map) map.removeLayer(m);
  });
  markersList.value = [];

  const filteredFavorites = favorites.value.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  );

  const customIcon = leafletLib.divIcon({
    html: '<i class="fa-solid fa-location-dot text-indigo-600 text-3xl"></i>',
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  filteredFavorites.forEach((fav) => {
    const marker = leafletLib.marker([fav.lat, fav.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong>${fav.name}</strong><br>${fav.description || ""}`);
    markersList.value.push(marker);
  });

  // If there are markers, fit bounds
  if (markersList.value.length > 0) {
    const group = leafletLib.featureGroup(markersList.value);
    map.fitBounds(group.getBounds().pad(0.1));
  }
};

onMounted(async () => {
  // Import Leaflet only on client side
  leafletLib = await import("leaflet");

  if (data.value?.items) {
    favorites.value = data.value.items;
  }

  // Initialize map
  if (mapContainer.value && leafletLib) {
    map = leafletLib.map(mapContainer.value).setView([46.603354, 1.888334], 6); // Center of France

    leafletLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    updateMarkers();
  }
});

const handleSearch = () => {
  updateMarkers();
};

// Re-run search/filter when query changes
watch(searchQuery, () => {
  updateMarkers();
});

const handleLogout = async () => {
  authToken.value = null;
  await navigateTo("/login");
};
</script>

<template>
  <div class="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
    <!-- Header / Search Bar -->
    <header class="bg-white shadow-md z-[1000] p-4 flex items-center justify-between">
      <div class="flex items-center flex-1 max-w-2xl gap-4">
        <NuxtLink to="/" class="text-indigo-600 hover:text-indigo-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une adresse favorite..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            @keyup.enter="handleSearch"
          />
        </div>
        <NuxtLink
          to="/newadress"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shrink-0"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          <span class="hidden sm:inline">Ajouter</span>
        </NuxtLink>
      </div>
      <div class="flex items-center gap-4 ml-4">
        <button
          class="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
          @click="handleLogout"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          <span class="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>

    <!-- Map Container -->
    <main class="flex-1 relative">
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>
      
      <!-- Overlay for Empty State -->
      <div 
        v-if="favorites.length === 0" 
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 text-center max-w-sm"
      >
        <div class="text-indigo-100 mb-4">
          <i class="fa-solid fa-map-location-dot text-6xl"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Aucune adresse trouvée</h3>
        <p class="text-gray-500 text-sm mb-6">Commencez par ajouter vos adresses favorites depuis votre tableau de bord.</p>
        <NuxtLink 
          to="/"
          class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Tableau de bord
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<style>
.custom-div-icon {
  background: transparent;
  border: none;
}

.custom-div-icon i {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Ensure leaflet popup looks modern */
.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.leaflet-popup-content {
  margin: 13px 19px;
  line-height: 1.4;
}

.leaflet-container {
  font-family: inherit;
}
</style>
