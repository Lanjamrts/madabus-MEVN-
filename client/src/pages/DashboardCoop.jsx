import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import cooperativeService from "../services/cooperative.service";
import trajetService from "../services/trajet.service";
import reservationService from "../services/reservation.service";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

const statutLabel = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  refusee: "Refusée",
  terminee: "Terminée",
};

const DashboardCoop = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [onglet, setOnglet] = useState("reservations");
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: "", villeDepart: "", villeArrivee: "",
    dateDepart: "", dateArrivee: "", heureDepart: "", heureArrivee: "",
    prix: "", placesDisponibles: "", placesTotales: "",
    typeVehicule: "taxi-brousse", description: "",
  });
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const [statsData, resData, trajetsData] = await Promise.all([
          cooperativeService.stats(),
          cooperativeService.reservations(),
          trajetService.mesTrajets(),
        ]);
        setStats(statsData.stats);
        setReservations(resData.reservations);
        setTrajets(trajetsData.trajets);
      } catch {
        setToast({ message: "Erreur de chargement.", type: "error" });
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreerTrajet = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const data = await trajetService.creer(form);
      setTrajets((prev) => [data.trajet, ...prev]);
      setShowForm(false);
      setForm({ titre: "", villeDepart: "", villeArrivee: "", dateDepart: "", dateArrivee: "", heureDepart: "", heureArrivee: "", prix: "", placesDisponibles: "", placesTotales: "", typeVehicule: "taxi-brousse", description: "" });
      setToast({ message: "Trajet créé avec succès.", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Erreur.", type: "error" });
    } finally {
      setEnvoi(false);
    }
  };

  const handleStatutReservation = async (id, statut) => {
    try {
      const data = await reservationService.mettreAJourStatut(id, { statut });
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? data.reservation : r))
      );
      setToast({ message: data.message || "Statut mis à jour.", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Erreur.", type: "error" });
    }
  };

  const handleAnnulerTrajet = async (id) => {
    try {
      await trajetService.supprimer(id);
      setTrajets((prev) => prev.map((t) => t._id === id ? { ...t, statut: "annule" } : t));
      setToast({ message: "Trajet annulé.", type: "success" });
    } catch {
      setToast({ message: "Erreur.", type: "error" });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long",
  });

  if (chargement) {
    return (
      <div className="dashboard-page">
        <div className="stats-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card" style={{ padding: "1.5rem" }}>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text short" style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="dashboard-header">
        <h1>Bienvenue, {user?.prenom}</h1>
        <p>{user?.nomCooperative || "Tableau de bord coopérative"}</p>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="stat-card-header">
            <div className="stat-icon green">🚐</div>
            <h3>Trajets actifs</h3>
          </div>
          <div className="stat-value">{stats?.totalTrajets || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="stat-card-header">
            <div className="stat-icon blue">🎫</div>
            <h3>Total réservations</h3>
          </div>
          <div className="stat-value">{stats?.totalReservations || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-card-header">
            <div className="stat-icon yellow">⏳</div>
            <h3>En attente</h3>
          </div>
          <div className="stat-value">{stats?.reservationsEnAttente || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="stat-card-header">
            <div className="stat-icon green">✓</div>
            <h3>Confirmées</h3>
          </div>
          <div className="stat-value">{stats?.reservationsConfirmees || 0}</div>
        </motion.div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn-action ${onglet === "reservations" ? "green" : "gray"}`}
          onClick={() => setOnglet("reservations")}
        >
          Réservations
        </button>
        <button
          className={`btn-action ${onglet === "trajets" ? "green" : "gray"}`}
          onClick={() => setOnglet("trajets")}
        >
          Mes trajets
        </button>
        <button
          className="btn-primary"
          style={{ padding: "8px 16px", fontSize: "13px", marginLeft: "auto" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Fermer" : "+ Nouveau trajet"}
        </button>
      </div>

      {showForm && (
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ marginBottom: "1.5rem", overflow: "hidden" }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Créer un nouveau trajet</h3>
          <form onSubmit={handleCreerTrajet} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Titre</label>
              <input name="titre" value={form.titre} onChange={handleChange} required placeholder="Ex: Tana - Tamatave Direct" />
            </div>
            <div className="form-group">
              <label>Ville départ</label>
              <input name="villeDepart" value={form.villeDepart} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ville arrivée</label>
              <input name="villeArrivee" value={form.villeArrivee} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date départ</label>
              <input type="date" name="dateDepart" value={form.dateDepart} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date arrivée</label>
              <input type="date" name="dateArrivee" value={form.dateArrivee} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Heure départ</label>
              <input type="time" name="heureDepart" value={form.heureDepart} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Heure arrivée</label>
              <input type="time" name="heureArrivee" value={form.heureArrivee} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Prix (Ar)</label>
              <input type="number" name="prix" value={form.prix} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Type véhicule</label>
              <select name="typeVehicule" value={form.typeVehicule} onChange={handleChange}>
                <option value="taxi-brousse">Taxi-brousse</option>
                <option value="mini-bus">Mini-bus</option>
                <option value="bus">Bus</option>
                <option value="voiture">Voiture</option>
              </select>
            </div>
            <div className="form-group">
              <label>Places totales</label>
              <input type="number" name="placesTotales" value={form.placesTotales} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Places disponibles</label>
              <input type="number" name="placesDisponibles" value={form.placesDisponibles} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description (optionnelle)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ padding: "10px", border: "1.5px solid #e5e7eb", borderRadius: "10px", resize: "vertical" }} />
            </div>
            <button type="submit" className="btn-primary" disabled={envoi} style={{ justifySelf: "start" }}>
              {envoi ? "Création..." : "Créer le trajet"}
            </button>
          </form>
        </motion.div>
      )}

      {onglet === "reservations" && (
        <div className="table-container">
          <div className="table-header">
            <h2>Réservations reçues</h2>
          </div>
          {reservations.length === 0 ? (
            <div className="empty-state"><h3>Aucune réservation</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Trajet</th>
                  <th>Places</th>
                  <th>Total</th>
                  <th>Référence</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.voyageur?.prenom} {r.voyageur?.nom}</strong>
                      <br /><span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{r.voyageur?.telephone}</span>
                    </td>
                    <td>{r.trajet?.titre}<br /><span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{formatDate(r.trajet?.dateDepart)}</span></td>
                    <td>{r.nombrePlaces}</td>
                    <td><strong>{r.montantTotal.toLocaleString()} Ar</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.reference || "-"}</td>
                    <td><span className={`badge ${r.statut}`}>{statutLabel[r.statut]}</span></td>
                    <td>
                      {r.statut === "en_attente" && (
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button className="btn-action green" onClick={() => handleStatutReservation(r._id, "confirmee")}>Confirmer</button>
                          <button className="btn-action red" onClick={() => handleStatutReservation(r._id, "refusee")}>Refuser</button>
                        </div>
                      )}
                      {r.statut === "confirmee" && (
                        <button className="btn-action blue" onClick={() => handleStatutReservation(r._id, "terminee")}>Terminer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {onglet === "trajets" && (
        <div className="table-container">
          <div className="table-header">
            <h2>Mes trajets</h2>
          </div>
          {trajets.length === 0 ? (
            <div className="empty-state"><h3>Aucun trajet créé</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Trajet</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Places</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trajets.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.titre}</strong></td>
                    <td>{t.villeDepart} → {t.villeArrivee}</td>
                    <td>{formatDate(t.dateDepart)}</td>
                    <td>{t.prix.toLocaleString()} Ar</td>
                    <td>{t.placesDisponibles}/{t.placesTotales}</td>
                    <td><span className={`badge ${t.statut}`}>{t.statut}</span></td>
                    <td>
                      {t.statut === "actif" && (
                        <button className="btn-action red" onClick={() => handleAnnulerTrajet(t._id)}>Annuler</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardCoop;
