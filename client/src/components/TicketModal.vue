<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="!closed" class="ticket-overlay" @click="$emit('close')">
        <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

        <Transition name="modal-inner">
          <div
            class="ticket-modal"
            @click.stop
          >
            <button class="ticket-close" @click="$emit('close')">✕</button>

            <div v-if="chargement" style="padding: 3rem; text-align: center">
              <div class="spinner dark" />
              <p style="margin-top: 1rem; color: #6b7280">Chargement du ticket...</p>
            </div>

            <div v-else-if="!ticket" style="padding: 3rem; text-align: center">
              <p style="color: #c8102e">Ticket non disponible.</p>
            </div>

            <template v-else>
              <div class="ticket-content" ref="ticketRef">
                <div class="ticket-header">
                  <div class="ticket-brand">
                    <img src="/diamora.png" alt="" class="ticket-logo" />
                  </div>
                  <div class="ticket-ref-badge">{{ ticket.reference }}</div>
                  <span class="ticket-badge-confirme">✓ Confirmé</span>
                </div>

                <div class="ticket-passenger">
                  <label>Passager</label>
                  <span>{{ ticket.voyageur.prenom }} {{ ticket.voyageur.nom }}</span>
                </div>

                <div class="ticket-route">
                  <div class="ticket-route-point">
                    <div class="route-dot green" />
                    <div>
                      <label>Départ</label>
                      <span class="ticket-city">{{ ticket.trajet.villeDepart }}</span>
                    </div>
                  </div>
                  <div class="ticket-route-line" />
                  <div class="ticket-route-point">
                    <div class="route-dot red" />
                    <div>
                      <label>Arrivée</label>
                      <span class="ticket-city">{{ ticket.trajet.villeArrivee }}</span>
                    </div>
                  </div>
                </div>

                <div class="ticket-details">
                  <div class="ticket-detail-item">
                    <label>Trajet</label>
                    <span>{{ ticket.trajet.titre }}</span>
                  </div>
                  <div class="ticket-detail-item">
                    <label>Date</label>
                    <span>{{ formatDate(ticket.trajet.dateDepart) }}</span>
                  </div>
                  <div class="ticket-detail-item">
                    <label>Horaire</label>
                    <span>{{ ticket.trajet.heureDepart }} — {{ ticket.trajet.heureArrivee }}</span>
                  </div>
                  <div class="ticket-detail-item">
                    <label>Places</label>
                    <span>{{ ticket.nombrePlaces }}</span>
                  </div>
                  <div class="ticket-detail-item">
                    <label>Coopérative</label>
                    <span>{{ ticket.trajet.cooperative?.nomCooperative || ticket.trajet.cooperative?.nom }}</span>
                  </div>
                  <div class="ticket-detail-item">
                    <label>Total payé</label>
                    <span class="ticket-price">{{ ticket.montantTotal.toLocaleString() }} Ar</span>
                  </div>
                </div>

                <div class="ticket-qr-section">
                  <canvas ref="qrCanvas" />
                  <p class="ticket-qr-label">Scannez ce code pour vérifier votre réservation</p>
                </div>
              </div>

              <div class="ticket-actions">
                <button class="btn-primary" @click="handleImprimer">🖨️ Imprimer le ticket</button>
                <button class="btn-secondary" @click="$emit('close')">Fermer</button>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import QRCode from "qrcode";
import reservationService from "../services/reservation.service";
import Toast from "./Toast.vue";
import "./TicketModal.css";

const props = defineProps({
  reservationId: String,
});
const emit = defineEmits(["close"]);

const ticket = ref(null);
const chargement = ref(true);
const toast = ref(null);
const ticketRef = ref(null);
const qrCanvas = ref(null);
const closed = ref(false);

onMounted(async () => {
  try {
    const data = await reservationService.obtenirTicket(props.reservationId);
    ticket.value = data.ticket;
    await nextTick();
    if (qrCanvas.value && ticket.value?.reference) {
      QRCode.toCanvas(qrCanvas.value, ticket.value.reference, {
        width: 130,
        margin: 1,
        color: { dark: "#1a7a3c", light: "#ffffff" },
      });
    }
  } catch (err) {
    toast.value = {
      message: err.response?.data?.message || "Ticket non disponible.",
      type: "error",
    };
  } finally {
    chargement.value = false;
  }
});

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const handleImprimer = () => {
  const content = ticket.value;
  if (!content) return;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Ticket MadaBus - ${content.reference}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 2rem; color: #111827; }
          .ticket-print { max-width: 500px; margin: 0 auto; border: 2px solid #1a7a3c; border-radius: 20px; padding: 2rem; }
          .ticket-header { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
          .ticket-ref { font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem; }
          .ticket-info { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
          .info-item label { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 0.25rem; }
          .info-item span { font-size: 1rem; font-weight: 600; color: #111827; }
          .ticket-qr { text-align: center; margin: 1.5rem 0; }
          .ticket-footer { text-align: center; font-size: 0.8rem; color: #9ca3af; border-top: 2px dashed #e5e7eb; padding-top: 1rem; }
          .badge-confirme { display: inline-block; padding: 4px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: #dcfce7; color: #166534; }
          @media print { body { padding: 0; } .ticket-print { border: none; } }
        </style>
      </head>
      <body>
        <div class="ticket-print">
          <div class="ticket-header">
            <img src="/diamora.png" alt="" style="width:48px;height:48px;object-fit:contain;margin-bottom:0.5rem" />
            <div class="ticket-ref">Réf: ${content.reference}</div>
            <span class="badge-confirme">✓ Confirmé</span>
          </div>
          <div class="ticket-info">
            <div class="info-item"><label>Client</label><span>${content.voyageur.prenom} ${content.voyageur.nom}</span></div>
            <div class="info-item"><label>Trajet</label><span>${content.trajet.titre}</span></div>
            <div class="info-item"><label>Départ</label><span>${content.trajet.villeDepart}</span></div>
            <div class="info-item"><label>Arrivée</label><span>${content.trajet.villeArrivee}</span></div>
            <div class="info-item"><label>Date</label><span>${new Date(content.trajet.dateDepart).toLocaleDateString("fr-FR")}</span></div>
            <div class="info-item"><label>Horaire</label><span>${content.trajet.heureDepart} - ${content.trajet.heureArrivee}</span></div>
            <div class="info-item"><label>Places</label><span>${content.nombrePlaces}</span></div>
            <div class="info-item"><label>Total</label><span>${content.montantTotal.toLocaleString()} Ar</span></div>
          </div>
          <div class="ticket-qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${content.reference}" alt="QR Code" />
          </div>
          <div class="ticket-footer">Réservation de transport à Madagascar</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
};
</script>
