import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage : récupérer l'utilisateur si token présent
  useEffect(() => {
    const chargerUser = async () => {
      if (authService.tokenExiste()) {
        try {
          const data = await authService.moi();
          setUser(data.user);
        } catch {
          authService.deconnecter();
        }
      }
      setChargement(false);
    };
    chargerUser();
  }, []);

  const inscrire = async (donnees) => {
    const data = await authService.inscrire(donnees);
    setUser(data.user);
    return data;
  };

  const connecter = async (email, motDePasse) => {
    const data = await authService.connecter(email, motDePasse);
    setUser(data.user);
    return data;
  };

  const deconnecter = () => {
    authService.deconnecter();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, chargement, inscrire, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};