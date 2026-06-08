<template>
  <div class="detail-page">
    <Toast :message="toast?.message" :type="toast?.type" @close="toast = null" />

    <div v-if="chargement" class="detail-card">
      <div class="skeleton" style="height: 280px" />
      <div style="padding: 2rem">
        <div class="skeleton skeleton-title" />
        <div class="skeleton skeleton-text" style="margin-top: 12px" />
        <div class="skeleton skeleton-text short" />
      </div>
    </div>

    <div v-else-if="!trajet" class="detail-page">
      <div class="empty-state">
        <h3>Trajet introuvable</h3>
        <p>Ce trajet n'existe pas ou a été supprimé.</p>
      </div>
    </div>

    <div v-else class="detail-card" style="opacity: 0; animation: fadeIn 0.5s forwards">
      <div class="detail-img" />

      <div class="detail-body">
        <div class="detail-header">
          <div>
            <h1 class="detail-title">{{ trajet.titre }}</h1>
            <p style="color: #6b7280; font-size: 0.9rem; margin-top: 4px">
              {{ trajet.cooperative?.nomCooperative || trajet.cooperative?.nom }}
            </p>
          </div>
          <span class="detail-price">{{ trajet.prix.toLocaleString() }} Ar</span>
        </div>

        <div class="detail-info">
          <div class="detail-info-item">
            <label>Départ</label>
            <span>{{ trajet.villeDepart }}</span>
          </div>
          <div class="detail-info-item">
            <label>Arrivée</label>
            <span>{{ trajet.villeArrivee }}</span>
          </div>
          <div class="detail-info-item">
            <label>Date</label>
            <span>{{ formatDate(trajet.dateDepart) }}</span>
          </div>
          <div class="detail-info-item">
            <label>Horaire</label>
            <span>{{ trajet.heureDepart }} - {{ trajet.heureArrivee }}</span>
          </div>
          <div class="detail-info-item">
            <label>Véhicule</label>
            <span>{{ trajet.typeVehicule }}</span>
          </div>
          <div class="detail-info-item">
            <label>Places disponibles</label>
            <span :style="{ color: trajet.placesDisponibles > 0 ? '#1a7a3c' : '#c8102e' }">
              {{ trajet.placesDisponibles }} / {{ trajet.placesTotales }}
            </span>
          </div>
        </div>

        <p v-if="trajet.description" class="detail-desc">{{ trajet.description }}</p>

        <div v-if="trajet.villesIntermediaires?.length > 0" style="margin-bottom: 1.5rem">
          <h4 style="font-size: 0.9rem; color: #374151; margin-bottom: 0.5rem">Villes intermédiaires</h4>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            <span v-for="v in trajet.villesIntermediaires" :key="v" style="padding: 4px 12px; background: #f3f4f6; border-radius: 8px; font-size: 0.85rem; color: #374151">{{ v }}</span>
          </div>
        </div>

        <div v-if="trajet.statut === 'actif'" class="reservation-form">
          <div class="stepper">
            <template v-for="(nom, i) in etapes" :key="nom">
              <div style="display: flex; align-items: center">
                <div style="display: flex; align-items: center; gap: 8px">
                  <div :class="['step-circle', i < etape ? 'done' : i === etape ? 'active' : 'pending']">
                    {{ i < etape ? '✓' : i + 1 }}
                  </div>
                  <span v-if="i === etape" class="step-label">{{ nom }}</span>
                </div>
                <div v-if="i < etapes.length - 1" :class="['step-connector', i < etape ? 'done' : '']" />
              </div>
            </template>
          </div>

          <Transition name="fade" mode="out-in">
            <div v-if="etape === 0" key="step1">
              <h3>Réservez vos places</h3>
              <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap">
                <div class="form-group" style="min-width: 120px">
                  <label>Nombre de places</label>
                  <input
                    type="number"
                    :min="1"
                    :max="trajet.placesDisponibles"
                    v-model.number="nbPlaces"
                  />
                </div>
                <div style="font-size: 0.9rem; color: #6b7280">
                  Total : <strong style="color: #1a7a3c">{{ (trajet.prix * nbPlaces).toLocaleString() }} Ar</strong>
                </div>
              </div>
              <button class="btn-primary" style="margin-top: 1rem" @click="etape = 1">
                Continuer
              </button>
            </div>

            <div v-else-if="etape === 1" key="step2">
              <h3>Confirmer la réservation</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 1rem 0; font-size: 0.9rem">
                <span style="color: #6b7280">Trajet</span><span style="font-weight: 600">{{ trajet.titre }}</span>
                <span style="color: #6b7280">Date</span><span style="font-weight: 600">{{ formatDate(trajet.dateDepart) }}</span>
                <span style="color: #6b7280">Places</span><span style="font-weight: 600">{{ nbPlaces }}</span>
                <span style="color: #6b7280">Total</span><span style="font-weight: 700; color: #1a7a3c">{{ (trajet.prix * nbPlaces).toLocaleString() }} Ar</span>
              </div>
              <div style="display: flex; gap: 0.75rem">
                <button class="btn-secondary" style="padding: 10px 20px; font-size: 14px" @click="etape = 0">Retour</button>
                <button class="btn-primary" :disabled="envoi" @click="handleReserver">
                  <div v-if="envoi" class="spinner" style="border-top-color: rgba(255,255,255,0.4)" />
                  <span v-else>Confirmer la réservation</span>
                </button>
              </div>
            </div>

            <div v-else key="step3" style="text-align: center; padding: 1rem">
              <div style="font-size: 3rem; margin-bottom: 0.75rem">✅</div>
              <h3 style="color: #1a7a3c; margin-bottom: 0.5rem">Réservation confirmée !</h3>
              <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem">
                Votre réservation est en attente de confirmation.
              </p>
              <div style="display: flex; gap: 0.75rem; justify-content: center">
                <button class="btn-primary" @click="router.push('/mes-reservations')">Voir mes réservations</button>
                <button class="btn-secondary" @click="router.push('/trajets')">Autres trajets</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import trajetService from "../services/trajet.service";
import reservationService from "../services/reservation.service";
import Toast from "../components/Toast.vue";
import "../styles/dashboard.css";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const etapes = ["Trajet", "Réservation", "Confirmation"];

const trajet = ref(null);
const chargement = ref(true);
const nbPlaces = ref(1);
const etape = ref(0);
const envoi = ref(false);
const toast = ref(null);

onMounted(async () => {
  try {
    const data = await trajetService.obtenir(route.params.id);
    trajet.value = data.trajet;
  } catch {
    toast.value = { message: "Trajet introuvable.", type: "error" };
  } finally {
    chargement.value = false;
  }
});

const handleReserver = async () => {
  if (!auth.user) {
    router.push("/connexion");
    return;
  }
  if (nbPlaces.value < 1 || nbPlaces.value > trajet.value.placesDisponibles) return;

  envoi.value = true;
  try {
    const data = await reservationService.creer({ trajet: route.params.id, nombrePlaces: nbPlaces.value });
    etape.value = 2;
    toast.value = { message: "Réservation réussie !", type: "success" };
  } catch (err) {
    toast.value = { message: err.response?.data?.message || "Erreur de réservation.", type: "error" };
  } finally {
    envoi.value = false;
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
</script>

<style scoped>
@keyframes fadeIn { to { opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
