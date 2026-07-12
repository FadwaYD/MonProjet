import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  FaSignInAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Connexion() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Impossible de contacter le serveur.");
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaSignInAlt size={30} color="#980027" />
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
};

export default Connexion;