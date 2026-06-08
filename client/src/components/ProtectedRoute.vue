<template>
  <div v-if="auth.chargement" class="loading-screen">
    <div class="spinner" />
  </div>
  <slot v-else />
</template>

<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
</script>

<style scoped>
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
