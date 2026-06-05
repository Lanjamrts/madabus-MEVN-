const express = require("express");
const router = express.Router();
const { proteger, autoriser } = require("../middleware/auth.middleware");
const User = require("../models/User");
const Trajet = require("../models/Trajet");
const Reservation = require("../models/Reservation");

router.use(proteger, autoriser("admin"));

router.get("/stats", async (req, res) => {
  try {
    const [totalVoyageurs, totalCooperatives, totalTrajets, totalReservations] =
      await Promise.all([
        User.countDocuments({ role: "voyageur" }),
        User.countDocuments({ role: "cooperative" }),
        Trajet.countDocuments({ statut: "actif" }),
        Reservation.countDocuments(),
      ]);

    res.json({
      success: true,
      stats: {
        totalVoyageurs,
        totalCooperatives,
        totalTrajets,
        totalReservations,
      },
    });
  } catch (error) {
    console.error("Erreur stats admin:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.get("/utilisateurs", async (req, res) => {
  try {
    const { role, actif } = req.query;
    const filtre = {};
    if (role) filtre.role = role;
    if (actif !== undefined) filtre.actif = actif === "true";

    const users = await User.find(filtre).select("-motDePasse").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, utilisateurs: users });
  } catch (error) {
    console.error("Erreur liste utilisateurs:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.put("/utilisateurs/:id/statut", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Impossible de modifier un admin." });
    }
    user.actif = !user.actif;
    await user.save();
    res.json({ success: true, message: "Statut mis à jour.", utilisateur: user.toPublic() });
  } catch (error) {
    console.error("Erreur statut utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.delete("/utilisateurs/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Impossible de supprimer un admin." });
    }

    if (user.role === "cooperative") {
      await Trajet.updateMany({ cooperative: user._id }, { statut: "annule" });
    }

    await Reservation.deleteMany({ voyageur: user._id });

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: "Utilisateur supprimé." });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

router.get("/reservations", async (req, res) => {
  try {
    const { statut } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;

    const reservations = await Reservation.find(filtre)
      .populate({ path: "trajet", populate: { path: "cooperative", select: "nom prenom nomCooperative" } })
      .populate("voyageur", "nom prenom email telephone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error("Erreur liste réservations admin:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
