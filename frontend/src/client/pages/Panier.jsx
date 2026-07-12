import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import {
  FaTrash,
  FaArrowLeft,
  FaShoppingCart,
  FaLock,
  FaFileInvoice,
} from "react-icons/fa";

function Panier() {
  const navigate = useNavigate();
  const {
    panier,
    supprimerDuPanier,
    changerQuantitePanier,
    viderPanier,
    totalPanier,
    nbArticlesPanier,
  } = useCart();

  const [user, setUser] = useState(null);
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const getImageUrl = (image) =>
    image || "https://via.placeholder.com/100x100?text=Produit";

  const handleValiderCommande = async () => {
  if (!user) {
    navigate("/connexion", { state: { from: "/panier" } });
    return;
  }

  if (panier.length === 0) return;

  try {
    const token = localStorage.getItem("token");

    const articles = panier.map((item) => ({
      produit_id: item.id,
      quantite: item.quantite,
      prix: item.prix,
    }));
const res = await fetch("http://localhost:4000/api/commande", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ articles }),
});

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Erreur lors de la validation de la commande.");
      return;
    }

    setConfirmation(true);
    viderPanier();

    setTimeout(() => {
      navigate("/");
    }, 3000);
 } catch (error) {
  console.error("Erreur détaillée :", error);
  alert("Impossible de contacter le serveur : " + error.message);
}
};

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <Link to="/produits" style={styles.back}>
          <FaArrowLeft />
          Continuer mes achats
        </Link>

        <h1 style={styles.title}>
          <FaShoppingCart style={{ marginRight: "10px" }} />
          Mon Panier {nbArticlesPanier > 0 && `(${nbArticlesPanier})`}
        </h1>

        {confirmation ? (
          <div style={styles.confirmationBox}>
            <h2 style={{ color: "#15803d" }}>✅ Commande validée !</h2>
            <p style={{ color: "#475569" }}>
              Votre demande a bien été enregistrée. Vous allez être redirigé
              vers l'accueil...
            </p>
          </div>
        ) : panier.length === 0 ? (
          <div style={styles.emptyBox}>
            <FaShoppingCart size={50} color="#cbd5e1" />
            <p style={styles.emptyText}>Votre panier est vide.</p>
            <Link to="/produits" style={styles.emptyBtn}>
              Voir nos produits
            </Link>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* Liste des articles */}
            <div style={styles.itemsCol}>
              {panier.map((item) => (
                <div key={item.id} style={styles.itemCard}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.nom}
                    style={styles.itemImage}
                  />

                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{item.nom}</h3>
                    <p style={styles.itemBrand}>{item.marque}</p>
                    <span style={styles.itemPrixUnit}>
                      {Number(item.prix).toFixed(2)} DH / unité
                    </span>
                  </div>

                  <div style={styles.itemQty}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => changerQuantitePanier(item.id, -1)}
                    >
                      -
                    </button>
                    <span style={styles.qtyValue}>{item.quantite}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => changerQuantitePanier(item.id, 1)}
                      disabled={item.quantite >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  <div style={styles.itemRight}>
                    <span style={styles.itemTotal}>
                      {(Number(item.prix) * item.quantite).toFixed(2)} DH
                    </span>
                    <button
                      style={styles.trashBtn}
                      onClick={() => supprimerDuPanier(item.id)}
                    >
                      <FaTrash />
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé de commande */}
            <div style={styles.summaryCol}>
              <div style={styles.summaryCard}>
                <h2 style={styles.summaryTitle}>Résumé de la commande</h2>

                <div style={styles.summaryRow}>
                  <span>Articles ({nbArticlesPanier})</span>
                  <span>{totalPanier.toFixed(2)} DH</span>
                </div>

                <div style={styles.summaryDivider} />

                <div style={styles.summaryTotalRow}>
                  <span>Total</span>
                  <strong>{totalPanier.toFixed(2)} DH</strong>
                </div>

                {!user && (
                  <div style={styles.warningBox}>
                    <FaLock />
                    Vous devez être connecté pour valider votre commande.
                  </div>
                )}

                <button
                  style={{
                    ...styles.validerBtn,
                    opacity: panier.length === 0 ? 0.5 : 1,
                    cursor: panier.length === 0 ? "not-allowed" : "pointer",
                  }}
                  onClick={handleValiderCommande}
                  disabled={panier.length === 0}
                >
                  <FaFileInvoice />
                  {user ? "Valider la commande" : "Se connecter pour valider"}
                </button>
              </div>
            </div>
          </div>
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
    padding: "120px 20px 60px",
    minHeight: "60vh",
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

  title: {
    display: "flex",
    alignItems: "center",
    color: "#0f172a",
    fontSize: "26px",
    marginBottom: "30px",
  },

  emptyBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "16px",
  },

  emptyBtn: {
    background: "#8b0020",
    color: "#fff",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: 600,
  },

  confirmationBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "15px",
    padding: "40px",
    textAlign: "center",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
    alignItems: "start",
  },

  itemsCol: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  itemCard: {
    display: "grid",
    gridTemplateColumns: "80px 1fr auto auto",
    gap: "20px",
    alignItems: "center",
    background: "#fff",
    padding: "18px",
    borderRadius: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  itemImage: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "6px",
    boxSizing: "border-box",
  },

  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  itemName: {
    margin: 0,
    fontSize: "16px",
    color: "#0f172a",
  },

  itemBrand: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },

  itemPrixUnit: {
    fontSize: "13px",
    color: "#8b0020",
    fontWeight: 600,
  },

  itemQty: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "4px 10px",
  },

  qtyBtn: {
    border: "none",
    background: "#f8fafc",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },

  qtyValue: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: 600,
  },

  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },

  itemTotal: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
  },

  trashBtn: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  summaryCol: {
    position: "sticky",
    top: "100px",
  },

  summaryCard: {
    background: "#fff",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  summaryTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#0f172a",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#475569",
  },

  summaryDivider: {
    height: "1px",
    background: "#f1f5f9",
  },

  summaryTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    color: "#0f172a",
  },

  warningBox: {
    background: "#fff1f2",
    color: "#8b0020",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    lineHeight: 1.4,
  },

  validerBtn: {
    background: "#8b0020",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

export default Panier;