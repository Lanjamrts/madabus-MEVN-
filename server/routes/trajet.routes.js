const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { proteger, autoriser } = require("../middleware/auth.middleware");
const {
  listerTrajets,
  obtenirTrajet,
  creerTrajet,
  modifierTrajet,
  supprimerTrajet,
  mesTrajets,
} = require("../controllers/trajet.controller");

router.get("/", listerTrajets);
router.get("/mes-trajets", proteger, autoriser("cooperative"), mesTrajets);
router.get("/:id", obtenirTrajet);

router.post(
  "/",
  proteger,
  autoriser("cooperative", "admin"),
  [
    body("titre").notEmpty().withMessage("Le titre est obligatoire"),
    body("villeDepart").notEmpty().withMessage("La ville de départ est obligatoire"),
    body("villeArrivee").notEmpty().withMessage("La ville d'arrivée est obligatoire"),
    body("dateDepart").isISO8601().withMessage("Date de départ invalide"),
    body("dateArrivee").isISO8601().withMessage("Date d'arrivée invalide"),
    body("heureDepart").notEmpty().withMessage("L'heure de départ est obligatoire"),
    body("heureArrivee").notEmpty().withMessage("L'heure d'arrivée est obligatoire"),
    body("prix").isNumeric().withMessage("Le prix doit être un nombre"),
    body("placesDisponibles").isInt({ min: 1 }).withMessage("Minimum 1 place"),
    body("placesTotales").isInt({ min: 1 }).withMessage("Minimum 1 place"),
  ],
  creerTrajet
);

router.put("/:id", proteger, autoriser("cooperative", "admin"), modifierTrajet);
router.delete("/:id", proteger, autoriser("cooperative", "admin"), supprimerTrajet);

module.exports = router;
