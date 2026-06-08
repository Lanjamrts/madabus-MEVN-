<template>
  <div class="dashboard-page">
    <Toast :message="toast?.message" :type="toast?.type" @close="toast = null" />
    <TicketModal v-if="ticketId" :reservation-id="ticketId" @close="ticketId = null" />

    <div class="dashboard-header">
      <h1>Mes réservations</h1>
      <p>Consultez et gérez vos réservations.</p>
    </div>

    <div v-if="chargement" class="trajets-grid">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton skeleton-title" />
        <div class="skeleton skeleton-text" />
      </div>
    </div>

    <div v-else-if="reservations.length === 0" class="empty-state">
      <h3>Aucune réservation</h3>
      <p>Vous n'avez pas encore effectué de réservation.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Trajet</th>
            <th>Date</th>
            <th>Places</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Paiement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reservations" :key="r._id" class="fade-row">
            <td>
              <strong>{{ r.trajet?.titre || "Trajet" }}</strong>
              <br />
              <span style="font-size: 0.8rem; color: #6b7280">
                {{ r.trajet?.villeDepart }} → {{ r.trajet?.villeArrivee }}
              </span>
            </td>
            <td>{{ r.trajet ? formatDate(r.trajet.dateDepart) : "-" }}</td>
            <td>{{ r.nombrePlaces }}</td>
            <td><strong>{{ r.montantTotal.toLocaleString() }} Ar</strong></td>
            <td><span :class="['badge', r.statut]">{{ statutLabel[r.statut] }}</span></td>
            <td><span :class="['badge', r.statutPaiement]">{{ statutPaiementLabel[r.statutPaiement] }}</span></td>
            <td>
              <div style="display: flex; gap: 0.25rem; flex-wrap: wrap">
                <button v-if="peutAfficherTicket(r)" class="btn-action blue" @click="ticketId = r._id">
                  🎫 Ticket
                </button>
                <button v-if="r.statut === 'en_attente'" class="btn-action red" @click="handleAnnuler(r._id)">
                  Annuler
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import reservationService from "../services/reservation.service";
import Toast from "../components/Toast.vue";
import TicketModal from "../components/TicketModal.vue";
import "../styles/dashboard.css";

const statutLabel = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  refusee: "Refusée",
  terminee: "Terminée",
};

const statutPaiementLabel = {
  impaye: "Impayé",
  partiel: "Partiel",
  paye: "Payé",
  rembourse: "Remboursé",
};

const reservations = ref([]);
const chargement = ref(true);
const toast = ref(null);
const ticketId = ref(null);

onMounted(async () => {
  try {
    const data = await reservationService.mesReservations();
    reservations.value = data.reservations;
  } catch {
    toast.value = { message: "Erreur de chargement.", type: "error" };
  } finally {
    chargement.value = false;
  }
});

const handleAnnuler = async (id) => {
  try {
    await reservationService.annuler(id);
    reservations.value = reservations.value.map((r) =>
      r._id === id ? { ...r, statut: "annulee" } : r
    );
    toast.value = { message: "Réservation annulée.", type: "success" };
  } catch {
    toast.value = { message: "Erreur lors de l'annulation.", type: "error" };
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", {
  day: "numeric", month: "long", year: "numeric",
});

const peutAfficherTicket = (r) => r.statut === "confirmee" || r.statut === "terminee";
</script>

<style scoped>
.fade-row {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
