<template>
  <Navbar />
  <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import Navbar from "./components/Navbar.vue";

const auth = useAuthStore();

onMounted(() => {
  auth.init();
});
</script>
