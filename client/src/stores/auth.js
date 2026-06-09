import { defineStore } from "pinia";
import { ref } from "vue";
import authService from "../services/auth.service";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const chargement = ref(true);

  const init = async () => {
    if (authService.tokenExiste()) {
      try {
        const data = await authService.moi();
        user.value = data.user;
      } catch {
        authService.deconnecter();
      }
    }
    chargement.value = false;
  };

  const inscrire = async (donnees) => {
    const data = await authService.inscrire(donnees);
    user.value = data.user;
    return data;
  };

  const connecter = async (email, motDePasse) => {
    const data = await authService.connecter(email, motDePasse);
    user.value = data.user;
    return data;
  };

  const modifierProfil = async (donnees) => {
    const data = await authService.modifierProfil(donnees);
    user.value = data.user;
    return data;
  };

  const deconnecter = () => {
    authService.deconnecter();
    user.value = null;
  };

  return { user, chargement, init, inscrire, connecter, modifierProfil, deconnecter };
});
