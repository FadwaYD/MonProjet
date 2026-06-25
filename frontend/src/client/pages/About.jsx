import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <>
    <Navbar />
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.badge}>🧪 À propos de nous</div>

        <h1 style={styles.heroTitle}>Grand Laboratoire</h1>

        <p style={styles.heroText}>
          Votre partenaire biomédical de référence en Afrique de l'Ouest
          depuis plus de 15 ans.
        </p>
      </section>

      {/* Histoire */}
      <section style={styles.historySection}>
        <div style={styles.historyText}>
          <h2 style={styles.sectionTitle}>Notre histoire</h2>

          <p>
            Fondée en 2009, Grand Laboratoire est née de la vision de
            professionnels de la santé et de la recherche qui constataient le
            manque d'accès à des produits biomédicaux de qualité.
          </p>

          <p>
            Au fil des années, nous avons construit un réseau de partenaires
            internationaux et développé une expertise logistique reconnue.
          </p>

          <p>
            Aujourd'hui, nous servons plus de 450 clients avec un catalogue de
            plus de 2000 produits.
          </p>
        </div>

        <div style={styles.imageContainer}>
          <img
            src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1000"
            alt="laboratoire"
            style={styles.image}
          />

          <div style={styles.experienceBox}>
            <h2>15+</h2>
            <p>Années d'expérience</p>
          </div>
        </div>
      </section>

      {/* Mission Vision Valeurs */}
      <section style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.icon}>🎯</div>
          <h3>Notre mission</h3>

          <p>
            Fournir aux professionnels de la santé et de la recherche les
            meilleurs produits biomédicaux avec un service irréprochable.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🏅</div>
          <h3>Notre vision</h3>

          <p>
            Devenir le leader incontesté de la distribution biomédicale en
            Afrique de l'Ouest.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>👥</div>
          <h3>Nos valeurs</h3>

          <p>
            Qualité, intégrité, réactivité et innovation guident chacune de nos
            actions.
          </p>
        </div>
      </section>

      {/* Engagements */}
      <section style={styles.engagementSection}>
        <h2 style={styles.sectionTitle}>Nos engagements</h2>

        <p style={styles.subtitle}>
          Des valeurs fortes qui définissent notre identité.
        </p>

        <div style={styles.engagementGrid}>
          <div style={styles.engagementCard}>
            <div style={styles.icon}>🛡️</div>
            <h3>Qualité</h3>
            <p>Produits certifiés et conformes aux normes.</p>
          </div>

          <div style={styles.engagementCard}>
            <div style={styles.icon}>❤️</div>
            <h3>Intégrité</h3>
            <p>Transparence totale dans nos relations.</p>
          </div>

          <div style={styles.engagementCard}>
            <div style={styles.icon}>⚡</div>
            <h3>Réactivité</h3>
            <p>Livraison rapide et assistance continue.</p>
          </div>

          <div style={styles.engagementCard}>
            <div style={styles.icon}>🌐</div>
            <h3>Innovation</h3>
            <p>Veille technologique permanente.</p>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section style={styles.teamSection}>
        <h2 style={styles.sectionTitle}>Notre équipe</h2>

        <p style={styles.subtitle}>
          Des professionnels passionnés à votre service.
        </p>

        <div style={styles.teamGrid}>
          <div style={styles.memberCard}>
            <div style={styles.avatar}>AF</div>
            <h4>Dr. Amadou Faye</h4>
            <p>Directeur Général</p>
          </div>

          <div style={styles.memberCard}>
            <div style={styles.avatar}>AD</div>
            <h4>Mme Aïcha Diallo</h4>
            <p>Directrice Commerciale</p>
          </div>

          <div style={styles.memberCard}>
            <div style={styles.avatar}>IN</div>
            <h4>M. Ibrahim Ndiaye</h4>
            <p>Responsable Logistique</p>
          </div>

          <div style={styles.memberCard}>
            <div style={styles.avatar}>FS</div>
            <h4>Dr. Fatou Sow</h4>
            <p>Responsable Qualité</p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={styles.certificationSection}>
        <h2 style={{ marginBottom: "40px" }}>
          Certifications & Qualité
        </h2>

        <div style={styles.certificationGrid}>
          <div style={styles.certCard}>ISO 9001:2015</div>
          <div style={styles.certCard}>ISO 13485</div>
          <div style={styles.certCard}>Certification CE</div>
          <div style={styles.certCard}>BPF</div>
        </div>
      </section>
      <Footer />
    </>
  );
};

const styles = {
  hero: {
    background: "#751529",
    color: "white",
    textAlign: "center",
    padding: "90px 20px",
  },

  badge: {
    display: "inline-block",
    background: "#8e3346",
    padding: "10px 20px",
    borderRadius: "20px",
    marginBottom: "20px",
  },

  heroTitle: {
    fontSize: "60px",
    marginBottom: "20px",
  },

  heroText: {
    fontSize: "22px",
    maxWidth: "700px",
    margin: "auto",
  },

  historySection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "50px",
    padding: "80px",
    flexWrap: "wrap",
  },

  historyText: {
    flex: 1,
    minWidth: "300px",
    lineHeight: "1.8",
  },

  imageContainer: {
    flex: 1,
    position: "relative",
    minWidth: "300px",
  },

  image: {
    width: "100%",
    borderRadius: "20px",
  },

  experienceBox: {
    position: "absolute",
    bottom: "0",
    left: "0",
    background: "#8b0020",
    color: "white",
    padding: "20px",
    borderRadius: "0 15px 0 15px",
  },

  sectionTitle: {
    fontSize: "40px",
    marginBottom: "20px",
    textAlign: "center",
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "30px",
    padding: "70px",
    background: "#f8f8f8",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "35px",
    marginBottom: "15px",
  },

  engagementSection: {
    padding: "80px",
    textAlign: "center",
  },

  subtitle: {
    color: "#666",
    marginBottom: "40px",
  },

  engagementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },

  engagementCard: {
    padding: "25px",
  },

  teamSection: {
    padding: "80px",
    background: "#fafafa",
    textAlign: "center",
  },

  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "40px",
  },

  memberCard: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#8b0020",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 15px",
    fontWeight: "bold",
  },

  certificationSection: {
    background: "#6b1124",
    color: "white",
    textAlign: "center",
    padding: "80px",
  },

  certificationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
  },

  certCard: {
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "20px",
    borderRadius: "10px",
  },
};

export default About;