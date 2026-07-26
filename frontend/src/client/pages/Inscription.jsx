import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  FaUserPlus,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Inscription() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ice: "",
    nom: "",
    prenom: "",
    nomLabo: "",
    ville: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const {
      ice,
      nom,
      prenom,
      nomLabo,
      ville,
      email,
      telephone,
      mot_de_passe,
      confirmation,
    } = formData;

    if (!nom || !prenom || !email || !telephone || !mot_de_passe) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (mot_de_passe !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:4000/api/auth/register",
        {
          ice,
          nom,
          prenom,
          nomLabo,
          ville,
          telephone,
          email,
          mot_de_passe,
        }
      );

      if (res.data.success) {
        setSuccess(res.data.message || "Compte créé avec succès.");
        setTimeout(() => navigate("/connexion"), 1500);
      } else {
        setError(res.data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur serveur, veuillez réessayer plus tard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaUserPlus size={30} color="#980027" />
          </div>

          <h1 style={styles.title}>Créer un compte</h1>

          <p style={styles.subtitle}>Rejoignez Grand Laboratoire</p>

          {error && <p style={styles.errorText}>{error}</p>}
          {success && <p style={styles.successText}>{success}</p>}

          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  placeholder="Votre prénom"
                  style={styles.input}
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>Nom</label>
                <input
                  type="text"
                  name="nom"
                  placeholder="Votre nom"
                  style={styles.input}
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Société</label>
              <input
                type="text"
                name="nomLabo"
                placeholder="Nom de votre société"
                style={styles.input}
                value={formData.nomLabo}
                onChange={handleChange}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Ville</label>
              <input
                type="text"
                name="ville"
                placeholder="Votre ville"
                style={styles.input}
                value={formData.ville}
                onChange={handleChange}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>ICE</label>
              <input
                type="text"
                name="ice"
                placeholder="Identifiant commun de l'entreprise"
                style={styles.input}
                value={formData.ice}
                onChange={handleChange}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Téléphone</label>

              <div style={styles.inputContainer}>
                <FaPhone style={styles.inputIcon} />

                <input
                  type="text"
                  name="telephone"
                  placeholder="+212 ..."
                  style={styles.inputWithIcon}
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Email</label>

              <div style={styles.inputContainer}>
                <FaEnvelope style={styles.inputIcon} />

                <input
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  style={styles.inputWithIcon}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Mot de passe</label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="mot_de_passe"
                  placeholder="••••••••"
                  style={styles.inputWithIcon}
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                />

                {showPassword ? (
                  <FaEyeSlash
                    style={styles.eyeIcon}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FaEye
                    style={styles.eyeIcon}
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Confirmer le mot de passe</label>

              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />

                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmation"
                  placeholder="••••••••"
                  style={styles.inputWithIcon}
                  value={formData.confirmation}
                  onChange={handleChange}
                />

                {showConfirm ? (
                  <FaEyeSlash
                    style={styles.eyeIcon}
                    onClick={() => setShowConfirm(false)}
                  />
                ) : (
                  <FaEye
                    style={styles.eyeIcon}
                    onClick={() => setShowConfirm(true)}
                  />
                )}
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Création en cours..." : "Créer mon compte"}
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

  errorText: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px",
    textAlign: "center",
  },

  successText: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px",
    textAlign: "center",
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
    opacity: 1,
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