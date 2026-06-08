<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-logo">
        <img src="/diamora.png" alt="Diamora" class="navbar-logo-img" />
        <span class="navbar-logo-text">Mada<span class="navbar-logo-bus">Bus</span></span>
      </router-link>

      <button v-if="auth.user" class="hamburger" @click="mobileOuvert = !mobileOuvert" aria-label="Menu">
        <span :class="['hamburger-line', { open: mobileOuvert }]" />
        <span :class="['hamburger-line', { open: mobileOuvert }]" />
        <span :class="['hamburger-line', { open: mobileOuvert }]" />
      </button>

      <div class="navbar-links">
        <router-link
          v-for="l in liens"
          :key="l.to"
          :to="l.to"
          :class="['nav-link', { active: $route.path === l.to }]"
        >
          {{ l.label }}
        </router-link>
      </div>

      <div v-if="auth.user" class="navbar-user" @click="menuOuvert = !menuOuvert">
        <div class="user-avatar">{{ initials }}</div>
        <div class="user-info">
          <span class="user-name">{{ auth.user.prenom }} {{ auth.user.nom }}</span>
          <span class="user-role">{{ roleLabel[auth.user.role] }}</span>
        </div>
        <svg :class="['chevron', { open: menuOuvert }]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>

        <Transition name="dropdown">
          <div v-if="menuOuvert" class="dropdown">
            <router-link to="/profil" class="dropdown-item" @click="menuOuvert = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Mon profil
            </router-link>
            <button class="dropdown-item danger" @click="handleDeconnexion">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Déconnexion
            </button>
          </div>
        </Transition>
      </div>

      <div v-else class="navbar-links" style="justify-content: flex-end">
        <router-link to="/connexion" class="nav-link">Connexion</router-link>
        <router-link to="/inscription" class="nav-link" style="background: #1a7a3c; color: white; border-radius: 10px; padding: 8px 18px;">
          Inscription
        </router-link>
      </div>
    </div>

    <Transition name="mobile">
      <div v-if="mobileOuvert && auth.user" class="mobile-menu">
        <router-link
          v-for="l in liens"
          :key="l.to"
          :to="l.to"
          :class="['mobile-link', { active: $route.path === l.to }]"
          @click="mobileOuvert = false"
        >
          {{ l.label }}
        </router-link>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0" />
        <router-link to="/profil" class="mobile-link" @click="mobileOuvert = false">Mon profil</router-link>
        <button class="mobile-link danger" @click="handleDeconnexion">Déconnexion</button>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import "./Navbar.css";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const menuOuvert = ref(false);
const mobileOuvert = ref(false);

const roleLabel = {
  voyageur: "Voyageur",
  cooperative: "Coopérative",
  admin: "Administrateur",
};

const initials = computed(() => {
  if (!auth.user) return "";
  return (auth.user.prenom?.[0] || "") + (auth.user.nom?.[0] || "");
});

const liens = computed(() => {
  const l = [];
  if (auth.user?.role === "voyageur") {
    l.push({ to: "/trajets", label: "Trajets" });
    l.push({ to: "/mes-reservations", label: "Mes réservations" });
  }
  if (auth.user?.role === "cooperative") {
    l.push({ to: "/dashboard-coop", label: "Tableau de bord" });
  }
  if (auth.user?.role === "admin") {
    l.push({ to: "/admin", label: "Administration" });
  }
  return l;
});

const handleDeconnexion = () => {
  auth.deconnecter();
  menuOuvert.value = false;
  mobileOuvert.value = false;
  router.push("/");
};
</script>
