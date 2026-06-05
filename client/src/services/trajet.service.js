import api from "./api";

const trajetService = {
  lister: async (params = {}) => {
    const res = await api.get("/trajets", { params });
    return res.data;
  },

  obtenir: async (id) => {
    const res = await api.get(`/trajets/${id}`);
    return res.data;
  },

  creer: async (donnees) => {
    const res = await api.post("/trajets", donnees);
    return res.data;
  },

  modifier: async (id, donnees) => {
    const res = await api.put(`/trajets/${id}`, donnees);
    return res.data;
  },

  supprimer: async (id) => {
    const res = await api.delete(`/trajets/${id}`);
    return res.data;
  },

  mesTrajets: async () => {
    const res = await api.get("/trajets/mes-trajets");
    return res.data;
  },
};

export default trajetService;
