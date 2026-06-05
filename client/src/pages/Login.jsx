import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Login = () => {
  const { connecter } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    try {
      const data = await connecter(form.email, form.motDePasse);
      // Rediriger selon le rôle
      const redirections = {
        voyageur:    "/trajets",
        cooperative: "/dashboard-coop",
        admin:       "/admin",
      };
      navigate(redirections[data.user.role] || "/tableau-de-bord");
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur de connexion. Réessayez.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="mada-flag-bar" />

        <div className="auth-header">
          <img
            src="/diamora.png"
            alt="Diamora"
            className="auth-logo"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="auth-logo-fallback" style={{ display: "none" }}>MB</div>
          <h1 className="auth-app-name">Mada<span>Bus</span></h1>
          <p className="auth-subtitle">Réservation de taxi-brousse à Madagascar</p>
        </div>

        {erreur && <div className="auth-erreur">{erreur}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="exemple@mail.mg"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input
              id="motDePasse"
              type="password"
              name="motDePasse"
              placeholder="••••••••"
              value={form.motDePasse}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-auth" disabled={chargement}>
            {chargement ? <div className="spinner" /> : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ?{" "}
          <Link to="/inscription">Créer un compte</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;