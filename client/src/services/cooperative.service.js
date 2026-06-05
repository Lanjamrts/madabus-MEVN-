import api from "./api";

const cooperativeService = {
  stats: async () => {
    const res = await api.get("/cooperative/stats");
    return res.data;
  },

  reservations: async () => {
    const res = await api.get("/cooperative/reservations");
    return res.data;
  },
};

export default cooperativeService;
