import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/home.css";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const Accueil = () => {
  return (
    <>
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">Transport à Madagascar</div>
          <h1 className="hero-title">
            Réservez votre <span className="green">taxi-brousse</span>{" "}
            en toute <span className="red">simplicité</span>
          </h1>
          <p className="hero-subtitle">
            MadaBus connecte les voyageurs aux coopératives de transport
            pour des trajets fiables, sécurisés et confortables à travers Madagascar.
          </p>
          <div className="hero-actions">
            <Link to="/trajets" className="btn-primary">
              Rechercher un trajet
            </Link>
            <Link to="/inscription" className="btn-secondary">
              Créer un compte
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="section">
        <motion.div className="section-header" {...fadeUp}>
          <span className="section-tag">Comment ça marche</span>
          <h2 className="section-title">Réservez en 3 étapes</h2>
          <p className="section-desc">
            Un processus simple et rapide pour voyager en toute sérénité.
          </p>
        </motion.div>

        <div className="steps-grid">
          {[
            { num: "1", title: "Recherchez", desc: "Choisissez votre ville de départ, destination et date." },
            { num: "2", title: "Réservez", desc: "Sélectionnez votre trajet et réservez vos places." },
            { num: "3", title: "Voyagez", desc: "Recevez votre confirmation et embarquez sereinement." },
          ].map((s, i) => (
            <motion.div
              key={s.num}
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: "#f9fafb" }}>
        <motion.div className="section-header" {...fadeUp}>
          <span className="section-tag">Pourquoi MadaBus</span>
          <h2 className="section-title">Voyagez en toute confiance</h2>
        </motion.div>

        <div className="features-grid">
          {[
            { icon: "🛡️", bg: "#dcfce7", title: "Paiement sécurisé", desc: "MVola, Orange Money, Airtel Money ou espèces." },
            { icon: "📍", bg: "#eff6ff", title: "Trajets vérifiés", desc: "Tous nos trajets sont gérés par des coopératives partenaires." },
            { icon: "📱", bg: "#fef9c3", title: "Confirmation instantanée", desc: "Recevez votre réservation confirmée en temps réel." },
            { icon: "🔄", bg: "#fff1f2", title: "Annulation flexible", desc: "Annulez votre réservation et récupérez vos places." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">Mada<span>Bus</span></div>
        <p>Réservation de transport à Madagascar &mdash; &copy; {new Date().getFullYear()}</p>
      </footer>
    </>
  );
};

export default Accueil;
