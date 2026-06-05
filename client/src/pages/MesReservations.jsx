import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import reservationService from "../services/reservation.service";
import Toast from "../components/Toast";
import TicketModal from "../components/TicketModal";
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

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState(null);
  const [ticketId, setTicketId] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await reservationService.mesReservations();
        setReservations(data.reservations);
      } catch {
        setToast({ message: "Erreur de chargement.", type: "error" });
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const handleAnnuler = async (id) => {
    try {
      await reservationService.annuler(id);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, statut: "annulee" } : r))
      );
      setToast({ message: "Réservation annulée.", type: "success" });
    } catch {
      setToast({ message: "Erreur lors de l'annulation.", type: "error" });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const peutAfficherTicket = (r) => r.statut === "confirmee" || r.statut === "terminee";

  return (
    <div className="dashboard-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {ticketId && <TicketModal reservationId={ticketId} onClose={() => setTicketId(null)} />}

      <div className="dashboard-header">
        <h1>Mes réservations</h1>
        <p>Consultez et gérez vos réservations.</p>
      </div>

      {chargement ? (
        <div className="trajets-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune réservation</h3>
          <p>Vous n'avez pas encore effectué de réservation.</p>
        </div>
      ) : (
        <div className="table-container">
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
              {reservations.map((r) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>
                    <strong>{r.trajet?.titre || "Trajet"}</strong>
                    <br />
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {r.trajet?.villeDepart} → {r.trajet?.villeArrivee}
                    </span>
                  </td>
                  <td>{r.trajet ? formatDate(r.trajet.dateDepart) : "-"}</td>
                  <td>{r.nombrePlaces}</td>
                  <td><strong>{r.montantTotal.toLocaleString()} Ar</strong></td>
                  <td><span className={`badge ${r.statut}`}>{statutLabel[r.statut]}</span></td>
                  <td><span className={`badge ${r.statutPaiement}`}>{statutPaiementLabel[r.statutPaiement]}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                      {peutAfficherTicket(r) && (
                        <button className="btn-action blue" onClick={() => setTicketId(r._id)}>
                          🎫 Ticket
                        </button>
                      )}
                      {r.statut === "en_attente" && (
                        <button className="btn-action red" onClick={() => handleAnnuler(r._id)}>
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MesReservations;
