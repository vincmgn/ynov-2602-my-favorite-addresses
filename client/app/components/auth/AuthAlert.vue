<script setup lang="ts">
defineProps<{
  message: string;
  type: "error" | "success";
}>();
</script>

<template>
  <div
    v-if="message"
    :class="[
      'rounded-xl p-4 text-sm border',
      type === 'error'
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-green-50 text-green-600 border-green-100',
    ]"
  >
    {{ message }}
  </div>
</template>
