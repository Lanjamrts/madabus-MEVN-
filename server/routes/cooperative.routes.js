const express = require("express");
const router = express.Router();
const { proteger, autoriser } = require("../middleware/auth.middleware");
const Reservation = require("../models/Reservation");
const Trajet = require("../models/Trajet");

router.use(proteger, autoriser("cooperative"));

router.get("/stats", async (req, res) => {
  try {
    const trajets = await Trajet.find({ cooperative: req.user._id }).select("_id");
    const trajetIds = trajets.map((t) => t._id);

    const [totalTrajets, totalReservations, reservationsEnAttente, reservationsConfirmees] =
      await Promise.all([
        Trajet.countDocuments({ cooperative: req.user._id, statut: "actif" }),
        Reservation.countDocuments({ trajet: { $in: trajetIds } }),
        Reservation.countDocuments({ trajet: { $in: trajetIds }, statut: "en_attente" }),
        Reservation.countDocuments({ trajet: { $in: trajetIds }, statut: "confirmee" }),
      ]);

    res.json({
      success: true,
      stats: {
        totalTrajets,
        totalReservations,
        reservationsEnAttente,
        reservationsConfirmees,
      },
    });
  } catch (error) {
    console.error("Erreur stats coop:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.get("/reservations", async (req, res) => {
  try {
    const trajets = await Trajet.find({ cooperative: req.user._id }).select("_id");
    const trajetIds = trajets.map((t) => t._id);

    const reservations = await Reservation.find({ trajet: { $in: trajetIds } })
      .populate("trajet")
      .populate("voyageur", "nom prenom email telephone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error("Erreur réservations coop:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
