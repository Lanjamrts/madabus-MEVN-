import api from "./api";

const paiementService = {
  creer: async (donnees) => {
    const res = await api.post("/paiements", donnees);
    return res.data;
  },

  confirmer: async (id) => {
    const res = await api.put(`/paiements/${id}/confirmer`);
    return res.data;
  },

  mesPaiements: async () => {
    const res = await api.get("/paiements/mes-paiements");
    return res.data;
  },
};

export default paiementService;
