const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Vérifier le token JWT
const proteger = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Veuillez vous connecter.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-motDePasse");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Token invalide.",
      });
    }

    if (!user.actif) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé. Contactez l'administrateur.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Token invalide." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expirée. Reconnectez-vous." });
    }
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Restreindre selon le rôle
const autoriser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis : ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = { proteger, autoriser };