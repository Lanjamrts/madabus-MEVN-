<template>
  <section class="hero">
    <div
      class="hero-content"
    >
      <div class="hero-badge">Transport à Madagascar</div>
      <h1 class="hero-title">
        Réservez votre <span class="green">taxi-brousse</span>
        en toute <span class="red">simplicité</span>
      </h1>
      <p class="hero-subtitle">
        MadaBus connecte les voyageurs aux coopératives de transport
        pour des trajets fiables, sécurisés et confortables à travers Madagascar.
      </p>
      <div class="hero-actions">
        <router-link to="/trajets" class="btn-primary">
          Rechercher un trajet
        </router-link>
        <router-link to="/inscription" class="btn-secondary">
          Créer un compte
        </router-link>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-header fade-up">
      <span class="section-tag">Comment ça marche</span>
      <h2 class="section-title">Réservez en 3 étapes</h2>
      <p class="section-desc">
        Un processus simple et rapide pour voyager en toute sérénité.
      </p>
    </div>

    <div class="steps-grid">
      <div
        v-for="(s, i) in steps"
        :key="s.num"
        class="step-card"
        :style="{ '--delay': `${i * 0.15}s` }"
      >
        <div class="step-number">{{ s.num }}</div>
        <h3>{{ s.title }}</h3>
        <p>{{ s.desc }}</p>
      </div>
    </div>
  </section>

  <section class="section" style="background: #f9fafb">
    <div class="section-header fade-up">
      <span class="section-tag">Pourquoi MadaBus</span>
      <h2 class="section-title">Voyagez en toute confiance</h2>
    </div>

    <div class="features-grid">
      <div
        v-for="(f, i) in features"
        :key="f.title"
        class="feature-card"
        :style="{ '--delay': `${i * 0.1}s` }"
      >
        <div class="feature-icon" :style="{ background: f.bg }">{{ f.icon }}</div>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
      </div>
    </div>
  </section>

  <footer class="footer">
    <img src="/diamora.png" alt="Diamora" style="width:48px;height:48px;object-fit:contain;margin-bottom:0.75rem" />
    <p>Réservation de transport à Madagascar &mdash; &copy; {{ new Date().getFullYear() }}</p>
  </footer>
</template>

<script setup>
import "../styles/home.css";

const steps = [
  { num: "1", title: "Recherchez", desc: "Choisissez votre ville de départ, destination et date." },
  { num: "2", title: "Réservez", desc: "Sélectionnez votre trajet et réservez vos places." },
  { num: "3", title: "Voyagez", desc: "Recevez votre confirmation et embarquez sereinement." },
];

const features = [
  { icon: "🛡️", bg: "#dcfce7", title: "Paiement sécurisé", desc: "MVola, Orange Money, Airtel Money ou espèces." },
  { icon: "📍", bg: "#eff6ff", title: "Trajets vérifiés", desc: "Tous nos trajets sont gérés par des coopératives partenaires." },
  { icon: "📱", bg: "#fef9c3", title: "Confirmation instantanée", desc: "Recevez votre réservation confirmée en temps réel." },
  { icon: "🔄", bg: "#fff1f2", title: "Annulation flexible", desc: "Annulez votre réservation et récupérez vos places." },
];
</script>

<style scoped>
.step-card, .feature-card { transform: translateY(20px); }
</style>
