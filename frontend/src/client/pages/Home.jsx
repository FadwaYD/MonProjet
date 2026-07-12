import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaFlask,
  FaVial,
  FaTools,
  FaTruck,
  FaUsers,
  FaBox,
  FaAward,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:4000";

// Construit l'URL complète de l'image, que l'API renvoie
// déjà une URL complète ou juste un nom de fichier.
function getImageUrl(image) {
  if (!image) return "/placeholder.png"; // image par défaut si aucune image
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${API_BASE_URL}/uploads/${image}`;
}

function Home() {
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();

  // ==========================
  // GET PRODUITS FROM API
  // ==========================
  useEffect(() => {
    fetch("http://localhost:4000/api/produits")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur serveur");
        }
        return res.json();
      })
      .then((data) => {
        console.log("API DATA =>", data);

        if (data.success && Array.isArray(data.data)) {
          setProduits(data.data);
        } else {
          setProduits([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setProduits([]);
      });
  }, []);

  return (
    <>
      {/* petites règles au survol, impossibles en inline style */}
      <style>{`
        .hoverLift { transition: transform .25s ease, box-shadow .25s ease; }
        .hoverLift:hover { transform: translateY(-6px); box-shadow: 0 14px 28px rgba(139,0,0,0.15); }

        .hoverImg { overflow: hidden; }
        .hoverImg img { transition: transform .4s ease; }
        .hoverImg:hover img { transform: scale(1.06); }

        .btnPrimaryHover:hover { background:#a0002f !important; box-shadow:0 8px 20px rgba(179,0,45,0.35); }
        .btnSecondaryHover:hover { background:rgba(255,255,255,0.12) !important; }
        .btnWhiteHover:hover { background:#f2dde1 !important; }
        .btnBorderHover:hover { background:rgba(255,255,255,0.12) !important; }
        .linkHover:hover { text-decoration: underline; }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.overlay}></div>

        <div style={styles.heroContent}>
          <div style={styles.badge}>
            🔬 Leader des solutions biomédicales
          </div>

          <h1 style={styles.title}>
            Votre partenaire
            <br />
            <span style={styles.titlePink}>biomédical de</span>
            <br />
            confiance
          </h1>

          <p style={styles.subtitle}>
            Réactifs, verrerie, produits chimiques et matériel médical.
            Grand Laboratoire vous accompagne depuis plus de 15 ans.
          </p>

          <div style={styles.buttons}>
            <button
              className="btnPrimaryHover"
              style={styles.btnPrimary}
              onClick={() => navigate("/produits")}
            >
              Découvrir nos produits →
            </button>
            <Link to="/contact" className="btnSecondaryHover" style={styles.btnSecondary}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.statsSection}>
        <div style={styles.stats}>
          <div className="hoverLift" style={styles.statCard}>
            <div style={styles.statIconWrap}>
              <FaBox size={26} color="#8b0000" />
            </div>
            <h2 style={styles.statNumber}>{produits?.length || 0}</h2>
            <p style={styles.statLabel}>Produits</p>
          </div>

          <div className="hoverLift" style={styles.statCard}>
            <div style={styles.statIconWrap}>
              <FaUsers size={26} color="#8b0000" />
            </div>
            <h2 style={styles.statNumber}>450</h2>
            <p style={styles.statLabel}>Clients</p>
          </div>

          <div className="hoverLift" style={styles.statCard}>
            <div style={styles.statIconWrap}>
              <FaAward size={26} color="#8b0000" />
            </div>
            <h2 style={styles.statNumber}>15</h2>
            <p style={styles.statLabel}>Ans d'expérience</p>
          </div>

          <div className="hoverLift" style={styles.statCard}>
            <div style={styles.statIconWrap}>
              <FaTruck size={26} color="#8b0000" />
            </div>
            <h2 style={styles.statNumber}>12000</h2>
            <p style={styles.statLabel}>Livraisons</p>
          </div>
        </div>
      </section>

      {/* PRODUITS */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.sectionTitle}>Produits en vedette</h2>
              <p style={styles.sectionSubtitle}>
                Nos produits les plus demandés.
              </p>
            </div>

            <Link to="/produits" className="linkHover" style={styles.link}>
              Voir tout →
            </Link>
          </div>

          <div style={styles.grid}>
            {(produits || []).slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="hoverLift"
                style={{ ...styles.productCard, cursor: "pointer" }}
                onClick={() => navigate(`/produit/${p.id}`)}
              >
                <div className="hoverImg">
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.nom}
                    style={styles.image}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>

                <div style={styles.productBody}>
                  <span style={styles.brand}>{p.marque}</span>

                  <h3 style={styles.productTitle}>{p.nom}</h3>

                  <p style={styles.productDesc}>{p.description}</p>

                  <div style={styles.cardFooter}>
                    <span style={styles.stock}>● En stock</span>
                    <span style={styles.reference}>
                      Réf: {p.reference}
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
          <h2 style={styles.sectionTitleCenter}>Nos services</h2>

          <p style={styles.sectionSubtitleCenter}>
            Solutions complètes pour laboratoires et hôpitaux.
          </p>

          <div style={styles.grid}>
            <div className="hoverLift" style={styles.serviceCard}>
              <div style={styles.serviceIconWrap}>
                <FaFlask color="#8b0000" size={26} />
              </div>
              <h3 style={styles.serviceTitle}>Vente matériel médical</h3>
              <p style={styles.serviceDesc}>Matériel neuf et reconditionné.</p>
            </div>

            <div className="hoverLift" style={styles.serviceCard}>
              <div style={styles.serviceIconWrap}>
                <FaVial color="#8b0000" size={26} />
              </div>
              <h3 style={styles.serviceTitle}>Location matériel</h3>
              <p style={styles.serviceDesc}>Location flexible courte et longue durée.</p>
            </div>

            <div className="hoverLift" style={styles.serviceCard}>
              <div style={styles.serviceIconWrap}>
                <FaFlask color="#8b0000" size={26} />
              </div>
              <h3 style={styles.serviceTitle}>Produits laboratoire</h3>
              <p style={styles.serviceDesc}>Réactifs et verrerie professionnelle.</p>
            </div>

            <div className="hoverLift" style={styles.serviceCard}>
              <div style={styles.serviceIconWrap}>
                <FaTools color="#8b0000" size={26} />
              </div>
              <h3 style={styles.serviceTitle}>Maintenance</h3>
              <p style={styles.serviceDesc}>Support et maintenance technique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Besoin d'un devis ?</h2>
          <p style={styles.ctaSubtitle}>Recevez votre devis sous 24h.</p>

          <div style={styles.ctaButtons}>
            <Link to="/inscription" className="btnWhiteHover" style={styles.btnWhite}>
              Créer un compte
            </Link>
            <Link to="/contact" className="btnBorderHover" style={styles.btnBorder}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ==========================
   STYLES (POLISH, MÊME IDENTITÉ)
========================== */
const styles = {
  hero: {
    minHeight: "100vh",
    paddingTop: "80px",
    background: "linear-gradient(135deg,#4b0012,#78001d,#a0002a)",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 75% 30%, rgba(255,255,255,0.08), transparent 60%)",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1300px",
    margin: "auto",
    padding: "0 80px",
    color: "#fff",
  },

  badge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    marginBottom: "30px",
    fontSize: "0.95rem",
  },

  title: {
    fontSize: "4.5rem",
    fontWeight: "800",
    lineHeight: "1.05",
    marginBottom: "20px",
  },

  titlePink: {
    color: "#f6a7bb",
  },

  subtitle: {
    fontSize: "1.3rem",
    marginBottom: "30px",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "600px",
  },

  buttons: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  btnPrimary: {
    background: "#b3002d",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background .2s ease, box-shadow .2s ease",
  },

  btnSecondary: {
    background: "transparent",
    border: "1px solid white",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    transition: "background .2s ease",
  },

  container: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "0 20px",
  },

  statsSection: {
    marginTop: "40px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },

  statCard: {
    background: "#fff",
    padding: "30px 20px",
    textAlign: "center",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  statIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(139,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },

  statNumber: {
    fontSize: "1.8rem",
    margin: "0 0 4px",
    color: "#1a1a1a",
  },

  statLabel: {
    color: "#666",
    margin: 0,
  },

  section: { padding: "80px 0" },
  sectionGray: { padding: "80px 0", background: "#f7f7f7" },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "16px",
  },

  sectionTitle: { fontSize: "2rem", margin: "0 0 6px" },
  sectionSubtitle: { color: "#666", margin: 0 },

  sectionTitleCenter: {
    textAlign: "center",
    fontSize: "2.2rem",
    marginBottom: "10px",
  },

  sectionSubtitleCenter: {
    textAlign: "center",
    marginBottom: "40px",
    color: "#666",
  },

  link: {
    color: "#8b0000",
    fontWeight: "600",
    textDecoration: "none",
    alignSelf: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "24px",
  },

  productCard: {
    background: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },

  productBody: { padding: "18px" },

  brand: {
    color: "#8b0000",
    fontSize: "0.8rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  productTitle: { fontSize: "18px", margin: "8px 0" },

  productDesc: { color: "#666", fontSize: "0.9rem", lineHeight: "1.5" },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  },

  stock: { color: "green", fontSize: "0.85rem", fontWeight: "600" },

  reference: { fontSize: "12px", color: "#999" },

  serviceCard: {
    background: "#fff",
    padding: "30px 25px",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
  },

  serviceIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    background: "rgba(139,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },

  serviceTitle: { margin: "0 0 8px", fontSize: "1.1rem" },
  serviceDesc: { color: "#666", margin: 0, fontSize: "0.92rem" },

  cta: {
    background: "linear-gradient(135deg,#5a0013,#85001f,#b0002d)",
    color: "#fff",
    textAlign: "center",
    padding: "80px 20px",
  },

  ctaTitle: { fontSize: "2.2rem", margin: "0 0 10px" },
  ctaSubtitle: { color: "rgba(255,255,255,0.85)", marginBottom: "30px" },

  ctaButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  btnWhite: {
    background: "#fff",
    color: "#8b0000",
    padding: "12px 25px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    transition: "background .2s ease",
  },

  btnBorder: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "12px 25px",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
    transition: "background .2s ease",
  },
};

export default Home;