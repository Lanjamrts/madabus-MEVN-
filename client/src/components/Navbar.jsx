import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, deconnecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [mobileOuvert, setMobileOuvert] = useState(false);

  const handleDeconnexion = () => {
    deconnecter();
    setMenuOuvert(false);
    setMobileOuvert(false);
    navigate("/");
  };

  const roleLabel = {
    voyageur: "Voyageur",
    cooperative: "Coopérative",
    admin: "Administrateur",
  };

  const liens = [];
  if (user?.role === "voyageur") {
    liens.push({ to: "/trajets", label: "Trajets" });
    liens.push({ to: "/mes-reservations", label: "Mes réservations" });
  }
  if (user?.role === "cooperative") {
    liens.push({ to: "/dashboard-coop", label: "Tableau de bord" });
  }
  if (user?.role === "admin") {
    liens.push({ to: "/admin", label: "Administration" });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/diamora.png" alt="Diamora" className="navbar-logo-img" />
          <span className="navbar-logo-text">Mada<span className="navbar-logo-bus">Bus</span></span>
        </Link>

        {/* Hamburger mobile */}
        {user && (
          <button className="hamburger" onClick={() => setMobileOuvert(!mobileOuvert)} aria-label="Menu">
            <span className={`hamburger-line ${mobileOuvert ? "open" : ""}`} />
            <span className={`hamburger-line ${mobileOuvert ? "open" : ""}`} />
            <span className={`hamburger-line ${mobileOuvert ? "open" : ""}`} />
          </button>
        )}

        {/* Menu desktop */}
        <div className="navbar-links">
          {liens.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${isActive(l.to) ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Profil */}
        {user && (
          <div className="navbar-user" onClick={() => setMenuOuvert(!menuOuvert)}>
            <div className="user-avatar">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.prenom} {user?.nom}</span>
              <span className="user-role">{roleLabel[user?.role]}</span>
            </div>
            <svg className={`chevron ${menuOuvert ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>

            <AnimatePresence>
              {menuOuvert && (
                <motion.div
                  className="dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link to="/profil" className="dropdown-item" onClick={() => setMenuOuvert(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Mon profil
                  </Link>
                  <button className="dropdown-item danger" onClick={handleDeconnexion}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!user && (
          <div className="navbar-links" style={{ justifyContent: "flex-end" }}>
            <Link to="/connexion" className="nav-link">Connexion</Link>
            <Link to="/inscription" className="nav-link" style={{ background: "#1a7a3c", color: "white", borderRadius: "10px", padding: "8px 18px" }}>
              Inscription
            </Link>
          </div>
        )}
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOuvert && user && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {liens.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`mobile-link ${isActive(l.to) ? "active" : ""}`}
                onClick={() => setMobileOuvert(false)}
              >
                {l.label}
              </Link>
            ))}
            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0.5rem 0" }} />
            <Link to="/profil" className="mobile-link" onClick={() => setMobileOuvert(false)}>Mon profil</Link>
            <button className="mobile-link danger" onClick={handleDeconnexion}>Déconnexion</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
