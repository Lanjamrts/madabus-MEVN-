import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../services/admin.service";
import reservationService from "../services/reservation.service";
import trajetService from "../services/trajet.service";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

const statutLabel = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  terminee: "Terminée",
};

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [onglet, setOnglet] = useState("dashboard");
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const charger = async () => {
      setChargement(true);
      try {
        const [statsData, usersData, resData] = await Promise.all([
          adminService.stats(),
          adminService.utilisateurs(),
          reservationService.listerToutes(),
        ]);
        setStats(statsData.stats);
        setUtilisateurs(usersData.utilisateurs);
        setReservations(resData.reservations);
      } catch {
        setToast({ message: "Erreur de chargement.", type: "error" });
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const handleBasculerStatut = async (id) => {
    try {
      await adminService.basculerStatut(id);
      setUtilisateurs((prev) =>
        prev.map((u) => (u._id === id ? { ...u, actif: !u.actif } : u))
      );
      setToast({ message: "Statut mis à jour.", type: "success" });
    } catch {
      setToast({ message: "Erreur.", type: "error" });
    }
  };

  const handleStatutReservation = async (id, statut) => {
    try {
      await reservationService.mettreAJourStatut(id, { statut });
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, statut } : r)));
      setToast({ message: "Statut mis à jour.", type: "success" });
    } catch {
      setToast({ message: "Erreur.", type: "error" });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const roleLabel = { voyageur: "Voyageur", cooperative: "Coopérative", admin: "Admin" };

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
        <h1>Administration</h1>
        <p>Gérez l'ensemble de la plateforme.</p>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="stat-card-header">
            <div className="stat-icon blue">👤</div>
            <h3>Voyageurs</h3>
          </div>
          <div className="stat-value">{stats?.totalVoyageurs || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="stat-card-header">
            <div className="stat-icon green">🏢</div>
            <h3>Coopératives</h3>
          </div>
          <div className="stat-value">{stats?.totalCooperatives || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-card-header">
            <div className="stat-icon yellow">🚐</div>
            <h3>Trajets actifs</h3>
          </div>
          <div className="stat-value">{stats?.totalTrajets || 0}</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="stat-card-header">
            <div className="stat-icon red">🎫</div>
            <h3>Réservations</h3>
          </div>
          <div className="stat-value">{stats?.totalReservations || 0}</div>
        </motion.div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["dashboard", "users", "reservations"].map((tab) => (
          <button
            key={tab}
            className={`btn-action ${onglet === tab ? "green" : "gray"}`}
            onClick={() => setOnglet(tab)}
          >
            {tab === "dashboard" ? "Résumé" : tab === "users" ? "Utilisateurs" : "Réservations"}
          </button>
        ))}
      </div>

      {onglet === "users" && (
        <div className="table-container">
          <div className="table-header"><h2>Utilisateurs</h2></div>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Actif</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.prenom} {u.nom}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.telephone}</td>
                  <td><span className={`badge ${u.role}`}>{roleLabel[u.role]}</span></td>
                  <td>
                    <span className={`badge ${u.actif ? "confirmee" : "annulee"}`}>
                      {u.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <button
                      className={`btn-action ${u.actif ? "red" : "green"}`}
                      onClick={() => handleBasculerStatut(u._id)}
                    >
                      {u.actif ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === "reservations" && (
        <div className="table-container">
          <div className="table-header"><h2>Toutes les réservations</h2></div>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Trajet</th>
                <th>Places</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.voyageur?.prenom} {r.voyageur?.nom}</td>
                  <td>{r.trajet?.titre || "-"}</td>
                  <td>{r.nombrePlaces}</td>
                  <td>{r.montantTotal.toLocaleString()} Ar</td>
                  <td><span className={`badge ${r.statut}`}>{statutLabel[r.statut]}</span></td>
                  <td>
                    <select
                      value={r.statut}
                      onChange={(e) => handleStatutReservation(r._id, e.target.value)}
                      style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="confirmee">Confirmée</option>
                      <option value="annulee">Annulée</option>
                      <option value="terminee">Terminée</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
