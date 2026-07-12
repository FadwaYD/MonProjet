import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaUserEdit,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

function Profil() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ice: "",
    nom: "",
    prenom: "",
    nomLabo: "",
    ville: "",
    email: "",
    telephone: "",
  });

  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmation: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);

  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [userId, setUserId] = useState(null);

  // Charge les infos utilisateur depuis le localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/connexion");
      return;
    }

    const user = JSON.parse(stored);
    setUserId(user.id);

    setFormData({
      ice: user.ice || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      nomLabo: user.nomLabo || "",
      ville: user.ville || "",
      email: user.email || "",
      telephone: user.telephone || "",
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess("");

    const { nom, prenom, email, telephone } = formData;

    if (!nom || !prenom || !email || !telephone) {
      setInfoError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setInfoLoading(true);

      const res = await axios.put(
        `http://localhost:4000/api/auth/profil/${userId}`,
        formData
      );

      if (res.data.success) {
        setInfoSuccess(res.data.message || "Profil mis à jour avec succès.");

        // Met à jour le localStorage pour que la navbar reflète le changement
        const stored = JSON.parse(localStorage.getItem("user"));
        const updatedUser = { ...stored, ...res.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        setInfoError(res.data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur serveur, veuillez réessayer plus tard.";
      setInfoError(message);
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    const { ancien_mot_de_passe, nouveau_mot_de_passe, confirmation } =
      passwordData;

    if (!ancien_mot_de_passe || !nouveau_mot_de_passe || !confirmation) {
      setPwdError("Veuillez remplir tous les champs.");
      return;
    }

    if (nouveau_mot_de_passe !== confirmation) {
      setPwdError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      setPwdLoading(true);

      const res = await axios.put(
        `http://localhost:4000/api/auth/profil/${userId}/mot-de-passe`,
        {
          ancien_mot_de_passe,
          nouveau_mot_de_passe,
        }
      );

      if (res.data.success) {
        setPwdSuccess(res.data.message || "Mot de passe mis à jour.");
        setPasswordData({
          ancien_mot_de_passe: "",
          nouveau_mot_de_passe: "",
          confirmation: "",
        });
      } else {
        setPwdError(res.data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur serveur, veuillez réessayer plus tard.";
      setPwdError(message);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        {/* ============ CARTE INFOS PROFIL ============ */}
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaUserEdit size={28} color="#980027" />
          </div>

          <h1 style={styles.title}>Mon profil</h1>
          <p style={styles.subtitle}>Modifiez vos informations</p>

          {infoError && <p style={styles.errorText}>{infoError}</p>}
          {infoSuccess && <p style={styles.successText}>{infoSuccess}</p>}

          <form onSubmit={handleInfoSubmit}>
            <div style={styles.row}>
              <div style={styles.group}>
                <label style={styles.label}>Prénom</label>
                <input
                  type="text"
                  name="prenom"
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
                  style={styles.inputWithIcon}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={infoLoading}>
              {infoLoading ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        {/* ============ CARTE MOT DE PASSE ============ */}
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <FaLock size={28} color="#980027" />
          </div>

          <h2 style={styles.title}>Changer mon mot de passe</h2>

          {pwdError && <p style={styles.errorText}>{pwdError}</p>}
          {pwdSuccess && <p style={styles.successText}>{pwdSuccess}</p>}

          <form onSubmit={handlePasswordSubmit}>
            <div style={styles.group}>
              <label style={styles.label}>Mot de passe actuel</label>
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showOld ? "text" : "password"}
                  name="ancien_mot_de_passe"
                  style={styles.inputWithIcon}
                  value={passwordData.ancien_mot_de_passe}
                  onChange={handlePasswordChange}
                />
                {showOld ? (
                  <FaEyeSlash
                    style={styles.eyeIcon}
                    onClick={() => setShowOld(false)}
                  />
                ) : (
                  <FaEye
                    style={styles.eyeIcon}
                    onClick={() => setShowOld(true)}
                  />
                )}
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showNew ? "text" : "password"}
                  name="nouveau_mot_de_passe"
                  style={styles.inputWithIcon}
                  value={passwordData.nouveau_mot_de_passe}
                  onChange={handlePasswordChange}
                />
                {showNew ? (
                  <FaEyeSlash
                    style={styles.eyeIcon}
                    onClick={() => setShowNew(false)}
                  />
                ) : (
                  <FaEye
                    style={styles.eyeIcon}
                    onClick={() => setShowNew(true)}
                  />
                )}
              </div>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>
                Confirmer le nouveau mot de passe
              </label>
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showNew ? "text" : "password"}
                  name="confirmation"
                  style={styles.inputWithIcon}
                  value={passwordData.confirmation}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={pwdLoading}>
              {pwdLoading ? "Mise à jour..." : "Changer le mot de passe"}
            </button>
          </form>
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
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
    padding: "120px 20px 60px",
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
    width: "60px",
    height: "60px",
    borderRadius: "16px",
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
  },
};

export default Profil;