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
      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategorieActive(cat)}
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
          {loading && <p style={styles.resultText}>Chargement des produits...</p>}

          {error && (
            <p style={{ ...styles.resultText, color: "#dc2626" }}>{error}</p>
          )}

          {!loading && !error && (
            <>
              <p style={styles.resultText}>
                {produitsFiltres.length} produit(s)
              </p>

              <div style={styles.grid}>
                {produitsFiltres.map((produit) => (
                  <Link
                    key={produit.id}
                    to={`/produit/${produit.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={styles.card}>
                      <img
                        src={getImageUrl(produit.image)}
                        alt={produit.nom}
                        style={styles.image}
                      />

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
                            {produit.stock > 0
                              ? "En stock"
                              : "Rupture de stock"}
                          </span>
                        </div>

                        <h3 style={styles.title}>{produit.nom}</h3>

                        <p style={styles.desc}>{produit.description}</p>

                        <p style={styles.ref}>Réf: {produit.reference}</p>

                        <p style={styles.prix}>
                          {Number(produit.prix).toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {produitsFiltres.length === 0 && (
                <p style={styles.resultText}>Aucun produit trouvé.</p>
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