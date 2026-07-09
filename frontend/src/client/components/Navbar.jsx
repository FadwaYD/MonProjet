import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaUserEdit, FaSignOutAlt } from "react-icons/fa";

function Navbar() {
  const [hovered, setHovered] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Charge l'utilisateur connecté depuis le localStorage
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    loadUser();

    // Met à jour si le login/logout se fait dans un autre onglet
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/connexion");
  };

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

  logo: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#8b0000",
    cursor: "pointer",
  },

  navLinks: {
    display: "flex",
    gap: "35px",
  },

  link: {
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  login: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "600",
  },

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

  profileContainer: {
    position: "relative",
  },

  profileTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "10px",
    transition: "background 0.2s ease",
  },

  profileName: {
    fontWeight: "600",
    color: "#333",
    fontSize: "15px",
  },

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

  dropdownIcon: {
    fontSize: "16px",
  },
};

export default Navbar;