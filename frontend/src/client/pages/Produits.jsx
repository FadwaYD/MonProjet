import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function Produits() {
  const produits = [
    {
      id: 1,
      marque: "Sigma-Aldrich",
      nom: "Acide sulfurique pur 95-97%",
      description: "Acide sulfurique pour analyses",
      ref: "GL-CH-001",
      categorie: "Produits chimiques",
      image:
        "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600",
    },
    {
      id: 2,
      marque: "Duran",
      nom: "Bécher en verre borosilicaté",
      description: "Bécher 250ml borosilicaté",
      ref: "GL-VS-001",
      categorie: "Verrerie scientifique",
      image:
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600",
    },
    {
      id: 3,
      marque: "Philips",
      nom: "Défibrillateur automatique DSA",
      description: "Défibrillateur semi-automatique",
      ref: "GL-MM-001",
      categorie: "Matériels médicaux",
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600",
    },
    {
      id: 4,
      marque: "Merck",
      nom: "Éthanol absolu 99.8%",
      description: "Éthanol absolu 99.8%",
      ref: "GL-CH-002",
      categorie: "Produits chimiques",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
    },
    {
      id: 5,
      marque: "Olympus",
      nom: "Microscope optique",
      description: "Microscope professionnel",
      ref: "GL-MS-001",
      categorie: "Matériels scientifiques",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    },
  ];

  const categories = [
    "Tous",
    "Réactifs de laboratoire",
    "Produits chimiques",
    "Verrerie scientifique",
    "Consommables médicaux",
    "Matériels scientifiques",
    "Matériels médicaux",
  ];

  const [categorieActive, setCategorieActive] = useState("Tous");
  const [search, setSearch] = useState("");

  const produitsFiltres = produits.filter((produit) => {
    const categorieOk =
      categorieActive === "Tous" ||
      produit.categorie === categorieActive;

    const rechercheOk =
      produit.nom.toLowerCase().includes(search.toLowerCase()) ||
      produit.marque.toLowerCase().includes(search.toLowerCase());

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
            Découvrez notre catalogue complet de réactifs,
            verrerie et matériel biomédical.
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
                    background:
                      categorieActive === cat
                        ? "#8b0020"
                        : "#f3f4f6",
                    color:
                      categorieActive === cat
                        ? "white"
                        : "#334155",
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
          <p style={styles.resultText}>
            {produitsFiltres.length} produit(s)
          </p>

          <div style={styles.grid}>
            {produitsFiltres.map((produit) => (
                <Link
  to={`/produit/${produit.id}`}
  style={{ textDecoration: "none", color: "inherit" }}
>
              <div key={produit.id} style={styles.card}>
                <img
                  src={produit.image}
                  alt={produit.nom}
                  style={styles.image}
                />

                <div style={styles.body}>
                  <div style={styles.header}>
                    <span style={styles.marque}>
                      {produit.marque}
                    </span>

                    <span style={styles.stock}>
                      En stock
                    </span>
                  </div>

                  <h3 style={styles.title}>
                    {produit.nom}
                  </h3>

                  <p style={styles.desc}>
                    {produit.description}
                  </p>

                  <p style={styles.ref}>
                    Réf: {produit.ref}
                  </p>
                </div>
              </div>
              </Link>
            ))}
          </div>
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
    background: "#dcfce7",
    color: "#15803d",
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
  },
};

export default Produits;