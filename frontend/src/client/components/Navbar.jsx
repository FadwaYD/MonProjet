import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaUserEdit,
  FaSignOutAlt,
  FaShoppingCart,
  FaTrash,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";

const NAV_ITEMS = ["Accueil", "About", "Produits", "Services", "Contact"];

function Navbar() {
  const [hovered, setHovered] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/connexion");
  };

  const getImageUrl = (image) =>
    image || "https://via.placeholder.com/60x60?text=P";

  const pathFor = (item) =>
    item === "Accueil" ? "/" : `/${item.toLowerCase().replace(" ", "")}`;

  const isActive = (item) => location.pathname === pathFor(item);

  return (
    <nav style={{ ...styles.navbar, height: scrolled ? "68px" : "80px", boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.12)" : "0 2px 20px rgba(0,0,0,0.08)" }}>
      {/* Animations */}
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          60% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes cartItemIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes logoBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileLinkIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .navbar-root {
          transition: height 0.3s ease, box-shadow 0.3s ease;
        }

        .nav-link {
          position: relative;
          transition: color 0.25s ease;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 0%;
          height: 2px;
          background: #b3002d;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .logo-anim {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        .logo-anim:hover {
          animation: logoBreathe 1.2s ease-in-out infinite;
        }

        .cart-trigger-anim {
          transition: transform 0.2s ease;
        }
        .cart-trigger-anim:hover {
          transform: scale(1.1);
        }
        .cart-trigger-anim:active {
          transform: scale(0.95);
        }

        .cart-badge-anim {
          animation: badgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .dropdown-anim {
          animation: dropdownIn 0.22s ease-out both;
          transform-origin: top right;
        }

        .cart-item-anim {
          animation: cartItemIn 0.25s ease-out both;
        }

        .dropdown-item-anim {
          transition: background 0.2s ease, padding-left 0.2s ease;
        }
        .dropdown-item-anim:hover {
          background: #fdf2f4;
          padding-left: 22px;
        }

        .qty-btn-anim {
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .qty-btn-anim:hover:not(:disabled) {
          background: #eef1f5;
          transform: translateY(-1px);
        }

        .trash-btn-anim {
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .trash-btn-anim:hover {
          transform: scale(1.15);
          color: #b91c1c;
        }

        .devis-btn-anim {
          transition: background 0.25s ease, transform 0.15s ease;
        }
        .devis-btn-anim:hover {
          background: #6f1528;
          transform: translateY(-2px);
        }

        .profile-trigger-anim {
          transition: background 0.2s ease;
        }
        .profile-trigger-anim:hover {
          background: #f8fafc;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #8b0000;
          padding: 8px;
          transition: transform 0.2s ease;
        }
        .hamburger-btn:hover {
          transform: scale(1.1);
        }

        .mobile-menu {
          animation: mobileMenuIn 0.25s ease-out both;
        }

        .mobile-link {
          animation: mobileLinkIn 0.3s ease-out both;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .mobile-link:hover {
          color: #b3002d;
          padding-left: 6px;
        }

        @media (max-width: 900px) {
          .nav-links-desktop {
            display: none !important;
          }
          .hamburger-btn {
            display: inline-flex !important;
          }
          .navbar-inner {
            padding: 0 20px !important;
          }
          .profile-name-text {
            display: none !important;
          }
        }
      `}</style>

      <div className="navbar-root navbar-inner" style={styles.navbarInner}>
        <div style={styles.logo} className="logo-anim">🔬 Grand Laboratoire</div>

        <div style={styles.navLinks} className="nav-links-desktop">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              to={pathFor(item)}
              className={`nav-link ${isActive(item) ? "active" : ""}`}
              style={{
                ...styles.link,
                color: hovered === item || isActive(item) ? "#b3002d" : "#333",
              }}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered("")}
            >
              {item}
            </Link>
          ))}
        </div>

        <div style={styles.actions}>
          {/* --- Icône Panier --- */}
          <div style={styles.cartContainer} ref={cartRef}>
            <div
              style={styles.cartTrigger}
              className="cart-trigger-anim"
              onClick={() => setPanierOuvert((prev) => !prev)}
            >
              <FaShoppingCart size={22} color="#b3002d" />
              {nbArticlesPanier > 0 && (
                <span style={styles.cartBadge} className="cart-badge-anim">{nbArticlesPanier}</span>
              )}
            </div>

            {panierOuvert && (
              <div style={styles.cartDropdown} className="dropdown-anim">
                <div style={styles.cartHeader}>
                  <strong>Mon Panier ({nbArticlesPanier})</strong>
                </div>

                {panier.length === 0 ? (
                  <p style={styles.cartEmpty}>Votre panier est vide.</p>
                ) : (
                  <>
                    <div style={styles.cartItems}>
                      {panier.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{ ...styles.cartItem, animationDelay: `${idx * 0.05}s` }}
                          className="cart-item-anim"
                        >
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
                                className="qty-btn-anim"
                                onClick={() =>
                                  changerQuantitePanier(item.id, -1)
                                }
                              >
                                -
                              </button>
                              <span>{item.quantite}</span>
                              <button
                                style={styles.cartQtyBtn}
                                className="qty-btn-anim"
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
                              className="trash-btn-anim"
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
                        className="devis-btn-anim"
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
                className="profile-trigger-anim"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <FaUserCircle size={30} color="#b3002d" />
                <span style={styles.profileName} className="profile-name-text">
                  {user.prenom || user.nom || "Mon compte"}
                </span>
              </div>

              {menuOpen && (
                <div style={styles.dropdown} className="dropdown-anim">
                  <Link
                    to="/profil"
                    style={styles.dropdownItem}
                    className="dropdown-item-anim"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserEdit style={styles.dropdownIcon} />
                    Modifier mes informations
                  </Link>

                  <button
                    style={styles.dropdownItemButton}
                    className="dropdown-item-anim"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt style={styles.dropdownIcon} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authLinksDesktop} className="nav-links-desktop">
              <Link to="/connexion" style={styles.login} className="nav-link">
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
            </div>
          )}

          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item}
              to={pathFor(item)}
              style={{
                ...styles.mobileLink,
                color: isActive(item) ? "#b3002d" : "#333",
                animationDelay: `${i * 0.05}s`,
              }}
              className="mobile-link"
            >
              {item}
            </Link>
          ))}

          {!user && (
            <div style={styles.mobileAuthRow}>
              <Link to="/connexion" style={styles.mobileLoginLink}>
                Connexion
              </Link>
              <Link to="/inscription" style={{ textDecoration: "none" }}>
                <button style={styles.mobileBtn}>Inscription</button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    background: "#ffffff",
    boxSizing: "border-box",
    zIndex: 1000,
  },
  navbarInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 80px",
    height: "100%",
    boxSizing: "border-box",
  },
  logo: { fontSize: "24px", fontWeight: "700", color: "#8b0000", whiteSpace: "nowrap" },
  navLinks: { display: "flex", gap: "35px" },
  link: { textDecoration: "none", fontSize: "16px", fontWeight: "500" },
  actions: { display: "flex", alignItems: "center", gap: "20px" },
  authLinksDesktop: { display: "flex", alignItems: "center", gap: "20px" },
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

  // --- Menu mobile ---
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    padding: "10px 20px 20px",
    background: "#fff",
    borderTop: "1px solid #f1f1f1",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  mobileLink: {
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    padding: "14px 4px",
    borderBottom: "1px solid #f5f5f5",
  },
  mobileAuthRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "14px",
    gap: "12px",
  },
  mobileLoginLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "600",
  },
  mobileBtn: {
    background: "#b3002d",
    color: "#fff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Navbar;