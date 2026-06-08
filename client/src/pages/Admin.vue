<template>
  <div class="dashboard-page">
    <Toast :message="toast?.message" :type="toast?.type" @close="toast = null" />

    <div class="dashboard-header">
      <h1>Administration</h1>
      <p>Supervision de la plateforme.</p>
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
            <div class="stat-icon blue">👤</div>
            <h3>Voyageurs</h3>
          </div>
          <div class="stat-value">{{ stats?.totalVoyageurs || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.05s forwards">
          <div class="stat-card-header">
            <div class="stat-icon green">🏢</div>
            <h3>Coopératives</h3>
          </div>
          <div class="stat-value">{{ stats?.totalCooperatives || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.1s forwards">
          <div class="stat-card-header">
            <div class="stat-icon yellow">🚐</div>
            <h3>Trajets actifs</h3>
          </div>
          <div class="stat-value">{{ stats?.totalTrajets || 0 }}</div>
        </div>
        <div class="stat-card" style="opacity: 0; animation: fadeUp 0.4s 0.15s forwards">
          <div class="stat-card-header">
            <div class="stat-icon red">🎫</div>
            <h3>Réservations</h3>
          </div>
          <div class="stat-value">{{ stats?.totalReservations || 0 }}</div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem">
        <button v-for="tab in ['users', 'reservations']" :key="tab"
          :class="['btn-action', onglet === tab ? 'green' : 'gray']"
          @click="onglet = tab"
        >
          {{ tab === "users" ? "Utilisateurs" : "Réservations" }}
        </button>
      </div>

      <div v-if="onglet === 'users'" class="table-container">
        <div class="table-header"><h2>Utilisateurs</h2></div>
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Statut</th><th>Inscription</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in utilisateurs" :key="u._id">
              <td><strong>{{ u.prenom }} {{ u.nom }}</strong></td>
              <td>{{ u.email }}</td>
              <td>{{ u.telephone }}</td>
              <td><span :class="['badge', u.role]">{{ roleLabel[u.role] }}</span></td>
              <td>
                <span :class="['badge', u.actif ? 'confirmee' : 'annulee']">
                  {{ u.actif ? "Actif" : "Inactif" }}
                </span>
              </td>
              <td style="font-size: 0.8rem">{{ new Date(u.createdAt).toLocaleDateString("fr-FR") }}</td>
              <td>
                <div style="display: flex; gap: 0.25rem">
                  <button :class="['btn-action', u.actif ? 'red' : 'green']" @click="handleBasculerStatut(u._id)">
                    {{ u.actif ? "Désactiver" : "Activer" }}
                  </button>
                  <button v-if="u.role !== 'admin'" class="btn-action red" @click="handleSupprimerUtilisateur(u._id)">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="onglet === 'reservations'" class="table-container">
        <div class="table-header"><h2>Toutes les réservations (lecture seule)</h2></div>
        <div v-if="reservations.length === 0" class="empty-state"><h3>Aucune réservation</h3></div>
        <table v-else>
          <thead>
            <tr>
              <th>Client</th><th>Trajet</th><th>Places</th><th>Total</th><th>Référence</th><th>Statut</th><th>Paiement</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservations" :key="r._id">
              <td>{{ r.voyageur?.prenom }} {{ r.voyageur?.nom }}</td>
              <td>{{ r.trajet?.titre || "-" }}</td>
              <td>{{ r.nombrePlaces }}</td>
              <td>{{ r.montantTotal.toLocaleString() }} Ar</td>
              <td style="font-family: monospace; font-size: 0.8rem">{{ r.reference || "-" }}</td>
              <td><span :class="['badge', r.statut]">{{ statutLabel[r.statut] }}</span></td>
              <td><span :class="['badge', r.statutPaiement]">{{ r.statutPaiement }}</span></td>
              <td style="font-size: 0.8rem">{{ formatDate(r.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import adminService from "../services/admin.service";
import Toast from "../components/Toast.vue";
import "../styles/dashboard.css";

const statutLabel = {
  en_attente: "En attente", confirmee: "Confirmée", annulee: "Annulée",
  refusee: "Refusée", terminee: "Terminée",
};

const roleLabel = { voyageur: "Voyageur", cooperative: "Coopérative", admin: "Admin" };

const stats = ref(null);
const utilisateurs = ref([]);
const reservations = ref([]);
const onglet = ref("dashboard");
const chargement = ref(true);
const toast = ref(null);

onMounted(async () => {
  chargement.value = true;
  try {
    const [statsData, usersData, resData] = await Promise.all([
      adminService.stats(),
      adminService.utilisateurs(),
      adminService.reservations(),
    ]);
    stats.value = statsData.stats;
    utilisateurs.value = usersData.utilisateurs;
    reservations.value = resData.reservations;
  } catch {
    toast.value = { message: "Erreur de chargement.", type: "error" };
  } finally {
    chargement.value = false;
  }
});

const handleBasculerStatut = async (id) => {
  try {
    await adminService.basculerStatut(id);
    utilisateurs.value = utilisateurs.value.map((u) =>
      u._id === id ? { ...u, actif: !u.actif } : u
    );
    toast.value = { message: "Statut mis à jour.", type: "success" };
  } catch {
    toast.value = { message: "Erreur.", type: "error" };
  }
};

const handleSupprimerUtilisateur = async (id) => {
  if (!window.confirm("Supprimer définitivement cet utilisateur ? Cette action est irréversible.")) return;
  try {
    await adminService.supprimerUtilisateur(id);
    utilisateurs.value = utilisateurs.value.filter((u) => u._id !== id);
    toast.value = { message: "Utilisateur supprimé.", type: "success" };
  } catch {
    toast.value = { message: "Erreur lors de la suppression.", type: "error" };
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
</script>

<style scoped>
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
</style>
