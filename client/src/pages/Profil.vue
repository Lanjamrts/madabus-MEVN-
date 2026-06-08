<template>
  <div class="dashboard-page">
    <div class="detail-card" style="max-width: 600px; margin: 0 auto">
      <div style="padding: 2rem; text-align: center">
        <div
          class="user-avatar"
          style="
            width: 72px; height: 72px; font-size: 24px;
            margin: 0 auto 1rem; border-radius: 50%;
            background: linear-gradient(135deg, #1a7a3c, #c8102e);
            color: white; display: flex; align-items: center;
            justify-content: center; font-weight: 700;
            text-transform: uppercase;
          "
        >
          {{ initials }}
        </div>
        <h1 style="font-size: 1.5rem; font-weight: 700; color: #111827">
          {{ auth.user?.prenom }} {{ auth.user?.nom }}
        </h1>
        <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1.5rem">
          {{ roleLabel[auth.user?.role] }}
        </p>

        <div style="display: grid; gap: 0.75rem; text-align: left">
          <div v-for="item in infos" :key="item.label"
            style="display: flex; justify-content: space-between; padding: 10px 14px; background: #f9fafb; border-radius: 10px; font-size: 0.9rem"
          >
            <span style="color: #6b7280">{{ item.label }}</span>
            <span style="font-weight: 600; color: #111827">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import "../styles/dashboard.css";

const auth = useAuthStore();

const roleLabel = {
  voyageur: "Voyageur",
  cooperative: "Coopérative",
  admin: "Administrateur",
};

const initials = computed(() => {
  if (!auth.user) return "";
  return (auth.user.prenom?.[0] || "") + (auth.user.nom?.[0] || "");
});

const infos = computed(() => {
  if (!auth.user) return [];
  const items = [
    { label: "Email", value: auth.user.email },
    { label: "Téléphone", value: auth.user.telephone },
    { label: "Rôle", value: roleLabel[auth.user.role] },
    ...(auth.user.nomCooperative ? [{ label: "Coopérative", value: auth.user.nomCooperative }] : []),
    { label: "Membre depuis", value: new Date(auth.user.createdAt).toLocaleDateString("fr-FR") },
  ];
  return items;
});
</script>
