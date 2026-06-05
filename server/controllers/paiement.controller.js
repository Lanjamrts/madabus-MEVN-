const { validationResult } = require("express-validator");
const Paiement = require("../models/Paiement");
const Reservation = require("../models/Reservation");

const creerPaiement = async (req, res) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ success: false, message: "Données invalides", erreurs: erreurs.array() });
    }

    const { reservation: reservationId, montant, methode, operateur, reference } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation introuvable." });
    }

    if (reservation.voyageur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    if (reservation.statutPaiement === "paye") {
      return res.status(400).json({ success: false, message: "Déjà payé." });
    }

    const paiement = await Paiement.create({
      reservation: reservationId,
      voyageur: req.user._id,
      montant,
      methode,
      operateur: operateur || null,
      reference: reference || null,
      statut: "en_attente",
    });

    res.status(201).json({
      success: true,
      message: "Paiement initié. En attente de confirmation.",
      paiement,
    });
  } catch (error) {
    console.error("Erreur création paiement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const confirmerPaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ success: false, message: "Paiement introuvable." });
    }

    paiement.statut = "reussi";
    paiement.datePaiement = new Date();
    await paiement.save();

    const reservation = await Reservation.findById(paiement.reservation);
    if (reservation) {
      reservation.statutPaiement = "paye";
      reservation.statut = "confirmee";
      reservation.paiement = paiement._id;
      await reservation.save();
    }

    res.json({ success: true, message: "Paiement confirmé.", paiement });
  } catch (error) {
    console.error("Erreur confirmation paiement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const mesPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find({ voyageur: req.user._id })
      .populate({
        path: "reservation",
        populate: { path: "trajet", select: "villeDepart villeArrivee dateDepart prix" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: paiements.length, paiements });
  } catch (error) {
    console.error("Erreur mes paiements:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { creerPaiement, confirmerPaiement, mesPaiements };
