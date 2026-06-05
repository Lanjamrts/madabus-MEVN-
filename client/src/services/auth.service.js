import api from "./api";

const authService = {
  // Inscription
  inscrire: async (donnees) => {
    const res = await api.post("/auth/inscription", donnees);
    if (res.data.token) {
      localStorage.setItem("madabus_token", res.data.token);
    }
    return res.data;
  },

  // Connexion
  connecter: async (email, motDePasse) => {
    const res = await api.post("/auth/connexion", { email, motDePasse });
    if (res.data.token) {
      localStorage.setItem("madabus_token", res.data.token);
    }
    return res.data;
  },

  // Récupérer le profil
  moi: async () => {
    const res = await api.get("/auth/moi");
    return res.data;
  },

  // Déconnexion
  deconnecter: () => {
    localStorage.removeItem("madabus_token");
  },

  // Vérifier si un token existe
  tokenExiste: () => {
    return !!localStorage.getItem("madabus_token");
  },
};

export default authService;