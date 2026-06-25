import React from "react";
import Navbar from "../components/Navbar";
import { FaSignInAlt, FaEnvelope, FaLock, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

function Connexion() {
  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaSignInAlt size={30} color="#980027" />
          </div>

          <h1 style={styles.title}>Connexion</h1>

          <p style={styles.subtitle}>
            Accédez à votre espace client
          </p>

          <form>
            <div style={styles.group}>
              <label>Email</label>

              <div style={styles.inputContainer}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label>Mot de passe</label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  style={styles.input}
                />
                <FaEye style={styles.eyeIcon} />
              </div>
            </div>

            <button style={styles.button}>
              Se connecter
            </button>
          </form>

          <p style={styles.linkText}>
            Pas encore de compte ?
            <Link to="/inscription" style={styles.link}>
              {" "}Créer un compte
            </Link>
          </p>
        </div>
      </div>

    </>
  );
}

const styles = {
  page: {
    minHeight: "80vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px 20px",
  },

  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  iconBox: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background: "#fdecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "30px",
  },

  group: {
    marginBottom: "20px",
  },

  inputContainer: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "15px",
    color: "#94a3b8",
  },

  eyeIcon: {
    position: "absolute",
    right: "15px",
    top: "15px",
    color: "#94a3b8",
  },

 input: {
  width: "100%",
  padding: "14px 45px",
  borderRadius: "10px",
  border: "1px solid #dbe2ea",
  fontSize: "15px",
  boxSizing: "border-box", // IMPORTANT
  outline: "none",
},

  button: {
    width: "100%",
    background: "#980027",
    color: "white",
    border: "none",
    padding: "15px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  linkText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#64748b",
  },

  link: {
    color: "#980027",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Connexion;