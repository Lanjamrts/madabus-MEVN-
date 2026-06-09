const express = require("express");
const { body } = require("express-validator");
const { inscription, connexion, moi, modifierProfil } = require("../controllers/auth.controller");
const { proteger } = require("../middleware/auth.middleware");

const router = express.Router();

// Validations inscription
const validationInscription = [
  body("nom")
    .trim()
    .notEmpty().withMessage("Le nom est obligatoire")
    .isLength({ min: 2 }).withMessage("Le nom doit avoir au moins 2 caractères"),
  body("prenom")
    .trim()
    .notEmpty().withMessage("Le prénom est obligatoire")
    .isLength({ min: 2 }).withMessage("Le prénom doit avoir au moins 2 caractères"),
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Email invalide"),
  body("telephone")
    .trim()
    .notEmpty().withMessage("Le téléphone est obligatoire")
    .matches(/^(\+261|0)[0-9]{9}$/).withMessage("Numéro malgache invalide (ex: +261341234567)"),
  body("motDePasse")
    .notEmpty().withMessage("Le mot de passe est obligatoire")
    .isLength({ min: 6 }).withMessage("Le mot de passe doit avoir au moins 6 caractères"),
  body("role")
    .optional()
    .isIn(["voyageur", "cooperative"]).withMessage("Rôle invalide"),
];

// Validations connexion
const validationConnexion = [
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage("Email invalide"),
  body("motDePasse")
    .notEmpty().withMessage("Le mot de passe est obligatoire"),
];

// Routes
router.post("/inscription", validationInscription, inscription);
router.post("/connexion",   validationConnexion,   connexion);
router.get("/moi",          proteger,              moi);
router.put("/profil",       proteger,              modifierProfil);

module.exports = router;