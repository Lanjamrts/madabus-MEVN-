import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import trajetService from "../services/trajet.service";
import SkeletonCard from "../components/Skeleton";
import Toast from "../components/Toast";
import "../styles/trajets.css";

const Trajets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trajets, setTrajets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [toast, setToast] = useState(null);

  const [filtres, setFiltres] = useState({
    villeDepart: searchParams.get("villeDepart") || "",
    villeArrivee: searchParams.get("villeArrivee") || "",
    dateDepart: searchParams.get("dateDepart") || "",
    typeVehicule: searchParams.get("typeVehicule") || "",
    prixMin: searchParams.get("prixMin") || "",
    prixMax: searchParams.get("prixMax") || "",
  });

  const chargerTrajets = async (params) => {
    setChargement(true);
    try {
      const data = await trajetService.lister(params);
      setTrajets(data.trajets);
    } catch {
      setToast({ message: "Erreur lors du chargement des trajets.", type: "error" });
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    const params = {};
    Object.entries(filtres).forEach(([k, v]) => { if (v) params[k] = v; });
    chargerTrajets(params);
  }, []);

  const handleFiltre = (e) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  };

  const appliquerFiltres = (e) => {
    e.preventDefault();
    const params = {};
    Object.entries(filtres).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    chargerTrajets(params);
  };

  const reinitialiser = () => {
    setFiltres({ villeDepart: "", villeArrivee: "", dateDepart: "", typeVehicule: "", prixMin: "", prixMax: "" });
    setSearchParams({});
    chargerTrajets({});
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="trajets-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="trajets-header">
        <h1>Trajets disponibles</h1>
        <p>Trouvez le trajet qui vous convient parmi nos nombreuses destinations.</p>
      </div>

      <form className="filtres-bar" onSubmit={appliquerFiltres}>
        <div className="filtre-group">
          <label>Départ</label>
          <input name="villeDepart" placeholder="Antananarivo" value={filtres.villeDepart} onChange={handleFiltre} />
        </div>
        <div className="filtre-group">
          <label>Arrivée</label>
          <input name="villeArrivee" placeholder="Toamasina" value={filtres.villeArrivee} onChange={handleFiltre} />
        </div>
        <div className="filtre-group">
          <label>Date</label>
          <input type="date" name="dateDepart" value={filtres.dateDepart} onChange={handleFiltre} />
        </div>
        <div className="filtre-group">
          <label>Véhicule</label>
          <select name="typeVehicule" value={filtres.typeVehicule} onChange={handleFiltre}>
            <option value="">Tous</option>
            <option value="taxi-brousse">Taxi-brousse</option>
            <option value="mini-bus">Mini-bus</option>
            <option value="bus">Bus</option>
            <option value="voiture">Voiture</option>
          </select>
        </div>
        <div className="filtre-group">
          <label>Prix min</label>
          <input type="number" name="prixMin" placeholder="0" value={filtres.prixMin} onChange={handleFiltre} />
        </div>
        <div className="filtre-group">
          <label>Prix max</label>
          <input type="number" name="prixMax" placeholder="50000" value={filtres.prixMax} onChange={handleFiltre} />
        </div>
        <button type="submit" className="btn-filtre">Filtrer</button>
        <button type="button" className="btn-filtre-reset" onClick={reinitialiser}>Réinitialiser</button>
      </form>

      {chargement ? (
        <div className="trajets-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : trajets.length === 0 ? (
        <div className="empty-state">
          <h3>Aucun trajet trouvé</h3>
          <p>Essayez de modifier vos filtres ou de choisir une autre date.</p>
        </div>
      ) : (
        <motion.div
          className="trajets-grid"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {trajets.map((t, i) => (
            <motion.div
              key={t._id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
            >
              <Link to={`/trajets/${t._id}`} className="trajet-card">
                <div className="trajet-card-img" />
                <div className="trajet-card-body">
                  <div className="trajet-card-header">
                    <span className="trajet-card-title">{t.titre}</span>
                    <span className="trajet-card-price">{t.prix.toLocaleString()} Ar</span>
                  </div>
                  <div className="trajet-card-route">
                    <span className="route-dot green" />
                    <span>{t.villeDepart}</span>
                    <div className="route-line" />
                    <span className="route-dot red" />
                    <span>{t.villeArrivee}</span>
                  </div>
                  <div className="trajet-card-meta">
                    <span>📅 {formatDate(t.dateDepart)}</span>
                    <span>⏰ {t.heureDepart}</span>
                    <span>🚐 {t.typeVehicule}</span>
                  </div>
                  <div className="trajet-card-footer">
                    <span className="trajet-card-coop">{t.cooperative?.nomCooperative || t.cooperative?.nom}</span>
                    <span className="trajet-card-places">{t.placesDisponibles} places</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Trajets;
