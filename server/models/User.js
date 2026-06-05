const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: [2, "Le nom doit avoir au moins 2 caractères"],
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est obligatoire"],
      trim: true,
      minlength: [2, "Le prénom doit avoir au moins 2 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    telephone: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire"],
      trim: true,
      match: [/^(\+261|0)[0-9]{9}$/, "Numéro malgache invalide (ex: +261341234567)"],
    },
    motDePasse: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit avoir au moins 6 caractères"],
      select: false, // ne pas retourner le mdp par défaut
    },
    role: {
      type: String,
      enum: ["voyageur", "cooperative", "admin"],
      default: "voyageur",
    },
    // Champ spécifique pour les coopératives
    nomCooperative: {
      type: String,
      trim: true,
      default: null,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    derniereConnexion: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatiques
  }
);

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next();
  const salt = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparerMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

// Retourner l'utilisateur sans le mot de passe
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.motDePasse;
  return obj;
};

module.exports = mongoose.model("User", userSchema);