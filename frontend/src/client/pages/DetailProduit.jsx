import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaStar,
  FaHeart,
  FaFileInvoice,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:4000/api/produits";

function DetailProduit() {
  const { id } = useParams();

  const [produit, setProduit] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantite, setQuantite] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQuantite(1);

    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produit introuvable");
        return res.json();
      })
      .then((result) => {
        const data = result.data || result;

        if (!data || !data.id) {
          throw new Error("Produit introuvable");
        }

        setProduit(data);
        setLoading(false);

        // Tous les autres produits (sauf le produit courant)
        fetch(API_URL)
          .then((res) => res.json())
          .then((listResult) => {
            const liste = listResult.data || [];

            const autres = liste.filter(
              (p) => String(p.id) !== String(data.id)
            );

            setSimilaires(autres);
          })
          .catch(() => setSimilaires([]));
      })
      .catch((err) => {
        console.error(err);
        setError("Produit introuvable ou erreur serveur");
        setLoading(false);
      });
  }, [id]);

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600x400?text=Produit";
    return image;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <p>Chargement du produit...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !produit) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <Link to="/produits" style={styles.back}>
            <FaArrowLeft />
            Retour aux produits
          </Link>
          <p style={{ color: "#dc2626" }}>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <Link to="/produits" style={styles.back}>
          <FaArrowLeft />
          Retour aux produits
        </Link>

        <div style={styles.productCard}>
          {/* Galerie */}
          <div style={styles.left}>
            <div style={styles.imageBox}>
              <img
                src={getImageUrl(produit.image)}
                alt={produit.nom}
                style={styles.mainImage}
              />

              <button style={styles.favorite}>
                <FaHeart />
              </button>
            </div>

            <div style={styles.thumbnailContainer}>
              <img
                src={getImageUrl(produit.image)}
                alt=""
                style={styles.thumbnail}
              />
              <img
                src={getImageUrl(produit.image)}
                alt=""
                style={styles.thumbnail}
              />
              <img
                src={getImageUrl(produit.image)}
                alt=""
                style={styles.thumbnail}
              />
            </div>
          </div>

          {/* Infos */}
          <div style={styles.right}>
            <div style={styles.badgeRow}>
              <span style={styles.brand}>{produit.marque}</span>

              <span
                style={{
                  ...styles.stock,
                  background: produit.stock > 0 ? "#dcfce7" : "#fee2e2",
                  color: produit.stock > 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {produit.stock > 0 ? "En stock" : "Rupture de stock"}
              </span>
            </div>

            <h1 style={styles.h1}>{produit.nom}</h1>

            <p style={styles.ref}>Référence : {produit.reference}</p>

            <p style={styles.description}>{produit.description}</p>

            <div style={styles.rating}>
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <span style={styles.ratingText}>(12 avis)</span>
            </div>

            <h2 style={styles.price}>
              {Number(produit.prix).toFixed(2)} DH
            </h2>

            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <small style={styles.infoLabel}>Stock disponible</small>
                <h4 style={styles.infoValue}>{produit.stock} unités</h4>
              </div>

              <div style={styles.infoBox}>
                <small style={styles.infoLabel}>Marque</small>
                <h4 style={styles.infoValue}>{produit.marque}</h4>
              </div>

              <div style={styles.infoBox}>
                <small style={styles.infoLabel}>Référence</small>
                <h4 style={styles.infoValue}>{produit.reference}</h4>
              </div>

              <div style={styles.infoBox}>
                <small style={styles.infoLabel}>Catégorie</small>
                <h4 style={styles.infoValue}>{produit.statut}</h4>
              </div>
            </div>

            <div style={styles.alert}>
              Connectez-vous pour consulter les prix et effectuer une demande
              de devis.
            </div>

            <div style={styles.actions}>
              <div style={styles.qty}>
                <button
                  style={styles.qtyBtn}
                  onClick={() => quantite > 1 && setQuantite(quantite - 1)}
                >
                  -
                </button>

                <span style={styles.qtyValue}>{quantite}</span>

                <button
                  style={styles.qtyBtn}
                  onClick={() => setQuantite(quantite + 1)}
                >
                  +
                </button>
              </div>

              <button style={styles.cartBtn}>
                <FaShoppingCart />
                Ajouter au panier
              </button>
            </div>

            <button style={styles.devisBtn}>
              <FaFileInvoice />
              Demander un devis
            </button>
          </div>
        </div>

        {/* Description */}
        <div style={styles.tabs}>
          <h2 style={styles.tabsTitle}>Description</h2>
          <p style={styles.tabsText}>{produit.description}</p>
        </div>

        {/* Produits similaires */}
        {similaires.length > 0 && (
          <section style={styles.similarSection}>
            <h2 style={styles.similarTitle}>Produits similaires</h2>

            <div style={styles.similarGrid}>
              {similaires.map((item) => (
                <Link
                  key={item.id}
                  to={`/produit/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={styles.similarCard}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.nom}
                      style={styles.similarImage}
                    />

                    <h4 style={styles.similarName}>{item.nom}</h4>

                    <p style={styles.similarBrand}>{item.marque}</p>

                    <span style={styles.priceSmall}>
                      {Number(item.prix).toFixed(2)} DH
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: "1300px",
    margin: "auto",
    padding: "30px 20px",
  },

  back: {
    textDecoration: "none",
    color: "#8b0020",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    fontWeight: 500,
  },

  productCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    alignItems: "start",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  imageBox: {
    position: "relative",
    width: "100%",
  },

  mainImage: {
    width: "100%",
    height: "380px",
    objectFit: "cover",
    borderRadius: "15px",
    display: "block",
  },

  favorite: {
    position: "absolute",
    top: "15px",
    right: "15px",
    border: "none",
    background: "#fff",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },

  thumbnailContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
  },

  thumbnail: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  brand: {
    background: "#fdecef",
    color: "#8b0020",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },

  stock: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },

  h1: {
    margin: 0,
    fontSize: "26px",
    color: "#0f172a",
    lineHeight: 1.3,
  },

  ref: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  description: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
  },

  rating: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: "8px",
    color: "#64748b",
    fontSize: "14px",
  },

  price: {
    margin: 0,
    color: "#8b0020",
    fontSize: "32px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  infoBox: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  infoValue: {
    margin: 0,
    color: "#0f172a",
    fontSize: "15px",
  },

  alert: {
    background: "#fff1f2",
    color: "#8b0020",
    padding: "15px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  actions: {
    display: "flex",
    gap: "15px",
  },

  qty: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
  },

  qtyBtn: {
    border: "none",
    background: "#f8fafc",
    width: "40px",
    height: "44px",
    fontSize: "18px",
    cursor: "pointer",
  },

  qtyValue: {
    width: "40px",
    textAlign: "center",
    fontWeight: 600,
  },

  cartBtn: {
    flex: 1,
    background: "#8b0020",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 600,
  },

  devisBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "2px solid #8b0020",
    background: "#fff",
    color: "#8b0020",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 600,
  },

  tabs: {
    marginTop: "30px",
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  tabsTitle: {
    margin: "0 0 12px 0",
    color: "#0f172a",
  },

  tabsText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },

  similarSection: {
    marginTop: "40px",
  },

  similarTitle: {
    margin: "0 0 20px 0",
    color: "#0f172a",
  },

  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
  },

  similarCard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  similarImage: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "10px",
    marginBottom: "6px",
    background: "#f8fafc",
    padding: "8px",
    boxSizing: "border-box",
  },

  similarName: {
    margin: 0,
    color: "#0f172a",
    fontSize: "15px",
  },

  similarBrand: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  priceSmall: {
    color: "#8b0020",
    fontWeight: "bold",
    marginTop: "4px",
  },
};

export default DetailProduit;