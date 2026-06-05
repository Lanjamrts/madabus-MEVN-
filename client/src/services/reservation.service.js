import api from "./api";

const reservationService = {
  creer: async (donnees) => {
    const res = await api.post("/reservations", donnees);
    return res.data;
  },

  mesReservations: async () => {
    const res = await api.get("/reservations/mes-reservations");
    return res.data;
  },

  obtenir: async (id) => {
    const res = await api.get(`/reservations/${id}`);
    return res.data;
  },

  annuler: async (id) => {
    const res = await api.put(`/reservations/${id}/annuler`);
    return res.data;
  },

  listerToutes: async (params = {}) => {
    const res = await api.get("/reservations", { params });
    return res.data;
  },

  mettreAJourStatut: async (id, donnees) => {
    const res = await api.put(`/reservations/${id}/statut`, donnees);
    return res.data;
  },
};

export default reservationService;
