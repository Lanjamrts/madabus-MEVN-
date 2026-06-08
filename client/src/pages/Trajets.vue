<template>
  <div class="trajets-page">
    <Toast :message="toast?.message" :type="toast?.type" @close="toast = null" />

    <div class="trajets-header">
      <h1>Trajets disponibles</h1>
      <p>Trouvez le trajet qui vous convient parmi nos nombreuses destinations.</p>
    </div>

    <form class="filtres-bar" @submit.prevent="appliquerFiltres">
      <div class="filtre-group">
        <label>Départ</label>
        <input name="villeDepart" placeholder="Antananarivo" v-model="filtres.villeDepart" />
      </div>
      <div class="filtre-group">
        <label>Arrivée</label>
        <input name="villeArrivee" placeholder="Toamasina" v-model="filtres.villeArrivee" />
      </div>
      <div class="filtre-group">
        <label>Date</label>
        <input type="date" name="dateDepart" v-model="filtres.dateDepart" />
      </div>
      <div class="filtre-group">
        <label>Véhicule</label>
        <select name="typeVehicule" v-model="filtres.typeVehicule">
          <option value="">Tous</option>
          <option value="taxi-brousse">Taxi-brousse</option>
          <option value="mini-bus">Mini-bus</option>
          <option value="bus">Bus</option>
          <option value="voiture">Voiture</option>
        </select>
      </div>
      <div class="filtre-group">
        <label>Prix min</label>
        <input type="number" name="prixMin" placeholder="0" v-model="filtres.prixMin" />
      </div>
      <div class="filtre-group">
        <label>Prix max</label>
        <input type="number" name="prixMax" placeholder="50000" v-model="filtres.prixMax" />
      </div>
      <button type="submit" class="btn-filtre">Filtrer</button>
      <button type="button" class="btn-filtre-reset" @click="reinitialiser">Réinitialiser</button>
    </form>

    <div v-if="chargement" class="trajets-grid">
      <div v-for="n in 6" :key="n">
        <SkeletonCard />
      </div>
    </div>

    <div v-else-if="trajets.length === 0" class="empty-state">
      <h3>Aucun trajet trouvé</h3>
      <p>Essayez de modifier vos filtres ou de choisir une autre date.</p>
    </div>

    <div v-else class="trajets-grid">
      <div v-for="t in trajets" :key="t._id" class="trajet-card-wrapper">
        <router-link :to="`/trajets/${t._id}`" class="trajet-card">
          <div class="trajet-card-img" />
          <div class="trajet-card-body">
            <div class="trajet-card-header">
              <span class="trajet-card-title">{{ t.titre }}</span>
              <span class="trajet-card-price">{{ t.prix.toLocaleString() }} Ar</span>
            </div>
            <div class="trajet-card-route">
              <span class="route-dot green" />
              <span>{{ t.villeDepart }}</span>
              <div class="route-line" />
              <span class="route-dot red" />
              <span>{{ t.villeArrivee }}</span>
            </div>
            <div class="trajet-card-meta">
              <span>📅 {{ formatDate(t.dateDepart) }}</span>
              <span>⏰ {{ t.heureDepart }}</span>
              <span>🚐 {{ t.typeVehicule }}</span>
            </div>
            <div class="trajet-card-footer">
              <span class="trajet-card-coop">{{ t.cooperative?.nomCooperative || t.cooperative?.nom }}</span>
              <span class="trajet-card-places">{{ t.placesDisponibles }} places</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import trajetService from "../services/trajet.service";
import SkeletonCard from "../components/Skeleton.vue";
import Toast from "../components/Toast.vue";
import "../styles/trajets.css";

const route = useRoute();
const router = useRouter();

const trajets = ref([]);
const chargement = ref(true);
const toast = ref(null);

const filtres = reactive({
  villeDepart: route.query.villeDepart || "",
  villeArrivee: route.query.villeArrivee || "",
  dateDepart: route.query.dateDepart || "",
  typeVehicule: route.query.typeVehicule || "",
  prixMin: route.query.prixMin || "",
  prixMax: route.query.prixMax || "",
});

const chargerTrajets = async (params) => {
  chargement.value = true;
  try {
    const data = await trajetService.lister(params);
    trajets.value = data.trajets;
  } catch {
    toast.value = { message: "Erreur lors du chargement des trajets.", type: "error" };
  } finally {
    chargement.value = false;
  }
};

onMounted(() => {
  const params = {};
  Object.entries(filtres).forEach(([k, v]) => { if (v) params[k] = v; });
  chargerTrajets(params);
});

const appliquerFiltres = () => {
  const params = {};
  Object.entries(filtres).forEach(([k, v]) => { if (v) params[k] = v; });
  router.replace({ query: params });
  chargerTrajets(params);
};

const reinitialiser = () => {
  Object.assign(filtres, { villeDepart: "", villeArrivee: "", dateDepart: "", typeVehicule: "", prixMin: "", prixMax: "" });
  router.replace({ query: {} });
  chargerTrajets({});
};

const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
</script>
