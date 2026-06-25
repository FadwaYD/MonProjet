import React from "react";
import Navbar from "../components/Navbar";
import {
  FaUserPlus,
  FaEnvelope,
  FaLock,
  FaEye,
  FaPhone,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Inscription() {
  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaUserPlus size={30} color="#980027" />
          </div>

          <h1 style={styles.title}>Créer un compte</h1>

          <p style={styles.subtitle}>
            Rejoignez Grand Laboratoire
          </p>

          <form>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Prénom</label>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  style={styles.input}
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Nom</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Société</label>
              <input
                type="text"
                placeholder="Nom de votre société"
                style={styles.input}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Téléphone</label>

              <div style={styles.inputContainer}>
                <FaPhone style={styles.inputIcon} />

                <input
                  type="text"
                  placeholder="+212 ..."
                  style={styles.inputWithIcon}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Email</label>

              <div style={styles.inputContainer}>
                <FaEnvelope style={styles.inputIcon} />

                <input
                  type="email"
                  placeholder="votre@email.com"
                  style={styles.inputWithIcon}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Mot de passe</label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />

                <input
                  type="password"
                  placeholder="••••••••"
                  style={styles.inputWithIcon}
                />

                <FaEye style={styles.eyeIcon} />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>
                Confirmer le mot de passe
              </label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />

                <input
                  type="password"
                  placeholder="••••••••"
                  style={styles.inputWithIcon}
                />

                <FaEye style={styles.eyeIcon} />
              </div>
            </div>

            <button type="submit" style={styles.button}>
              Créer mon compte
            </button>
          </form>

          <p style={styles.linkText}>
            Déjà un compte ?
            <Link to="/connexion" style={styles.link}>
              {" "}Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "120px 20px 40px",
  },

  card: {
    width: "100%",
    maxWidth: "550px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxSizing: "border-box",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  iconBox: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background: "#fdecef",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "30px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },

  group: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#334155",
  },

  inputContainer: {
    position: "relative",
    width: "100%",
  },

  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },

  eyeIcon: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #dbe2ea",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  inputWithIcon: {
    width: "100%",
    padding: "14px 45px",
    borderRadius: "10px",
    border: "1px solid #dbe2ea",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  button: {
    width: "100%",
    background: "#980027",
    color: "#fff",
    border: "none",
    padding: "15px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },

  linkText: {
    textAlign: "center",
    marginTop: "25px",
    color: "#64748b",
  },

  link: {
    color: "#980027",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Inscription;