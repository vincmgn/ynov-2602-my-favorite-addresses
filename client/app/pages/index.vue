<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useCookie, useRuntimeConfig, navigateTo, useFetch } from "#app";
import type { Map, Marker } from "leaflet";
import type { Address } from "~/types";

const authToken = useCookie("auth_token");
if (!authToken.value) {
  navigateTo("/login");
}

const config = useRuntimeConfig();
const mapContainer = ref<HTMLElement | null>(null);
const searchQuery = ref("");
const markersList = ref<Marker[]>([]);
const fetchBaseURL = config.public.apiBase;

const isModalOpen = ref(false);
const selectedAddress = ref<Address | null>(null);

const { data, refresh } = useFetch<{ items: Address[] }>(`${fetchBaseURL}/addresses`, {
  immediate: !!authToken.value,
  watch: false, // On ne veut pas qu'il s'auto-refresh sur le token ici
  headers: computed(() => ({
    Authorization: `Bearer ${authToken.value}`,
  })),
});

const favorites = ref<Address[]>(data.value?.items || []);

const handleModalSuccess = async () => {
  await refresh();
  if (data.value?.items) {
    favorites.value = data.value.items;
  }
  isModalOpen.value = false;
  selectedAddress.value = null;
};

const handleEdit = (fav: Address) => {
  selectedAddress.value = fav;
  isModalOpen.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return;

  try {
    await $fetch(`${fetchBaseURL}/addresses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });
    await handleModalSuccess();
  } catch (error) {
    console.error("Failed to delete:", error);
  }
};

// Leaflet variables
let map: Map | null = null;
let leafletLib: typeof import("leaflet") | null = null;

const updateMarkers = () => {
  if (!map || !leafletLib) return;

  markersList.value.forEach((m) => {
    // @ts-expect-error - Leaflet type mismatch in markers array
    if (map) map.removeLayer(m);
  });
  markersList.value = [];

  const filteredFavorites = favorites.value.filter(
    (f) =>
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
    if (!leafletLib) return;

    // Create popup container
    const popupContent = document.createElement("div");
    popupContent.className = "p-1 min-w-[150px]";
    popupContent.innerHTML = `
      <div class="mb-3">
        <strong class="text-gray-900 block text-sm">${fav.name}</strong>
        <span class="text-gray-500 text-xs">${fav.description || "Pas de description"}</span>
      </div>
      <div class="flex gap-2 pt-2 border-t border-gray-100">
        <button id="edit-${fav.id}" class="flex-1 bg-indigo-50 text-indigo-600 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
          <i class="fa-solid fa-pen mr-1"></i> Modifier
        </button>
        <button id="del-${fav.id}" class="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
          <i class="fa-solid fa-trash mr-1"></i>
        </button>
      </div>
    `;

    // Wait bit for leaflet to render or just attach after adding to map
    const marker = leafletLib
      .marker([fav.lat, fav.lng], { icon: customIcon })
      .addTo(map as Map)
      .bindPopup(popupContent);

    marker.on("popupopen", () => {
      document.getElementById(`edit-${fav.id}`)?.addEventListener("click", () => handleEdit(fav));
      document.getElementById(`del-${fav.id}`)?.addEventListener("click", () => handleDelete(fav.id));
    });

    markersList.value.push(marker);
  });

  if (markersList.value.length > 0) {
    // @ts-expect-error - Leaflet type mismatch in markers array
    const group = leafletLib.featureGroup(markersList.value);
    map.fitBounds(group.getBounds().pad(0.1));
  }
};

onMounted(async () => {
  leafletLib = await import("leaflet");

  if (data.value?.items) {
    favorites.value = data.value.items;
  }

  if (mapContainer.value && leafletLib) {
    map = leafletLib.map(mapContainer.value).setView([46.603354, 1.888334], 6);

    leafletLib
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
      .addTo(map);

    updateMarkers();
  }
});

const handleSearch = () => {
  updateMarkers();
};

watch(searchQuery, () => {
  updateMarkers();
});

watch(
  () => data.value,
  (newData) => {
    if (newData?.items) {
      favorites.value = newData.items;
      updateMarkers();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
    <header class="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
      <div
        class="bg-white/90 backdrop-blur-md shadow-2xl border border-white/20 rounded-2xl p-2 flex items-center gap-2 mt-20">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fa-solid fa-magnifying-glass" />
          </span>
          <input v-model="searchQuery" type="text" placeholder="Rechercher une adresse favorite..."
            class="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-all"
            @keyup.enter="handleSearch" />
        </div>
        <button
          class="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-200 shrink-0"
          @click="isModalOpen = true">
          <i class="fa-solid fa-plus mr-2" />
          <span>Ajouter</span>
        </button>
      </div>
    </header>

    <!-- Map Container -->
    <main class="flex-1 relative">
      <div ref="mapContainer" class="absolute inset-0 z-0" />

      <div v-if="favorites.length === 0"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 text-center max-w-sm">
        <div class="text-indigo-100 mb-4">
          <i class="fa-solid fa-map-location-dot text-6xl" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Aucune adresse trouvée</h3>
        <p class="text-gray-500 text-sm mb-6">
          Commencez par ajouter vos adresses favorites depuis votre tableau de bord.
        </p>
        <NuxtLink to="/account"
          class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
          Tableau de bord
        </NuxtLink>
      </div>
    </main>

    <AddressFormModal :is-open="isModalOpen" :address="selectedAddress" @close="
      isModalOpen = false;
    selectedAddress = null;
    " @success="handleModalSuccess" />
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

.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.leaflet-popup-content {
  margin: 13px 19px;
  line-height: 1.4;
}

.leaflet-container {
  font-family: inherit;
}
</style>
