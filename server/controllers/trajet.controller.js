const { validationResult } = require("express-validator");
const Trajet = require("../models/Trajet");

const listerTrajets = async (req, res) => {
  try {
    const {
      villeDepart,
      villeArrivee,
      dateDepart,
      prixMin,
      prixMax,
      typeVehicule,
      places,
      cooperative,
    } = req.query;

    const filtre = { statut: "actif" };

    if (villeDepart) filtre.villeDepart = new RegExp(villeDepart, "i");
    if (villeArrivee) filtre.villeArrivee = new RegExp(villeArrivee, "i");
    if (dateDepart) {
      const debut = new Date(dateDepart);
      debut.setHours(0, 0, 0, 0);
      const fin = new Date(dateDepart);
      fin.setHours(23, 59, 59, 999);
      filtre.dateDepart = { $gte: debut, $lte: fin };
    }
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }
    if (typeVehicule) filtre.typeVehicule = typeVehicule;
    if (places) filtre.placesDisponibles = { $gte: Number(places) };
    if (cooperative) filtre.cooperative = cooperative;

    const trajets = await Trajet.find(filtre)
      .populate("cooperative", "nom prenom nomCooperative telephone email")
      .sort({ dateDepart: 1 });

    res.json({ success: true, count: trajets.length, trajets });
  } catch (error) {
    console.error("Erreur lister trajets:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const obtenirTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id)
      .populate("cooperative", "nom prenom nomCooperative telephone email");

    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet introuvable." });
    }

    res.json({ success: true, trajet });
  } catch (error) {
    console.error("Erreur obtenir trajet:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const creerTrajet = async (req, res) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ success: false, message: "Données invalides", erreurs: erreurs.array() });
    }

    const donnees = { ...req.body, cooperative: req.user._id };
    const trajet = await Trajet.create(donnees);

    res.status(201).json({ success: true, message: "Trajet créé avec succès.", trajet });
  } catch (error) {
    console.error("Erreur création trajet:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const modifierTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet introuvable." });
    }

    if (trajet.cooperative.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    const trajetModifie = await Trajet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Trajet mis à jour.", trajet: trajetModifie });
  } catch (error) {
    console.error("Erreur modification trajet:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const supprimerTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id);
    if (!trajet) {
      return res.status(404).json({ success: false, message: "Trajet introuvable." });
    }

    if (trajet.cooperative.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Action non autorisée." });
    }

    trajet.statut = "annule";
    await trajet.save();

    res.json({ success: true, message: "Trajet annulé." });
  } catch (error) {
    console.error("Erreur suppression trajet:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const mesTrajets = async (req, res) => {
  try {
    const trajets = await Trajet.find({ cooperative: req.user._id }).sort({ dateDepart: -1 });
    res.json({ success: true, count: trajets.length, trajets });
  } catch (error) {
    console.error("Erreur mes trajets:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { listerTrajets, obtenirTrajet, creerTrajet, modifierTrajet, supprimerTrajet, mesTrajets };
