import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:4000/api/produits";

function Produits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categorieActive, setCategorieActive] = useState("Tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des produits");
        return res.json();
      })
      .then((data) => {
        // Protection : on vérifie que data.data est bien un tableau
        if (data.success && Array.isArray(data.data)) {
          setProduits(data.data);
        } else {
          console.error("Réponse API inattendue:", data);
          setError("Impossible de charger les produits");
          setProduits([]); // évite tout undefined
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur serveur, réessayez plus tard");
        setProduits([]); // évite tout undefined
        setLoading(false);
      });
  }, []);

  // Génère la liste des catégories (statut) dynamiquement depuis les produits
  const categories = [
    "Tous",
    ...Array.from(new Set((produits || []).map((p) => p.statut))).filter(Boolean),
  ];

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600x400?text=Produit";
    return image; // déjà une URL complète venant du backend
  };

  const produitsFiltres = (produits || []).filter((produit) => {
    const categorieOk =
      categorieActive === "Tous" || produit.statut === categorieActive;

    const rechercheOk =
      produit.nom?.toLowerCase().includes(search.toLowerCase()) ||
      produit.marque?.toLowerCase().includes(search.toLowerCase());

    return categorieOk && rechercheOk;
  });

  return (
    <>
      {/* Animations globales de la page */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes dotPulse {
          0% { box-shadow: 0 0 0 0 rgba(21,128,61,0.45); }
          70% { box-shadow: 0 0 0 6px rgba(21,128,61,0); }
          100% { box-shadow: 0 0 0 0 rgba(21,128,61,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .hero-anim {
          animation: heroFadeIn 0.6s ease-out both;
        }

        .search-input {
          transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
        }
        .search-input:focus {
          border-color: #8b0020 !important;
          box-shadow: 0 0 0 4px rgba(139,0,32,0.12);
          outline: none;
        }

        .category-btn {
          transition: background 0.25s ease, color 0.25s ease, transform 0.15s ease, box-shadow 0.25s ease;
        }
        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .category-btn:active {
          transform: translateY(0) scale(0.97);
        }

        .product-card {
          opacity: 0;
          animation: cardRise 0.55s ease-out forwards;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 30px rgba(0,0,0,0.14);
        }
        .product-card:hover .product-image {
          transform: scale(1.06);
        }
        .product-card:hover .product-prix {
          color: #6f1528;
        }

        .product-image-wrap {
          overflow: hidden;
        }
        .product-image {
          transition: transform 0.5s ease;
          display: block;
        }

        .stock-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #15803d;
          margin-right: 6px;
          animation: dotPulse 2s infinite;
        }

        .prix-anim {
          transition: color 0.3s ease;
        }

        .skeleton-card {
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          animation: cardRise 0.5s ease-out forwards;
        }
        .skeleton-block {
          background: linear-gradient(90deg, #eef0f2 25%, #f7f8f9 37%, #eef0f2 63%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .spinner-ring {
          width: 34px;
          height: 34px;
          border: 3px solid #f1d9de;
          border-top-color: #8b0020;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 14px;
        }

        .fade-in-text {
          animation: fadeIn 0.4s ease-out both;
        }

        .empty-state {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={styles.hero} className="hero-anim">
        <div style={styles.container}>
          <h1>Nos produits</h1>
          <p>
            Découvrez notre catalogue complet de réactifs, verrerie et
            matériel biomédical.
          </p>
        </div>
      </section>

      {/* FILTRE */}
      <section style={styles.filterSection}>
        <div style={styles.container}>
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Rechercher..."
              style={styles.search}
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategorieActive(cat)}
                  className="category-btn"
                  style={{
                    ...styles.categoryBtn,
                    background: categorieActive === cat ? "#8b0020" : "#f3f4f6",
                    color: categorieActive === cat ? "white" : "#334155",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LISTE */}
      <section style={styles.productsSection}>
        <div style={styles.container}>
          {loading && (
            <>
              <div style={{ ...styles.resultText, display: "flex", alignItems: "center" }}>
                <span className="spinner-ring" style={{ marginRight: 10, marginBottom: 0 }}></span>
                Chargement des produits...
              </div>
              <div style={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="skeleton-block" style={{ width: "100%", height: "220px" }} />
                    <div style={{ padding: "15px" }}>
                      <div className="skeleton-block" style={{ width: "40%", height: "12px", borderRadius: 4, marginBottom: 10 }} />
                      <div className="skeleton-block" style={{ width: "80%", height: "16px", borderRadius: 4, marginBottom: 10 }} />
                      <div className="skeleton-block" style={{ width: "60%", height: "12px", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && (
            <p className="fade-in-text" style={{ ...styles.resultText, color: "#dc2626" }}>{error}</p>
          )}

          {!loading && !error && (
            <>
              <p className="fade-in-text" style={styles.resultText}>
                {produitsFiltres.length} produit(s)
              </p>

              <div style={styles.grid}>
                {produitsFiltres.map((produit, idx) => (
                  <Link
                    key={produit.id}
                    to={`/produit/${produit.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="product-card"
                      style={{ ...styles.card, animationDelay: `${Math.min(idx, 10) * 0.06}s` }}
                    >
                      <div className="product-image-wrap">
                        <img
                          src={getImageUrl(produit.image)}
                          alt={produit.nom}
                          style={styles.image}
                          className="product-image"
                        />
                      </div>

                      <div style={styles.body}>
                        <div style={styles.header}>
                          <span style={styles.marque}>{produit.marque}</span>

                          <span
                            style={{
                              ...styles.stock,
                              background:
                                produit.stock > 0 ? "#dcfce7" : "#fee2e2",
                              color:
                                produit.stock > 0 ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {produit.stock > 0 && <span className="stock-dot"></span>}
                            {produit.stock > 0
                              ? "En stock"
                              : "Rupture de stock"}
                          </span>
                        </div>

                        <h3 style={styles.title}>{produit.nom}</h3>

                        <p style={styles.desc}>{produit.description}</p>

                        <p style={styles.ref}>Réf: {produit.reference}</p>

                        <p style={styles.prix} className="product-prix prix-anim">
                          {Number(produit.prix).toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {produitsFiltres.length === 0 && (
                <p className="empty-state" style={styles.resultText}>Aucun produit trouvé.</p>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

const styles = {
  hero: {
    background: "#6f1528",
    color: "white",
    padding: "70px 0",
  },

  container: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "0 20px",
  },

  filterSection: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "15px 0",
  },

  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  search: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "250px",
  },

  categories: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
  },

  categoryBtn: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  productsSection: {
    padding: "40px 0 80px",
  },

  resultText: {
    marginBottom: "20px",
    color: "#64748b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },

  card: {
    background: "#fff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },

  body: {
    padding: "15px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  marque: {
    color: "#8b0020",
    fontSize: "14px",
  },

  stock: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
  },

  title: {
    marginBottom: "10px",
    color: "#0f172a",
  },

  desc: {
    color: "#64748b",
    marginBottom: "10px",
  },

  ref: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "5px",
  },

  prix: {
    color: "#8b0020",
    fontWeight: "bold",
    fontSize: "16px",
  },
};

export default Produits;