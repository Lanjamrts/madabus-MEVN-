const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { proteger, autoriser } = require("../middleware/auth.middleware");
const {
  creerReservation,
  mesReservations,
  obtenirReservation,
  annulerReservation,
  listerReservations,
  mettreAJourStatut,
  obtenirTicket,
} = require("../controllers/reservation.controller");

router.post(
  "/",
  proteger,
  autoriser("voyageur"),
  [
    body("trajet").isMongoId().withMessage("Trajet invalide"),
    body("nombrePlaces").isInt({ min: 1 }).withMessage("Minimum 1 place"),
  ],
  creerReservation
);

router.get("/mes-reservations", proteger, autoriser("voyageur"), mesReservations);
router.get("/:id", proteger, obtenirReservation);
router.put("/:id/annuler", proteger, autoriser("voyageur"), annulerReservation);
router.get("/", proteger, autoriser("cooperative", "admin"), listerReservations);
router.put("/:id/statut", proteger, autoriser("cooperative"), mettreAJourStatut);
router.get("/:id/ticket", proteger, autoriser("voyageur"), obtenirTicket);

module.exports = router;
