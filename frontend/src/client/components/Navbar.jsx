import React from "react";

function Navbar() {
  return (
    <div style={styles.nav}>
      <div style={styles.logo}>
        🔬 <span>Grand Laboratoire</span>
      </div>

      <div style={styles.links}>
        <a>Accueil</a>
        <a>À propos</a>
        <a>Produits</a>
        <a>Services</a>
        <a>Contact</a>
      </div>

      <div>
        <span style={{ marginRight: "15px" }}>🛒</span>
        <button style={styles.login}>Connexion</button>
        <button style={styles.signup}>Inscription</button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
    background: "white",
    alignItems: "center",
  },
  logo: {
    fontWeight: "bold",
    color: "#8b0000",
  },
  links: {
    display: "flex",
    gap: "20px",
  },
  login: {
    background: "transparent",
    border: "none",
    marginRight: "10px",
  },
  signup: {
    background: "#8b0000",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
  },
};

export default Navbar;