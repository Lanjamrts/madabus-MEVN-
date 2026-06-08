<template>
  <div class="dashboard-page">
    <Toast :message="toast?.message" :type="toast?.type" @close="toast = null" />

    <div class="dashboard-header">
      <h1>Bienvenue, {{ auth.user?.prenom }}</h1>
      <p>{{ auth.user?.nomCooperative || "Tableau de bord coopérative" }}</p>
    </div>

    <div v-if="chargement" class="stats-grid">
      <div v-for="n in 4" :key="n" class="skeleton-card" style="padding: 1.5rem">
        <div class="skeleton skeleton-title" />
        <div class="skeleton skeleton-text short" style="margin-top: 8px" />
      </div>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s forwards">
          <div class="stat-card-header">
            <div class="stat-icon green">🚐</div>
            <h3>Trajets actifs</h3>
          </div>
          <div class="stat-value">{{ stats?.totalTrajets || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.05s forwards">
          <div class="stat-card-header">
            <div class="stat-icon blue">🎫</div>
            <h3>Total réservations</h3>
          </div>
          <div class="stat-value">{{ stats?.totalReservations || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.1s forwards">
          <div class="stat-card-header">
            <div class="stat-icon yellow">⏳</div>
            <h3>En attente</h3>
          </div>
          <div class="stat-value">{{ stats?.reservationsEnAttente || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.15s forwards">
          <div class="stat-card-header">
            <div class="stat-icon green">✓</div>
            <h3>Confirmées</h3>
          </div>
          <div class="stat-value">{{ stats?.reservationsConfirmees || 0 }}</div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem">
        <button :class="['btn-action', onglet === 'reservations' ? 'green' : 'gray']" @click="onglet = 'reservations'">Réservations</button>
        <button :class="['btn-action', onglet === 'trajets' ? 'green' : 'gray']" @click="onglet = 'trajets'">Mes trajets</button>
        <button class="btn-primary" style="padding: 8px 16px; font-size: 13px; margin-left: auto" @click="showForm = !showForm">
          {{ showForm ? "Fermer" : "+ Nouveau trajet" }}
        </button>
      </div>

      <Transition name="slide">
        <div v-if="showForm" class="stat-card" style="margin-bottom: 1.5rem; overflow: hidden">
          <h3 style="margin-bottom: 1rem">Créer un nouveau trajet</h3>
          <form @submit.prevent="handleCreerTrajet" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
            <div class="form-group" style="grid-column: 1 / -1">
              <label>Titre</label>
              <input name="titre" v-model="form.titre" required placeholder="Ex: Tana - Tamatave Direct" />
            </div>
            <div class="form-group">
              <label>Ville départ</label>
              <input name="villeDepart" v-model="form.villeDepart" required />
            </div>
            <div class="form-group">
              <label>Ville arrivée</label>
              <input name="villeArrivee" v-model="form.villeArrivee" required />
            </div>
            <div class="form-group">
              <label>Date départ</label>
              <input type="date" name="dateDepart" v-model="form.dateDepart" required />
            </div>
            <div class="form-group">
              <label>Date arrivée</label>
              <input type="date" name="dateArrivee" v-model="form.dateArrivee" required />
            </div>
            <div class="form-group">
              <label>Heure départ</label>
              <input type="time" name="heureDepart" v-model="form.heureDepart" required />
            </div>
            <div class="form-group">
              <label>Heure arrivée</label>
              <input type="time" name="heureArrivee" v-model="form.heureArrivee" required />
            </div>
            <div class="form-group">
              <label>Prix (Ar)</label>
              <input type="number" name="prix" v-model="form.prix" required />
            </div>
            <div class="form-group">
              <label>Type véhicule</label>
              <select name="typeVehicule" v-model="form.typeVehicule">
                <option value="taxi-brousse">Taxi-brousse</option>
                <option value="mini-bus">Mini-bus</option>
                <option value="bus">Bus</option>
                <option value="voiture">Voiture</option>
              </select>
            </div>
            <div class="form-group">
              <label>Places totales</label>
              <input type="number" name="placesTotales" v-model="form.placesTotales" required />
            </div>
            <div class="form-group">
              <label>Places disponibles</label>
              <input type="number" name="placesDisponibles" v-model="form.placesDisponibles" required />
            </div>
            <div class="form-group" style="grid-column: 1 / -1">
              <label>Description (optionnelle)</label>
              <textarea name="description" v-model="form.description" rows="3" style="padding: 10px; border: 1.5px solid #e5e7eb; border-radius: 10px; resize: vertical" />
            </div>
            <button type="submit" class="btn-primary" :disabled="envoi" style="justify-self: start">
              {{ envoi ? "Création..." : "Créer le trajet" }}
            </button>
          </form>
        </div>
      </Transition>

      <div v-if="onglet === 'reservations'" class="table-container">
        <div class="table-header"><h2>Réservations reçues</h2></div>
        <div v-if="reservations.length === 0" class="empty-state"><h3>Aucune réservation</h3></div>
        <table v-else>
          <thead>
            <tr>
              <th>Client</th><th>Trajet</th><th>Places</th><th>Total</th><th>Référence</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservations" :key="r._id">
              <td>
                <strong>{{ r.voyageur?.prenom }} {{ r.voyageur?.nom }}</strong>
                <br /><span style="font-size: 0.8rem; color: #6b7280">{{ r.voyageur?.telephone }}</span>
              </td>
              <td>{{ r.trajet?.titre }}<br /><span style="font-size: 0.8rem; color: #6b7280">{{ formatDate(r.trajet?.dateDepart) }}</span></td>
              <td>{{ r.nombrePlaces }}</td>
              <td><strong>{{ r.montantTotal.toLocaleString() }} Ar</strong></td>
              <td style="font-family: monospace; font-size: 0.8rem">{{ r.reference || "-" }}</td>
              <td><span :class="['badge', r.statut]">{{ statutLabel[r.statut] }}</span></td>
              <td>
                <div v-if="r.statut === 'en_attente'" style="display: flex; gap: 0.25rem">
                  <button class="btn-action green" @click="handleStatutReservation(r._id, 'confirmee')">Confirmer</button>
                  <button class="btn-action red" @click="handleStatutReservation(r._id, 'refusee')">Refuser</button>
                </div>
                <button v-if="r.statut === 'confirmee'" class="btn-action blue" @click="handleStatutReservation(r._id, 'terminee')">Terminer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="onglet === 'trajets'" class="table-container">
        <div class="table-header"><h2>Mes trajets</h2></div>
        <div v-if="trajets.length === 0" class="empty-state"><h3>Aucun trajet créé</h3></div>
        <table v-else>
          <thead>
            <tr>
              <th>Titre</th><th>Trajet</th><th>Date</th><th>Prix</th><th>Places</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in trajets" :key="t._id">
              <td><strong>{{ t.titre }}</strong></td>
              <td>{{ t.villeDepart }} → {{ t.villeArrivee }}</td>
              <td>{{ formatDate(t.dateDepart) }}</td>
              <td>{{ t.prix.toLocaleString() }} Ar</td>
              <td>{{ t.placesDisponibles }}/{{ t.placesTotales }}</td>
              <td><span :class="['badge', t.statut]">{{ t.statut }}</span></td>
              <td>
                <button v-if="t.statut === 'actif'" class="btn-action red" @click="handleAnnulerTrajet(t._id)">Annuler</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import cooperativeService from "../services/cooperative.service";
import trajetService from "../services/trajet.service";
import reservationService from "../services/reservation.service";
import Toast from "../components/Toast.vue";
import "../styles/dashboard.css";

const auth = useAuthStore();

const statutLabel = {
  en_attente: "En attente", confirmee: "Confirmée", annulee: "Annulée",
  refusee: "Refusée", terminee: "Terminée",
};

const stats = ref(null);
const reservations = ref([]);
const trajets = ref([]);
const onglet = ref("reservations");
const chargement = ref(true);
const toast = ref(null);
const showForm = ref(false);
const envoi = ref(false);

const form = reactive({
  titre: "", villeDepart: "", villeArrivee: "",
  dateDepart: "", dateArrivee: "", heureDepart: "", heureArrivee: "",
  prix: "", placesDisponibles: "", placesTotales: "",
  typeVehicule: "taxi-brousse", description: "",
});

onMounted(async () => {
  try {
    const [statsData, resData, trajetsData] = await Promise.all([
      cooperativeService.stats(),
      cooperativeService.reservations(),
      trajetService.mesTrajets(),
    ]);
    stats.value = statsData.stats;
    reservations.value = resData.reservations;
    trajets.value = trajetsData.trajets;
  } catch {
    toast.value = { message: "Erreur de chargement.", type: "error" };
  } finally {
    chargement.value = false;
  }
});

const handleCreerTrajet = async (e) => {
  envoi.value = true;
  try {
    const data = await trajetService.creer({ ...form });
    trajets.value = [data.trajet, ...trajets.value];
    showForm.value = false;
    Object.assign(form, { titre: "", villeDepart: "", villeArrivee: "", dateDepart: "", dateArrivee: "", heureDepart: "", heureArrivee: "", prix: "", placesDisponibles: "", placesTotales: "", typeVehicule: "taxi-brousse", description: "" });
    toast.value = { message: "Trajet créé avec succès.", type: "success" };
  } catch (err) {
    toast.value = { message: err.response?.data?.message || "Erreur.", type: "error" };
  } finally {
    envoi.value = false;
  }
};

const handleStatutReservation = async (id, statut) => {
  try {
    const data = await reservationService.mettreAJourStatut(id, { statut });
    reservations.value = reservations.value.map((r) => (r._id === id ? data.reservation : r));
    toast.value = { message: data.message || "Statut mis à jour.", type: "success" };
  } catch (err) {
    toast.value = { message: err.response?.data?.message || "Erreur.", type: "error" };
  }
};

const handleAnnulerTrajet = async (id) => {
  try {
    await trajetService.supprimer(id);
    trajets.value = trajets.value.map((t) => t._id === id ? { ...t, statut: "annule" } : t);
    toast.value = { message: "Trajet annulé.", type: "success" };
  } catch {
    toast.value = { message: "Erreur.", type: "error" };
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
</script>

<style scoped>
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
