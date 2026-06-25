import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaStar,
  FaHeart,
  FaFileInvoice,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function DetailProduit() {
  const [quantite, setQuantite] = useState(1);

  const produit = {
    nom: "Bécher en verre borosilicaté 250ml",
    marque: "Duran",
    ref: "GL-VS-001",
    prix: "2500 FCFA",
    stock: "300 unités",
    categorie: "Verrerie scientifique",
    description:
      "Bécher en verre borosilicaté résistant aux chocs thermiques et aux produits chimiques. Graduation précise et excellente transparence.",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1000",
  };

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
            <div style={styles.thumbnailContainer}>
              <img
                src={produit.image}
                alt=""
                style={styles.thumbnail}
              />
              <img
                src={produit.image}
                alt=""
                style={styles.thumbnail}
              />
              <img
                src={produit.image}
                alt=""
                style={styles.thumbnail}
              />
            </div>

            <div style={styles.imageBox}>
              <img
                src={produit.image}
                alt={produit.nom}
                style={styles.mainImage}
              />

              <button style={styles.favorite}>
                <FaHeart />
              </button>
            </div>
          </div>

          {/* Infos */}
          <div style={styles.right}>
            <div>
              <span style={styles.brand}>
                {produit.marque}
              </span>

              <span style={styles.stock}>
                En stock
              </span>
            </div>

            <h1>{produit.nom}</h1>

            <p style={styles.ref}>
              Référence : {produit.ref}
            </p>

            <p>{produit.description}</p>

            <div style={styles.rating}>
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <span>(12 avis)</span>
            </div>

            <h2 style={styles.price}>
              {produit.prix}
            </h2>

            <div style={styles.infoGrid}>
              <div style={styles.infoBox}>
                <small>Stock disponible</small>
                <h4>{produit.stock}</h4>
              </div>

              <div style={styles.infoBox}>
                <small>Marque</small>
                <h4>Duran</h4>
              </div>

              <div style={styles.infoBox}>
                <small>Origine</small>
                <h4>France</h4>
              </div>

              <div style={styles.infoBox}>
                <small>Catégorie</small>
                <h4>{produit.categorie}</h4>
              </div>
            </div>

            <div style={styles.alert}>
              Connectez-vous pour consulter les prix et effectuer
              une demande de devis.
            </div>

            <div style={styles.actions}>
              <div style={styles.qty}>
                <button
                  onClick={() =>
                    quantite > 1 &&
                    setQuantite(quantite - 1)
                  }
                >
                  -
                </button>

                <span>{quantite}</span>

                <button
                  onClick={() =>
                    setQuantite(quantite + 1)
                  }
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
          <h2>Description</h2>

          <p>
            Le bécher en verre borosilicaté est conçu pour une
            utilisation professionnelle dans les laboratoires.
          </p>

          <p>
            Il offre une excellente résistance thermique et
            chimique ainsi qu'une graduation précise.
          </p>
        </div>

        {/* Produits similaires */}
        <section>
          <h2>Produits similaires</h2>

          <div style={styles.similarGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={styles.similarCard}>
                <img
                  src={produit.image}
                  alt=""
                  style={styles.similarImage}
                />

                <h4>Bécher 100ml</h4>

                <p>Duran</p>

                <span style={styles.priceSmall}>
                  1800 FCFA
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: "1300px",
    margin: "auto",
    padding: "30px",
  },

  back: {
    textDecoration: "none",
    color: "#8b0020",
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  productCard: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "30px",
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
  },

  left: {
    display: "flex",
    gap: "15px",
  },

  thumbnailContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  thumbnail: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  imageBox: {
    flex: 1,
    position: "relative",
  },

  mainImage: {
    width: "100%",
    borderRadius: "15px",
  },

  favorite: {
    position: "absolute",
    top: "15px",
    right: "15px",
    border: "none",
    background: "#fff",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    cursor: "pointer",
  },

  right: {
    padding: "10px",
  },

  brand: {
    background: "#fdecef",
    color: "#8b0020",
    padding: "6px 12px",
    borderRadius: "20px",
    marginRight: "10px",
  },

  stock: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  ref: {
    color: "#64748b",
  },

  rating: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    margin: "15px 0",
  },

  price: {
    color: "#8b0020",
    fontSize: "35px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    margin: "20px 0",
  },

  infoBox: {
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "10px",
  },

  alert: {
    background: "#fff1f2",
    color: "#8b0020",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  actions: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
  },

  qty: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  cartBtn: {
    flex: 1,
    background: "#8b0020",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
  },

  devisBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "2px solid #8b0020",
    background: "#fff",
    color: "#8b0020",
    cursor: "pointer",
  },

  tabs: {
    marginTop: "30px",
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  similarCard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  similarImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  priceSmall: {
    color: "#8b0020",
    fontWeight: "bold",
  },
};

export default DetailProduit;