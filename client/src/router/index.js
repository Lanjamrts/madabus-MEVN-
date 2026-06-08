import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Accueil from "../pages/Accueil.vue";

const routes = [
  { path: "/", component: Accueil },
  { path: "/connexion", component: () => import("../pages/Login.vue") },
  { path: "/inscription", component: () => import("../pages/Register.vue") },

  {
    path: "/trajets",
    component: () => import("../pages/Trajets.vue"),
    meta: { roles: ["voyageur"] },
  },
  {
    path: "/trajets/:id",
    component: () => import("../pages/TrajetDetail.vue"),
    meta: { roles: ["voyageur"] },
  },
  {
    path: "/mes-reservations",
    component: () => import("../pages/MesReservations.vue"),
    meta: { roles: ["voyageur"] },
  },
  {
    path: "/dashboard-coop",
    component: () => import("../pages/DashboardCoop.vue"),
    meta: { roles: ["cooperative"] },
  },
  {
    path: "/admin",
    component: () => import("../pages/Admin.vue"),
    meta: { roles: ["admin"] },
  },
  {
    path: "/profil",
    component: () => import("../pages/Profil.vue"),
    meta: { auth: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.auth !== false && to.meta.roles) {
    if (!auth.user) return next("/connexion");
    if (!to.meta.roles.includes(auth.user.role)) return next("/");
  }
  if (to.meta.auth && !auth.user) return next("/connexion");
  next();
});

export default router;
