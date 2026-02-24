<template>
  <div class="h-screen flex flex-col bg-gray-50 font-sans antialiased text-gray-900">
    <AppHeader class="flex-none" />
    <main class="flex-1 overflow-y-auto overflow-x-hidden">
      <slot />
    </main>
  </div>
</template>
