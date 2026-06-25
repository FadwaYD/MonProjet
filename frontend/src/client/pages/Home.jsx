import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaFlask,
  FaVial,
  FaTools,
  FaTruck,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaAward,
} from "react-icons/fa";

function Home() {
  const produits = [
    {
      id: 1,
      marque: "Sigma-Aldrich",
      nom: "Acide sulfurique pur 95-97%",
      description: "Acide sulfurique pour analyses",
      ref: "GL-CH-001",
      image:
        "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600",
    },
    {
      id: 2,
      marque: "Duran",
      nom: "Bécher en verre borosilicaté",
      description: "Bécher 250ml borosilicaté",
      ref: "GL-VS-001",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600",
    },
    {
      id: 3,
      marque: "Olympus",
      nom: "Microscope optique",
      description: "Microscope trinoculaire pro",
      ref: "GL-MS-001",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    },
    {
      id: 4,
      marque: "Philips",
      nom: "Défibrillateur DSA",
      description: "Défibrillateur semi-automatique",
      ref: "GL-MM-001",
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600",
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO */}
      {/* HERO */}
<section style={styles.hero}>
  <div style={styles.overlay}></div>

  <div style={styles.heroContent}>
    <div style={styles.badge}>
      🔬 Leader des solutions biomédicales en Afrique de l'Ouest
    </div>

    <h1 style={styles.title}>
      Votre partenaire
      <br />
      <span style={styles.titlePink}>
        biomédical de
      </span>
      <br />
      confiance
    </h1>

    <p style={styles.subtitle}>
      Réactifs, verrerie, produits chimiques et matériel médical.
      Grand Laboratoire vous accompagne avec excellence depuis
      plus de 15 ans.
    </p>

    <div style={styles.buttons}>
      <button style={styles.btnPrimary}>
        Découvrir nos produits →
      </button>

      <button style={styles.btnSecondary}>
        Nous contacter
      </button>
    </div>
  </div>
</section>

      {/* STATS */}
      <section style={styles.statsSection}>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <FaBox size={30} color="#8b0000" />
            <h2>8</h2>
            <p>Produits</p>
          </div>

          <div style={styles.statCard}>
            <FaUsers size={30} color="#8b0000" />
            <h2>450</h2>
            <p>Clients</p>
          </div>

          <div style={styles.statCard}>
            <FaAward size={30} color="#8b0000" />
            <h2>15</h2>
            <p>Ans d'expérience</p>
          </div>

          <div style={styles.statCard}>
            <FaTruck size={30} color="#8b0000" />
            <h2>12000</h2>
            <p>Livraisons</p>
          </div>
        </div>
      </section>

      {/* PRODUITS */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.sectionTitle}>
                Produits en vedette
              </h2>
              <p style={styles.sectionSubtitle}>
                Nos produits les plus demandés par nos clients.
              </p>
            </div>

            <a href="/" style={styles.link}>
              Voir tout →
            </a>
          </div>

          <div style={styles.grid}>
            {produits.map((p) => (
              <div key={p.id} style={styles.productCard}>
                <img
                  src={p.image}
                  alt={p.nom}
                  style={styles.image}
                />

                <div style={styles.productBody}>
                  <span style={styles.brand}>
                    {p.marque}
                  </span>

                  <h3 style={styles.productTitle}>
                    {p.nom}
                  </h3>

                  <p style={styles.productDesc}>
                    {p.description}
                  </p>

                  <div style={styles.cardFooter}>
                    <span style={styles.stock}>
                      En stock
                    </span>

                    <span style={styles.reference}>
                      Réf: {p.ref}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={styles.sectionGray}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>
            Nos services
          </h2>

          <p style={styles.sectionSubtitleCenter}>
            Des solutions complètes pour équiper et maintenir vos
            laboratoires et structures médicales.
          </p>

          <div style={styles.grid}>
            <div style={styles.serviceCard}>
              <div style={styles.iconBox}>
                <FaFlask color="#8b0000" size={28} />
              </div>

              <h3>Vente de matériel médical</h3>

              <p>
                Vente de matériel médical neuf et
                reconditionné de qualité professionnelle.
              </p>
            </div>

            <div style={styles.serviceCard}>
              <div style={styles.iconBox}>
                <FaVial color="#8b0000" size={28} />
              </div>

              <h3>Location de matériel médical</h3>

              <p>
                Location flexible de matériel médical
                pour courts et longs termes.
              </p>
            </div>

            <div style={styles.serviceCard}>
              <div style={styles.iconBox}>
                <FaFlask color="#8b0000" size={28} />
              </div>

              <h3>Produits de laboratoire</h3>

              <p>
                Réactifs, verrerie et consommables de
                laboratoire.
              </p>
            </div>

            <div style={styles.serviceCard}>
              <div style={styles.iconBox}>
                <FaTools color="#8b0000" size={28} />
              </div>

              <h3>Maintenance</h3>

              <p>
                Maintenance préventive et assistance
                technique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={{ marginBottom: "20px" }}>
            Besoin d'un devis personnalisé ?
          </h2>

          <p style={{ marginBottom: "30px" }}>
            Créez votre compte gratuitement et recevez
            un devis sous 24h.
          </p>

          <button style={styles.btnWhite}>
            Créer un compte
          </button>

          <button style={styles.btnBorder}>
            Nous contacter
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

const styles = {

hero: {
  minHeight: "100vh",
  paddingTop: "80px",
  background:
    "linear-gradient(135deg,#4b0012,#78001d,#a0002a)",
  display: "flex",
  alignItems: "center",
},

overlay: {
  position: "absolute",
  inset: 0,

  background: `
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 25%),
    radial-gradient(circle at 70% 20%, rgba(255,255,255,0.05) 0%, transparent 25%),
    radial-gradient(circle at 85% 70%, rgba(255,255,255,0.04) 0%, transparent 25%),
    radial-gradient(circle at 40% 80%, rgba(255,255,255,0.04) 0%, transparent 25%)
  `,
},

heroContent: {
  position: "relative",
  zIndex: 2,
  maxWidth: "1300px",
  width: "100%",
  margin: "0 auto",
  padding: "0 80px",
  color: "#fff",
},

badge: {
  display: "inline-block",
  padding: "10px 18px",
  borderRadius: "30px",
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(10px)",
  fontSize: "14px",
  marginBottom: "30px",
},

title: {
  fontSize: "5.5rem",
  fontWeight: "800",
  lineHeight: "0.95",
  marginBottom: "35px",
  maxWidth: "650px",
},

titlePink: {
  color: "#f6a7bb",
},

subtitle: {
  maxWidth: "650px",
  fontSize: "1.5rem",
  lineHeight: "1.8",
  color: "#f3f4f6",
  marginBottom: "40px",
},

buttons: {
  display: "flex",
  gap: "15px",
},

btnPrimary: {
  background: "#b3002d",
  color: "#fff",
  border: "none",
  padding: "18px 35px",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
},

btnSecondary: {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "#fff",
  padding: "18px 35px",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
},




 

  container: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "0 20px",
  },

  badge: {
    background: "rgba(255,255,255,0.15)",
    padding: "8px 16px",
    borderRadius: "30px",
    display: "inline-block",
    marginBottom: "20px",
  },

  title: {
    fontSize: "4rem",
    fontWeight: "800",
    maxWidth: "650px",
    lineHeight: "1.1",
    marginBottom: "25px",
  },

  subtitle: {
    maxWidth: "650px",
    fontSize: "1.2rem",
    lineHeight: "1.8",
    marginBottom: "30px",
  },

  buttons: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  btnPrimary: {
    background: "#c30039",
    color: "white",
    border: "none",
    padding: "15px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  btnOutline: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "white",
    padding: "15px 28px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  statsSection: {
    marginTop: "40px",
    position: "relative",
    zIndex: 10,
  },

  stats: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    padding: "0 20px",
  },

  statCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
  },

  section: {
    padding: "80px 0",
  },

  sectionGray: {
    padding: "80px 0",
    background: "#f7f7f7",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  sectionTitle: {
    fontSize: "2.3rem",
    color: "#0f172a",
  },

  sectionSubtitle: {
    color: "#64748b",
  },

  sectionTitleCenter: {
    textAlign: "center",
    fontSize: "2.5rem",
  },

  sectionSubtitleCenter: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "50px",
  },

  link: {
    color: "#8b0000",
    textDecoration: "none",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },

  productCard: {
    background: "#fff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },

  productBody: {
    padding: "20px",
  },

  brand: {
    color: "#8b0000",
    fontWeight: "600",
    fontSize: "14px",
  },

  productTitle: {
    marginTop: "10px",
    fontSize: "20px",
  },

  productDesc: {
    color: "#666",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },

  stock: {
    color: "green",
    fontWeight: "600",
  },

  reference: {
    color: "#999",
    fontSize: "13px",
  },

  serviceCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    background: "#fdecef",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },

  cta: {
    background:
      "linear-gradient(135deg,#5a0013,#85001f,#b0002d)",
    color: "white",
    textAlign: "center",
    padding: "100px 20px",
  },

  btnWhite: {
    background: "#fff",
    color: "#8b0000",
    border: "none",
    padding: "15px 28px",
    borderRadius: "10px",
    marginRight: "10px",
    cursor: "pointer",
  },

  btnBorder: {
    background: "transparent",
    border: "1px solid white",
    color: "white",
    padding: "15px 28px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default Home;