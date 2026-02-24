<template>
  <div class="flex min-h-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
    <div class="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-indigo-100/50 ring-1 ring-gray-100">
      <div class="text-center">
        <div
          class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <slot name="icon" />
        </div>
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">
          <slot name="title" />
        </h2>
        <p class="mt-2 text-sm text-gray-500">
          <slot name="subtitle" />
        </p>
      </div>

      <slot />

      <div class="mt-8 text-center text-sm">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
