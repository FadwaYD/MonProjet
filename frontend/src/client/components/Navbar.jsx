import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaUserEdit,
  FaSignOutAlt,
  FaShoppingCart,
  FaTrash,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [hovered, setHovered] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const {
    panier,
    panierOuvert,
    setPanierOuvert,
    supprimerDuPanier,
    changerQuantitePanier,
    totalPanier,
    nbArticlesPanier,
  } = useCart();

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setPanierOuvert(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setPanierOuvert]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/connexion");
  };

  const getImageUrl = (image) =>
    image || "https://via.placeholder.com/60x60?text=P";

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>🔬 Grand Laboratoire</div>

      <div style={styles.navLinks}>
        {["Accueil", "About", "Produits", "Services", "Contact"].map(
          (item) => (
            <Link
              key={item}
              to={
                item === "Accueil"
                  ? "/"
                  : `/${item.toLowerCase().replace(" ", "")}`
              }
              style={{
                ...styles.link,
                color: hovered === item ? "#b3002d" : "#333",
              }}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered("")}
            >
              {item}
            </Link>
          )
        )}
      </div>

      <div style={styles.actions}>
        {/* --- Icône Panier --- */}
        <div style={styles.cartContainer} ref={cartRef}>
          <div
            style={styles.cartTrigger}
            onClick={() => setPanierOuvert((prev) => !prev)}
          >
            <FaShoppingCart size={22} color="#b3002d" />
            {nbArticlesPanier > 0 && (
              <span style={styles.cartBadge}>{nbArticlesPanier}</span>
            )}
          </div>

          {panierOuvert && (
            <div style={styles.cartDropdown}>
              <div style={styles.cartHeader}>
                <strong>Mon Panier ({nbArticlesPanier})</strong>
              </div>

              {panier.length === 0 ? (
                <p style={styles.cartEmpty}>Votre panier est vide.</p>
              ) : (
                <>
                  <div style={styles.cartItems}>
                    {panier.map((item) => (
                      <div key={item.id} style={styles.cartItem}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.nom}
                          style={styles.cartItemImage}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={styles.cartItemName}>{item.nom}</p>
                          <div style={styles.cartQtyRow}>
                            <button
                              style={styles.cartQtyBtn}
                              onClick={() =>
                                changerQuantitePanier(item.id, -1)
                              }
                            >
                              -
                            </button>
                            <span>{item.quantite}</span>
                            <button
                              style={styles.cartQtyBtn}
                              onClick={() =>
                                changerQuantitePanier(item.id, 1)
                              }
                              disabled={item.quantite >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={styles.cartItemRight}>
                          <span style={styles.cartItemPrix}>
                            {(Number(item.prix) * item.quantite).toFixed(2)} DH
                          </span>
                          <button
                            style={styles.cartTrashBtn}
                            onClick={() => supprimerDuPanier(item.id)}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.cartFooter}>
                    <div style={styles.cartTotalRow}>
                      <span>Total</span>
                      <strong style={{ color: "#8b0020" }}>
                        {totalPanier.toFixed(2)} DH
                      </strong>
                    </div>
                    <button
                      style={styles.cartDevisBtn}
                      onClick={() => {
                        setPanierOuvert(false);
                        navigate("/panier");
                      }}
                    >
                      Voir le panier
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- Compte utilisateur --- */}
        {user ? (
          <div style={styles.profileContainer} ref={menuRef}>
            <div
              style={styles.profileTrigger}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaUserCircle size={30} color="#b3002d" />
              <span style={styles.profileName}>
                {user.prenom || user.nom || "Mon compte"}
              </span>
            </div>

            {menuOpen && (
              <div style={styles.dropdown}>
                <Link
                  to="/profil"
                  style={styles.dropdownItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUserEdit style={styles.dropdownIcon} />
                  Modifier mes informations
                </Link>

                <button
                  style={styles.dropdownItemButton}
                  onClick={handleLogout}
                >
                  <FaSignOutAlt style={styles.dropdownIcon} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/connexion" style={styles.login}>
              Connexion
            </Link>

            <Link to="/inscription">
              <button
                style={styles.btn}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.background = "#8b0000";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.background = "#b3002d";
                }}
              >
                Inscription
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "80px",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 80px",
    boxSizing: "border-box",
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
    zIndex: 1000,
  },
  logo: { fontSize: "24px", fontWeight: "700", color: "#8b0000", cursor: "pointer" },
  navLinks: { display: "flex", gap: "35px" },
  link: { textDecoration: "none", fontSize: "16px", fontWeight: "500", transition: "all 0.3s ease" },
  actions: { display: "flex", alignItems: "center", gap: "20px" },
  login: { textDecoration: "none", color: "#333", fontWeight: "600" },
  btn: {
    background: "#b3002d",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  profileContainer: { position: "relative" },
  profileTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "10px",
    transition: "background 0.2s ease",
  },
  profileName: { fontWeight: "600", color: "#333", fontSize: "15px" },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    minWidth: "220px",
    overflow: "hidden",
    border: "1px solid #f1f1f1",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    textDecoration: "none",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    borderBottom: "1px solid #f1f1f1",
    cursor: "pointer",
  },
  dropdownItemButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    width: "100%",
    background: "none",
    border: "none",
    color: "#b3002d",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownIcon: { fontSize: "16px" },

  // --- Styles Panier ---
  cartContainer: { position: "relative" },
  cartTrigger: {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "8px",
  },
  cartBadge: {
    position: "absolute",
    top: "0",
    right: "0",
    background: "#f59e0b",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 700,
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartDropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    width: "340px",
    maxHeight: "420px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #f1f1f1",
    overflow: "hidden",
  },
  cartHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #f1f1f1",
    fontSize: "14px",
  },
  cartEmpty: {
    padding: "20px 18px",
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  cartItems: {
    maxHeight: "260px",
    overflowY: "auto",
    padding: "10px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cartItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    borderBottom: "1px solid #f8fafc",
    paddingBottom: "10px",
  },
  cartItemImage: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    background: "#f8fafc",
    borderRadius: "6px",
  },
  cartItemName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
  },
  cartQtyRow: { display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" },
  cartQtyBtn: {
    border: "1px solid #ddd",
    background: "#f8fafc",
    width: "20px",
    height: "20px",
    fontSize: "12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cartItemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
  },
  cartItemPrix: { fontSize: "12px", fontWeight: 700, color: "#8b0020" },
  cartTrashBtn: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
  },
  cartFooter: {
    padding: "14px 18px",
    borderTop: "1px solid #f1f1f1",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cartTotalRow: { display: "flex", justifyContent: "space-between", fontSize: "14px" },
  cartDevisBtn: {
    background: "#8b0020",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
  },
};

export default Navbar;