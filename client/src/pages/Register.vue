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
        <p class="auth-subtitle">Créer votre compte</p>
      </div>

      <div v-if="erreur" class="auth-erreur">{{ erreur }}</div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input name="nom" placeholder="Rakoto" v-model="form.nom" :class="{ erreur: erreurs.nom }" />
            <span v-if="erreurs.nom" class="msg-erreur">{{ erreurs.nom }}</span>
          </div>
          <div class="form-group">
            <label>Prénom</label>
            <input name="prenom" placeholder="Jean" v-model="form.prenom" :class="{ erreur: erreurs.prenom }" />
            <span v-if="erreurs.prenom" class="msg-erreur">{{ erreurs.prenom }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" placeholder="exemple@mail.mg" v-model="form.email" :class="{ erreur: erreurs.email }" />
          <span v-if="erreurs.email" class="msg-erreur">{{ erreurs.email }}</span>
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <input name="telephone" placeholder="+261341234567" v-model="form.telephone" :class="{ erreur: erreurs.telephone }" />
          <span v-if="erreurs.telephone" class="msg-erreur">{{ erreurs.telephone }}</span>
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input type="password" name="motDePasse" placeholder="6 caractères minimum" v-model="form.motDePasse" :class="{ erreur: erreurs.motDePasse }" />
          <span v-if="erreurs.motDePasse" class="msg-erreur">{{ erreurs.motDePasse }}</span>
        </div>

        <div class="form-group">
          <label>Je suis</label>
          <select name="role" v-model="form.role">
            <option value="voyageur">Voyageur</option>
            <option value="cooperative">Coopérative de transport</option>
          </select>
        </div>

        <div v-if="form.role === 'cooperative'" class="form-group">
          <label>Nom de la coopérative</label>
          <input name="nomCooperative" placeholder="Ex: Cotisse Transport" v-model="form.nomCooperative" :class="{ erreur: erreurs.nomCooperative }" />
          <span v-if="erreurs.nomCooperative" class="msg-erreur">{{ erreurs.nomCooperative }}</span>
        </div>

        <button type="submit" class="btn-auth" :disabled="chargement">
          <div v-if="chargement" class="spinner" />
          <span v-else>Créer mon compte</span>
        </button>
      </form>

      <div class="auth-footer">
        Déjà un compte ?
        <router-link to="/connexion">Se connecter</router-link>
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

const form = reactive({
  nom: "", prenom: "", email: "",
  telephone: "", motDePasse: "",
  role: "voyageur", nomCooperative: "",
});
const erreur = ref("");
const erreurs = reactive({});
const chargement = ref(false);

const handleImgError = (e) => {
  e.target.style.display = "none";
  e.target.nextElementSibling.style.display = "flex";
};

const valider = () => {
  const e = {};
  if (!form.nom.trim()) e.nom = "Nom obligatoire";
  if (!form.prenom.trim()) e.prenom = "Prénom obligatoire";
  if (!form.email.trim()) e.email = "Email obligatoire";
  if (!form.telephone.trim()) e.telephone = "Téléphone obligatoire";
  if (form.motDePasse.length < 6) e.motDePasse = "6 caractères minimum";
  if (form.role === "cooperative" && !form.nomCooperative.trim())
    e.nomCooperative = "Nom de coopérative obligatoire";
  return e;
};

const handleSubmit = async () => {
  const e = valider();
  if (Object.keys(e).length > 0) {
    Object.assign(erreurs, e);
    return;
  }
  chargement.value = true;
  erreur.value = "";
  try {
    await auth.inscrire({ ...form });
    router.push(form.role === "cooperative" ? "/dashboard-coop" : "/trajets");
  } catch (err) {
    erreur.value = err.response?.data?.message || "Erreur lors de l'inscription.";
  } finally {
    chargement.value = false;
  }
};
</script>
