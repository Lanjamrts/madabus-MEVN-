const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    voyageur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le voyageur est obligatoire"],
    },
    trajet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trajet",
      required: [true, "Le trajet est obligatoire"],
    },
    nombrePlaces: {
      type: Number,
      required: [true, "Le nombre de places est obligatoire"],
      min: [1, "Minimum 1 place"],
    },
    montantTotal: {
      type: Number,
      required: [true, "Le montant total est obligatoire"],
      min: [0, "Le montant ne peut pas être négatif"],
    },
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "annulee", "terminee"],
      default: "en_attente",
    },
    statutPaiement: {
      type: String,
      enum: ["impaye", "partiel", "paye", "rembourse"],
      default: "impaye",
    },
    paiement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paiement",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    dateReservation: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ voyageur: 1 });
reservationSchema.index({ trajet: 1 });
reservationSchema.index({ statut: 1 });

reservationSchema.methods.toPublic = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model("Reservation", reservationSchema);
