const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { proteger, autoriser } = require("../middleware/auth.middleware");
const { creerPaiement, confirmerPaiement, mesPaiements } = require("../controllers/paiement.controller");

router.post(
  "/",
  proteger,
  autoriser("voyageur"),
  [
    body("reservation").isMongoId().withMessage("Réservation invalide"),
    body("montant").isNumeric().withMessage("Montant invalide"),
    body("methode").isIn(["mobile_money", "especes", "virement"]).withMessage("Méthode invalide"),
  ],
  creerPaiement
);

router.put("/:id/confirmer", proteger, autoriser("admin"), confirmerPaiement);
router.get("/mes-paiements", proteger, autoriser("voyageur"), mesPaiements);

module.exports = router;
