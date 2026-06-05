const { validationResult } = require("express-validator");
const Reservation = require("../models/Reservation");
const Trajet = require("../models/Trajet");

const creerReservation = async (req, res) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ success: false, message: "Données invalides", erreurs: erreurs.array() });
    }

    const { trajet: trajetId, nombrePlaces } = req.body;

    const trajet = await Trajet.findById(trajetId);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet introuvable." });
    }

    if (trajet.statut !== "actif") {
      return res.status(400).json({ success: false, message: "Ce trajet n'est plus disponible." });
    }

    if (trajet.placesDisponibles < nombrePlaces) {
      return res.status(400).json({
        success: false,
        message: `Il ne reste que ${trajet.placesDisponibles} place(s) disponible(s).`,
      });
    }

    const montantTotal = trajet.prix * nombrePlaces;

    const reservation = await Reservation.create({
      voyageur: req.user._id,
      trajet: trajetId,
      nombrePlaces,
      montantTotal,
    });

    trajet.placesDisponibles -= nombrePlaces;
    await trajet.save();

    const reservationComplete = await Reservation.findById(reservation._id)
      .populate("trajet")
      .populate("voyageur", "nom prenom email telephone");

    res.status(201).json({
      success: true,
      message: "Réservation effectuée avec succès.",
      reservation: reservationComplete,
    });
  } catch (error) {
    console.error("Erreur création réservation:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const mesReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ voyageur: req.user._id })
      .populate({
        path: "trajet",
        populate: { path: "cooperative", select: "nom prenom nomCooperative telephone" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error("Erreur mes réservations:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const obtenirReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate({
        path: "trajet",
        populate: { path: "cooperative", select: "nom prenom nomCooperative telephone" },
      })
      .populate("paiement");

    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation introuvable." });
    }

    if (
      reservation.voyageur.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    res.json({ success: true, reservation });
  } catch (error) {
    console.error("Erreur obtenir réservation:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const annulerReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation introuvable." });
    }

    if (
      reservation.voyageur.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    if (reservation.statut === "annulee") {
      return res.status(400).json({ success: false, message: "Réservation déjà annulée." });
    }

    reservation.statut = "annulee";
    await reservation.save();

    const trajet = await Trajet.findById(reservation.trajet);
    if (trajet) {
      trajet.placesDisponibles += reservation.nombrePlaces;
      await trajet.save();
    }

    res.json({ success: true, message: "Réservation annulée.", reservation });
  } catch (error) {
    console.error("Erreur annulation réservation:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const listerReservations = async (req, res) => {
  try {
    const { statut, trajet, voyageur } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;
    if (trajet) filtre.trajet = trajet;
    if (voyageur) filtre.voyageur = voyageur;

    if (req.user.role === "cooperative") {
      const trajets = await Trajet.find({ cooperative: req.user._id }).select("_id");
      const ids = trajets.map((t) => t._id);
      filtre.trajet = filtre.trajet || { $in: ids };
    }

    const reservations = await Reservation.find(filtre)
      .populate({ path: "trajet", populate: { path: "cooperative", select: "nom prenom nomCooperative" } })
      .populate("voyageur", "nom prenom email telephone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    console.error("Erreur lister réservations:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const mettreAJourStatut = async (req, res) => {
  try {
    const { statut, statutPaiement } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation introuvable." });
    }

    if (statut) reservation.statut = statut;
    if (statutPaiement) reservation.statutPaiement = statutPaiement;
    await reservation.save();

    res.json({ success: true, message: "Statut mis à jour.", reservation });
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = {
  creerReservation,
  mesReservations,
  obtenirReservation,
  annulerReservation,
  listerReservations,
  mettreAJourStatut,
};
