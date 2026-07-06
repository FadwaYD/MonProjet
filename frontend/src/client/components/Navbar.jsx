import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [hovered, setHovered] = useState("");

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        🔬 Grand Laboratoire
      </div>

      <div style={styles.navLinks}>
        {["Accueil", "About", "Produits", "Services", "Contact"].map(
          (item) => (
            <Link
              key={item}
              to={item === "Accueil" ? "/" : `/${item.toLowerCase().replace(" ", "")}`}
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
};

export default Navbar;