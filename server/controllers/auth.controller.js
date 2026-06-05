const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Générer un token JWT
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/inscription
// @desc    Créer un nouveau compte
// @access  Public
const inscription = async (req, res) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        erreurs: erreurs.array(),
      });
    }

    const { nom, prenom, email, telephone, motDePasse, role, nomCooperative } = req.body;

    // Vérifier si l'email existe déjà
    const existeDeja = await User.findOne({ email });
    if (existeDeja) {
      return res.status(409).json({
        success: false,
        message: "Un compte avec cet email existe déjà.",
      });
    }

    // Valider le rôle coopérative
    if (role === "cooperative" && !nomCooperative) {
      return res.status(400).json({
        success: false,
        message: "Le nom de la coopérative est obligatoire.",
      });
    }

    // Le rôle "admin" ne peut pas être choisi à l'inscription
    const roleFinal = role === "admin" ? "voyageur" : role || "voyageur";

    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      motDePasse,
      role: roleFinal,
      nomCooperative: roleFinal === "cooperative" ? nomCooperative : null,
    });

    const token = genererToken(user._id);

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès. Bienvenue sur MadaBus !",
      token,
      user: user.toPublic(),
    });
  } catch (error) {
    console.error("Erreur inscription :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// @route   POST /api/auth/connexion
// @desc    Connexion utilisateur
// @access  Public
const connexion = async (req, res) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        erreurs: erreurs.array(),
      });
    }

    const { email, motDePasse } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select("+motDePasse");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé. Contactez l'administrateur.",
      });
    }

    const motDePasseCorrect = await user.comparerMotDePasse(motDePasse);
    if (!motDePasseCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    // Mettre à jour la dernière connexion
    user.derniereConnexion = new Date();
    await user.save({ validateBeforeSave: false });

    const token = genererToken(user._id);

    res.status(200).json({
      success: true,
      message: `Bienvenue ${user.prenom} !`,
      token,
      user: user.toPublic(),
    });
  } catch (error) {
    console.error("Erreur connexion :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// @route   GET /api/auth/moi
// @desc    Récupérer l'utilisateur connecté
// @access  Privé
const moi = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: user.toPublic(),
    });
  } catch (error) {
    console.error("Erreur profil :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { inscription, connexion, moi };