import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "../styles/dashboard.css";

const roleLabel = {
  voyageur: "Voyageur",
  cooperative: "Coopérative",
  admin: "Administrateur",
};

const Profil = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <motion.div
        className="detail-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div
            className="user-avatar"
            style={{
              width: 72,
              height: 72,
              fontSize: 24,
              margin: "0 auto 1rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a7a3c, #c8102e)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            {user.prenom} {user.nom}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {roleLabel[user.role]}
          </p>

          <div style={{ display: "grid", gap: "0.75rem", textAlign: "left" }}>
            {[
              { label: "Email", value: user.email },
              { label: "Téléphone", value: user.telephone },
              { label: "Rôle", value: roleLabel[user.role] },
              ...(user.nomCooperative ? [{ label: "Coopérative", value: user.nomCooperative }] : []),
              { label: "Membre depuis", value: new Date(user.createdAt).toLocaleDateString("fr-FR") },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#f9fafb",
                  borderRadius: 10,
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "#6b7280" }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profil;
