import React from "react";

function Footer() {
  return (
    <div style={styles.footer}>
      <div style={styles.grid}>
        <div>
          <h3>Grand Laboratoire</h3>
          <p>Solutions biomédicales depuis 15 ans.</p>
        </div>

        <div>
          <h4>Navigation</h4>
          <p>Accueil</p>
          <p>Produits</p>
          <p>Services</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p>Dakar, Sénégal</p>
          <p>+221 33 123 45 67</p>
        </div>

        <div>
          <h4>Horaires</h4>
          <p>Lundi - Vendredi</p>
          <p>8h - 18h</p>
        </div>
      </div>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        © 2024 Grand Laboratoire
      </p>
    </div>
  );
}

const styles = {
  footer: {
    background: "#5a0000",
    color: "white",
    padding: "50px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
  },
};

export default Footer;