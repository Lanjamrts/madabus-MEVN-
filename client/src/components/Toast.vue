<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="message" class="toast-notif" :style="styleObj" @click="$emit('close')">
        <span class="toast-icon">{{ t.icon }}</span>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  message: String,
  type: { type: String, default: "info" },
  duration: { type: Number, default: 4000 },
});

const emit = defineEmits(["close"]);

const types = {
  success: { bg: "#dcfce7", border: "#86efac", color: "#166534", icon: "✓" },
  error: { bg: "#fff1f2", border: "#fecdd3", color: "#c8102e", icon: "✕" },
  info: { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", icon: "ℹ" },
};

const t = computed(() => types[props.type] || types.info);

const styleObj = computed(() => ({
  background: t.value.bg,
  border: `1px solid ${t.value.border}`,
  color: t.value.color,
}));

let timer;
onMounted(() => {
  timer = setTimeout(() => emit("close"), props.duration);
});
onUnmounted(() => clearTimeout(timer));
</script>

<style scoped>
.toast-notif {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  max-width: 400px;
  cursor: pointer;
}
.toast-icon {
  font-size: 16px;
  font-weight: 700;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
