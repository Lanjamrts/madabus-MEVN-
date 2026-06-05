const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: [true, "La réservation est obligatoire"],
    },
    voyageur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le voyageur est obligatoire"],
    },
    montant: {
      type: Number,
      required: [true, "Le montant est obligatoire"],
      min: [0, "Le montant ne peut pas être négatif"],
    },
    methode: {
      type: String,
      enum: ["mobile_money", "especes", "virement"],
      required: [true, "La méthode de paiement est obligatoire"],
    },
    operateur: {
      type: String,
      enum: ["mvola", "orange_money", "airtel_money", null],
      default: null,
    },
    reference: {
      type: String,
      trim: true,
    },
    statut: {
      type: String,
      enum: ["en_attente", "reussi", "echoue", "rembourse"],
      default: "en_attente",
    },
    datePaiement: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paiementSchema.index({ reservation: 1 });
paiementSchema.index({ voyageur: 1 });

module.exports = mongoose.model("Paiement", paiementSchema);
