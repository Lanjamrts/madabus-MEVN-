const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Charger les variables d'environnement
dotenv.config();

// Connexion MongoDB
connectDB();

const app = express();

// ─── Middlewares globaux ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Routes ────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/trajets", require("./routes/trajet.routes"));
app.use("/api/reservations", require("./routes/reservation.routes"));
app.use("/api/paiements", require("./routes/paiement.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/cooperative", require("./routes/cooperative.routes"));

// Route de santé (health check)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚌 MadaBus API est en ligne",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Route 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} introuvable`,
  });
});

// ─── Gestionnaire d'erreurs global ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
  });
});

// ─── Démarrage ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚌 MadaBus API démarré sur http://localhost:${PORT}`);
  console.log(`📌 Environnement : ${process.env.NODE_ENV || "development"}\n`);
});