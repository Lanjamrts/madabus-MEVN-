import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import trajetService from "../services/trajet.service";
import reservationService from "../services/reservation.service";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

const etapes = ["Trajet", "Réservation", "Confirmation"];

const TrajetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trajet, setTrajet] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [nbPlaces, setNbPlaces] = useState(1);
  const [etape, setEtape] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await trajetService.obtenir(id);
        setTrajet(data.trajet);
      } catch {
        setToast({ message: "Trajet introuvable.", type: "error" });
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [id]);

  const handleReserver = async () => {
    if (!user) {
      navigate("/connexion");
      return;
    }
    if (nbPlaces < 1 || nbPlaces > trajet.placesDisponibles) return;

    setEnvoi(true);
    try {
      const data = await reservationService.creer({ trajet: id, nombrePlaces: nbPlaces });
      setReservation(data.reservation);
      setEtape(2);
      setToast({ message: "Réservation réussie !", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Erreur de réservation.", type: "error" });
    } finally {
      setEnvoi(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  if (chargement) {
    return (
      <div className="detail-page">
        <div className="detail-card">
          <div className="skeleton" style={{ height: 280 }} />
          <div style={{ padding: "2rem" }}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" style={{ marginTop: 12 }} />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div className="detail-page">
        <div className="empty-state">
          <h3>Trajet introuvable</h3>
          <p>Ce trajet n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <motion.div
        className="detail-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="detail-img" />

        <div className="detail-body">
          <div className="detail-header">
            <div>
              <h1 className="detail-title">{trajet.titre}</h1>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 4 }}>
                {trajet.cooperative?.nomCooperative || trajet.cooperative?.nom}
              </p>
            </div>
            <span className="detail-price">{trajet.prix.toLocaleString()} Ar</span>
          </div>

          <div className="detail-info">
            <div className="detail-info-item">
              <label>Départ</label>
              <span>{trajet.villeDepart}</span>
            </div>
            <div className="detail-info-item">
              <label>Arrivée</label>
              <span>{trajet.villeArrivee}</span>
            </div>
            <div className="detail-info-item">
              <label>Date</label>
              <span>{formatDate(trajet.dateDepart)}</span>
            </div>
            <div className="detail-info-item">
              <label>Horaire</label>
              <span>{trajet.heureDepart} - {trajet.heureArrivee}</span>
            </div>
            <div className="detail-info-item">
              <label>Véhicule</label>
              <span>{trajet.typeVehicule}</span>
            </div>
            <div className="detail-info-item">
              <label>Places disponibles</label>
              <span style={{ color: trajet.placesDisponibles > 0 ? "#1a7a3c" : "#c8102e" }}>
                {trajet.placesDisponibles} / {trajet.placesTotales}
              </span>
            </div>
          </div>

          {trajet.description && (
            <p className="detail-desc">{trajet.description}</p>
          )}

          {trajet.villesIntermediaires?.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "0.5rem" }}>Villes intermédiaires</h4>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {trajet.villesIntermediaires.map((v) => (
                  <span key={v} style={{ padding: "4px 12px", background: "#f3f4f6", borderRadius: "8px", fontSize: "0.85rem", color: "#374151" }}>{v}</span>
                ))}
              </div>
            </div>
          )}

          {trajet.statut === "actif" && (
            <div className="reservation-form">
              <div className="stepper">
                {etapes.map((nom, i) => (
                  <div key={nom} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={`step-circle ${i < etape ? "done" : i === etape ? "active" : "pending"}`}>
                        {i < etape ? "✓" : i + 1}
                      </div>
                      <span className={`step-label ${i >= etape && i !== etape ? "pending" : ""}`} style={{ display: i === etape ? "inline" : "none" }}>
                        {nom}
                      </span>
                    </div>
                    {i < etapes.length - 1 && <div className={`step-connector ${i < etape ? "done" : ""}`} />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {etape === 0 && (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3>Réservez vos places</h3>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div className="form-group" style={{ minWidth: 120 }}>
                        <label>Nombre de places</label>
                        <input
                          type="number"
                          min={1}
                          max={trajet.placesDisponibles}
                          value={nbPlaces}
                          onChange={(e) => setNbPlaces(Math.min(Number(e.target.value) || 1, trajet.placesDisponibles))}
                        />
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        Total : <strong style={{ color: "#1a7a3c" }}>{(trajet.prix * nbPlaces).toLocaleString()} Ar</strong>
                      </div>
                    </div>
                    <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => setEtape(1)}>
                      Continuer
                    </button>
                  </motion.div>
                )}

                {etape === 1 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h3>Confirmer la réservation</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "1rem 0", fontSize: "0.9rem" }}>
                      <span style={{ color: "#6b7280" }}>Trajet</span><span style={{ fontWeight: 600 }}>{trajet.titre}</span>
                      <span style={{ color: "#6b7280" }}>Date</span><span style={{ fontWeight: 600 }}>{formatDate(trajet.dateDepart)}</span>
                      <span style={{ color: "#6b7280" }}>Places</span><span style={{ fontWeight: 600 }}>{nbPlaces}</span>
                      <span style={{ color: "#6b7280" }}>Total</span><span style={{ fontWeight: 700, color: "#1a7a3c" }}>{(trajet.prix * nbPlaces).toLocaleString()} Ar</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={() => setEtape(0)}>Retour</button>
                      <button className="btn-primary" disabled={envoi} onClick={handleReserver}>
                        {envoi ? <div className="spinner" style={{ borderTopColor: "rgba(255,255,255,0.4)" }} /> : "Confirmer la réservation"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {etape === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                    <h3 style={{ color: "#1a7a3c", marginBottom: "0.5rem" }}>Réservation confirmée !</h3>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                      Votre réservation est en attente de confirmation.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                      <button className="btn-primary" onClick={() => navigate("/mes-reservations")}>
                        Voir mes réservations
                      </button>
                      <button className="btn-secondary" onClick={() => navigate("/trajets")}>
                        Autres trajets
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrajetDetail;
