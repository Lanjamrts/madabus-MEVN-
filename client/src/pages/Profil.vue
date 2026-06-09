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

        <div v-if="!modeEdition">
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

          <button
            @click="modeEdition = true"
            style="
              margin-top: 1.5rem; padding: 10px 24px;
              background: #1a7a3c; color: white; border: none;
              border-radius: 10px; cursor: pointer; font-weight: 600;
              font-size: 0.9rem;
            "
          >
            Modifier le profil
          </button>
        </div>

        <div v-else style="text-align: left">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; text-align: center">
            Modifier mon profil
          </h2>

          <div v-if="message" :style="{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem',
            fontSize: '0.9rem', fontWeight: 600,
            background: messageType === 'success' ? '#d1fae5' : '#fee2e2',
            color: messageType === 'success' ? '#065f46' : '#991b1b',
          }">
            {{ message }}
          </div>

          <form @submit.prevent="enregistrer" style="display: grid; gap: 1rem">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 0.85rem; color: #374151">Prénom</label>
              <input
                v-model="form.prenom"
                style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.9rem; outline: none; box-sizing: border-box"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 0.85rem; color: #374151">Nom</label>
              <input
                v-model="form.nom"
                style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.9rem; outline: none; box-sizing: border-box"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 0.85rem; color: #374151">Email</label>
              <input
                v-model="form.email"
                type="email"
                style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.9rem; outline: none; box-sizing: border-box"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 600; font-size: 0.85rem; color: #374151">Téléphone</label>
              <input
                v-model="form.telephone"
                style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.9rem; outline: none; box-sizing: border-box"
              />
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem">
              <button
                type="submit"
                :disabled="chargement"
                style="
                  flex: 1; padding: 10px 24px;
                  background: #1a7a3c; color: white; border: none;
                  border-radius: 10px; cursor: pointer; font-weight: 600;
                  font-size: 0.9rem;
                "
              >
                {{ chargement ? "Enregistrement..." : "Enregistrer" }}
              </button>
              <button
                type="button"
                @click="annuler"
                style="
                  flex: 1; padding: 10px 24px;
                  background: #e5e7eb; color: #374151; border: none;
                  border-radius: 10px; cursor: pointer; font-weight: 600;
                  font-size: 0.9rem;
                "
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import "../styles/dashboard.css";

const auth = useAuthStore();

const roleLabel = {
  voyageur: "Voyageur",
  cooperative: "Coopérative",
  admin: "Administrateur",
};

const modeEdition = ref(false);
const chargement = ref(false);
const message = ref("");
const messageType = ref("success");

const form = ref({
  prenom: auth.user?.prenom || "",
  nom: auth.user?.nom || "",
  email: auth.user?.email || "",
  telephone: auth.user?.telephone || "",
});

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

const annuler = () => {
  form.value = {
    prenom: auth.user?.prenom || "",
    nom: auth.user?.nom || "",
    email: auth.user?.email || "",
    telephone: auth.user?.telephone || "",
  };
  message.value = "";
  modeEdition.value = false;
};

const enregistrer = async () => {
  message.value = "";
  chargement.value = true;
  try {
    const data = await auth.modifierProfil(form.value);
    messageType.value = "success";
    message.value = "Profil mis à jour avec succès !";
    setTimeout(() => {
      modeEdition.value = false;
      message.value = "";
    }, 1500);
  } catch (error) {
    messageType.value = "error";
    message.value = error.response?.data?.message || "Erreur lors de la mise à jour.";
  } finally {
    chargement.value = false;
  }
};
</script>
