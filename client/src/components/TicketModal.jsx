import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import reservationService from "../services/reservation.service";
import Toast from "./Toast";
import "./TicketModal.css";

const TicketModal = ({ reservationId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState(null);
  const ticketRef = useRef();

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await reservationService.obtenirTicket(reservationId);
        setTicket(data.ticket);
      } catch (err) {
        setToast({
          message: err.response?.data?.message || "Ticket non disponible.",
          type: "error",
        });
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [reservationId]);

  const handleImprimer = () => {
    const content = ticketRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket MadaBus - ${ticket.reference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 2rem; color: #111827; }
            .ticket-print { max-width: 500px; margin: 0 auto; border: 2px solid #1a7a3c; border-radius: 20px; padding: 2rem; }
            .ticket-header { text-align: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
            .ticket-title { font-size: 1.5rem; font-weight: 800; color: #1a7a3c; }
            .ticket-title span { color: #c8102e; }
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
              <div class="ticket-title">Mada<span>Bus</span></div>
              <div class="ticket-ref">Réf: ${ticket.reference}</div>
              <span class="badge-confirme">✓ Confirmé</span>
            </div>
            <div class="ticket-info">
              <div class="info-item"><label>Client</label><span>${ticket.voyageur.prenom} ${ticket.voyageur.nom}</span></div>
              <div class="info-item"><label>Trajet</label><span>${ticket.trajet.titre}</span></div>
              <div class="info-item"><label>Départ</label><span>${ticket.trajet.villeDepart}</span></div>
              <div class="info-item"><label>Arrivée</label><span>${ticket.trajet.villeArrivee}</span></div>
              <div class="info-item"><label>Date</label><span>${new Date(ticket.trajet.dateDepart).toLocaleDateString("fr-FR")}</span></div>
              <div class="info-item"><label>Horaire</label><span>${ticket.trajet.heureDepart} - ${ticket.trajet.heureArrivee}</span></div>
              <div class="info-item"><label>Places</label><span>${ticket.nombrePlaces}</span></div>
              <div class="info-item"><label>Total</label><span>${ticket.montantTotal.toLocaleString()} Ar</span></div>
            </div>
            <div class="ticket-qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.reference}" alt="QR Code" />
            </div>
            <div class="ticket-footer">MadaBus - Réservation de transport à Madagascar</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <AnimatePresence>
      <motion.div
        className="ticket-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        <motion.div
          className="ticket-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="ticket-close" onClick={onClose}>✕</button>

          {chargement ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner dark" />
              <p style={{ marginTop: "1rem", color: "#6b7280" }}>Chargement du ticket...</p>
            </div>
          ) : !ticket ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "#c8102e" }}>Ticket non disponible.</p>
            </div>
          ) : (
            <>
              <div className="ticket-content" ref={ticketRef}>
                <div className="ticket-header">
                  <div className="ticket-brand">
                    <img src="/diamora.png" alt="" className="ticket-logo" />
                    <span className="ticket-brand-name">Mada<span>Bus</span></span>
                  </div>
                  <div className="ticket-ref-badge">{ticket.reference}</div>
                  <span className="ticket-badge-confirme">✓ Confirmé</span>
                </div>

                <div className="ticket-passenger">
                  <label>Passager</label>
                  <span>{ticket.voyageur.prenom} {ticket.voyageur.nom}</span>
                </div>

                <div className="ticket-route">
                  <div className="ticket-route-point">
                    <div className="route-dot green" />
                    <div>
                      <label>Départ</label>
                      <span className="ticket-city">{ticket.trajet.villeDepart}</span>
                    </div>
                  </div>
                  <div className="ticket-route-line" />
                  <div className="ticket-route-point">
                    <div className="route-dot red" />
                    <div>
                      <label>Arrivée</label>
                      <span className="ticket-city">{ticket.trajet.villeArrivee}</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-details">
                  <div className="ticket-detail-item">
                    <label>Trajet</label>
                    <span>{ticket.trajet.titre}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <label>Date</label>
                    <span>{formatDate(ticket.trajet.dateDepart)}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <label>Horaire</label>
                    <span>{ticket.trajet.heureDepart} — {ticket.trajet.heureArrivee}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <label>Places</label>
                    <span>{ticket.nombrePlaces}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <label>Coopérative</label>
                    <span>{ticket.trajet.cooperative?.nomCooperative || ticket.trajet.cooperative?.nom}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <label>Total payé</label>
                    <span className="ticket-price">{ticket.montantTotal.toLocaleString()} Ar</span>
                  </div>
                </div>

                <div className="ticket-qr-section">
                  <QRCodeSVG
                    value={ticket.reference}
                    size={130}
                    bgColor="#ffffff"
                    fgColor="#1a7a3c"
                    level="M"
                  />
                  <p className="ticket-qr-label">Scannez ce code pour vérifier votre réservation</p>
                </div>
              </div>

              <div className="ticket-actions">
                <button className="btn-primary" onClick={handleImprimer}>
                  🖨️ Imprimer le ticket
                </button>
                <button className="btn-secondary" onClick={onClose}>
                  Fermer
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketModal;
