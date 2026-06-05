import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../services/admin.service";
import Toast from "../components/Toast";
import "../styles/dashboard.css";

const statutLabel = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  refusee: "Refusée",
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
          adminService.reservations(),
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

  const handleSupprimerUtilisateur = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ? Cette action est irréversible.")) return;
    try {
      await adminService.supprimerUtilisateur(id);
      setUtilisateurs((prev) => prev.filter((u) => u._id !== id));
      setToast({ message: "Utilisateur supprimé.", type: "success" });
    } catch {
      setToast({ message: "Erreur lors de la suppression.", type: "error" });
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
        <p>Supervision de la plateforme.</p>
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
        {["users", "reservations"].map((tab) => (
          <button
            key={tab}
            className={`btn-action ${onglet === tab ? "green" : "gray"}`}
            onClick={() => setOnglet(tab)}
          >
            {tab === "users" ? "Utilisateurs" : "Réservations"}
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
                <th>Statut</th>
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
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button
                        className={`btn-action ${u.actif ? "red" : "green"}`}
                        onClick={() => handleBasculerStatut(u._id)}
                      >
                        {u.actif ? "Désactiver" : "Activer"}
                      </button>
                      {u.role !== "admin" && (
                        <button
                          className="btn-action red"
                          onClick={() => handleSupprimerUtilisateur(u._id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === "reservations" && (
        <div className="table-container">
          <div className="table-header"><h2>Toutes les réservations (lecture seule)</h2></div>
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
                  <th>Paiement</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id}>
                    <td>{r.voyageur?.prenom} {r.voyageur?.nom}</td>
                    <td>{r.trajet?.titre || "-"}</td>
                    <td>{r.nombrePlaces}</td>
                    <td>{r.montantTotal.toLocaleString()} Ar</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.reference || "-"}</td>
                    <td><span className={`badge ${r.statut}`}>{statutLabel[r.statut]}</span></td>
                    <td><span className={`badge ${r.statutPaiement}`}>{r.statutPaiement}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{formatDate(r.createdAt)}</td>
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

export default Admin;
