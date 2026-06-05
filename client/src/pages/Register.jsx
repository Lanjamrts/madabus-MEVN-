import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Register = () => {
  const { inscrire } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "",
    telephone: "", motDePasse: "",
    role: "voyageur", nomCooperative: "",
  });
  const [erreur, setErreur]       = useState("");
  const [erreurs, setErreurs]     = useState({});
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreurs({ ...erreurs, [e.target.name]: "" });
    setErreur("");
  };

  const valider = () => {
    const e = {};
    if (!form.nom.trim())        e.nom        = "Nom obligatoire";
    if (!form.prenom.trim())     e.prenom     = "Prénom obligatoire";
    if (!form.email.trim())      e.email      = "Email obligatoire";
    if (!form.telephone.trim())  e.telephone  = "Téléphone obligatoire";
    if (form.motDePasse.length < 6) e.motDePasse = "6 caractères minimum";
    if (form.role === "cooperative" && !form.nomCooperative.trim())
      e.nomCooperative = "Nom de coopérative obligatoire";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = valider();
    if (Object.keys(e_).length > 0) { setErreurs(e_); return; }
    setChargement(true);
    setErreur("");
    try {
      await inscrire(form);
      navigate(form.role === "cooperative" ? "/dashboard-coop" : "/trajets");
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'inscription.");
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
          <p className="auth-subtitle">Créer votre compte</p>
        </div>

        {erreur && <div className="auth-erreur">{erreur}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input name="nom" placeholder="Rakoto" value={form.nom} onChange={handleChange} className={erreurs.nom ? "erreur" : ""} />
              {erreurs.nom && <span className="msg-erreur">{erreurs.nom}</span>}
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input name="prenom" placeholder="Jean" value={form.prenom} onChange={handleChange} className={erreurs.prenom ? "erreur" : ""} />
              {erreurs.prenom && <span className="msg-erreur">{erreurs.prenom}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="exemple@mail.mg" value={form.email} onChange={handleChange} className={erreurs.email ? "erreur" : ""} />
            {erreurs.email && <span className="msg-erreur">{erreurs.email}</span>}
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input name="telephone" placeholder="+261341234567" value={form.telephone} onChange={handleChange} className={erreurs.telephone ? "erreur" : ""} />
            {erreurs.telephone && <span className="msg-erreur">{erreurs.telephone}</span>}
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="motDePasse" placeholder="6 caractères minimum" value={form.motDePasse} onChange={handleChange} className={erreurs.motDePasse ? "erreur" : ""} />
            {erreurs.motDePasse && <span className="msg-erreur">{erreurs.motDePasse}</span>}
          </div>

          <div className="form-group">
            <label>Je suis</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="voyageur">Voyageur</option>
              <option value="cooperative">Coopérative de transport</option>
            </select>
          </div>

          {form.role === "cooperative" && (
            <div className="form-group">
              <label>Nom de la coopérative</label>
              <input name="nomCooperative" placeholder="Ex: Cotisse Transport" value={form.nomCooperative} onChange={handleChange} className={erreurs.nomCooperative ? "erreur" : ""} />
              {erreurs.nomCooperative && <span className="msg-erreur">{erreurs.nomCooperative}</span>}
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={chargement}>
            {chargement ? <div className="spinner" /> : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ?{" "}
          <Link to="/connexion">Se connecter</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;