import api from "./api";

const adminService = {
  stats: async () => {
    const res = await api.get("/admin/stats");
    return res.data;
  },

  utilisateurs: async (params = {}) => {
    const res = await api.get("/admin/utilisateurs", { params });
    return res.data;
  },

  basculerStatut: async (id) => {
    const res = await api.put(`/admin/utilisateurs/${id}/statut`);
    return res.data;
  },
};

export default adminService;
