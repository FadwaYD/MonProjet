import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();

  // Page d'origine (ex: "/panier") si l'utilisateur a été redirigé ici, sinon "/"
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Nouvel état pour la popup "Compte non validé"
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !motDePasse) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/login",
        {
          email: email,
          mot_de_passe: motDePasse,
        }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "Admin") {
          navigate("/admin");
        } else {
          // ✅ Redirige vers la page d'origine (ex: /panier) au lieu de toujours "/"
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        // ✅ Cas spécifique : compte pas encore validé -> popup stylée
        if (
          error.response.status === 403 &&
          error.response.data.message === "Compte non validé"
        ) {
          setShowPendingModal(true);
        } else {
          alert(error.response.data.message);
        }
      } else {
        alert("Impossible de contacter le serveur.");
      }
    }

    setLoading(false);
  };

  return (
    <>
      
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="loginShield" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c2185b" />
                  <stop offset="100%" stopColor="#7a001f" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6l-8-3Z"
                fill="url(#loginShield)"
              />
              <path
                d="M9.2 11.6h5.6c.4 0 .7.3.7.7v3.2c0 .4-.3.7-.7.7H9.2c-.4 0-.7-.3-.7-.7v-3.2c0-.4.3-.7.7-.7Z"
                fill="#fff"
              />
              <path
                d="M10.1 11.6v-1.4a1.9 1.9 0 1 1 3.8 0v1.4"
                stroke="#fff"
                strokeWidth="1.1"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <h2 style={styles.title}>Connexion</h2>

          <p style={styles.subtitle}>
            Accédez à votre espace client
          </p>

          <form onSubmit={handleLogin}>
            <div style={styles.group}>
              <label>Email</label>

              <div style={styles.inputContainer}>
                <FaEnvelope style={styles.inputIcon} />

                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label>Mot de passe</label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  style={styles.input}
                />

                <span
                  style={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p style={styles.linkText}>
            Pas encore de compte ?

            <Link to="/inscription" style={styles.link}>
              {" "}
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* ✅ Popup "Compte non validé" */}
      {showPendingModal && (
        <div
          style={styles.overlay}
          onClick={() => setShowPendingModal(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.modalClose}
              onClick={() => setShowPendingModal(false)}
              aria-label="Fermer"
            >
              <FaTimes />
            </button>

            <div style={styles.modalIconBox}>
              <FaClock size={28} color="#b45309" />
            </div>

            <h3 style={styles.modalTitle}>Compte en attente</h3>

            <p style={styles.modalText}>
              Votre compte n'a pas encore été validé par notre équipe.
              Vous recevrez un email dès que l'activation sera confirmée.
            </p>

            <button
              style={styles.modalButton}
              onClick={() => setShowPendingModal(false)}
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  page: {
    minHeight: "80vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "160px 20px 50px",
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
    background: "linear-gradient(135deg, #fdecef 0%, #f9d7dd 100%)",
    boxShadow: "0 6px 16px rgba(152, 0, 39, 0.15)",
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
    cursor: "pointer",
  },

  input: {
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
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    marginTop: "10px",
  },

  linkText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#64748b",
  },

  link: {
    color: "#980027",
    textDecoration: "none",
    fontWeight: "bold",
  },

  /* ============================
     POPUP "COMPTE NON VALIDÉ"
  ============================ */

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    animation: "fadeIn 0.15s ease-out",
  },

  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "380px",
    background: "#fff",
    borderRadius: "18px",
    padding: "36px 30px 30px",
    textAlign: "center",
    boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
  },

  modalClose: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "16px",
    cursor: "pointer",
    width: "28px",
    height: "28px",
    borderRadius: "8px",
  },

  modalIconBox: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
  },

  modalTitle: {
    fontSize: "19px",
    marginBottom: "10px",
    color: "#1e293b",
  },

  modalText: {
    fontSize: "14.5px",
    lineHeight: "1.55",
    color: "#64748b",
    marginBottom: "26px",
  },

  modalButton: {
    width: "100%",
    background: "#980027",
    color: "#fff",
    border: "none",
    padding: "13px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14.5px",
  },
};

export default Connexion;