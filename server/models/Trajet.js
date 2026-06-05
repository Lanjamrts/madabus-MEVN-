const mongoose = require("mongoose");

const trajetSchema = new mongoose.Schema(
  {
    cooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La coopérative est obligatoire"],
    },
    titre: {
      type: String,
      required: [true, "Le titre du trajet est obligatoire"],
      trim: true,
    },
    villeDepart: {
      type: String,
      required: [true, "La ville de départ est obligatoire"],
      trim: true,
    },
    villeArrivee: {
      type: String,
      required: [true, "La ville d'arrivée est obligatoire"],
      trim: true,
    },
    dateDepart: {
      type: Date,
      required: [true, "La date de départ est obligatoire"],
    },
    dateArrivee: {
      type: Date,
      required: [true, "La date d'arrivée est obligatoire"],
    },
    heureDepart: {
      type: String,
      required: [true, "L'heure de départ est obligatoire"],
    },
    heureArrivee: {
      type: String,
      required: [true, "L'heure d'arrivée est obligatoire"],
    },
    prix: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [0, "Le prix ne peut pas être négatif"],
    },
    typeVehicule: {
      type: String,
      enum: ["mini-bus", "bus", "taxi-brousse", "voiture"],
      default: "taxi-brousse",
    },
    placesDisponibles: {
      type: Number,
      required: [true, "Le nombre de places est obligatoire"],
      min: [1, "Minimum 1 place"],
    },
    placesTotales: {
      type: Number,
      required: [true, "Le nombre de places totales est obligatoire"],
      min: [1, "Minimum 1 place"],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    statut: {
      type: String,
      enum: ["actif", "annule", "termine"],
      default: "actif",
    },
    villesIntermediaires: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

trajetSchema.index({ villeDepart: 1, villeArrivee: 1, dateDepart: 1 });
trajetSchema.index({ cooperative: 1 });
trajetSchema.index({ statut: 1 });

trajetSchema.methods.toPublic = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model("Trajet", trajetSchema);
