<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="mada-flag-bar" />

      <div class="auth-header">
        <img
          src="/diamora.png"
          alt="Diamora"
          class="auth-logo"
          @error="handleImgError"
        />
        <div class="auth-logo-fallback" style="display: none">MB</div>
        <h1 class="auth-app-name">Mada<span>Bus</span></h1>
        <p class="auth-subtitle">Réservation de taxi-brousse à Madagascar</p>
      </div>

      <div v-if="erreur" class="auth-erreur">{{ erreur }}</div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Adresse email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="exemple@mail.mg"
            v-model="form.email"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label for="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            name="motDePasse"
            placeholder="••••••••"
            v-model="form.motDePasse"
            required
          />
        </div>

        <button type="submit" class="btn-auth" :disabled="chargement">
          <div v-if="chargement" class="spinner" />
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="auth-footer">
        Pas encore de compte ?
        <router-link to="/inscription">Créer un compte</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import "../styles/auth.css";

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ email: "", motDePasse: "" });
const erreur = ref("");
const chargement = ref(false);

const handleImgError = (e) => {
  e.target.style.display = "none";
  e.target.nextElementSibling.style.display = "flex";
};

const handleSubmit = async () => {
  chargement.value = true;
  erreur.value = "";
  try {
    const data = await auth.connecter(form.email, form.motDePasse);
    const redirections = {
      voyageur: "/trajets",
      cooperative: "/dashboard-coop",
      admin: "/admin",
    };
    router.push(redirections[data.user.role] || "/");
  } catch (err) {
    erreur.value = err.response?.data?.message || "Erreur de connexion. Réessayez.";
  } finally {
    chargement.value = false;
  }
};
</script>
