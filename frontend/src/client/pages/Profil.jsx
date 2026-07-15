import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSave, FaUserCircle } from "react-icons/fa";

const CHAMPS_VIDES = {
  ice: "",
  nom: "",
  prenom: "",
  nomLabo: "",
  ville: "",
  email: "",
  telephone: "",
  mot_de_passe: "",
  confirmMotDePasse: "",
};

function Profil() {
  const [form, setForm] = useState(CHAMPS_VIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/connexion");
      return;
    }

    const chargerProfil = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/utilisateurs/moi", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // On remplit TOUS les champs reçus, sans écraser ceux qui n'existent pas encore
        setForm((prev) => ({
          ...prev,
          ice: res.data.ice || "",
          nom: res.data.nom || "",
          prenom: res.data.prenom || "",
          nomLabo: res.data.nomLabo || "",
          ville: res.data.ville || "",
          email: res.data.email || "",
          telephone: res.data.telephone || "",
        }));
      } catch (err) {
        const msg = err.response?.data?.message || "Impossible de charger vos informations.";
        setMessage({ type: "error", texte: msg });
        console.error("Erreur chargement profil :", err.response?.data || err.message);

        // Si le token est invalide/expiré, on renvoie vers la connexion
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => navigate("/connexion"), 1500);
        }
      } finally {
        setLoading(false);
      }
    };

    chargerProfil();
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.mot_de_passe && form.mot_de_passe !== form.confirmMotDePasse) {
      setMessage({ type: "error", texte: "Les mots de passe ne correspondent pas." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ice: form.ice,
        nom: form.nom,
        prenom: form.prenom,
        nomLabo: form.nomLabo,
        ville: form.ville,
        email: form.email,
        telephone: form.telephone,
      };
      if (form.mot_de_passe) payload.mot_de_passe = form.mot_de_passe;

      const res = await axios.put("http://localhost:5000/api/utilisateurs/moi", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userStocke = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...userStocke, ...res.data.utilisateur }));

      setMessage({ type: "success", texte: "Vos informations ont été mises à jour." });
      setForm((prev) => ({ ...prev, mot_de_passe: "", confirmMotDePasse: "" }));
    } catch (err) {
      setMessage({
        type: "error",
        texte: err.response?.data?.message || "Une erreur est survenue.",
      });
      console.error("Erreur mise à jour profil :", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.pageWrapper}>Chargement...</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <FaUserCircle size={44} color="#b3002d" />
          <h2 style={styles.titre}>Modifier mes informations</h2>
        </div>

        {message && (
          <div
            style={{
              ...styles.alert,
              background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: message.type === "success" ? "#065f46" : "#b91c1c",
              border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {message.texte}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Nom</label>
              <input style={styles.input} name="nom" value={form.nom} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Prénom</label>
              <input style={styles.input} name="prenom" value={form.prenom} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Nom du laboratoire</label>
              <input style={styles.input} name="nomLabo" value={form.nomLabo} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>ICE</label>
              <input style={styles.input} name="ice" value={form.ice} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Ville</label>
              <input style={styles.input} name="ville" value={form.ville} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Téléphone</label>
              <input style={styles.input} name="telephone" value={form.telephone} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} />
          </div>

          <hr style={styles.separator} />
          <p style={styles.hint}>Laissez vide si vous ne souhaitez pas changer de mot de passe.</p>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <input
                style={styles.input}
                type="password"
                name="mot_de_passe"
                value={form.mot_de_passe}
                onChange={handleChange}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <input
                style={styles.input}
                type="password"
                name="confirmMotDePasse"
                value={form.confirmMotDePasse}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={saving}>
            <FaSave />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    padding: "120px 20px 60px",
    boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    padding: "36px",
    width: "100%",
    maxWidth: "640px",
  },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  titre: { margin: 0, color: "#8b0000", fontSize: "22px" },
  alert: { padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { flex: "1 1 220px", display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#333" },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  separator: { border: "none", borderTop: "1px solid #eee", margin: "8px 0" },
  hint: { fontSize: "13px", color: "#94a3b8", margin: 0 },
  btn: {
    marginTop: "10px",
    background: "#b3002d",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};

export default Profil;